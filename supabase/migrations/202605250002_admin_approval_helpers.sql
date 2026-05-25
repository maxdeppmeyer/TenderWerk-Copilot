-- Administrative und Freigabe-Funktionen; Änderungen werden auditiert.
create or replace function public.approve_tender(input_tender_id uuid, input_confirmation text) returns void language plpgsql security definer set search_path = public as $$
declare row_tender public.tenders; current_user uuid := auth.uid();
begin
  select * into row_tender from public.tenders where id = input_tender_id;
  if row_tender.id is null or not public.has_org_role(row_tender.organization_id, array['owner','admin','approver']::public.member_role[]) then raise exception 'APPROVAL_DENIED'; end if;
  if length(trim(coalesce(input_confirmation,''))) < 10 then raise exception 'APPROVAL_CONFIRMATION_REQUIRED'; end if;
  update public.tenders set status = 'freigegeben', updated_at = now() where id = input_tender_id;
  insert into public.audit_logs (organization_id, tender_id, actor_user_id, event_type, description, metadata)
  values (row_tender.organization_id, input_tender_id, current_user, 'approval', 'Interne Freigabe erteilt; manuelle Einreichung bleibt erforderlich.', jsonb_build_object('confirmation', input_confirmation));
end $$;

grant execute on function public.approve_tender(uuid,text) to authenticated;
