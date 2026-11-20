import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRoadmapHandler } from '../../supabase/functions/_shared/roadmap/handler.ts'
import { generateMockRoadmap, loadMockRoadmap } from '../../supabase/functions/_shared/roadmap/mock.ts'
import { selectRoadmapGenerator } from '../../supabase/functions/_shared/roadmap/openai.ts'

const endpoint = 'https://api.openai.com/v1/responses'
const config: Record<string, string> = {
  ROADMAP_AI_MODE: 'openai',
  OPENAI_API_KEY: 'unit-test-only',
  ROADMAP_AI_MODEL: 'test-model',
}

function output(text: string) {
  return Response.json({
    status: 'completed',
    output: [
      { type: 'reasoning' },
      { type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] },
    ],
  })
}

function roadmap(candidateRef = 'c1') {
  return {
    steps: [{
      title: '데이터 모델링',
      learningGoals: ['정규화 이해'],
      recommendedCourses: [{ candidateRef, reason: '설계 실습' }],
      practiceProjects: [{ title: '대출 시스템', description: '관계형 모델 실습' }],
    }],
  }
}

function handle(fetchResponse: typeof fetch, env = config, body = { careerId: 'backend-developer' }) {
  const handler = createRoadmapHandler({
    authenticate: async () => ({ userId: 'private-test-user' }),
    isAllowedUser: (userId) => userId === 'private-test-user',
    load: loadMockRoadmap,
    generate: selectRoadmapGenerator((name) => env[name], generateMockRoadmap, fetchResponse),
  })
  return handler(new Request('https://local.invalid', {
    method: 'POST',
    headers: { Authorization: 'Bearer private.test.jwt' },
    body: JSON.stringify(body),
  }))
}

async function expectError(response: Response, status: number, code: string) {
  assert.equal(response.status, status)
  const body = await response.json()
  assert.deepEqual(Object.keys(body).sort(), ['code', 'message', 'requestId'])
  assert.equal(body.code, code)
  assert.match(body.requestId, /^[a-f0-9-]{36}$/)
}

test('counts input tokens and generates a Korean roadmap with the configured schema', async () => {
  const calls: string[] = []
  const response = await handle(async (url, options) => {
    calls.push(String(url))
    assert.equal(new Headers(options?.headers).get('authorization'), 'Bearer unit-test-only')
    const body = JSON.parse(String(options?.body))
    assert.equal(body.model, 'test-model')
    assert.match(body.instructions, /한국어/)
    assert.equal(body.text.format.strict, true)
    assert.deepEqual(
      body.text.format.schema.properties.steps.items.properties.recommendedCourses.items.properties.candidateRef.enum,
      ['c1'],
    )
    const input = JSON.parse(body.input)
    assert.deepEqual(input.targetCareer, { name: '백엔드 개발자' })
    assert.deepEqual(input.completedCourses, [{ name: '자료구조' }])
    assert.deepEqual(input.plannedCourses, [{ name: '데이터베이스' }])
    assert.equal(input.skillGaps[0].name, '관계형 데이터 모델링')
    assert.deepEqual(input.candidates, [{ candidateRef: 'c1', name: '데이터베이스' }])
    assert.doesNotMatch(String(options?.body), /private-test-user|private\.test\.jwt|unit-test-only|email/)
    if (calls.length === 1) return Response.json({ input_tokens: 150 })
    assert.equal(body.max_output_tokens, 1200)
    assert.equal(body.store, false)
    return output(JSON.stringify(roadmap()))
  }, { ...config, ROADMAP_MAX_OUTPUT_TOKENS: '1200' })
  assert.deepEqual(calls, [`${endpoint}/input_tokens`, endpoint])
  assert.equal(response.status, 200)
  const { steps } = await response.json()
  assert.deepEqual(steps[0].recommendedCourses[0], { course: { name: '데이터베이스' }, reason: '설계 실습' })
})

test('blocks over-budget input before generation', async () => {
  const calls: string[] = []
  const response = await handle(async (url) => {
    calls.push(String(url))
    return Response.json({ input_tokens: 301 })
  }, { ...config, ROADMAP_MAX_INPUT_TOKENS: '300' })
  await expectError(response, 422, 'ROADMAP_AI_INPUT_LIMIT')
  assert.deepEqual(calls, [`${endpoint}/input_tokens`])
})

const providerCases = [
  ['unknown candidate', () => output(JSON.stringify(roadmap('outside'))), 500, 'INVALID_ROADMAP_RESPONSE'],
  ['invalid model JSON', () => output('{'), 500, 'INVALID_ROADMAP_RESPONSE'],
  ['invalid HTTP JSON', () => new Response('{'), 500, 'INVALID_ROADMAP_RESPONSE'],
  ['refusal', () => Response.json({
    status: 'completed',
    output: [{ type: 'message', role: 'assistant', content: [{ type: 'refusal', refusal: 'private detail' }] }],
  }), 422, 'ROADMAP_AI_REFUSED'],
  ['incomplete output', () => Response.json({ status: 'incomplete' }), 502, 'ROADMAP_AI_INCOMPLETE'],
  ['provider 429', () => new Response('private detail', { status: 429 }), 503, 'ROADMAP_AI_RATE_LIMITED'],
  ['provider 503', () => new Response('private detail', { status: 503 }), 502, 'ROADMAP_AI_UNAVAILABLE'],
] as const

for (const [name, providerResponse, status, code] of providerCases) {
  test(`handles ${name} without retrying`, async () => {
    const calls: string[] = []
    const response = await handle(async (url) => {
      calls.push(String(url))
      return String(url).endsWith('/input_tokens') ? Response.json({ input_tokens: 150 }) : providerResponse()
    })
    await expectError(response, status, code)
    assert.deepEqual(calls, [`${endpoint}/input_tokens`, endpoint])
  })
}

test('uses one timeout budget for token counting and generation', async () => {
  let budget: AbortSignal | null | undefined
  const response = await handle(async (url, options) => {
    if (String(url).endsWith('/input_tokens')) {
      budget = options?.signal
      return Response.json({ input_tokens: 150 })
    }
    assert.equal(options?.signal, budget)
    assert.ok(budget)
    return new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout signal was not raised')), 1000)
      const abort = () => {
        clearTimeout(timer)
        reject(budget?.reason)
      }
      if (budget?.aborted) abort()
      else budget?.addEventListener('abort', abort, { once: true })
    })
  }, { ...config, ROADMAP_PROVIDER_TIMEOUT_MS: '50' })
  await expectError(response, 504, 'ROADMAP_AI_TIMEOUT')
})

test('fails closed when OpenAI mode is missing a key', async () => {
  let calls = 0
  const response = await handle(async () => {
    calls++
    return new Response()
  }, { ...config, OPENAI_API_KEY: '' })
  await expectError(response, 503, 'ROADMAP_AI_NOT_CONFIGURED')
  assert.equal(calls, 0)
})

test('uses Mock mode by default and rejects client-side mode or model overrides', async () => {
  let calls = 0
  const fetchResponse = async () => {
    calls++
    return new Response()
  }
  assert.equal((await handle(fetchResponse, {})).status, 200)
  const request = { careerId: 'backend-developer', mode: 'openai', model: 'client-model' }
  await expectError(await handle(fetchResponse, {}, request), 400, 'INVALID_REQUEST')
  assert.equal(calls, 0)
})
