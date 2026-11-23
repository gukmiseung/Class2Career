# Class2Career production cutover

Target: Supabase `bnjskjmikxsrwpedmnvh`, Vercel `m1seun9/class2-career`. Never infer the target from a CLI working directory. Record the exact reviewed source SHA and current production deployment before changing anything.

## Before approval

- Confirm the production domain, active deployment SHA, linked Git branch, and Auth Site URL and allowed redirects. Verify production `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` belong to the target ref. Never log either server credentials or the environment export.
- Obtain an encrypted, access-restricted backup and prove restoration in a separate isolated PostgreSQL environment. Do not use the synthetic migration rehearsal as evidence of restore readiness. Record recovery ownership and expected recovery time/data loss. Database dumps do not replace Storage object, role membership, project settings, or Edge Function recovery plans.
- Confirm the existing interest rows each have exactly one catalog title match. Review the active UI: its single-interest `ON CONFLICT (user_id)` cannot run against the new composite key. Arrange a write pause across the schema and frontend cutover.

## Backup and restore evidence

- Use the approved production Session pooler or direct endpoint with TLS and a verified server identity. Confirm the ref and read-only session before dumping. Prompt locally for credentials; never embed them in a command, URI, or log.
- Use PostgreSQL 17 `pg_dump --format=custom` with no schema exclusions for the database recovery archive. Write directly to a verified encrypted, access-restricted location outside the repository and sync folders. Confirm usable encryption and recovery-key access before dumping. Do not use `--enable-row-security`; missing privileges or any dump failure disqualifies the archive.
- Record exit status, size, SHA-256, and `pg_restore --list` results. Verify required `public` and `auth` objects, data, policies, and constraints. Keep the archive and its detailed inventory restricted. Keep separate recovery records for roles/memberships, Storage objects, and platform configuration.
- Restore to a fresh, network-isolated PostgreSQL target with required roles and extensions provisioned, using `pg_restore --exit-on-error`. Never point restore tooling at production. Check the restore outcome, schema, grants and aggregate row counts without logging data. Record recovery evidence before approving schema changes.

## Approved backend change

Do not run `supabase db push` or replay the baseline. Production has existing schema with unverified migration history. The two rehearsed changes are:

1. `migrations/20261123000000_allow_in_progress_course_status.sql`
2. `migrations/20261123010000_allow_multiple_career_interests.sql`

Use one `psql` invocation with `-X --single-transaction --set=ON_ERROR_STOP=1`, first `-c "SET LOCAL lock_timeout = '5s'"`, then both `-f` inputs in that order. Confirm the production target in the approved connection before executing. An error must abort both changes. Before resuming writes, check the three allowed statuses, the interest composite PK and FK, RLS/GRANTs, timestamps, and row-count preservation. Once new states or multiple interests exist, do not restore the old constraints by deleting new data.

The concept example cache already exists in production. Compare its definition, RLS, and service-role privileges before any change. On an empty environment, create it with `20261123020000` before applying the `20261123030000` grants. Do not reseed a live cache automatically.

## Approved functions and frontend

- Deploy `generate-roadmap` from the reviewed SHA to the explicit production ref. Verify `OPENAI_API_KEY`, `ROADMAP_AI_MODE=openai`, and `ROADMAP_AI_MODEL`; decide whether to set `ROADMAP_ALLOWED_USER_IDS` for rollout. Keep provider keys on the server.
- Check the running `generate-concept-examples` against the reviewed implementation before deciding to redeploy it. Verify `GEMINI_API_KEY`, optional `GEMINI_MODEL`, and runtime service-role access to the cache. Both functions verify the caller's token in the handler; preserve the reviewed gateway JWT configuration.
- Set `VITE_ENABLE_AI_ROADMAP=true` only when the backend is ready. Deploy the reviewed frontend to the confirmed Production project. Check the domain, SHA and readiness. With approved test accounts, exercise login/logout, session redirects, course status writes, multiple interests and individual deletion, personal roadmap and concept examples. Verify cross-account isolation and failure behavior before reopening writes.
- If frontend rollout fails after the schema changes, keep affected writes paused. Do not send the old single-interest frontend back into service until compatibility is resolved.

## Vercel owner handoff

The owner of `m1seun9/class2-career` confirms the current domain and deployment under Settings → Domains and Deployments → Production. Under Settings → Environment Variables → Production, verify the Supabase URL and public key belong to the target ref, and prepare the AI flag without exposing key values. Coordinate the deployment window before merging if the production branch auto-deploys. After backend approval and verification, deploy the reviewed SHA, confirm READY and domain assignment, and report the active SHA and smoke-test outcome.
