-- TenderWerk Copilot MVP – initiales Schema, Rollen, RLS und private Storage-Buckets
create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'admin', 'editor', 'approver', 'viewer');
create type public.license_status as enum ('trial', 'active', 'lifetime', 'inactive', 'past_due', 'blocked', 'cancelled', 'expired');
create type public.tender_status as enum ('eingegangen', 'in_analyse', 'pruefung_noetig', 'go_empfohlen', 'no_go_empfohlen', 'in_kalkulation', 'bereit_zur_freigabe', 'freigegeben', 'manuell_eingereicht', 'abgeschlossen', 'archiviert');
create type public.file_status as enum ('uploaded', 'validating', 'extracted', 'requires_ocr', 'unsupported', 'quarantined', 'failed');
create type public.job_status as enum ('queued', 'extracting', 'analyzing', 'scoring', 'completed', 'partial', 'failed');
create type public.verification_status as enum ('belegt', 'pruefen', 'bestaetigt', 'abgelehnt', 'unklar');
create type public.origin_type as enum ('parser', 'ai', 'user', 'system_calculation');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  locale text not null default 'de-DE',
  timezone text not null default 'Europe/Berlin',
  analysis_auto_start_email boolean not null default false,
  scoring_weights jsonb not null default '{"performance":25,"evidence":20,"region":10,"deadline":15,"capacity":10,"calculation":10,"risk":10}'::jsonb,
  limits jsonb not null default '{"max_file_bytes":26214400,"max_project_bytes":104857600,"max_files":60}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_capabilities (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  location text not null default '',
  radius_km integer not null default 0 check (radius_km >= 0),
  regions text[] not null default '{}',
  categories text[] not null default '{}',
  services text[] not null default '{}',
  exclusions text[] not null default '{}',
  capacity jsonb not null default '{}'::jsonb,
  calculation_defaults jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.licenses (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  status public.license_status not null default 'trial',
  analysis_quota integer not null default 3 check (analysis_quota >= 0),
  analysis_used integer not null default 0 check (analysis_used >= 0),
  valid_until timestamptz,
  note text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.evidence_library_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text not null,
  storage_path text,
  valid_until date,
  verification_status public.verification_status not null default 'pruefen',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  contracting_authority text,
  source text not null default 'Manueller Upload',
  status public.tender_status not null default 'eingegangen',
  category text,
  processing_mode text,
  location text,
  summary text,
  data_quality text not null default 'unzureichende_unterlagen',
  current_analysis_version integer not null default 0,
  approval_required boolean not null default true,
  archived_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tenders_org_created_idx on public.tenders (organization_id, created_at desc);

create table public.tender_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  parent_file_id uuid references public.tender_files(id) on delete set null,
  original_name text not null,
  storage_path text not null,
  bucket_name text not null default 'tender-originals',
  mime_type text,
  extension text,
  size_bytes bigint not null default 0,
  sha256 text,
  origin text not null default 'original' check (origin in ('original', 'derived', 'email')),
  document_role text,
  parser_status public.file_status not null default 'uploaded',
  parser_warning text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index tender_files_tender_idx on public.tender_files (tender_id);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  file_id uuid not null references public.tender_files(id) on delete cascade,
  chunk_index integer not null,
  locator text not null,
  content text not null,
  char_count integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(file_id, chunk_index)
);
create index document_chunks_tender_idx on public.document_chunks (tender_id, file_id);

create table public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  requested_by uuid not null references auth.users(id),
  idempotency_key text not null,
  status public.job_status not null default 'queued',
  requested_modules text[] not null default '{summary,deadlines,requirements,risks,lots,line_items}',
  analysis_version integer not null,
  error_code text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  usage_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(organization_id, idempotency_key)
);

create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  job_id uuid references public.analysis_jobs(id) on delete set null,
  version integer not null,
  model_provider text,
  model_name text,
  prompt_version text not null,
  result jsonb not null,
  security_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(tender_id, version)
);

create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  type text not null,
  value timestamptz,
  original_text text not null,
  critical boolean not null default false,
  conflict boolean not null default false,
  evidence jsonb not null default '[]'::jsonb,
  origin public.origin_type not null default 'ai',
  ai_confidence text,
  verification_status public.verification_status not null default 'pruefen',
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.lots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  label text not null,
  title text not null,
  description text,
  selection text not null default 'unklar' check (selection in ('anbieten','nicht_anbieten','unklar')),
  recommendation text,
  required_services text[] not null default '{}',
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  name text not null,
  category text not null,
  mandatory boolean not null default false,
  due_moment text,
  status text not null default 'manuell_pruefen',
  evidence_library_item_id uuid references public.evidence_library_items(id) on delete set null,
  evidence jsonb not null default '[]'::jsonb,
  origin public.origin_type not null default 'ai',
  verification_status public.verification_status not null default 'pruefen',
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  category text not null,
  severity text not null check (severity in ('kritisch','hoch','mittel','niedrig','hinweis')),
  description text not null,
  recommended_action text not null,
  status text not null default 'offen',
  evidence jsonb not null default '[]'::jsonb,
  verification_status public.verification_status not null default 'pruefen',
  created_at timestamptz not null default now()
);

create table public.line_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  lot_id uuid references public.lots(id) on delete set null,
  analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  item_number text,
  short_text text not null,
  long_text text,
  quantity numeric,
  unit text,
  evidence jsonb not null default '[]'::jsonb,
  verification_status public.verification_status not null default 'pruefen',
  created_at timestamptz not null default now()
);

create table public.calculation_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  line_item_id uuid not null references public.line_items(id) on delete cascade,
  cost_type text not null,
  work_hours_per_unit numeric not null default 0,
  hourly_rate numeric not null default 0,
  material_cost_per_unit numeric not null default 0,
  equipment_cost_per_unit numeric not null default 0,
  external_cost_per_unit numeric not null default 0,
  overhead_percent numeric not null default 0,
  risk_percent numeric not null default 0,
  margin_percent numeric not null default 0,
  confirmed boolean not null default false,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique(line_item_id)
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  section text not null,
  title text not null,
  priority text not null default 'mittel',
  status text not null default 'offen',
  due_at timestamptz,
  source_reference text,
  note text,
  origin public.origin_type not null default 'ai',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.go_nogo_evaluations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid not null references public.tenders(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  scoring_version text not null default 'v1',
  weighting jsonb not null,
  dimensions jsonb not null,
  total_score integer not null check (total_score between 0 and 100),
  recommendation text not null,
  hard_stops jsonb not null default '[]'::jsonb,
  computed_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid references public.tenders(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  event_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tender_id uuid references public.tenders(id) on delete set null,
  job_id uuid references public.analysis_jobs(id) on delete set null,
  event_type text not null,
  success boolean not null,
  provider text,
  model text,
  input_units integer,
  output_units integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.email_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  tender_id uuid references public.tenders(id) on delete set null,
  recipient text not null,
  sender text,
  subject text,
  message_id text,
  import_token_hash text,
  status text not null default 'received',
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.organization_settings for each row execute function public.set_updated_at();
create trigger capabilities_updated_at before update on public.company_capabilities for each row execute function public.set_updated_at();
create trigger tenders_updated_at before update on public.tenders for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_member(org_id uuid) returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.organization_members m where m.organization_id = org_id and m.user_id = auth.uid() and m.is_active = true)
$$;
create or replace function public.has_org_role(org_id uuid, allowed public.member_role[]) returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.organization_members m where m.organization_id = org_id and m.user_id = auth.uid() and m.is_active = true and m.role = any(allowed))
$$;
create or replace function public.is_platform_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.platform_admins a where a.user_id = auth.uid())
$$;
create or replace function public.can_access_storage_path(object_name text) returns boolean language plpgsql security definer stable set search_path = public, storage as $$
declare folder text;
begin
  folder := (storage.foldername(object_name))[1];
  if folder is null or folder !~ '^[0-9a-fA-F-]{36}$' then return false; end if;
  return public.is_member(folder::uuid);
exception when others then return false;
end $$;

create or replace function public.complete_onboarding(input_profile jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare org_id uuid; current_user uuid := auth.uid();
begin
  if current_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select m.organization_id into org_id from public.organization_members m where m.user_id = current_user and m.is_active limit 1;
  if org_id is null then
    insert into public.organizations (name, owner_user_id) values (coalesce(nullif(input_profile->>'organizationName',''), 'Neue Organisation'), current_user) returning id into org_id;
    insert into public.organization_members (organization_id, user_id, role) values (org_id, current_user, 'owner');
    insert into public.organization_settings (organization_id) values (org_id);
    insert into public.licenses (organization_id, status, analysis_quota) values (org_id, 'trial', 3);
  else
    update public.organizations set name = coalesce(nullif(input_profile->>'organizationName',''), name) where id = org_id;
  end if;
  insert into public.company_capabilities (organization_id, location, radius_km, regions, categories, services, exclusions, capacity, calculation_defaults, confirmed_at, confirmed_by)
  values (org_id, coalesce(input_profile->>'location',''), coalesce((input_profile->>'radiusKm')::integer,0),
    coalesce(array(select jsonb_array_elements_text(input_profile->'regions')), '{}'),
    coalesce(array(select jsonb_array_elements_text(input_profile->'categories')), '{}'),
    coalesce(array(select jsonb_array_elements_text(input_profile->'services')), '{}'),
    coalesce(array(select jsonb_array_elements_text(input_profile->'exclusions')), '{}'),
    jsonb_build_object('employeesBand', input_profile->>'employeesBand', 'vehiclesAndEquipment', input_profile->'vehiclesAndEquipment', 'maxParallelProjects', input_profile->'maxParallelProjects'),
    jsonb_build_object('hourlyRate', input_profile->'hourlyRate', 'travelCostPerKm', input_profile->'travelCostPerKm', 'materialMarkupPercent', input_profile->'materialMarkupPercent', 'riskMarkupPercent', input_profile->'riskMarkupPercent', 'targetMarginPercent', input_profile->'targetMarginPercent', 'vatPercent', input_profile->'vatPercent'), now(), current_user)
  on conflict (organization_id) do update set location = excluded.location, radius_km = excluded.radius_km, regions = excluded.regions, categories = excluded.categories, services = excluded.services, exclusions = excluded.exclusions, capacity = excluded.capacity, calculation_defaults = excluded.calculation_defaults, confirmed_at = now(), confirmed_by = current_user, updated_at = now();
  return org_id;
end $$;

create or replace function public.create_tender_project(input_title text, input_source text) returns uuid language plpgsql security definer set search_path = public as $$
declare org_id uuid; tender_id uuid; current_user uuid := auth.uid();
begin
  if current_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select organization_id into org_id from public.organization_members where user_id = current_user and is_active limit 1;
  if org_id is null then raise exception 'ORG_REQUIRED'; end if;
  if not public.has_org_role(org_id, array['owner','admin','editor']::public.member_role[]) then raise exception 'ORG_ACCESS_DENIED'; end if;
  insert into public.tenders (organization_id, title, source, created_by) values (org_id, coalesce(nullif(input_title,''), 'Neue Ausschreibung – Analyse ausstehend'), coalesce(nullif(input_source,''), 'Manueller Upload'), current_user) returning id into tender_id;
  insert into public.audit_logs (organization_id, tender_id, actor_user_id, event_type, description) values (org_id, tender_id, current_user, 'project_created', 'Ausschreibungsprojekt angelegt.');
  return tender_id;
end $$;

grant execute on function public.complete_onboarding(jsonb) to authenticated;
grant execute on function public.create_tender_project(text,text) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.platform_admins enable row level security;
alter table public.organization_settings enable row level security;
alter table public.company_capabilities enable row level security;
alter table public.licenses enable row level security;
alter table public.evidence_library_items enable row level security;
alter table public.tenders enable row level security;
alter table public.tender_files enable row level security;
alter table public.document_chunks enable row level security;
alter table public.analysis_jobs enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.deadlines enable row level security;
alter table public.lots enable row level security;
alter table public.requirements enable row level security;
alter table public.risks enable row level security;
alter table public.line_items enable row level security;
alter table public.calculation_items enable row level security;
alter table public.checklist_items enable row level security;
alter table public.go_nogo_evaluations enable row level security;
alter table public.audit_logs enable row level security;
alter table public.usage_events enable row level security;
alter table public.email_imports enable row level security;

create policy profiles_self_select on public.profiles for select using (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy organizations_member_select on public.organizations for select using (public.is_member(id));
create policy organizations_admin_update on public.organizations for update using (public.has_org_role(id, array['owner','admin']::public.member_role[])) with check (public.has_org_role(id, array['owner','admin']::public.member_role[]));
create policy members_member_select on public.organization_members for select using (public.is_member(organization_id));
create policy members_owner_manage on public.organization_members for all using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]));
create policy platform_admin_self_select on public.platform_admins for select using (user_id = auth.uid());

create policy settings_member_select on public.organization_settings for select using (public.is_member(organization_id));
create policy settings_admin_manage on public.organization_settings for all using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]));
create policy capabilities_member_select on public.company_capabilities for select using (public.is_member(organization_id));
create policy capabilities_editor_manage on public.company_capabilities for all using (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]));
create policy licenses_member_select on public.licenses for select using (public.is_member(organization_id));

create policy evidence_member_select on public.evidence_library_items for select using (public.is_member(organization_id));
create policy evidence_editor_manage on public.evidence_library_items for all using (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]));
create policy tenders_member_select on public.tenders for select using (public.is_member(organization_id));
create policy tenders_editor_insert on public.tenders for insert with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]) and created_by = auth.uid());
create policy tenders_editor_update on public.tenders for update using (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[]));

create policy files_member_select on public.tender_files for select using (public.is_member(organization_id));
create policy files_editor_insert on public.tender_files for insert with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]));
create policy files_editor_update on public.tender_files for update using (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]));

-- Gemeinsame mandantenbezogene Lese-/Schreibregeln für Analyse- und Arbeitsdaten
create policy chunks_member_select on public.document_chunks for select using (public.is_member(organization_id));
create policy jobs_member_select on public.analysis_jobs for select using (public.is_member(organization_id));
create policy runs_member_select on public.analysis_runs for select using (public.is_member(organization_id));
create policy deadlines_member_select on public.deadlines for select using (public.is_member(organization_id));
create policy lots_member_select on public.lots for select using (public.is_member(organization_id));
create policy requirements_member_select on public.requirements for select using (public.is_member(organization_id));
create policy risks_member_select on public.risks for select using (public.is_member(organization_id));
create policy line_items_member_select on public.line_items for select using (public.is_member(organization_id));
create policy calculations_member_select on public.calculation_items for select using (public.is_member(organization_id));
create policy checklist_member_select on public.checklist_items for select using (public.is_member(organization_id));
create policy evaluations_member_select on public.go_nogo_evaluations for select using (public.is_member(organization_id));
create policy audit_member_select on public.audit_logs for select using (public.is_member(organization_id));
create policy usage_admin_select on public.usage_events for select using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]) or public.is_platform_admin());
create policy email_member_select on public.email_imports for select using (organization_id is not null and public.is_member(organization_id));

create policy deadlines_editor_manage on public.deadlines for all using (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[]));
create policy lots_editor_manage on public.lots for all using (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]));
create policy requirements_editor_manage on public.requirements for all using (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[]));
create policy risks_editor_manage on public.risks for all using (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[]));
create policy line_items_editor_manage on public.line_items for all using (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]));
create policy calculations_editor_manage on public.calculation_items for all using (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor']::public.member_role[]));
create policy checklist_editor_manage on public.checklist_items for all using (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin','editor','approver']::public.member_role[]));
create policy audit_insert on public.audit_logs for insert with check (public.is_member(organization_id) and actor_user_id = auth.uid());

-- Private Buckets; Uploadgrenzen können später in den Bucketeinstellungen angepasst werden.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('tender-originals', 'tender-originals', false, 26214400, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv','text/plain','application/xml','text/xml','application/zip']),
  ('tender-derived', 'tender-derived', false, 26214400, null),
  ('organization-evidence', 'organization-evidence', false, 26214400, null)
on conflict (id) do nothing;

create policy storage_members_read on storage.objects for select to authenticated using (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_access_storage_path(name));
create policy storage_editors_insert on storage.objects for insert to authenticated with check (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_access_storage_path(name));
create policy storage_editors_update on storage.objects for update to authenticated using (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_access_storage_path(name)) with check (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_access_storage_path(name));
create policy storage_admin_delete on storage.objects for delete to authenticated using (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_access_storage_path(name));
