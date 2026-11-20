import { useEffect, useRef } from 'react'
import ConceptHeader from './ConceptHeader'
import { getConceptAnalysis } from './conceptAnalysis'
import type { CourseConcept } from './courseConcepts'
import './ConceptRecommendationPage.css'

type Props = {
  courseName: string
  concepts: readonly CourseConcept[]
  analysisHref: string
}

const roleDescriptions: Record<string, string> = {
  '프론트엔드 개발자': '사용자 화면과 상호작용을 구현하고 서비스의 사용 경험을 개선하는 직무',
  '백엔드 개발자': '데이터 간 연결 관계와 탐색 기능을 구현하는 직무',
  '오디오 소프트웨어 개발자': '소리 데이터를 처리하고 재생·편집 기능을 구현하는 직무',
  '개발 도구 엔지니어': '개발자의 반복 작업을 줄이는 편집·빌드·테스트 도구를 만드는 직무',
  '데이터 엔지니어': '복잡한 데이터 관계를 처리하고 분석 기반을 구축하는 직무',
  '검색·추천 시스템 개발자': '사용자 및 콘텐츠의 연결 정보를 활용해 추천 기능을 만드는 직무',
  '소프트웨어 개발자': '전공 개념을 활용해 서비스 문제를 분석하고 기능을 구현하는 직무',
  '서비스 기획자': '사용자 문제를 기능과 정책, 화면 흐름으로 구체화하는 직무',
  '데이터 분석가': '데이터의 패턴을 찾아 의사결정에 필요한 인사이트를 전달하는 직무',
}

const learningTitles = ['개념 심화 학습', '직무 연계 실습', '미니 프로젝트 완성']

export default function ConceptRecommendationPage({ courseName, concepts, analysisHref }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const analyses = concepts.map((concept) => ({ concept, analysis: getConceptAnalysis(concept) }))
  const roles = [...new Set(analyses.flatMap(({ analysis }) => analysis.roles))].slice(0, 3)
  const steps = analyses[0].analysis.steps.slice(0, 3)

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

        <h1 ref={titleRef} tabIndex={-1}>이 개념과 연결되는 직무와 다음 학습</h1>

        <section className="recommendation-selection" aria-label="선택한 개념">
          <span>선택한 개념</span>
          <strong>{courseName} · {concepts.map(({ name }) => name.replace('와 ', '와 ').replace('과 ', '과 ')).join(' · ')}</strong>
        </section>

        <section className="recommendation-roles" aria-labelledby="recommendation-roles-title">
          <h2 id="recommendation-roles-title">관련 직무</h2>
          <ul>
            {roles.map((role) => <li key={role}><strong>{role}</strong><p>{roleDescriptions[role] ?? `${courseName} 개념을 활용해 서비스 문제를 해결하는 직무`}</p></li>)}
          </ul>
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
