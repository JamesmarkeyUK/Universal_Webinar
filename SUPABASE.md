# Supabase setup

This walks you through the **one-time backend setup** for Universal Webinar. Total time: ~10 minutes. No credit card required.

You'll create a Supabase project, run the migration SQL, create the admin user, and paste two env vars locally and on Vercel.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> and sign in (GitHub login is easiest).
2. Click **New project**.
3. Fill in:
   - **Name**: `universal-webinar` (or anything you like)
   - **Database password**: generate a strong one and save it in your password manager. You won't need it day-to-day.
   - **Region**: pick the one nearest you (e.g. London for UK).
   - **Plan**: Free.
4. Click **Create new project**. Wait ~2 minutes for provisioning.

---

## 2. Run the migration SQL

In **SQL Editor → New query**, paste each migration file in order and click **Run** for each. You should see *"Success. No rows returned."*

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — creates the tables, base RLS, and the Realtime publication.
2. [`supabase/migrations/0002_phase3_chat.sql`](supabase/migrations/0002_phase3_chat.sql) — adds the guest-chat RLS policies, identity helper functions, and the `author_name` trigger.

Both migrations are idempotent and safe to re-run.

---

## 3. Create the admin user

1. In the left nav, open **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Email: `Accounts@unisim.co.uk` (or whichever admin email you want).
4. Set a strong password and save it.
5. **Important**: Check **Auto Confirm User** before creating, so you don't have to click an email link.

That's your admin login.

> Email signup is the default Auth method. Anyone with the anon key can *attempt* to sign in, but only this user has a valid password.

> **Optional but recommended**: under **Authentication → Providers → Email**, turn **off** "Enable email signups" so nobody else can create an account through the front-end.

## 3a. Enable anonymous sign-in (required from Phase 3 onward)

Guests don't sign up — they join with just a name and email, which becomes an attendee row tied to a Supabase **anonymous** user. RLS uses that anonymous user's `auth.uid()` to gate who can post chat messages and reactions.

Turn it on under **Authentication → Sign In / Providers**:

1. Find **"Allow anonymous sign-ins"** (sometimes nested under the Email provider, depending on your dashboard version) and toggle it **on**.
2. Save.

If you skip this, the Join page will fail with "Anonymous sign-ins are disabled".

---

## 4. Get your project credentials

In **Project Settings → API** (left nav, near the bottom), copy:

- **Project URL** (e.g. `https://abcdefgh.supabase.co`) → goes into `VITE_SUPABASE_URL`
- **anon / public** API key (the long JWT under "Project API keys") → goes into `VITE_SUPABASE_ANON_KEY`

> Use the **anon** key, not the `service_role` key. The anon key is safe in the browser; the service_role key is **not** — never put it in `VITE_*` vars.

---

## 5. Configure local development

In the project root, create a file `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
```

Then:

```bash
npm run dev
```

Open <http://localhost:5173/admin/login>, sign in with `Accounts@unisim.co.uk` and your password. You should land on the dashboard.

---

## 6. Configure Vercel

In your Vercel project → **Settings → Environment Variables**, add the same two variables:

| Name | Value | Environments |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://YOUR-PROJECT-ID.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |

Click **Save**, then **Deployments → … → Redeploy** to apply.

---

## 7. Verify end-to-end

1. **Admin login**: `https://your-vercel-url/admin/login` → sign in.
2. **Create a webinar**: click **New webinar** on the dashboard.
3. **Copy the registration link** from the control room (top of the page).
4. **Open it in another browser / incognito**, fill in name + email, submit.
5. Back in the control room: refresh — your registration appears in the right-side **Registrations** panel.

If all five steps work, Phase 2 is complete. 🎉

---

## Troubleshooting

**"Supabase isn't connected"** banner on the login page
> Env vars aren't loaded. Restart `npm run dev` after creating `.env.local`. On Vercel, you must redeploy after adding env vars.

**Login error: "Invalid login credentials"**
> The email/password don't match. Either the user wasn't created, the email wasn't auto-confirmed (try the *"Auto Confirm User"* step again), or the password is wrong.

**"new row violates row-level security policy"** when registering as a guest
> RLS denied the insert. Verify the migration ran cleanly — the `registrations anon insert` policy must exist. Re-run `0001_init.sql`; it's idempotent.

**"Could not find the table 'public.webinars'"**
> The migration didn't run. Re-run it from the SQL editor.

**Realtime not working** (relevant in Phase 3+)
> Confirm under **Database → Replication** that `webinars`, `messages`, `reactions`, `speak_requests`, `attendees` are in the `supabase_realtime` publication. The migration adds them, but you can re-toggle from the UI if anything looks off.
