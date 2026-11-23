import { createAuthenticator, createRoadmapAllowlist } from '../_shared/roadmap/auth.ts'
import { createRoadmapHandler } from '../_shared/roadmap/handler.ts'
import { generateMockRoadmap } from '../_shared/roadmap/mock.ts'
import { selectRoadmapGenerator } from '../_shared/roadmap/openai.ts'
import { createSupabaseRoadmapLoader } from '../_shared/roadmap/supabaseData.ts'

function configuration() {
  const url = Deno.env.get('SUPABASE_URL')
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  const publishableKey = (publishableKeys ? JSON.parse(publishableKeys)?.default : undefined)
    ?? Deno.env.get('SUPABASE_ANON_KEY')
    ?? Deno.env.get('ROADMAP_SUPABASE_PUBLISHABLE_KEY')

  if (!url || typeof publishableKey !== 'string' || !publishableKey) {
    throw new Error('Supabase configuration is incomplete')
  }
  return { url, publishableKey }
}

const defaults: Record<string, string> = { ROADMAP_AI_MODE: 'openai', ROADMAP_AI_MODEL: 'gpt-5.4-nano' }
const env = (name: string) => Deno.env.get(name) ?? defaults[name]
const mode = env('ROADMAP_AI_MODE')
const allowlist = env('ROADMAP_ALLOWED_USER_IDS')?.trim()

Deno.serve(createRoadmapHandler({
  authenticate: createAuthenticator(configuration),
  isAllowedUser: allowlist || mode === 'mock' ? createRoadmapAllowlist(allowlist) : () => true,
  load: createSupabaseRoadmapLoader(configuration),
  generate: selectRoadmapGenerator(env, generateMockRoadmap),
}))
