export type Example = { title: string; description: string; topic: string }
export function validateExamples(value: unknown): Example[] {
  const items = (value as { examples?: unknown })?.examples
  if (!Array.isArray(items) || items.length !== 3) throw new Error('Invalid examples')
  return items.map((item) => {
    const result = {} as Example
    for (const key of ['title', 'description', 'topic'] as const) {
      if (typeof item?.[key] !== 'string' || !item[key].trim() || item[key].length > (key === 'description' ? 500 : 60)) throw new Error('Invalid example text')
      result[key] = item[key].trim()
    }
    return result
  })
}
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' }
export function createHandler(deps: {
  authenticate: (token: string) => Promise<unknown>
  generate: (ids: string[], token: string) => Promise<unknown>
}) {
  return async (request: Request) => {
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers })
    if (request.method === 'OPTIONS') return new Response(null, { headers })
    if (request.method !== 'POST') return reply({ message: 'POST required' }, 405)
    try {
      const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1]
      if (!token || !await deps.authenticate(token)) return reply({ message: '로그인이 필요합니다.' }, 401)
      const raw = await request.text()
      if (raw.length > 4096) return reply({ message: '요청이 너무 큽니다.' }, 413)
      let body
      try { body = JSON.parse(raw) } catch { return reply({ message: '잘못된 요청입니다.' }, 400) }
      const ids = body?.conceptIds
      if (!Array.isArray(ids) || ids.length < 1 || ids.length > 20 || ids.some(id => typeof id !== 'string' || !/^[1-9][0-9]{0,18}$/.test(id)) || new Set(ids).size !== ids.length) return reply({ message: '개념을 1~20개 선택해 주세요.' }, 400)
      return reply({ examples: validateExamples(await deps.generate(ids, token)) })
    } catch {
      return reply({ message: '사례를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, 502)
    }
  }
}
