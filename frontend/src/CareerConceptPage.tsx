import './CareerConceptPage.css'

type CareerConceptPageProps = {
  careerName: string
  courseName: string
  conceptSummary: string
}

export default function CareerConceptPage({ careerName, courseName, conceptSummary }: CareerConceptPageProps) {
  const mockConcepts = [
    {
      title: '핵심 개념',
      description: `${courseName}에서 배우는 ${conceptSummary}의 기본 원리와 주요 용어를 이해해요.`,
    },
    {
      title: '직무에서의 활용',
      description: `${careerName}가 서비스를 설계하고 문제를 해결할 때 ${conceptSummary}을 활용해요.`,
    },
    {
      title: '학습 포인트',
      description: '작은 예제를 직접 구현하고 결과를 비교하면서 개념이 적용되는 과정을 확인해 보세요.',
    },
  ]

  return (
    <main className="career-concept-page">
      <nav className="career-concept-breadcrumb" aria-label="현재 위치">
        <a href="#career">직무 탐색</a>
        <span aria-hidden="true">/</span>
        <a href={`#career-${encodeURIComponent(careerName)}`}>{careerName}</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{courseName}</span>
      </nav>

      <header className="career-concept-intro">
        <p>{careerName} · {courseName}</p>
        <h1>{courseName}의 주요 개념</h1>
        <span>{conceptSummary}</span>
      </header>

      <section className="career-concept-list" aria-label={`${courseName} 개념 설명`}>
        {mockConcepts.map((concept) => (
          <article key={concept.title}>
            <h2>{concept.title}</h2>
            <p>{concept.description}</p>
          </article>
        ))}
      </section>

      <aside className="career-concept-note">
        <strong>목 데이터 안내</strong>
        <p>현재 내용은 화면 확인용 예시이며, 추후 Gemini API의 과목별 개념 설명으로 교체됩니다.</p>
      </aside>
    </main>
  )
}
