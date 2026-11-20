import { useEffect, useRef } from 'react'
import ConceptHeader from './ConceptHeader'
import { conceptAnalyses } from './conceptAnalysis'
import type { CourseConcept } from './courseConcepts'
import './ConceptAnalysisPage.css'

type ConceptAnalysisPageProps = {
  courseName: string
  concepts: readonly CourseConcept[]
  selectionHref: string
  recommendationHref: string
}

export default function ConceptAnalysisPage({ courseName, concepts, selectionHref, recommendationHref }: ConceptAnalysisPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const analyses = concepts.map((concept) => ({ concept, analysis: conceptAnalyses[concept.id] }))
  const examples = analyses.flatMap(({ analysis }) => analysis?.examples ?? [])

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
          <p>선택한 개념의 설명과 등록된 실무 활용 사례를 확인해 보세요.</p>
        </header>

        <section className="analysis-concept-list" aria-label="선택한 개념 설명">
          {analyses.map(({ concept }) => (
            <article className="analysis-concept-card" key={concept.id}>
              <span>선택한 개념 · {courseName}</span>
              <h2>{concept.name}란?</h2>
              <p>{concept.description || '아직 등록된 개념 설명이 없습니다.'}</p>
            </article>
          ))}
        </section>

        <section className="analysis-examples" aria-labelledby="analysis-examples-title">
          <h2 id="analysis-examples-title">실무 활용 사례</h2>
          {examples.length > 0 ? <ol className="analysis-example-grid">
            {examples.map(({ title, description, topic }, index) => (
              <li className="analysis-example" key={title}>
                <span className="analysis-example-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3><p>{description}</p><strong># {topic}</strong>
              </li>
            ))}
          </ol> : <p>이 개념의 실무 활용 사례는 아직 등록되지 않았습니다.</p>}
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
