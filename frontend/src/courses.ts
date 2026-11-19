export const departments = ['컴퓨터학부', '소프트웨어학과'] as const
export const courseCategories = ['전공 필수', '전공 선택', '기본 소양', '교양'] as const
export const courseYears = [1, 2, 3, 4] as const

export type Department = typeof departments[number]
export type CourseCategory = typeof courseCategories[number]
export type CourseYear = typeof courseYears[number]

type Course = {
  id: string
  name: string
  department: Department
  category: CourseCategory
  credits: number
  year: CourseYear
  description: string
}

const computerScience: Omit<Course, 'department'>[] = [
  { id: 'cs-data-structures', name: '자료구조', category: '기본 소양', credits: 3, year: 1, description: '자료를 효율적으로 저장하고 관리하는 기본 자료 구조를 학습해요.' },
  { id: 'cs-programming', name: '컴퓨터프로그래밍', category: '기본 소양', credits: 3, year: 1, description: '프로그래밍 언어의 기본 문법과 문제 해결 과정을 학습해요.' },
  { id: 'cs-architecture', name: '컴퓨터구조', category: '전공 필수', credits: 3, year: 2, description: '컴퓨터 시스템의 구성 요소와 동작 원리를 이해해요.' },
  { id: 'cs-oop', name: '객체지향프로그래밍', category: '전공 선택', credits: 3, year: 2, description: '객체와 클래스를 활용한 프로그램 설계 방법을 익혀요.' },
  { id: 'cs-discrete-math', name: '이산수학', category: '기본 소양', credits: 3, year: 1, description: '논리, 집합, 그래프로 컴퓨터 과학의 수학적 기초를 다져요.' },
  { id: 'cs-digital-logic', name: '디지털논리회로', category: '기본 소양', credits: 3, year: 1, description: '논리 게이트를 조합해 디지털 회로를 설계해요.' },
  { id: 'cs-computational-thinking', name: '컴퓨팅사고', category: '교양', credits: 2, year: 1, description: '복잡한 문제를 단계로 나누고 해결 절차를 표현해요.' },
  { id: 'cs-linear-algebra', name: '선형대수', category: '기본 소양', credits: 3, year: 2, description: '벡터와 행렬을 활용해 선형 관계를 분석해요.' },
  { id: 'cs-algorithms', name: '알고리즘', category: '전공 필수', credits: 3, year: 2, description: '정렬, 탐색, 동적 계획법을 익히고 수행 시간을 비교해요.' },
  { id: 'cs-databases', name: '데이터베이스', category: '전공 필수', credits: 3, year: 2, description: '관계형 모델로 데이터를 설계하고 SQL로 조회해요.' },
  { id: 'cs-systems-programming', name: '시스템프로그래밍', category: '전공 선택', credits: 3, year: 2, description: '시스템 호출을 활용해 파일과 프로세스를 다루는 프로그램을 작성해요.' },
  { id: 'cs-web-programming', name: '웹프로그래밍', category: '전공 선택', credits: 3, year: 2, description: 'HTML, CSS, JavaScript로 사용자와 상호작용하는 웹 화면을 만들어요.' },
  { id: 'cs-operating-systems', name: '운영체제', category: '전공 필수', credits: 3, year: 3, description: '프로세스 스케줄링, 동기화, 메모리 관리의 원리를 학습해요.' },
  { id: 'cs-networks', name: '컴퓨터네트워크', category: '전공 필수', credits: 3, year: 3, description: '네트워크 계층과 TCP/IP를 통해 데이터 전송 과정을 이해해요.' },
  { id: 'cs-software-engineering', name: '소프트웨어공학', category: '전공 필수', credits: 3, year: 3, description: '요구사항 분석부터 설계, 개발, 테스트까지의 과정을 익혀요.' },
  { id: 'cs-ai', name: '인공지능', category: '전공 선택', credits: 3, year: 3, description: '탐색과 추론을 이용해 다양한 문제를 푸는 방법을 배워요.' },
  { id: 'cs-graphics', name: '컴퓨터그래픽스', category: '전공 선택', credits: 3, year: 3, description: '좌표 변환과 렌더링으로 3차원 장면을 표현해요.' },
  { id: 'cs-security', name: '정보보호개론', category: '전공 선택', credits: 3, year: 3, description: '암호화, 인증, 접근 제어 등 정보 보호의 기본 원리를 이해해요.' },
  { id: 'cs-mobile', name: '모바일프로그래밍', category: '전공 선택', credits: 3, year: 3, description: '모바일 환경에서 동작하는 앱을 설계하고 구현해요.' },
  { id: 'cs-capstone', name: '컴퓨터공학캡스톤디자인', category: '전공 필수', credits: 3, year: 4, description: '팀 프로젝트로 문제를 정의하고 동작하는 결과물을 만들어요.' },
  { id: 'cs-machine-learning', name: '기계학습', category: '전공 선택', credits: 3, year: 4, description: '데이터로 예측 모델을 학습시키고 성능을 평가해요.' },
  { id: 'cs-distributed-systems', name: '분산시스템', category: '전공 선택', credits: 3, year: 4, description: '여러 컴퓨터 사이에서 작업과 데이터를 나누는 원리를 학습해요.' },
  { id: 'cs-cloud', name: '클라우드컴퓨팅', category: '전공 선택', credits: 3, year: 4, description: '가상화와 컨테이너로 서비스를 배포하는 방법을 익혀요.' },
  { id: 'cs-tech-ethics', name: '디지털사회와윤리', category: '교양', credits: 2, year: 4, description: '디지털 기술이 사회에 미치는 영향과 개발자의 책임을 살펴봐요.' },
]

const software: Omit<Course, 'department'>[] = [
  { id: 'sw-intro', name: '소프트웨어입문', category: '기본 소양', credits: 3, year: 1, description: '소프트웨어 개발 과정과 프로그래밍의 기초를 익혀요.' },
  { id: 'sw-python', name: '파이썬프로그래밍', category: '전공 필수', credits: 3, year: 1, description: '파이썬으로 간단한 프로그램을 작성하고 데이터를 다뤄요.' },
  { id: 'sw-data-structures', name: '자료구조', category: '전공 필수', credits: 3, year: 2, description: '리스트, 트리, 그래프를 구현하고 문제 해결에 활용해요.' },
  { id: 'sw-ui', name: '사용자인터페이스설계', category: '전공 선택', credits: 3, year: 2, description: '사용자 요구에 맞는 화면을 설계하고 사용성을 평가해요.' },
  { id: 'sw-testing', name: '소프트웨어테스팅', category: '전공 필수', credits: 3, year: 3, description: '테스트 사례를 설계하고 자동화로 소프트웨어 동작을 검증해요.' },
  { id: 'sw-full-stack', name: '웹서비스개발', category: '전공 선택', credits: 3, year: 3, description: '웹 화면과 서버 API를 연결해 서비스를 구현해요.' },
  { id: 'sw-capstone', name: '소프트웨어캡스톤디자인', category: '전공 필수', credits: 3, year: 4, description: '팀으로 서비스의 기획, 구현, 검증을 경험해요.' },
  { id: 'sw-society', name: '소프트웨어와사회', category: '교양', credits: 2, year: 4, description: '소프트웨어가 일상과 사회에 가져오는 변화를 살펴봐요.' },
]

export const courses: Course[] = [
  ...computerScience.map((course) => ({ ...course, department: '컴퓨터학부' as const })),
  ...software.map((course) => ({ ...course, department: '소프트웨어학과' as const })),
]
