import { createAuthenticator } from '../_shared/roadmap/auth.ts'
import { createRoadmapHandler } from '../_shared/roadmap/handler.ts'
import { generateMockRoadmap, loadMockRoadmap } from '../_shared/roadmap/mock.ts'

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
  load: loadMockRoadmap,
  generate: generateMockRoadmap,
}))
