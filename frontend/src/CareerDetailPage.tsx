import './CareerDetailPage.css'

type Course = {
  name: string
  concepts: string
}

type CareerDetail = {
  title: string
  description: string
  tags: string[]
  courses: Course[]
}

const careerDetails: Record<string, CareerDetail> = {
  '프론트엔드 개발자': {
    title: '프론트엔드 개발자',
    description: '웹 서비스의 사용자 화면을 구현하고, 사용자가 편리하게 이용할 수 있도록 경험을 개선하는 직무예요.',
    tags: ['개발 분야', '웹 서비스'],
    courses: [
      { name: '웹프로그래밍', concepts: 'HTML · CSS · JavaScript' },
      { name: '자료구조', concepts: '자료 구조와 알고리즘 기초' },
      { name: '데이터베이스', concepts: '데이터 모델링과 SQL' },
      { name: '컴퓨터 네트워크', concepts: 'HTTP와 네트워크 구조' },
      { name: '소프트웨어공학', concepts: '설계 패턴과 협업 개발' },
      { name: '사용자 인터페이스', concepts: 'UI 설계와 사용성 평가' },
    ],
  },
  '백엔드 개발자': {
    title: '백엔드 개발자',
    description: '서비스의 데이터와 서버 기능을 안정적으로 설계하고 구현하는 직무예요.',
    tags: ['개발 분야', '서버·API'],
    courses: [
      { name: '자료구조', concepts: '자료 구조와 알고리즘 기초' },
      { name: '데이터베이스', concepts: '데이터 모델링과 SQL' },
      { name: '운영체제', concepts: '프로세스와 메모리 관리' },
      { name: '컴퓨터 네트워크', concepts: 'TCP/IP와 네트워크 구조' },
      { name: '소프트웨어공학', concepts: '시스템 설계와 테스트' },
      { name: '정보보안', concepts: '인증·인가와 웹 보안' },
      { name: '분산시스템', concepts: '확장성과 장애 대응' },
    ],
  },
  'AI 엔지니어': {
    title: 'AI 엔지니어',
    description: '인공지능 모델을 개발하고 실제 서비스 환경에 적용해 지속적으로 개선하는 직무예요.',
    tags: ['데이터·AI', '인공지능'],
    courses: [
      { name: '선형대수', concepts: '벡터와 행렬 연산' },
      { name: '확률과 통계', concepts: '확률 분포와 통계적 추론' },
      { name: '머신러닝', concepts: '지도·비지도 학습' },
      { name: '딥러닝', concepts: '신경망과 모델 학습' },
      { name: '데이터베이스', concepts: '학습 데이터 관리와 SQL' },
    ],
  },
  '데이터 분석가': {
    title: '데이터 분석가',
    description: '데이터를 수집하고 분석하여 의사결정에 도움이 되는 의미 있는 인사이트를 찾는 직무예요.',
    tags: ['데이터·AI', '데이터 분석'],
    courses: [
      { name: '확률과 통계', concepts: '기술 통계와 가설 검정' },
      { name: '데이터베이스', concepts: 'SQL과 데이터 추출' },
      { name: '데이터 시각화', concepts: '차트와 대시보드 설계' },
      { name: '머신러닝', concepts: '예측 모델과 성능 평가' },
    ],
  },
  'UI/UX 디자이너': {
    title: 'UI/UX 디자이너',
    description: '사용자의 요구와 행동을 이해하고 편리하고 일관된 서비스 경험과 화면을 설계하는 직무예요.',
    tags: ['디자인', '사용자 경험'],
    courses: [
      { name: '사용자 인터페이스', concepts: 'UI 원칙과 인터랙션 설계' },
      { name: '인간컴퓨터상호작용', concepts: '사용자 조사와 사용성 평가' },
      { name: '웹프로그래밍', concepts: 'HTML · CSS 기초' },
      { name: '디자인 시스템', concepts: '컴포넌트와 시각적 일관성' },
      { name: '서비스 디자인', concepts: '사용자 여정과 프로토타이핑' },
    ],
  },
  '클라우드 엔지니어': {
    title: '클라우드 엔지니어',
    description: '클라우드 환경에서 안정적이고 확장 가능한 시스템과 서비스 운영 기반을 구축하는 직무예요.',
    tags: ['인프라', '클라우드'],
    courses: [
      { name: '운영체제', concepts: '프로세스와 리눅스 시스템' },
      { name: '컴퓨터 네트워크', concepts: '네트워크 구조와 보안' },
      { name: '분산시스템', concepts: '분산 처리와 고가용성' },
      { name: '클라우드 컴퓨팅', concepts: '가상화와 컨테이너' },
    ],
  },
}

export default function CareerDetailPage({ careerName }: { careerName: string }) {
  const career = careerDetails[careerName]

  if (!career) {
    return (
      <main className="career-detail-page career-not-found">
        <h1>직무 정보를 찾을 수 없어요.</h1>
        <a href="#career">직무 목록으로 돌아가기</a>
      </main>
    )
  }

  return (
    <main className="career-detail-page">
      <nav className="career-breadcrumb" aria-label="현재 위치">
        <a href="#career">직무 탐색</a><span aria-hidden="true">/</span><span>{career.title}</span>
      </nav>

      <section className="career-detail-intro">
        <h1>{career.title}</h1>
        <p>{career.description}</p>
        <div className="career-tags">
          {career.tags.map((tag, index) => <span className={index === 0 ? 'primary' : ''} key={tag}>{tag}</span>)}
        </div>
        <a className="roadmap-link" href={`#roadmap-${encodeURIComponent(career.title)}`}>로드맵 확인하기 →</a>
      </section>

      <section className="connected-courses" aria-labelledby="course-heading">
        <h2 id="course-heading">이 직무와 연결되는 전공 과목</h2>
        <p>과목을 수강했는지에 따라 현재 학습 이력을 비교해요.</p>

        <div className="course-list">
          {career.courses.map((course) => (
            <article className="course-row" key={course.name}>
              <div>
                <h3>{course.name}</h3>
                <p>{course.concepts}</p>
              </div>
              <div className="course-actions">
                <span className="course-status">미수강</span>
                <button type="button">개념 보기 →</button>
              </div>
            </article>
          ))}
        </div>

        <p className="course-note">※ 과목 수강 이력은 학습 경험을 나타내며, 개별 개념의 숙련도를 의미하지는 않아요.</p>
      </section>
    </main>
  )
}
