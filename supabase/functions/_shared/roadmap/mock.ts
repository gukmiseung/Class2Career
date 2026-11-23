import type { RoadmapData, RoadmapDependencies } from './handler.ts'
import type { GeneratedRoadmap } from './response.ts'

export async function loadMockRoadmap(
  { careerId }: Parameters<RoadmapDependencies['load']>[0],
): Promise<RoadmapData | null> {
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
      details: {
        weeks: 3,
        outcome: '대출·반납 기록을 저장하고, 같은 책의 중복 대출을 막는 기능을 구현합니다.',
        competition: {
          type: '대학생 생활 문제 해결 해커톤',
          query: '대학생 생활 문제 해결 해커톤 공고',
          submission: '교내 도서 대출 과정을 개선하는 웹 서비스와 대출·반납을 보여 주는 데모를 준비합니다.',
          whatToCheck: '학교별 추천이 필요한지, 개인 참가가 가능한지, 시연 영상이 필요한지 확인합니다.',
        },
        experience: {
          setting: '교내 개발 동아리의 팀 프로젝트',
          actions: ['팀원과 API 요청·응답 형식을 합의합니다.', '다른 팀원에게 중복 대출 방지 코드를 리뷰받고 테스트에 반영합니다.'],
          evidence: '내가 구현한 API, 코드 리뷰에서 고친 내용, 중복 대출 테스트 결과를 README에 남깁니다.',
        },
      },
      recommendedCourses: candidates.slice(0, 2).map(({ candidateRef }) => ({
        candidateRef,
        reason: '과목 실습을 통해 직무 개념을 연습할 수 있습니다.',
        application: '관계형 모델링 과제에서 만든 테이블 구조를 대출·반납 기록에 적용합니다.',
      })),
      practiceProjects: [{
        title: '도서 대출 모델',
        description: '대출 기록과 도서의 관계를 모델링하고 간단한 조회를 구현합니다.',
        plan: {
          tasks: ['도서·이용자·대출 기록의 관계도를 그립니다.', '대출과 반납 API를 만들고 같은 책의 중복 대출을 테스트합니다.'],
          deliverable: 'ERD, API 명세, 테스트 실행 방법이 포함된 저장소',
          doneWhen: '동시에 들어온 두 대출 요청 중 한 건만 성공하고 반납 이력이 조회됩니다.',
        },
      }],
    }],
  } satisfies GeneratedRoadmap
}
