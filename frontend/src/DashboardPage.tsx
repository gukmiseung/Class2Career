import './DashboardPage.css'

const exploreCards = [
  {
    icon: '💼',
    tone: 'blue',
    title: '희망 직무 탐색하기',
    link: '직무 선택하기 →',
    href: '#career',
  },
  {
    icon: '📚',
    tone: 'green',
    title: '전공 과목 탐색하기',
    link: '과목 선택하기 →',
    href: '#explore',
  },
]

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-intro">
        <strong className="dashboard-brand">Class2Career</strong>
        <h1>나의 전공 지식, 어디까지 연결해 볼까요?</h1>
        <p>전공 수업에서 배운 개념을 실제 직무와 연결하고, 다음 학습 방향을 찾아보세요.</p>
      </section>

      <section className="dashboard-section" aria-label="탐색 시작하기">
        <div className="explore-grid">
          {exploreCards.map((card) => (
            <article className="explore-card" key={card.title}>
              <div className={`dashboard-icon ${card.tone}`} aria-hidden="true">{card.icon}</div>
              <h3>{card.title}</h3>
              <a className={card.tone} href={card.href}>{card.link}</a>
            </article>
          ))}
        </div>
      </section>

    </main>
  )
}
