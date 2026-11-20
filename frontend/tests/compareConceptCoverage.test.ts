import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  compareConceptCoverage,
  toRoadmapSkillGaps,
  type CompletedCourseConcepts,
  type RequiredConcept,
} from '../src/roadmap/compareConceptCoverage.ts'
import type { RoadmapRequest } from '../src/roadmap/contracts'

const sql = { id: 'sql', name: 'SQL', priority: 1 }
const api = { id: 'api', name: 'API 설계' }

function readyCourse(courseId: string, ...conceptIds: string[]): CompletedCourseConcepts {
  return { courseId, status: 'ready', conceptIds }
}

function compare(completedCourses: CompletedCourseConcepts[], concepts: RequiredConcept[] = [sql, api]) {
  return compareConceptCoverage({ requirements: { status: 'ready', concepts }, completedCourses })
}

test('classifies every matching concept as covered', () => {
  assert.deepEqual(compare([readyCourse('db', 'sql'), readyCourse('web', 'api')]), {
    requirementsStatus: 'ready',
    covered: [{ ...sql, courseIds: ['db'] }, { ...api, courseIds: ['web'] }],
    uncovered: [],
    unknown: [],
  })
})

test('separates covered and uncovered concepts when some match', () => {
  const result = compare([readyCourse('db', 'sql')])
  assert.deepEqual(result.covered, [{ ...sql, courseIds: ['db'] }])
  assert.deepEqual(result.uncovered, [api])
  assert.deepEqual(result.unknown, [])
})

test('classifies every requirement as uncovered when ready mappings do not match', () => {
  const result = compare([readyCourse('algorithms', 'sorting'), readyCourse('seminar')])
  assert.deepEqual(result.covered, [])
  assert.deepEqual(result.uncovered, [sql, api])
  assert.deepEqual(result.unknown, [])
})

test('reports no coverage evidence when there are no completed courses', () => {
  assert.deepEqual(compare([]).uncovered, [sql, api])
})

test('deduplicates requirement and course IDs while keeping every distinct evidence course', () => {
  const result = compare([
    readyCourse('db', 'sql', 'sql'),
    readyCourse('db', 'sql'),
    readyCourse('analytics', 'sql'),
  ], [sql, { id: 'sql', name: '중복 표시명' }])
  assert.deepEqual(result.covered, [{ ...sql, courseIds: ['db', 'analytics'] }])
})

test('ignores concepts found only in planned courses', () => {
  const registrations = [
    { courseStatus: 'completed', mapping: readyCourse('db', 'sql') },
    { courseStatus: 'planned', mapping: readyCourse('web', 'api') },
  ]
  const completed = registrations.filter(({ courseStatus }) => courseStatus === 'completed')
    .map(({ mapping }) => mapping)
  assert.deepEqual(compare(completed).uncovered, [api])
})

test('uses concept IDs independently of display names', () => {
  const result = compare([readyCourse('db', 'sql')], [
    { id: 'sql', name: '관계형 질의' },
    { id: 'different-concept', name: '관계형 질의' },
  ])
  assert.deepEqual(result.covered.map(({ id }) => id), ['sql'])
  assert.deepEqual(result.uncovered.map(({ id }) => id), ['different-concept'])
})

test('keeps confirmed matches and reports pending courses for unresolved concepts', () => {
  const result = compare([
    readyCourse('db', 'sql'),
    { courseId: 'workshop', status: 'pending', conceptIds: ['sql'] },
    { courseId: 'web', status: 'pending', conceptIds: [] },
  ])
  assert.deepEqual(result.covered, [{ ...sql, courseIds: ['db', 'workshop'] }])
  assert.deepEqual(result.uncovered, [])
  assert.deepEqual(result.unknown, [{ ...api, pendingCourseIds: ['workshop', 'web'] }])
})

test('distinguishes pending requirements from a known empty requirement list', () => {
  const pending = compareConceptCoverage({ requirements: { status: 'pending' }, completedCourses: [] })
  assert.deepEqual(pending, { requirementsStatus: 'pending', covered: [], uncovered: [], unknown: [] })
  assert.deepEqual(compare([], []), { ...pending, requirementsStatus: 'ready' })
})

test('converts only uncovered concepts to AI skill gaps without passing identifiers', () => {
  const request: RoadmapRequest = {
    targetCareer: { name: '백엔드 개발자' },
    completedCourses: [{ name: '데이터베이스' }],
    plannedCourses: [],
    skillGaps: toRoadmapSkillGaps(compare([readyCourse('db', 'sql')])),
  }
  assert.deepEqual(request.skillGaps, [{
    name: 'API 설계',
    context: '수강 완료 과목의 개념 목록에서 이 개념을 확인하지 못했습니다.',
  }])
  assert.deepEqual(toRoadmapSkillGaps(compare([
    { courseId: 'db', status: 'pending', conceptIds: ['sql'] },
  ])), [])
})
