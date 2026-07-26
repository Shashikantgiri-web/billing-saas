-- 0002_rls_policies.sql
-- Tenant isolation via RLS. business_id on every tenant row is checked
-- against the caller's own business (owned via business.owner_user_id = auth.uid()).
-- Admin role gets read-only visibility into `business` (join date, status) only —
-- never into customers/products/invoices, per 02_Business_Requirements.md §4.6.

-- Helper: is the current user the platform admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- Helper: business_id(s) owned by the current user
create or replace function owned_business_ids()
returns setof uuid as $$
  select id from business where owner_user_id = auth.uid();
$$ language sql stable security definer;

alter table users enable row level security;
alter table business enable row level security;
alter table business_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table activity_logs enable row level security;

-- users: a user can read/update their own row; admin can read all
create policy "users_select_own_or_admin" on users for select
  using (id = auth.uid() or is_admin());
create policy "users_update_own" on users for update
  using (id = auth.uid());

-- business: owner has full access; admin gets read-only
create policy "business_select_owner_or_admin" on business for select
  using (owner_user_id = auth.uid() or is_admin());
create policy "business_insert_owner" on business for insert
  with check (owner_user_id = auth.uid());
create policy "business_update_owner" on business for update
  using (owner_user_id = auth.uid());

-- business_settings: owner only
create policy "business_settings_all_owner" on business_settings for all
  using (business_id in (select owned_business_ids()))
  with check (business_id in (select owned_business_ids()));

-- categories: owner only
create policy "categories_all_owner" on categories for all
  using (business_id in (select owned_business_ids()))
  with check (business_id in (select owned_business_ids()));

-- products: owner only
create policy "products_all_owner" on products for all
  using (business_id in (select owned_business_ids()))
  with check (business_id in (select owned_business_ids()));

-- customers: owner only
create policy "customers_all_owner" on customers for all
  using (business_id in (select owned_business_ids()))
  with check (business_id in (select owned_business_ids()));

-- invoices: owner only
create policy "invoices_all_owner" on invoices for all
  using (business_id in (select owned_business_ids()))
  with check (business_id in (select owned_business_ids()));

-- invoice_items: scoped via parent invoice's business
create policy "invoice_items_all_owner" on invoice_items for all
  using (invoice_id in (select id from invoices where business_id in (select owned_business_ids())))
  with check (invoice_id in (select id from invoices where business_id in (select owned_business_ids())));

-- activity_logs: owner can read/insert for their own business
create policy "activity_logs_select_owner" on activity_logs for select
  using (business_id in (select owned_business_ids()));
create policy "activity_logs_insert_owner" on activity_logs for insert
  with check (business_id in (select owned_business_ids()));
