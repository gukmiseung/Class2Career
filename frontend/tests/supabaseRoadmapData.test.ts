import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compareConceptCoverage } from '../../supabase/functions/_shared/roadmap/compareConceptCoverage.ts'
import { createRoadmapHandler, type RoadmapDependencies } from '../../supabase/functions/_shared/roadmap/handler.ts'
import { createSupabaseRoadmapLoader } from '../../supabase/functions/_shared/roadmap/supabaseData.ts'

const userId = 'local-user-fixture'
const accessToken = 'local.session.fixture'
const publishableKey = 'local-publishable-fixture'
const backend = { slug: 'backend-developer', title: '백엔드 개발자', description: 'API와 데이터베이스' }
const dataAnalyst = { slug: 'data-analyst', title: '데이터 분석가', description: '데이터 분석' }
const structures = { id: 1, name: '자료구조', department: '컴퓨터학부', c2c_course_concepts: [{ id: 100, name: '스택' }] }
const database = { id: 42, name: '데이터베이스', department: '컴퓨터학부', c2c_course_concepts: [{ id: 200, name: 'SQL' }] }
const other = { id: 90, name: '다른 과목', department: '컴퓨터학부', c2c_course_concepts: [{ id: 300, name: 'SQL' }] }

function fixture(overrides: Record<string, unknown> = {}) {
  const requests: URL[] = []
  const responses: Record<string, unknown> = {
    c2c_user_career_interests: [{ career_name: backend.title }],
    c2c_careers: [backend, dataAnalyst],
    c2c_career_courses: [{ c2c_courses: structures }, { c2c_courses: database }],
    c2c_user_courses: [],
    ...overrides,
  }
  const load = createSupabaseRoadmapLoader(() => ({ url: 'https://dev.invalid', publishableKey }), async (input, init) => {
    const url = new URL(String(input))
    const headers = new Headers(init?.headers)
    assert.equal(url.origin, 'https://dev.invalid')
    assert.equal(headers.get('authorization'), `Bearer ${accessToken}`)
    assert.equal(headers.get('apikey'), publishableKey)
    assert.equal(init?.method ?? 'GET', 'GET')
    assert.equal(init?.redirect, 'error')
    requests.push(url)
    const table = url.pathname.split('/').pop()!
    assert.ok(table in responses)
    if (table === 'c2c_user_courses' || table === 'c2c_user_career_interests') {
      assert.equal(url.searchParams.get('user_id'), `eq.${userId}`)
    }
    const response = responses[table]
    if (response instanceof Response) return response
    if (table === 'c2c_careers' && url.searchParams.has('slug')) {
      const slug = url.searchParams.get('slug')?.slice(3)
      return Response.json((response as typeof backend[]).filter((career) => career.slug === slug))
    }
    return Response.json(response)
  })
  return { load, requests }
}

test('uses verified identity and keeps completed, planned and unrelated concept IDs distinct', async () => {
  const { load, requests } = fixture({
    c2c_user_career_interests: [{ career_name: dataAnalyst.title }],
    c2c_user_courses: [
      { status: 'completed', c2c_courses: structures },
      { status: 'planned', c2c_courses: database },
      { status: 'completed', c2c_courses: other },
    ],
  })
  const result = await load({ userId, accessToken, careerId: backend.slug })
  assert.ok(result && !('status' in result))
  assert.equal(result.request.targetCareer.name, backend.title)
  assert.deepEqual(result.request.completedCourses.map(({ name }) => name), ['자료구조', '다른 과목'])
  assert.deepEqual(result.request.plannedCourses.map(({ name }) => name), ['데이터베이스'])
  const coverage = compareConceptCoverage(result.coverage)
  assert.deepEqual(coverage.covered.map(({ id }) => id), ['100'])
  assert.deepEqual(coverage.uncovered.map(({ id }) => id), ['200'])
  assert.deepEqual(result.candidates.map(({ candidateRef }) => candidateRef), ['c42'])
  assert.ok(requests.some((url) => url.searchParams.get('career_slug') === 'eq.backend-developer'))
  assert.ok(requests.some((url) => url.searchParams.get('select')?.includes('c2c_course_concepts(')))
})

test('handles empty history and picks the first saved interest still in the catalog', async () => {
  const { load, requests } = fixture({
    c2c_user_career_interests: [{ career_name: '삭제된 직무' }, { career_name: dataAnalyst.title }, { career_name: backend.title }],
  })
  const result = await load({ userId, accessToken })
  assert.ok(result && !('status' in result))
  assert.equal(result.request.targetCareer.name, dataAnalyst.title)
  assert.deepEqual(result.request.completedCourses, [])
  assert.deepEqual(result.request.plannedCourses, [])
  assert.equal(compareConceptCoverage(result.coverage).uncovered.length, 2)
  assert.equal(result.candidates.length, 2)
  assert.ok(requests.some((url) => url.searchParams.get('order') === 'updated_at.desc,career_name.asc'))
})

test('requires a selected career only when there is no saved match or explicit selection', async () => {
  const { load } = fixture({ c2c_user_career_interests: [] })
  assert.deepEqual(await load({ userId, accessToken }), { status: 'career_selection_required' })
  assert.ok(await load({ userId, accessToken, careerId: backend.slug }))
  assert.equal(await load({ userId, accessToken, careerId: 'unknown-career' }), null)
})

function invoke(load: RoadmapDependencies['load'], generate: RoadmapDependencies['generate'], body: object) {
  return createRoadmapHandler({
    authenticate: async () => ({ userId }),
    isAllowedUser: () => true,
    load,
    generate,
  })(new Request('https://dev.invalid', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  }))
}

test('passes the catalog-derived gaps and allowed recommendations into the existing generator', async () => {
  const { load } = fixture({ c2c_user_courses: [{ status: 'completed', c2c_courses: structures }] })
  const response = await invoke(load, async (input, candidates) => {
    assert.deepEqual(input.skillGaps.map(({ name }) => name), ['SQL'])
    assert.deepEqual(candidates.map(({ candidateRef }) => candidateRef), ['c42'])
    assert.doesNotMatch(JSON.stringify(input), /local-user-fixture|local\.session\.fixture/)
    return { steps: [{
      title: 'SQL 실습',
      learningGoals: ['쿼리 작성'],
      recommendedCourses: [{ candidateRef: 'c42', reason: 'SQL 실습' }],
      practiceProjects: [],
    }] }
  }, {})
  assert.equal(response.status, 200)
  const { steps } = await response.json()
  assert.equal(steps[0].recommendedCourses[0].course.name, '데이터베이스')
})

test('a saved transition from in_progress to completed covers concepts and removes the course from recommendations', async () => {
  async function generateWithStatus(status: 'in_progress' | 'completed') {
    const { load } = fixture({ c2c_user_courses: [{ status, c2c_courses: structures }] })
    const received = { gaps: [] as string[], candidates: [] as string[] }
    const response = await invoke(load, async (input, candidates) => {
      received.gaps = input.skillGaps.map(({ name }) => name)
      received.candidates = candidates.map(({ candidateRef }) => candidateRef)
      return {
        steps: [{ title: '연습', learningGoals: ['개념 정리'], recommendedCourses: [], practiceProjects: [] }],
      }
    }, { careerId: backend.slug })
    assert.equal(response.status, 200)
    return received
  }

  assert.deepEqual(await generateWithStatus('in_progress'), { gaps: ['스택', 'SQL'], candidates: ['c1', 'c42'] })
  assert.deepEqual(await generateWithStatus('completed'), { gaps: ['SQL'], candidates: ['c42'] })
})

test('stops before generation when a career is missing, concepts are unready or reads fail', async () => {
  for (const [data, body, status, code] of [
    [{ c2c_user_career_interests: [] }, {}, 400, 'CAREER_SELECTION_REQUIRED'],
    [{ c2c_career_courses: [{ c2c_courses: { ...database, c2c_course_concepts: [] } }] }, { careerId: backend.slug }, 409, 'CAREER_REQUIREMENTS_NOT_READY'],
    [{ c2c_user_courses: new Response(null, { status: 403 }) }, { careerId: backend.slug }, 500, 'INTERNAL_ERROR'],
    [{ c2c_user_courses: [{ status: 'invalid', c2c_courses: structures }] }, { careerId: backend.slug }, 500, 'INTERNAL_ERROR'],
  ] as const) {
    let generated = 0
    const response = await invoke(fixture(data).load, async () => { generated++; return null }, body)
    assert.equal(response.status, status)
    assert.equal((await response.json()).code, code)
    assert.equal(generated, 0)
  }
})
