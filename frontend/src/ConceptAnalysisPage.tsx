import { useEffect, useRef } from 'react'
import ConceptHeader from './ConceptHeader'
import type { CourseConcept } from './courseConcepts'
import './ConceptAnalysisPage.css'
import { useConceptExamples } from './useConceptExamples'

type ConceptAnalysisPageProps = {
  courseName: string
  concepts: readonly CourseConcept[]
  selectionHref: string
  recommendationHref: string
}

const conceptExplanations: Record<string, string> = {
  lists: '배열은 데이터를 연속된 공간에 저장해 빠르게 조회하고, 연결 리스트는 각 데이터를 연결해 삽입과 삭제를 유연하게 처리해요. 상품 목록이나 최근 사용 기록처럼 순서가 중요한 서비스에서 활용돼요.',
  'stacks-queues': '스택은 가장 나중에 들어온 데이터를 먼저 처리하고, 큐는 먼저 들어온 데이터부터 처리해요. 실행 취소나 알림 대기열처럼 작업 순서가 중요한 기능에 활용돼요.',
  'trees-graphs': '트리와 그래프는 데이터 사이의 관계를 표현하는 자료구조예요. 트리는 계층적인 관계를, 그래프는 여러 대상이 서로 연결된 관계를 나타내요. 친구 관계나 길 찾기처럼 연결 구조를 다루는 서비스에서 활용돼요.',
  'sorting-search': '정렬은 데이터를 기준에 맞게 순서대로 배치하고, 탐색은 필요한 데이터를 효율적으로 찾는 방법이에요. 상품 정렬이나 로그 검색처럼 많은 정보에서 원하는 결과를 빠르게 보여줄 때 활용돼요.',
}

export default function ConceptAnalysisPage({ courseName, concepts, selectionHref, recommendationHref }: ConceptAnalysisPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const generated = useConceptExamples(concepts.map(concept => concept.id))
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="concept-page analysis-page">
      <ConceptHeader />
      <main className="analysis-content">
        <nav className="concept-breadcrumb" aria-label="현재 위치">
          <a href="#explore">전공 탐색</a><span aria-hidden="true">/</span>
          <a href={selectionHref}>{courseName}</a><span aria-hidden="true">/</span>
          <span aria-current="page">분석 결과</span>
        </nav>

        <header className="analysis-intro">
          <h1 ref={titleRef} tabIndex={-1}>선택한 개념은 실무에서 어떻게 쓰일까요?</h1>
          <p>개념을 간단히 살펴보고 실제 서비스에서의 활용 사례를 확인해 보세요.</p>
        </header>

        <section className="analysis-concept-list" aria-label="선택한 개념 설명">
          {concepts.map((concept) => (
            <article className="analysis-concept-card" key={concept.id}>
              <span>선택한 개념 · {courseName}</span>
              <h2>{concept.name}</h2>
              <p>{conceptExplanations[concept.id] ?? concept.description}</p>
            </article>
          ))}
        </section>

        <section className="analysis-examples" aria-labelledby="analysis-examples-title">
          <h2 id="analysis-examples-title">실무 활용 사례</h2>
          {generated.error ? (
            <div role="alert">
              <p>{generated.error}</p>
              <button type="button" onClick={generated.retry}>다시 생성</button>
            </div>
          ) : !generated.examples && <p role="status">선택한 개념의 실무 사례를 생성하고 있어요.</p>}
          {generated.examples && <ol className="analysis-example-grid" aria-live="polite">
            {generated.examples.map(({ title, description, topic }, index) => (
              <li className="analysis-example" key={index}>
                <span className="analysis-example-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3><p>{description}</p><strong># {topic}</strong>
              </li>
            ))}
          </ol>}
        </section>

        <section className="analysis-next" aria-label="관련 직무와 다음 학습 추천">
          <div><h2>이 개념과 연결되는 직무가 궁금하다면?</h2><p>관련 직무와 이어서 살펴볼 학습 내용을 확인할 수 있어요.</p></div>
          <a className="analysis-next-link" href={recommendationHref}>
            관련 직무 · 다음 학습 추천 보기 <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>
    </div>
  )
}
