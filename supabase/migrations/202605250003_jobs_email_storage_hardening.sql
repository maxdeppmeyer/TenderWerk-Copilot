create table public.organization_import_tokens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  token_hash text not null unique,
  label text not null default 'E-Mail-Eingang',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.organization_import_tokens enable row level security;
create policy import_tokens_admin_select on public.organization_import_tokens for select using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]));
create policy import_tokens_admin_manage on public.organization_import_tokens for all using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]));

create or replace function public.can_write_storage_path(object_name text) returns boolean language plpgsql security definer stable set search_path = public, storage as $$
declare folder text; org uuid;
begin
  folder := (storage.foldername(object_name))[1];
  if folder is null or folder !~ '^[0-9a-fA-F-]{36}$' then return false; end if;
  org := folder::uuid;
  return public.has_org_role(org, array['owner','admin','editor']::public.member_role[]);
exception when others then return false;
end $$;

drop policy if exists storage_editors_insert on storage.objects;
drop policy if exists storage_editors_update on storage.objects;
drop policy if exists storage_admin_delete on storage.objects;
create policy storage_editors_insert on storage.objects for insert to authenticated with check (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_write_storage_path(name));
create policy storage_editors_update on storage.objects for update to authenticated using (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_write_storage_path(name)) with check (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.can_write_storage_path(name));
create policy storage_admin_delete on storage.objects for delete to authenticated using (bucket_id in ('tender-originals','tender-derived','organization-evidence') and public.has_org_role(((storage.foldername(name))[1])::uuid, array['owner','admin']::public.member_role[]));

create or replace function public.reserve_analysis_job(input_tender_id uuid, input_idempotency_key text) returns uuid language plpgsql security definer set search_path = public as $$
declare current_user uuid := auth.uid(); row_tender public.tenders; row_license public.licenses; existing uuid; new_id uuid; next_version integer;
begin
  if current_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into row_tender from public.tenders where id = input_tender_id;
  if row_tender.id is null or not public.has_org_role(row_tender.organization_id, array['owner','admin','editor']::public.member_role[]) then raise exception 'ORG_ACCESS_DENIED'; end if;
  select id into existing from public.analysis_jobs where organization_id = row_tender.organization_id and idempotency_key = input_idempotency_key;
  if existing is not null then return existing; end if;
  select * into row_license from public.licenses where organization_id = row_tender.organization_id for update;
  if row_license.status not in ('trial','active','lifetime') then raise exception 'LICENSE_INACTIVE'; end if;
  if row_license.status <> 'lifetime' and row_license.analysis_used >= row_license.analysis_quota then raise exception 'QUOTA_EXCEEDED'; end if;
  next_version := row_tender.current_analysis_version + 1;
  insert into public.analysis_jobs (organization_id, tender_id, requested_by, idempotency_key, status, analysis_version)
  values (row_tender.organization_id, input_tender_id, current_user, input_idempotency_key, 'queued', next_version) returning id into new_id;
  if row_license.status <> 'lifetime' then update public.licenses set analysis_used = analysis_used + 1, updated_at = now(), updated_by = current_user where organization_id = row_tender.organization_id; end if;
  update public.tenders set status = 'in_analyse', updated_at = now() where id = input_tender_id;
  insert into public.usage_events (organization_id, tender_id, job_id, event_type, success, metadata) values (row_tender.organization_id, input_tender_id, new_id, 'analysis_reserved', true, jsonb_build_object('version', next_version));
  return new_id;
end $$;
grant execute on function public.reserve_analysis_job(uuid,text) to authenticated;
