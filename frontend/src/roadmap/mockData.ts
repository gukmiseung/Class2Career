import type {
  RoadmapInputSelection,
  RoadmapInputSource,
  RoadmapRequest,
  RoadmapResponse,
} from './contracts'

export const mockRoadmapSelection: Readonly<RoadmapInputSelection> = {
  learnerKey: 'demo-learner',
  careerName: '백엔드 개발자',
}

const mockRequest: RoadmapRequest = {
  targetCareer: {
    name: mockRoadmapSelection.careerName,
    description: '서비스의 데이터와 서버 기능을 설계하고 구현하는 직무',
  },
  completedCourses: [{ name: '자료구조' }],
  plannedCourses: [{ name: '데이터베이스' }],
  skillGaps: [
    { name: '관계형 데이터 모델링', context: '테이블 관계와 제약 조건을 설계한 경험이 부족합니다.' },
    { name: 'REST API 설계', context: '입력 검증과 오류 응답 설계 연습이 필요합니다.' },
  ],
}

export const mockRoadmapInputSource: RoadmapInputSource = {
  async load({ learnerKey, careerName }) {
    if (learnerKey !== mockRoadmapSelection.learnerKey || careerName !== mockRoadmapSelection.careerName) {
      return null
    }
    return structuredClone(mockRequest)
  },
}

/** Example response for mockRoadmapSelection, without an AI API call. */
export const mockRoadmapResponse: RoadmapResponse = {
  steps: [
    {
      title: '관계형 데이터 모델 설계',
      learningGoals: ['테이블 간 관계를 정의한다.', '제약 조건으로 데이터 일관성을 유지한다.'],
      recommendedCourses: [
        {
          course: { name: '데이터베이스' },
          reason: '수강 예정 과목의 모델링 실습으로 현재 역량 격차를 줄일 수 있습니다.',
        },
      ],
      practiceProjects: [
        { title: '도서 대출 모델', description: '도서, 회원, 대출 기록의 관계와 제약 조건을 설계합니다.' },
      ],
    },
    {
      title: 'REST API 설계와 구현',
      learningGoals: ['리소스별 엔드포인트를 설계한다.', '잘못된 요청에 일관된 오류 응답을 반환한다.'],
      recommendedCourses: [
        {
          course: { name: '소프트웨어공학' },
          reason: '수강 완료한 자료구조 지식을 모듈 설계와 API 테스트로 확장할 수 있습니다.',
        },
      ],
      practiceProjects: [
        { title: '도서 대출 API', description: '대출과 반납 API를 구현하고 입력 검증과 오류 응답을 테스트합니다.' },
      ],
    },
  ],
}
