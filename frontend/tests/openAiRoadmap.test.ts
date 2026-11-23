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
      details: {
        weeks: 3, outcome: '대출 이력을 조회하는 API를 만듭니다.',
        competition: {
          type: '대학생 서비스 개발 해커톤', query: '대학생 서비스 개발 해커톤 공고',
          submission: '교내 물품 대출 서비스 데모', whatToCheck: '팀 인원과 코드 제출 조건을 확인합니다.',
        },
        experience: {
          setting: '교내 개발 동아리', actions: ['API 계약을 맞춥니다.', '동시성 테스트에 대해 코드 리뷰를 받습니다.'],
          evidence: '피드백과 수정 전후 테스트 결과',
        },
      },
      recommendedCourses: [{ candidateRef, reason: '설계 실습', application: '정규화를 대출 기록 테이블에 적용합니다.' }],
      practiceProjects: [{
        title: '대출 시스템', description: '관계형 모델 실습',
        plan: { tasks: ['ERD를 그립니다.', '대출 API를 구현합니다.'], deliverable: 'ERD와 시연 영상', doneWhen: '중복 대출 테스트를 통과합니다.' },
      }],
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
    const steps = body.text.format.schema.properties.steps
    assert.equal(steps.maxItems, 3)
    assert.equal(steps.items.properties.learningGoals.maxItems, 2)
    assert.equal(steps.items.properties.recommendedCourses.maxItems, 2)
    assert.equal(steps.items.properties.practiceProjects.minItems, 1)
    assert.equal(steps.items.properties.practiceProjects.maxItems, 1)
    assert.deepEqual(steps.items.properties.details.required, ['weeks', 'outcome', 'competition', 'experience'])
    assert.deepEqual(
      body.text.format.schema.properties.steps.items.properties.recommendedCourses.items.properties.candidateRef.enum,
      ['c1'],
    )
    const input = JSON.parse(body.input)
    assert.deepEqual(input.targetCareer, { name: '백엔드 개발자' })
    assert.deepEqual(input.completedCourses, [{ name: '자료구조' }])
    assert.deepEqual(input.plannedCourses, [{ name: '데이터베이스' }])
    assert.equal(input.skillGaps[0].name, '관계형 데이터 모델링')
    assert.match(input.skillGapContext, /수강 완료 과목/)
    assert.equal(input.skillGaps[0].context, undefined)
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
  const [sample] = roadmap().steps
  assert.deepEqual(steps[0], {
    ...sample,
    recommendedCourses: [{
      course: { name: '데이터베이스' }, reason: sample.recommendedCourses[0].reason,
      application: sample.recommendedCourses[0].application,
    }],
  })
})

test('rejects detail cards with unusable project plans or competition guidance', async () => {
  const [step] = roadmap().steps
  for (const malformed of [
    { ...step, practiceProjects: [{ ...step.practiceProjects[0], plan: { tasks: ['한 가지 행동'] } }] },
    { ...step, details: { ...step.details, competition: { ...step.details.competition, query: ' ' } } },
  ]) {
    const reply = await handle(async (url) => String(url).endsWith('/input_tokens')
      ? Response.json({ input_tokens: 150 })
      : output(JSON.stringify({ steps: [malformed] })))
    await expectError(reply, 500, 'INVALID_ROADMAP_RESPONSE')
  }
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
  ['output token exhaustion', () => Response.json({
    status: 'incomplete',
    incomplete_details: { reason: 'max_output_tokens' },
    output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: '{' }] }],
  }), 502, 'ROADMAP_AI_OUTPUT_LIMIT'],
  ['incomplete output due to content filtering', () => Response.json({
    status: 'incomplete',
    incomplete_details: { reason: 'content_filter' },
  }), 422, 'ROADMAP_AI_REFUSED'],
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

test('the deployed entry point uses its own project and lets the same account generate more than eight times', async (t) => {
  const settings: Record<string, string> = {
    SUPABASE_URL: 'https://production-fixture.supabase.co',
    SUPABASE_PUBLISHABLE_KEYS: '{"default":"test-publishable-key"}',
    OPENAI_API_KEY: 'unit-test-only',
  }
  let run: ((request: Request) => Promise<Response>) | undefined
  const runtime = globalThis as typeof globalThis & { Deno?: unknown }
  runtime.Deno = {
    env: { get: (name: string) => settings[name] },
    serve: (handler: typeof run) => { run = handler },
  }
  t.after(() => { delete runtime.Deno })

  const calls: string[] = []
  t.mock.method(globalThis, 'fetch', async (input: URL | string, init: RequestInit) => {
    const url = new URL(input)
    calls.push(url.pathname)
    if (url.origin === 'https://api.openai.com') {
      assert.equal(JSON.parse(String(init.body)).model, 'gpt-5.4-nano')
      assert.doesNotMatch(String(init.body), /signed-in-user|test\.session\.token/)
      return url.pathname.endsWith('/input_tokens')
        ? Response.json({ input_tokens: 5000 })
        : output(JSON.stringify(roadmap()))
    }

    assert.equal(url.origin, settings.SUPABASE_URL)
    assert.equal(new Headers(init.headers).get('authorization'), 'Bearer test.session.token')
    switch (url.pathname) {
      case '/auth/v1/user': return Response.json({ id: 'signed-in-user', role: 'authenticated' })
      case '/rest/v1/c2c_careers': return Response.json([{ slug: 'backend-developer', title: '백엔드', description: 'API 구현' }])
      case '/rest/v1/c2c_career_courses': return Response.json([{ c2c_courses: {
        id: 1, name: '데이터베이스', department: '컴퓨터학부', c2c_course_concepts: [{ id: 10, name: '정규화' }],
      } }])
      case '/rest/v1/c2c_user_courses':
        assert.equal(url.searchParams.get('user_id'), 'eq.signed-in-user')
        return Response.json([])
      default: return assert.fail(`Unexpected path ${url.pathname}`)
    }
  })

  await import('../../supabase/functions/generate-roadmap/index.ts')
  assert.ok(run)
  for (let attempt = 0; attempt < 9; attempt++) {
    const response = await run(new Request('https://production-fixture.supabase.co/functions/v1/generate-roadmap', {
      method: 'POST',
      headers: { Authorization: 'Bearer test.session.token' },
      body: JSON.stringify({ careerId: 'backend-developer' }),
    }))
    assert.equal(response.status, 200)
    assert.equal((await response.json()).steps[0].recommendedCourses[0].course.name, '데이터베이스')
  }
  assert.equal(calls.filter((path) => path === '/v1/responses').length, 9)
})
