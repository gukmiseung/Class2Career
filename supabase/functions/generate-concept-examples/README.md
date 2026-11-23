# Concept practice examples

Generates three Korean practice example cards from authenticated users' selected DB concept IDs. Uses existing Supabase Auth verification, reads concepts with the caller's RLS permissions, and calls Gemini only on the server. The concept description, recommendation page, CSS and card layout are unchanged. Examples describe possible applications, not verified company case studies.

## Deploy

1. In this Supabase project's Edge Function secrets, set `GEMINI_API_KEY` to the existing Gemini key. Do not put it in frontend `VITE_` variables or commit it. A key configured in another service is not automatically available here.
2. Optionally set `GEMINI_MODEL` (default `gemini-3.5-flash-lite`) to a model available to the project.
3. Deploy from the repository root:

   supabase functions deploy generate-concept-examples --project-ref bnjskjmikxsrwpedmnvh

The checked-in config disables gateway JWT verification because this function explicitly verifies the bearer token through Supabase Auth (compatible with publishable keys). Supabase's URL and anon key are supplied by the Edge runtime; the existing `ROADMAP_SUPABASE_PUBLISHABLE_KEY` override is also supported.

No database migration is needed. Deploy the frontend after deploying the function. Verify while logged in: choose an array concept, then a different concept, and confirm three different relevant cards while DB descriptions and recommendation links remain unchanged. Test logout/expired session and provider failure: loading/error text stays within the existing cards, without pretending fallback text is generated content.

## Server cache

Generated examples are stored in `public.c2c_concept_examples`, keyed by a SHA-256 hash of the selected concepts' id, name, description and group. The same selection is served from the database without calling Gemini; editing a concept's text changes the hash and regenerates automatically. The table has RLS enabled with no policies, so only the Edge Function (service role, `SUPABASE_SERVICE_ROLE_KEY`, provided by the Edge runtime) can read or write it. Cache read/write failures never block generation. Apply the migration with `supabase db push`, or run `supabase/migrations/20261123000000_create_c2c_concept_examples.sql` in the SQL editor.

Browser requests are deduplicated and cached per user/selection for five minutes (maximum 50 entries). This is not a server quota: configure provider spending limits for production traffic. No real Gemini request is included in automated tests; they validate authentication, request IDs and output shape with injected dependencies.
