import { useEffect, useRef, useState } from 'react'
import ConceptHeader from './ConceptHeader'
import { getConceptAnalysis } from './conceptAnalysis'
import type { CourseConcept } from './courseConcepts'
import './ConceptAnalysisPage.css'

type ConceptAnalysisPageProps = {
  courseName: string
  concepts: readonly CourseConcept[]
  selectionHref: string
}

export default function ConceptAnalysisPage({ courseName, concepts, selectionHref }: ConceptAnalysisPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const analyses = concepts.map((concept) => ({
    id: concept.id,
    name: concept.name,
    ...getConceptAnalysis(concept),
  }))
  const primaryAnalysis = analyses[0]
  const multipleConcepts = analyses.length > 1
  const roles = [...new Set(analyses.flatMap(({ roles }) => roles))]
  const ExampleHeading = multipleConcepts ? 'h4' : 'h3'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="concept-page analysis-page">
      <ConceptHeader />

      <main className="analysis-content">
        <nav className="concept-breadcrumb" aria-label="현재 위치">
          <a href="#explore">전공 탐색</a>
          <span aria-hidden="true">/</span>
          <a href={selectionHref}>{courseName}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">분석 결과</span>
        </nav>

        <header className="analysis-intro">
          <h1 ref={titleRef} tabIndex={-1}>
            {multipleConcepts ? '선택한 개념은 실무에서 이렇게 활용돼요' : primaryAnalysis.title}
          </h1>
          <p>선택한 개념이 실제 서비스와 직무에서 어떻게 쓰이는지 정리했어요.</p>
        </header>

        <section className="analysis-examples" aria-labelledby="analysis-examples-title">
          <h2 id="analysis-examples-title">실무 활용 사례</h2>
          {analyses.map(({ id, name, examples }) => (
            <div className="analysis-example-group" key={id}>
              {multipleConcepts && <h3>{name}</h3>}
              <ul className="analysis-example-grid">
                {examples.map(({ title, description, topic }) => (
                  <li className="analysis-example" key={title}>
                    <ExampleHeading>{title}</ExampleHeading>
                    <p>{description}</p>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="analysis-roles" aria-labelledby="analysis-roles-title">
          <h2 id="analysis-roles-title">관련 직무</h2>
          <ul>{roles.map((role) => <li key={role}>{role}</li>)}</ul>
        </section>

        <section className="analysis-roadmap" aria-labelledby="analysis-roadmap-title">
          <div className="analysis-roadmap-summary">
            <div>
              <h2 id="analysis-roadmap-title">다음으로 학습하면 좋은 내용</h2>
              <p>
                {multipleConcepts
                  ? '선택한 개념의 기초를 익히고 실무 예제로 연습해 보세요.'
                  : primaryAnalysis.recommendation}
              </p>
            </div>
            <button
              type="button"
              aria-expanded={showRoadmap}
              aria-controls="analysis-roadmap-steps"
              onClick={() => setShowRoadmap((open) => !open)}
            >
              {showRoadmap ? '학습 로드맵 접기' : '학습 로드맵 보기'}
            </button>
          </div>

          <div className="analysis-roadmap-steps" id="analysis-roadmap-steps" hidden={!showRoadmap}>
            {analyses.map(({ id, name, steps }) => (
              <div key={id}>
                {multipleConcepts && <h3>{name}</h3>}
                <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
