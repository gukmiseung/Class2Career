import { createAuthenticator, createRoadmapAllowlist } from '../_shared/roadmap/auth.ts'
import { createRoadmapHandler } from '../_shared/roadmap/handler.ts'
import { generateMockRoadmap } from '../_shared/roadmap/mock.ts'
import { selectRoadmapGenerator } from '../_shared/roadmap/openai.ts'
import { createSupabaseRoadmapLoader } from '../_shared/roadmap/supabaseData.ts'

function developmentConfiguration() {
  const url = Deno.env.get('SUPABASE_URL')
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  const publishableKey = Deno.env.get('ROADMAP_SUPABASE_PUBLISHABLE_KEY') ??
    (publishableKeys ? JSON.parse(publishableKeys).default : Deno.env.get('SUPABASE_ANON_KEY'))

  if (!url || new URL(url).origin !== 'https://amxqvarurwddhngukqkp.supabase.co' ||
    typeof publishableKey !== 'string' || !publishableKey) {
    throw new Error('Development Supabase configuration is incomplete')
  }
  return { url, publishableKey }
}

Deno.serve(createRoadmapHandler({
  authenticate: createAuthenticator(developmentConfiguration),
  isAllowedUser: createRoadmapAllowlist(Deno.env.get('ROADMAP_ALLOWED_USER_IDS')),
  load: createSupabaseRoadmapLoader(developmentConfiguration),
  // Before exposing OpenAI mode publicly, enforce a per-user quota after authentication.
  generate: selectRoadmapGenerator((name) => Deno.env.get(name), generateMockRoadmap),
}))
