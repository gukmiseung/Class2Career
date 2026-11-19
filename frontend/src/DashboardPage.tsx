import './DashboardPage.css'

const exploreCards = [
  {
    icon: '💼',
    tone: 'blue',
    title: '희망 직무 탐색하기',
    description: <>관심 있는 직무에 필요한 전공 과목과<br />세부 개념, 추가 학습 방향을 확인해요.</>,
    link: '직무 선택하기 →',
    href: '#career',
  },
  {
    icon: '📚',
    tone: 'green',
    title: '전공 과목 탐색하기',
    description: <>수강한 과목의 세부 개념을 선택하고<br />실무 활용 사례와 관련 직무를 살펴봐요.</>,
    link: '과목 선택하기 →',
    href: '#explore',
  },
]

const learningStats = [
  { label: '수강 완료 과목', value: '0개', caption: '등록한 과목 기준' },
  { label: '수강 예정 과목', value: '0개', caption: '앞으로 배울 과목' },
  { label: '관심 직무', value: '0개', caption: '저장한 직무' },
]

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-intro">
        <h1>나의 전공 지식, 어디까지 연결해 볼까요?</h1>
        <p>전공 수업에서 배운 개념을 실제 직무와 연결하고, 다음 학습 방향을 찾아보세요.</p>
      </section>

      <section className="dashboard-section" aria-labelledby="explore-title">
        <h2 id="explore-title">탐색 시작하기</h2>
        <div className="explore-grid">
          {exploreCards.map((card) => (
            <article className="explore-card" key={card.title}>
              <div className={`dashboard-icon ${card.tone}`} aria-hidden="true">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <a className={card.tone} href={card.href}>{card.link}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section learning-section" aria-labelledby="learning-title">
        <h2 id="learning-title">나의 학습 현황</h2>
        <div className="stats-grid">
          {learningStats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <h3>{stat.label}</h3>
              <strong>{stat.value}</strong>
              <p>{stat.caption}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
