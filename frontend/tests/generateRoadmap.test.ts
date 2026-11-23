import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createAuthenticator, createRoadmapAllowlist } from '../../supabase/functions/_shared/roadmap/auth.ts'
import { createRoadmapHandler, type RoadmapData, type RoadmapDependencies } from '../../supabase/functions/_shared/roadmap/handler.ts'
import { generateMockRoadmap, loadMockRoadmap } from '../../supabase/functions/_shared/roadmap/mock.ts'

const token = 'test.header.signature'
const careerId = 'backend-developer'
const mockSelection = { userId: 'verified-user', accessToken: token, careerId }

function request(body = JSON.stringify({ careerId }), bearer: string | null = token) {
  return new Request('https://local.invalid/functions/v1/generate-roadmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearer === null ? {} : { Authorization: `Bearer ${bearer}` }),
    },
    body,
  })
}

function handler(overrides: Partial<RoadmapDependencies> = {}) {
  return createRoadmapHandler({
    authenticate: async (token) => token === mockSelection.accessToken ? { userId: mockSelection.userId } : null,
    isAllowedUser: createRoadmapAllowlist(mockSelection.userId),
    load: loadMockRoadmap,
    generate: generateMockRoadmap,
    ...overrides,
  })
}

async function expectError(response: Response, status: number, code: string) {
  assert.equal(response.status, status)
  const body = await response.json()
  assert.deepEqual(Object.keys(body).sort(), ['code', 'message', 'requestId'])
  assert.equal(body.code, code)
  assert.ok(body.message)
  assert.match(body.requestId, /^[a-f0-9-]{36}$/)
}

function withData(change: (data: RoadmapData) => void): RoadmapDependencies['load'] {
  return async (selection) => {
    const data = await loadMockRoadmap(selection)
    assert.ok(data)
    change(data)
    return data
  }
}

test('verifies the token against Supabase Auth using a server-configured API key', async () => {
  const authenticate = createAuthenticator(
    () => ({ url: 'https://supabase.invalid', publishableKey: 'test-key' }),
    async (url, options) => {
      assert.equal(String(url), 'https://supabase.invalid/auth/v1/user')
      const headers = new Headers(options?.headers)
      assert.equal(headers.get('apikey'), 'test-key')
      assert.equal(headers.get('authorization'), `Bearer ${token}`)
      return Response.json({ id: 'verified-user', role: 'authenticated' })
    },
  )
  assert.deepEqual(await authenticate(token), { userId: 'verified-user' })
})

test('returns null for a token rejected by Supabase Auth', async () => {
  const authenticate = createAuthenticator(
    () => ({ url: 'https://supabase.invalid', publishableKey: 'test-key' }),
    async () => new Response(null, { status: 401 }),
  )
  assert.equal(await authenticate(token), null)
})

test('rejects missing, invalid or publishable-key bearer credentials before loading data', async () => {
  const handle = handler({ load: async () => assert.fail('unauthenticated request reached loader') })
  for (const credential of [null, 'other.jwt.signature', 'publishable-key']) {
    await expectError(await handle(request(undefined, credential)), 401, 'UNAUTHORIZED')
  }
})

test('authorizes only verified IDs in a nonempty server allowlist before loading or generating', async () => {
  const cases = [
    { config: mockSelection.userId, credential: null, status: 401, code: 'UNAUTHORIZED' },
    { config: mockSelection.userId, credential: 'other.jwt.signature', status: 401, code: 'UNAUTHORIZED' },
    { config: 'different-user', credential: token, status: 403, code: 'ROADMAP_ACCESS_DENIED' },
    { config: undefined, credential: token, status: 403, code: 'ROADMAP_ACCESS_DENIED' },
    { config: ' , ', credential: token, status: 403, code: 'ROADMAP_ACCESS_DENIED' },
    { config: `other-user, ${mockSelection.userId} `, credential: token, status: 200 },
  ]

  for (const scenario of cases) {
    let loads = 0
    let generations = 0
    const response = await handler({
      isAllowedUser: createRoadmapAllowlist(scenario.config),
      load: (selection) => {
        loads++
        return loadMockRoadmap(selection)
      },
      generate: (input, candidates) => {
        generations++
        return generateMockRoadmap(input, candidates)
      },
    })(request(undefined, scenario.credential))

    if (scenario.code) await expectError(response, scenario.status, scenario.code)
    else assert.equal(response.status, 200)
    const expectedCalls = scenario.status === 200 ? 1 : 0
    assert.equal(loads, expectedCalls)
    assert.equal(generations, expectedCalls)
  }
})

test('rejects malformed JSON, invalid career IDs and client-supplied user IDs', async () => {
  const handle = handler({ load: async () => assert.fail('invalid request reached loader') })
  for (const body of ['{', '[]', '{"careerId":12}', '{"careerId":"!"}', '{"careerId":"backend-developer","userId":"other"}']) {
    await expectError(await handle(request(body)), 400, 'INVALID_REQUEST')
  }
})

test('returns a mock roadmap based on verified identity and confirmed gaps', async () => {
  const response = await handler({
    load: async (selection) => {
      assert.deepEqual(selection, mockSelection)
      return loadMockRoadmap(selection)
    },
    generate: async (input, candidates) => {
      assert.deepEqual(Object.keys(input).sort(), ['completedCourses', 'plannedCourses', 'skillGaps', 'targetCareer'])
      assert.deepEqual(input.skillGaps.map(({ name }) => name), ['관계형 데이터 모델링'])
      return generateMockRoadmap(input, candidates)
    },
  })(request())
  assert.equal(response.status, 200)
  const { steps } = await response.json()
  assert.equal(steps[0].title, '관계형 데이터 모델링')
  assert.deepEqual(steps[0].recommendedCourses[0].course, { name: '데이터베이스' })
})

test('distinguishes missing career requirements from incomplete course mappings', async () => {
  const noGenerate = async () => assert.fail('incomplete data reached generator')
  const pendingRequirements = handler({
    load: withData(({ coverage }) => { coverage.requirements = { status: 'pending' } }),
    generate: noGenerate,
  })
  const pendingMapping = handler({
    load: withData(({ coverage }) => {
      coverage.completedCourses = [{ courseId: 'pending', status: 'pending', conceptIds: [] }]
    }),
    generate: noGenerate,
  })
  await expectError(await pendingRequirements(request()), 409, 'CAREER_REQUIREMENTS_NOT_READY')
  await expectError(await pendingMapping(request()), 409, 'COURSE_CONCEPT_MAPPING_NOT_READY')
})

test('accepts ready empty requirements and an empty skill gap list', async () => {
  const response = await handler({
    load: withData(({ coverage }) => { coverage.requirements = { status: 'ready', concepts: [] } }),
    generate: async (input, candidates) => {
      assert.deepEqual(input.skillGaps, [])
      return generateMockRoadmap(input, candidates)
    },
  })(request())
  assert.equal(response.status, 200)
})

test('rejects an empty candidate set before generation', async () => {
  const response = await handler({
    load: withData((data) => { data.candidates = [] }),
    generate: async () => assert.fail('no candidates reached generator'),
  })(request())
  await expectError(response, 409, 'NO_COURSE_CANDIDATES')
})

test('rejects unknown recommendation references and invalid output shape or array lengths', async () => {
  const step = { title: '기초', learningGoals: ['목표'], recommendedCourses: [], practiceProjects: [] }
  for (const value of [
    { steps: [{ ...step, recommendedCourses: [{ candidateRef: 'outside', reason: '추천 이유' }] }] },
    { steps: [{ ...step, learningGoals: [123] }] },
    { steps: [] },
    { steps: Array(7).fill(step) },
    { steps: [{ ...step, practiceProjects: Array(4).fill({ title: '실습', description: '설명' }) }] },
  ]) {
    await expectError(await handler({ generate: async () => value })(request()), 500, 'INVALID_ROADMAP_RESPONSE')
  }
})

test('returns a generic 500 for an authentication service failure', async () => {
  const response = await handler({
    authenticate: async () => { throw new Error('internal detail') },
  })(request())
  await expectError(response, 500, 'INTERNAL_ERROR')
})

test('answers CORS preflight without attempting authentication', async () => {
  const response = await handler({
    authenticate: async () => assert.fail('preflight reached authentication'),
  })(new Request('https://local.invalid', { method: 'OPTIONS' }))
  assert.equal(response.status, 204)
  assert.match(response.headers.get('Access-Control-Allow-Headers') ?? '', /authorization/i)
})
