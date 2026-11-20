import type { RoadmapDependencies } from './handler.ts'
import type { GeneratedRoadmap } from './response.ts'

export const loadMockRoadmap: RoadmapDependencies['load'] = async ({ careerId }) => {
  if (careerId !== 'backend-developer') return null

  return {
    request: {
      targetCareer: { name: '백엔드 개발자' },
      completedCourses: [{ name: '자료구조' }],
      plannedCourses: [{ name: '데이터베이스' }],
    },
    coverage: {
      requirements: {
        status: 'ready',
        concepts: [
          { id: 'mock-data-structures', name: '자료구조' },
          { id: 'mock-data-modeling', name: '관계형 데이터 모델링' },
        ],
      },
      completedCourses: [{
        courseId: 'mock-structures',
        status: 'ready',
        conceptIds: ['mock-data-structures'],
      }],
    },
    candidates: [{ candidateRef: 'c1', name: '데이터베이스' }],
  }
}

export const generateMockRoadmap: RoadmapDependencies['generate'] = async (request, candidates) => {
  const skill = request.skillGaps[0]?.name

  return {
    steps: [{
      title: skill ?? '직무 개념 응용',
      learningGoals: [skill ? `${skill}을 과목 실습에 적용합니다.` : '이미 학습한 개념을 실습에 적용합니다.'],
      recommendedCourses: candidates.slice(0, 2).map(({ candidateRef }) => ({
        candidateRef,
        reason: '과목 실습을 통해 직무 개념을 연습할 수 있습니다.',
      })),
      practiceProjects: [{
        title: '도서 대출 모델',
        description: '대출 기록과 도서의 관계를 모델링하고 간단한 조회를 구현합니다.',
      }],
    }],
  } satisfies GeneratedRoadmap
}
