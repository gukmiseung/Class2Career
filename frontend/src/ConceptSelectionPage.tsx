import { useEffect, useRef, useState } from 'react'
import ConceptHeader from './ConceptHeader'
import type { CourseConcept } from './courseConcepts'
import './ConceptSelectionPage.css'

type ConceptSelectionPageProps = {
  courseName: string
  noteHref: string
  concepts: readonly CourseConcept[]
  initialSelectedIds: readonly string[]
  onAnalyze: (conceptIds: readonly string[]) => void
}

export default function ConceptSelectionPage({ courseName, noteHref, concepts, initialSelectedIds, onAnalyze }: ConceptSelectionPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedIds[0])
  const courseNoteHref = selectedId ? `${noteHref}?${new URLSearchParams({ concept: selectedId })}` : noteHref

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="concept-page">
      <ConceptHeader />

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

        <div className="concept-course">
          <dl>
            <dt>선택한 과목</dt>
            <dd>{courseName}</dd>
          </dl>
          <a className="concept-course-note" href={courseNoteHref}>과목 노트</a>
        </div>

        <fieldset className="concept-fieldset" aria-describedby="concept-hint">
          <legend>세부 개념 선택</legend>
          <p id="concept-hint">실무 활용 사례를 보고 싶은 개념 하나를 선택하세요.</p>

          {concepts.length === 0 ? (
            <p role="status">아직 등록된 개념이 없습니다.</p>
          ) : (

          <div className="concept-grid">
            {concepts.map(({ id, name, description }) => (
              <label className="concept-card" key={id}>
                <input
                  type="radio"
                  name="concept"
                  value={id}
                  checked={selectedId === id}
                  aria-labelledby={`concept-name-${id}`}
                  aria-describedby={`concept-description-${id}`}
                  onChange={() => setSelectedId(id)}
                />
                <span className="concept-card-copy">
                  <strong id={`concept-name-${id}`}>{name}</strong>
                  <span id={`concept-description-${id}`}>{description}</span>
                </span>
              </label>
            ))}
          </div>
          )}
        </fieldset>

        {concepts.length > 0 && <div className="concept-actions">
          <p role="status">선택한 개념 {selectedId ? 1 : 0}개</p>
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => selectedId && onAnalyze([selectedId])}
          >
            선택한 개념 분석하기
          </button>
        </div>}
      </main>
    </div>
  )
}
