-- 0003_invoice_numbering_and_storage.sql

-- Atomically claim the next invoice sequence number for a business,
-- avoiding race conditions when two invoices are created concurrently.
create or replace function next_invoice_number(p_business_id uuid)
returns text as $$
declare
  v_prefix text;
  v_seq integer;
  v_year text := to_char(now(), 'YYYY');
begin
  -- Row lock on business_settings prevents a concurrent call from reading
  -- the same seq before this transaction commits.
  select invoice_prefix, next_invoice_seq
    into v_prefix, v_seq
    from business_settings
    where business_id = p_business_id
    for update;

  if not found then
    raise exception 'business_settings not found for business %', p_business_id;
  end if;

  update business_settings
    set next_invoice_seq = v_seq + 1
    where business_id = p_business_id;

  return v_prefix || '-' || v_year || '-' || lpad(v_seq::text, 6, '0');
end;
$$ language plpgsql security definer;

-- Only the owning business's row-level policies (already in place) determine
-- who may call insert on invoices; this function just computes the number
-- inside the same transaction as that insert.

-- Storage bucket for logos/signatures
insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do nothing;

-- Anyone can read (bucket is public, needed for PDF/logo display)
create policy "business_assets_public_read"
on storage.objects for select
using (bucket_id = 'business-assets');

-- Only authenticated users can upload into a folder named after a business
-- they own: path convention is `${business_id}/logo.png` etc.
create policy "business_assets_owner_write"
on storage.objects for insert
with check (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1]::uuid in (select owned_business_ids())
);

create policy "business_assets_owner_update"
on storage.objects for update
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1]::uuid in (select owned_business_ids())
);

create policy "business_assets_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1]::uuid in (select owned_business_ids())
);
