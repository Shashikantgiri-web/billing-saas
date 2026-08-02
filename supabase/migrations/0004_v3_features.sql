-- 0004_v3_features.sql
-- V3: Terms & Conditions, customer invoice reference number, optional
-- Kg/Liter measurement columns, and soft delete/restore for invoices.

alter table business_settings
  add column if not exists terms_conditions jsonb default '[]'::jsonb;

alter table invoices
  add column if not exists customer_invoice_number text;

alter table invoices
  add column if not exists measurement_unit text not null default 'none'
    check (measurement_unit in ('none', 'kg', 'liter', 'both'));

alter table invoice_items
  add column if not exists kg_value numeric(12,3);
alter table invoice_items
  add column if not exists liter_value numeric(12,3);

alter table invoices
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references users(id),
  add column if not exists restored_at timestamptz,
  add column if not exists restored_by uuid references users(id);

create index if not exists idx_invoices_is_deleted on invoices(business_id, is_deleted);
