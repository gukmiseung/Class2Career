import { useEffect, useRef } from 'react'
import { EmptyState, ErrorMessage, Loading } from './AsyncState'
import ConceptHeader from './ConceptHeader'
import { getConceptAnalysis } from './conceptAnalysis'
import type { CourseConcept } from './courseConcepts'
import { useCareerCatalog } from './useCareerCatalog'
import './ConceptRecommendationPage.css'

type Props = {
  courseId: number
  courseName: string
  concepts: readonly CourseConcept[]
  analysisHref: string
}

const learningTitles = ['개념 심화 학습', '직무 연계 실습', '미니 프로젝트 완성']

export default function ConceptRecommendationPage({ courseId, courseName, concepts, analysisHref }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const { careers, loading, error, retry } = useCareerCatalog()
  const relatedCareers = careers.filter(({ courses }) => courses.some(({ course_id }) => course_id === courseId))
  const steps = getConceptAnalysis(concepts[0]).steps.slice(0, 3)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="concept-page recommendation-page-shell">
      <ConceptHeader />
      <main className="recommendation-content">
        <nav className="concept-breadcrumb" aria-label="현재 위치">
          <a href="#explore">전공 탐색</a><span aria-hidden="true">/</span>
          <span>{courseName}</span><span aria-hidden="true">/</span>
          <a href={analysisHref}>분석 결과</a><span aria-hidden="true">/</span>
          <span aria-current="page">관련 직무 · 다음 학습 추천</span>
        </nav>

        <h1 ref={titleRef} tabIndex={-1}>관련 직무와 다음 학습 추천</h1>

        <section className="recommendation-selection" aria-label="선택한 개념">
          <span>선택한 개념</span>
          <strong>{courseName} · {concepts.map(({ name }) => name).join(' · ')}</strong>
        </section>

        <section className="recommendation-roles" aria-labelledby="recommendation-roles-title">
          <h2 id="recommendation-roles-title">{courseName} 관련 직무</h2>
          {loading ? (
            <Loading message="관련 직무를 불러오고 있어요." compact />
          ) : error ? (
            <ErrorMessage message={error} onRetry={retry} />
          ) : relatedCareers.length === 0 ? (
            <EmptyState title="아직 연결된 직무가 없어요" message={`${courseName}에 연결된 직무가 등록되면 여기에 표시돼요.`} />
          ) : (
            <ul>
              {relatedCareers.map(({ slug, title, description }) => (
                <li className="recommendation-role-card" key={slug}>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="recommendation-learning" aria-labelledby="recommendation-learning-title">
          <h2 id="recommendation-learning-title">다음 학습 내용 추천</h2>
          <ol>
            {steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{learningTitles[index]}</strong><p>{step}</p></div>
                <span className="recommendation-more">자세히 보기 →</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="recommendation-actions">
          <a href={analysisHref}>← 개념 분석 결과로 돌아가기</a>
          <a className="primary" href="#explore">전공 탐색으로 돌아가기</a>
        </div>
      </main>
    </div>
  )
}
