-- Produktive Workflow-Ergaenzungen: sichere Freigabe, manuelle Einreichung und Indizes.
create or replace function public.approve_tender(input_tender_id uuid, input_confirmation text) returns void
language plpgsql security definer set search_path = public as $$
declare
  row_tender public.tenders;
  current_user uuid := auth.uid();
  open_critical integer;
  open_prices integer;
begin
  if current_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into row_tender from public.tenders where id = input_tender_id;
  if row_tender.id is null or not public.has_org_role(row_tender.organization_id, array['owner','admin','approver']::public.member_role[]) then raise exception 'APPROVAL_DENIED'; end if;
  if length(trim(coalesce(input_confirmation,''))) < 10 then raise exception 'APPROVAL_CONFIRMATION_REQUIRED'; end if;
  select count(*) into open_critical from public.checklist_items where tender_id = input_tender_id and priority in ('kritisch','hoch') and status <> 'erledigt';
  if open_critical > 0 then raise exception 'APPROVAL_BLOCKED_OPEN_CRITICAL_TASKS'; end if;
  select count(*) into open_prices from public.line_items li left join public.calculation_items ci on ci.line_item_id = li.id where li.tender_id = input_tender_id and coalesce(ci.confirmed, false) = false;
  if open_prices > 0 then raise exception 'APPROVAL_BLOCKED_UNCONFIRMED_CALCULATION'; end if;
  update public.tenders set status = 'freigegeben', updated_at = now() where id = input_tender_id;
  insert into public.audit_logs (organization_id, tender_id, actor_user_id, event_type, description, metadata)
  values (row_tender.organization_id, input_tender_id, current_user, 'approval', 'Interne Freigabe erteilt; manuelle Einreichung bleibt erforderlich.', jsonb_build_object('confirmation', input_confirmation));
end $$;
grant execute on function public.approve_tender(uuid,text) to authenticated;
create index if not exists analysis_jobs_tender_created_idx on public.analysis_jobs (tender_id, created_at desc);
create index if not exists checklist_items_tender_idx on public.checklist_items (tender_id);
create index if not exists calculations_tender_idx on public.calculation_items (tender_id);
create or replace function public.mark_tender_submitted(input_tender_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare row_tender public.tenders; current_user uuid := auth.uid();
begin
  if current_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into row_tender from public.tenders where id = input_tender_id;
  if row_tender.id is null or not public.has_org_role(row_tender.organization_id, array['owner','admin','approver']::public.member_role[]) then raise exception 'SUBMISSION_MARK_DENIED'; end if;
  if row_tender.status <> 'freigegeben' then raise exception 'APPROVAL_REQUIRED_BEFORE_SUBMISSION'; end if;
  update public.tenders set status = 'manuell_eingereicht', updated_at = now() where id = input_tender_id;
  insert into public.audit_logs (organization_id, tender_id, actor_user_id, event_type, description)
  values (row_tender.organization_id, input_tender_id, current_user, 'manual_submission_marked', 'Nutzer hat bestaetigt, dass die Einreichung manuell ausserhalb der Anwendung erfolgt ist.');
end $$;
grant execute on function public.mark_tender_submitted(uuid) to authenticated;
