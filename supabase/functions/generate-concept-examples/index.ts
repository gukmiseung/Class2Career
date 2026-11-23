import { GenerationError } from './errors.ts'
import { createAuthenticator } from '../_shared/roadmap/auth.ts'
import { createHandler } from './handler.ts'
import { generateExamples } from './gemini.ts'

function configuration() {
  const url = Deno.env.get('SUPABASE_URL')!
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  const publishableKey = Deno.env.get('ROADMAP_SUPABASE_PUBLISHABLE_KEY') ??
    (keys ? JSON.parse(keys).default : Deno.env.get('SUPABASE_ANON_KEY'))
  if (!url || !publishableKey) throw new GenerationError('AUTH_CONFIG', '로그인 서버 설정을 확인해야 합니다.')
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
    if (!catalog.ok) throw new GenerationError('CATALOG_READ', '개념 정보를 조회하지 못했습니다.')
    const concepts = await catalog.json()
    if (!Array.isArray(concepts) || concepts.length !== ids.length || new Set(concepts.map(c => c.course_id)).size !== 1) throw new GenerationError('CONCEPT_SELECTION', '개념 정보가 변경되었습니다. 과목에서 개념을 다시 선택해 주세요.')
    const key = Deno.env.get('GEMINI_API_KEY')?.trim()
    if (!key) throw new GenerationError('GEMINI_KEY_MISSING', 'AI 서비스 키가 서버에 설정되지 않았습니다.')
    return generateExamples(concepts, key, Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash-lite')
  },
}))
