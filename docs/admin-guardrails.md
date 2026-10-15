# Admin guardrails

What stops an admin from changing a role, banning an account or revoking a license
by accident, and how to see who did what. Added 2026-10-15 after an admin
promoted a two-hour-old account to admin by tapping Promote on a phone.

## What happened

`app/admin/admin-dashboard.tsx` had a Promote button in every user row, beside Ban,
that acted on one tap. The database function behind it only asked "is the caller an
admin?". Nothing recorded the change. The account was promoted on 2026-10-14 at
14:33:49 UTC by an existing admin from an iPhone; it was demoted on 2026-10-15.
(It was not a privilege-escalation bug: migration 008 had already stopped users editing
their own role. The evidence was in the Supabase API logs, see "Finding out who" below.)

## The rules (two layers; the second is the one that cannot be skipped)

**Dashboard** (`app/admin/confirm-action-dialog.tsx`, rules in `lib/admin-confirm.ts`)

- Promote, Remove admin, Ban and Unban live in a Danger zone inside the expanded user,
  not in the row. License Revoke and Restore open the same dialog.
- The dialog shows who it will hit (name, email, how old the account is, last sign-in,
  sign-in method), says what the action allows, and makes the admin **type the account
  email** (the license key for licenses). Pasting and dropping are blocked.
- The confirm button is disabled for **4 seconds** after the dialog opens, "Cancel" has
  the focus, Enter does nothing until it is ready, and clicking outside does not close it.
- An account that is too new or has an unconfirmed email cannot be promoted: the dialog
  shows the reason and no confirm button.

**Database** (`scripts/016_admin_guardrails.sql`)

- `admin_set_user_role`, `admin_set_user_banned` and `admin_set_license_revoked` take
  `p_confirm`, which must equal the target's email (license key). A request that does not
  name its target is refused whatever sent it. The old two-argument versions are gone.
- Making someone an admin needs a confirmed email, an account at least **24 hours old**,
  and at most **3 role changes per admin per hour**. Bans: 10 an hour. License changes: 20.
- An admin cannot be banned (remove the admin role first); nobody bans or demotes themselves.
- Every change is written to `admin_audit_log`: who, to whom, when, from which address and
  device. The table is append-only (update, delete and truncate are refused).
- `admin_update_all_licenses` and `admin_update_all_profiles` are dropped, so a license
  cannot be revoked straight from the browser either.
- Anonymous callers cannot execute these functions or read the audit table.

## Finding out who

Dashboard: the **Audit log** tab. SQL:

```sql
select at, actor_email, action, target_email, detail, ip
from public.admin_audit_log order by at desc limit 50;
```

Changes made before 016 are not in that table. For those, use Supabase, Logs, Explorer:

```sql
select timestamp, event_message, log_attributes from logs
where source = 'edge_logs' and event_message like '%admin_set_user%'
order by timestamp desc limit 50
```

`log_attributes['request.sb.auth_user']` is the caller's user id. Retention follows the
plan (7 days on Pro).

## Tests

- `node --experimental-strip-types scripts/check-admin-confirm.mjs` (dialog rules).
- The database rules were tested on a scratch Postgres (51 checks: who may call, each
  refusal, the rate limit, the audit trail, the closed doors). That harness is not in the
  repo (it needs PGlite); 016 is safe to re-run if you want to rebuild it.

## Things to know

- If 016 is not applied, the dashboard's buttons fail ("function ... does not exist") and the
  Audit log tab says to run it. That is the safe way to fail.
- A new teammate must wait 24 hours after signing up before they can be made an admin.
- The limit that stays open: any admin can still make another account an admin. If that
  should be the owner only, check `auth.uid()` against an allow-list in
  `admin_set_user_role`.
