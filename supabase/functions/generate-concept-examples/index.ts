import { createAuthenticator } from '../_shared/roadmap/auth.ts'
import { createHandler } from './handler.ts'
import { generateExamples } from './openai.ts'

function configuration() {
  const url = Deno.env.get('SUPABASE_URL')!
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  const publishableKey = Deno.env.get('ROADMAP_SUPABASE_PUBLISHABLE_KEY') ??
    (keys ? JSON.parse(keys).default : Deno.env.get('SUPABASE_ANON_KEY'))
  if (!url || !publishableKey) throw new Error('Missing server configuration')
  return { url, publishableKey }
}
Deno.serve(createHandler({
  authenticate: createAuthenticator(configuration),
  generate: async (ids, token) => {
    const { url, publishableKey } = configuration()
    const endpoint = new URL('/rest/v1/c2c_course_concepts', url)
    endpoint.searchParams.set('select', 'id,name,description,concept_group,course_id,c2c_courses(name)')
    endpoint.searchParams.set('id', `in.(${ids.join(',')})`)
    const catalog = await fetch(endpoint, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    })
    if (!catalog.ok) throw new Error('Catalog unavailable')
    const concepts = await catalog.json()
    if (!Array.isArray(concepts) || concepts.length !== ids.length || new Set(concepts.map(c => c.course_id)).size !== 1) throw new Error('Invalid concept selection')
    const key = Deno.env.get('OPENAI_API_KEY')
    if (!key) throw new Error('Missing OpenAI configuration')
    return generateExamples(concepts, key, Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini')
  },
}))
