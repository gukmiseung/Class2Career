import { deepEqual, equal } from 'node:assert/strict'
import { test } from 'node:test'
import { roadmaps } from '../src/careerRoadmaps.ts'
import { buildGeneralRoadmap } from '../src/roadmap/generalRoadmap.ts'
import type { Course } from '../src/courses'

function course(dbId: number): Course {
  return {
    dbId, id: `course-${dbId}`, slug: `course-${dbId}`, name: `과목 ${dbId}`,
    code: `C${dbId}`, department: '컴퓨터학부', category: '전공', credits: 3,
    year: 1, description: '', major: '컴퓨터학부', curricula: [],
    majors: ['컴퓨터학부'], categories: ['전공'], years: [],
  }
}

const career = {
  title: '백엔드 개발자', slug: 'backend-developer', category: '개발',
  description: '서버를 개발합니다.', keywords: ['API', 'SQL'],
  courses: [
    { course_id: 2, concepts: '  트랜잭션과 정규화  ', sort_order: 2 },
    { course_id: 1, concepts: '자료 구조', sort_order: 1 },
  ],
}

test('joins the selected career to public courses by database ID and uses link evidence', () => {
  const result = buildGeneralRoadmap(career.title, [career], [course(2), course(3), course(1)])
  deepEqual(result?.career, { slug: career.slug, title: career.title, description: career.description })
  deepEqual(result?.skillKeywords, ['API', 'SQL'])
  deepEqual(result?.recommendedCourses.map(({ course, relatedConcepts, reason }) => [course.dbId, relatedConcepts, reason]), [
    [1, '자료 구조', '관련 학습 개념: 자료 구조'],
    [2, '트랜잭션과 정규화', '관련 학습 개념: 트랜잭션과 정규화'],
  ])
  equal(career.courses[0].course_id, 2)
})

test('all six authored roadmaps retain their five stages', () => {
  equal(Object.keys(roadmaps).length, 6)
  for (const [title, steps] of Object.entries(roadmaps)) {
    equal(steps.length, 5)
    equal(buildGeneralRoadmap(title, [{ ...career, title }], [])?.steps, steps)
  }
})

test('skips unresolved links and leaves missing evidence and stages empty', () => {
  const other = {
    ...career, title: '보안 직무', keywords: [],
    courses: [
      { course_id: 1, concepts: '   ', sort_order: 1 },
      { course_id: 4, concepts: '보안', sort_order: 2 },
    ],
  }
  const result = buildGeneralRoadmap(other.title, [other], [course(1)])
  deepEqual(result?.recommendedCourses, [{ course: course(1), relatedConcepts: null, reason: null }])
  deepEqual(result?.skillKeywords, [])
  deepEqual(result?.steps, [])
  deepEqual(buildGeneralRoadmap(other.title, [other], [])?.recommendedCourses, [])
})

test('returns null when the career catalog has no matching title', () => {
  equal(buildGeneralRoadmap('없는 직무', [career], []), null)
})
