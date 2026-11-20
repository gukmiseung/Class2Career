import { createAuthenticator, createRoadmapAllowlist } from '../_shared/roadmap/auth.ts'
import { createRoadmapHandler } from '../_shared/roadmap/handler.ts'
import { generateMockRoadmap, loadMockRoadmap } from '../_shared/roadmap/mock.ts'
import { selectRoadmapGenerator } from '../_shared/roadmap/openai.ts'

const authenticate = createAuthenticator(() => {
  const url = Deno.env.get('SUPABASE_URL')
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  const publishableKey = Deno.env.get('ROADMAP_SUPABASE_PUBLISHABLE_KEY') ??
    (publishableKeys ? JSON.parse(publishableKeys).default : Deno.env.get('SUPABASE_ANON_KEY'))

  if (!url || typeof publishableKey !== 'string' || !publishableKey) {
    throw new Error('Supabase Auth configuration is incomplete')
  }
  return { url, publishableKey }
})

Deno.serve(createRoadmapHandler({
  authenticate,
  isAllowedUser: createRoadmapAllowlist(Deno.env.get('ROADMAP_ALLOWED_USER_IDS')),
  load: loadMockRoadmap,
  // Before exposing OpenAI mode publicly, enforce a per-user quota after authentication.
  generate: selectRoadmapGenerator((name) => Deno.env.get(name), generateMockRoadmap),
}))
