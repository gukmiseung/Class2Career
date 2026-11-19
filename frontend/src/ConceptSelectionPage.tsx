import { useEffect, useRef, useState } from 'react'
import type { CourseConcept } from './courseConcepts'
import './ConceptSelectionPage.css'

type ConceptSelectionPageProps = {
  courseName: string
  concepts: readonly CourseConcept[]
  onAnalyze?: (conceptIds: readonly string[]) => void
}

export default function ConceptSelectionPage({ courseName, concepts, onAnalyze }: ConceptSelectionPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  function toggleConcept(id: string) {
    setSelectedIds((ids) => ids.includes(id)
      ? ids.filter((selectedId) => selectedId !== id)
      : [...ids, id])
  }

  return (
    <div className="concept-page">
      <header className="concept-header">
        <div className="concept-header-inner">
          <a className="concept-brand" href="#top" aria-label="Class2Career 홈">C2C</a>
          <nav aria-label="주요 메뉴">
            <span role="link" aria-disabled="true">직무 탐색</span>
            <a href="#explore">전공 탐색</a>
            <a href="#explore/learning">내 학습</a>
            <a className="concept-login" href="#login">로그인</a>
          </nav>
        </div>
      </header>

      <main className="concept-content">
        <nav className="concept-breadcrumb" aria-label="현재 위치">
          <a href="#explore">전공 탐색</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{courseName}</span>
        </nav>

        <h1 ref={titleRef} tabIndex={-1}>어떤 개념이 궁금한가요?</h1>
        <p className="concept-intro">
          {courseName}에서 더 알아보고 싶은 개념을 선택해 보세요.
        </p>

        <dl className="concept-course">
          <dt>선택한 과목</dt>
          <dd>{courseName}</dd>
        </dl>

        <fieldset className="concept-fieldset" aria-describedby="concept-hint">
          <legend>세부 개념 선택</legend>
          <p id="concept-hint">관심 있는 개념을 여러 개 선택할 수 있어요.</p>

          <div className="concept-grid">
            {concepts.map(({ id, name, description }) => (
              <label className="concept-card" key={id}>
                <input
                  type="checkbox"
                  name="concept"
                  value={id}
                  checked={selectedIds.includes(id)}
                  aria-labelledby={`concept-name-${id}`}
                  aria-describedby={`concept-description-${id}`}
                  onChange={() => toggleConcept(id)}
                />
                <span className="concept-card-copy">
                  <strong id={`concept-name-${id}`}>{name}</strong>
                  <span id={`concept-description-${id}`}>{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="concept-actions">
          <p role="status">선택한 개념 {selectedIds.length}개</p>
          <button
            type="button"
            disabled={!onAnalyze || selectedIds.length === 0}
            onClick={() => onAnalyze?.(selectedIds)}
          >
            선택한 개념 분석하기
          </button>
        </div>
      </main>
    </div>
  )
}
