import { useCourseRegistrations } from './contexts/CourseRegistrationsContext'
import { useCourseCatalog } from './useCourseCatalog'
import './RoadmapPage.css'

type RoadmapStep = { title: string; description: string; kind: string; courseNames?: string[] }

const roadmaps: Record<string, RoadmapStep[]> = {
  '프론트엔드 개발자': [
    { title: '기초 다지기', description: '웹프로그래밍 · HTML, CSS, JavaScript', kind: '기초 학습', courseNames: ['웹프로그래밍'] },
    { title: '자료 구조 이해', description: '배열, 스택, 큐, 트리의 기본 개념', kind: '추가 학습', courseNames: ['자료구조'] },
    { title: '웹 통신과 데이터', description: 'HTTP, API, 데이터베이스 기초', kind: '추가 학습', courseNames: ['컴퓨터네트워크', '데이터베이스'] },
    { title: '프론트엔드 프레임워크', description: '컴포넌트, 상태 관리, 라우팅', kind: '추가 학습' },
    { title: '실전 프로젝트', description: 'API를 연결한 반응형 웹 서비스 제작', kind: '프로젝트' },
  ],
  '백엔드 개발자': [
    { title: '프로그래밍 기초', description: '언어 문법, 객체지향 프로그래밍', kind: '기초 학습', courseNames: ['컴퓨터프로그래밍', '객체지향프로그래밍', '파이썬프로그래밍'] },
    { title: '자료 구조와 알고리즘', description: '핵심 자료 구조와 문제 해결', kind: '추가 학습', courseNames: ['자료구조', '알고리즘'] },
    { title: '데이터베이스 설계', description: 'SQL, 정규화, 트랜잭션', kind: '추가 학습', courseNames: ['데이터베이스'] },
    { title: '서버와 API', description: 'REST API, 인증과 인가', kind: '추가 학습' },
    { title: '실전 프로젝트', description: '확장 가능한 서버 서비스 구축', kind: '프로젝트' },
  ],
  'AI 엔지니어': [
    { title: '수학 기초', description: '선형대수, 미적분, 확률과 통계', kind: '기초 학습', courseNames: ['선형대수'] },
    { title: '데이터 처리', description: 'Python, 데이터 전처리와 시각화', kind: '추가 학습', courseNames: ['파이썬프로그래밍', '데이터베이스'] },
    { title: '머신러닝', description: '지도·비지도 학습과 모델 평가', kind: '추가 학습', courseNames: ['기계학습'] },
    { title: '딥러닝', description: '신경망, 학습 최적화와 프레임워크', kind: '추가 학습' },
    { title: 'AI 서비스 프로젝트', description: '모델 배포와 서비스 연동', kind: '프로젝트' },
  ],
  '데이터 분석가': [
    { title: '통계 기초', description: '기술 통계, 확률과 가설 검정', kind: '기초 학습' },
    { title: '데이터 추출', description: 'SQL과 데이터베이스 활용', kind: '추가 학습', courseNames: ['데이터베이스'] },
    { title: '데이터 분석', description: 'Python을 활용한 탐색적 분석', kind: '추가 학습', courseNames: ['파이썬프로그래밍', '기계학습'] },
    { title: '시각화와 리포팅', description: '차트, 대시보드와 인사이트 전달', kind: '추가 학습' },
    { title: '분석 프로젝트', description: '실제 데이터 기반 문제 해결', kind: '프로젝트' },
  ],
  'UI/UX 디자이너': [
    { title: '디자인 기초', description: '색상, 타이포그래피와 레이아웃', kind: '기초 학습' },
    { title: '사용자 조사', description: '인터뷰, 페르소나와 사용자 여정', kind: '추가 학습' },
    { title: 'UI 설계', description: '와이어프레임과 디자인 시스템', kind: '추가 학습', courseNames: ['사용자인터페이스설계'] },
    { title: '프로토타이핑', description: '인터랙션 설계와 사용성 테스트', kind: '추가 학습' },
    { title: '포트폴리오 프로젝트', description: '문제 정의부터 결과 검증까지', kind: '프로젝트' },
  ],
  '클라우드 엔지니어': [
    { title: '시스템 기초', description: '운영체제, Linux와 네트워크', kind: '기초 학습', courseNames: ['운영체제', '컴퓨터네트워크'] },
    { title: '클라우드 핵심', description: '컴퓨팅, 스토리지와 네트워크', kind: '추가 학습', courseNames: ['클라우드컴퓨팅'] },
    { title: '컨테이너', description: 'Docker와 컨테이너 오케스트레이션', kind: '추가 학습' },
    { title: '자동화와 모니터링', description: 'CI/CD, IaC와 시스템 관측', kind: '추가 학습' },
    { title: '인프라 프로젝트', description: '고가용성 서비스 환경 구축', kind: '프로젝트' },
  ],
}

export default function RoadmapPage({ careerName }: { careerName: string }) {
  const steps = roadmaps[careerName]
  const { registrations } = useCourseRegistrations()
  const { catalog } = useCourseCatalog()

  if (!steps) {
    return (
      <main className="roadmap-page roadmap-not-found">
        <h1>로드맵 정보를 찾을 수 없어요.</h1>
        <a href="#career">직무 목록으로 돌아가기</a>
      </main>
    )
  }

  const completedCourseNames = new Set(
    catalog?.courses.filter(({ dbId }) => registrations[dbId] === 'completed')
      .map(({ name }) => name.replaceAll(' ', '')),
  )
  const isCompleted = (step: RoadmapStep) => step.courseNames?.some((name) => completedCourseNames.has(name)) ?? false
  const completedCount = steps.filter(isCompleted).length

  return (
    <main className="roadmap-page">
      <nav className="roadmap-breadcrumb" aria-label="현재 위치">
        <a href="#career">직무 탐색</a><span>/</span>
        <a href={`#career-${encodeURIComponent(careerName)}`}>{careerName}</a><span>/</span><span>학습 로드맵</span>
      </nav>

      <section className="roadmap-intro">
        <h1>{careerName} 학습 로드맵</h1>
        <p>현재 수강 이력을 바탕으로 다음에 학습하면 좋은 내용을 단계별로 정리했어요.</p>
      </section>

      <section className="roadmap-progress" aria-label="학습 진행률">
        <div className="progress-track"><span style={{ width: `${(completedCount / steps.length) * 100}%` }} /></div>
        <p>수강 완료한 관련 과목 {completedCount} / {steps.length}</p>
      </section>

      <ol className="roadmap-list">
        {steps.map((step, index) => (
          <li className={`roadmap-step${isCompleted(step) ? ' completed' : ''}`} key={step.title}>
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <div className="step-copy">
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </div>
            <div className="step-action">
              <span>{isCompleted(step) ? '수강 완료' : step.kind}</span>
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}
