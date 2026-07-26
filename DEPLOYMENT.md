# Deployment Checklist — Billing SaaS

## 1. Rotate credentials (do this first)
Your original `env.txt` was shared in this chat. Before going live:
- [ ] Supabase Dashboard → Settings → Database → reset the Postgres password
- [ ] Supabase Dashboard → Settings → API → regenerate the secret key
- [ ] Update `DATABASE_URL`, `DIRECT_URL`, and `SUPABASE_SECRET_KEY` everywhere they're used (local `.env.local` and Vercel env vars)

## 2. Supabase production settings
- [ ] **Email**: turn "Confirm email" back ON (you disabled it for local testing)
- [ ] **SMTP**: add a real provider (Resend, Postmark, SendGrid) under Authentication → SMTP Settings — Supabase's built-in email has a very low rate limit and isn't meant for production
- [ ] **Redirect URLs**: Authentication → URL Configuration → add your production domain (e.g. `https://yourapp.vercel.app/**`) to the allow list, or password reset / email confirmation links will fail
- [ ] **Site URL**: set to your production domain
- [ ] Re-run the verification script (`0000_verify_setup.sql`) against production if you're using a separate Supabase project for prod vs. dev

## 3. Vercel environment variables
Add all of these in Vercel → Project → Settings → Environment Variables (Production + Preview):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL
SUPABASE_SECRET_KEY
SUPABASE_JWKS_URL
DATABASE_URL
DIRECT_URL
```
- [ ] Never commit `.env.local` — it's already gitignored, double-check before pushing
- [ ] If you used the same Supabase project for dev and prod, be aware dev testing will show up in prod data — consider a separate Supabase project for production

## 4. First admin user
There's no UI to promote a user to admin — do it once, manually, in SQL Editor:
```sql
update users set role = 'admin' where id = '<your-auth-user-id>';
```
Find your user ID under Authentication → Users.

## 5. Known limitations to be aware of (not blockers, just scope)
- **PDF generation** is client-side (jsPDF), not the server-side Python service from the original spec — fine for now, revisit if you need branded/templated PDFs
- **No rate limiting** on API routes beyond what Supabase Auth enforces on login/signup — acceptable at small scale, add if abuse becomes a concern
- **No automated tests** — this was built iteratively phase-by-phase; manual testing covered the main flows but there's no test suite
- **Single admin role** — no granular permissions between platform admins
- **No email notifications** (invoice sent to customer, etc.) — not in original scope

## 6. Pre-launch smoke test (do this on the production URL)
- [ ] Register a new business end-to-end
- [ ] Add a customer, a category, a product
- [ ] Create an invoice with 2+ line items, confirm totals match
- [ ] Download the PDF, confirm it opens and shows correct data
- [ ] Void an invoice, confirm it's excluded from Reports totals
- [ ] Check Reports numbers match what you created
- [ ] Log in as admin, confirm you can see the business and change its status
- [ ] Try visiting another business's slug while logged in as a different owner — confirm you get redirected/404, not their data
