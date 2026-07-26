-- 0000_verify_setup.sql
-- Run this in Supabase SQL Editor AFTER running 0001 and 0002.
-- It doesn't change anything — just reports status.

-- 1. Confirm all 9 tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'users','business','business_settings','categories',
    'products','customers','invoices','invoice_items','activity_logs'
  )
order by table_name;
-- Expect: 9 rows. If fewer, 0001_init_schema.sql didn't fully run — check for errors and re-run.

-- 2. Confirm RLS is enabled on every tenant table
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relname in (
  'users','business','business_settings','categories',
  'products','customers','invoices','invoice_items','activity_logs'
)
order by relname;
-- Expect: rls_enabled = true for all 9 rows.

-- 3. Confirm policies exist
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
-- Expect: at least one policy per table (business, business_settings, categories,
-- customers, invoice_items, invoices, products, users all listed).

-- 4. Confirm the auto-create-user trigger exists (fires on new signups)
select trigger_name, event_object_table
from information_schema.triggers
where trigger_name = 'trg_on_auth_user_created';
-- Expect: 1 row, event_object_table = 'users' (fires on auth.users insert).

-- 5. Confirm helper functions exist
select proname from pg_proc where proname in ('is_admin', 'owned_business_ids', 'set_updated_at', 'handle_new_auth_user');
-- Expect: 4 rows.
