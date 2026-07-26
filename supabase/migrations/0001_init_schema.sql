-- 0001_init_schema.sql
-- Multi-tenant billing SaaS: V1 schema (9 tables) per 04_Database_Architecture.md

create extension if not exists "pgcrypto";

-- 1. users (mirrors auth.users, adds app-level role)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. business (the tenant)
create table if not exists business (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  slug text unique not null,
  name text not null,
  description text,
  location text,
  phone text,
  email text,
  status text not null default 'active' check (status in ('active', 'suspended', 'maintenance_ended')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. business_settings (1:1 with business)
create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid unique not null references business(id) on delete cascade,
  logo_url text,
  signature_url text,
  gst_number text,
  invoice_prefix text not null default 'INV',
  next_invoice_seq integer not null default 1,
  currency text not null default 'INR',
  default_tax_percent numeric(5,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- 5. products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  price numeric(12,2) not null default 0,
  tax_percent numeric(5,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  invoice_number text not null,
  subtotal numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,
  pdf_url text,
  status text not null default 'generated' check (status in ('generated', 'void')),
  created_at timestamptz not null default now(),
  unique (business_id, invoice_number)
);

-- 8. invoice_items
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null default 0,
  tax_percent numeric(5,2) default 0,
  quantity integer not null default 1,
  line_total numeric(12,2) not null default 0
);

-- 9. activity_logs
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references business(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for common tenant-scoped lookups
create index if not exists idx_business_owner on business(owner_user_id);
create index if not exists idx_categories_business on categories(business_id);
create index if not exists idx_products_business on products(business_id);
create index if not exists idx_customers_business on customers(business_id);
create index if not exists idx_invoices_business on invoices(business_id);
create index if not exists idx_invoices_customer on invoices(customer_id);
create index if not exists idx_invoice_items_invoice on invoice_items(invoice_id);
create index if not exists idx_activity_logs_business on activity_logs(business_id);

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();
create trigger trg_business_updated_at before update on business
  for each row execute function set_updated_at();
create trigger trg_business_settings_updated_at before update on business_settings
  for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();

-- Auto-create a `users` row whenever a new auth.users row is created
create or replace function handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, role, full_name)
  values (new.id, 'client', new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
