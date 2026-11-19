import { useEffect, useState } from 'react'
import { careerInterestsKey, loadCareerInterests } from './careerInterests'
import { loadRegistrations, parseRegistrations, registrationKey, statusLabels, type CourseStatus } from './courseRegistrations'
import { courses } from './courses'
import './LearningPage.css'

type LearningTab = CourseStatus | 'career'
type DeleteTarget = { type: 'course' | 'career'; id: string; name: string; noteKey: string }

function loadLearningProfile() {
  try {
    const profile = JSON.parse(window.localStorage.getItem('class2career.profile') ?? '{}') as { name?: string; avatar?: string }
    return { name: profile.name?.trim() ?? '', avatar: profile.avatar ?? '' }
  } catch {
    return { name: '', avatar: '' }
  }
}

export default function LearningPage() {
  const [registrations, setRegistrations] = useState(loadRegistrations)
  const [activeTab, setActiveTab] = useState<LearningTab | null>('completed')
  const [interestedCareers, setInterestedCareers] = useState(loadCareerInterests)
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set())
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [learningProfile] = useState(loadLearningProfile)
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('class2career.course-notes') ?? '{}')
    } catch {
      return {}
    }
  })
  const registeredCourses = courses.flatMap((course) => {
    const status = registrations[course.id]
    return status ? [{ ...course, status }] : []
  })
  const completedCount = registeredCourses.filter(({ status }) => status === 'completed').length
  const plannedCount = registeredCourses.filter(({ status }) => status === 'planned').length
  const visibleCourses = registeredCourses.filter(({ status }) => status === activeTab)

  function updateNote(courseId: string, note: string) {
    setNotes((current) => ({ ...current, [courseId]: note }))
    setSavedCourseId(null)
  }

  function saveNote(courseId: string) {
    try {
      window.localStorage.setItem('class2career.course-notes', JSON.stringify(notes))
      setSavedCourseId(courseId)
    } catch {
      return
    }
  }

  function toggleItem(itemId: string) {
    setExpandedItems((current) => {
      const next = new Set(current)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  function confirmDelete() {
    if (!deleteTarget) return

    if (deleteTarget.type === 'course') {
      setRegistrations((current) => {
        const next = { ...current }
        delete next[deleteTarget.id]
        window.localStorage.setItem(registrationKey, JSON.stringify(next))
        return next
      })
    } else {
      const next = interestedCareers.filter((name) => name !== deleteTarget.id)
      window.localStorage.setItem(careerInterestsKey, JSON.stringify(next))
      setInterestedCareers(next)
    }

    setNotes((current) => {
      const next = { ...current }
      delete next[deleteTarget.noteKey]
      window.localStorage.setItem('class2career.course-notes', JSON.stringify(next))
      return next
    })
    setExpandedItems((current) => {
      const next = new Set(current)
      next.delete(deleteTarget.noteKey)
      next.delete(deleteTarget.id)
      return next
    })
    setDeleteTarget(null)
  }

  useEffect(() => {
    function syncRegistrations(event: StorageEvent) {
      if (event.key === registrationKey || event.key === null) {
        setRegistrations(parseRegistrations(event.newValue))
      }
      if (event.key === careerInterestsKey || event.key === null) {
        setInterestedCareers(loadCareerInterests())
      }
    }

    window.addEventListener('storage', syncRegistrations)
    return () => window.removeEventListener('storage', syncRegistrations)
  }, [])

  return (
    <main className="learning-page">
      <header className="learning-profile-header">
        <div className="learning-profile-avatar" aria-label="내 프로필 사진">
          {learningProfile.avatar
            ? <img src={learningProfile.avatar} alt="" />
            : <span aria-hidden="true">{learningProfile.name.slice(0, 1) || '나'}</span>}
        </div>
        <div>
          <p>{learningProfile.name ? `${learningProfile.name}님의 학습 공간` : 'MY LEARNING'}</p>
          <h1>나의 학습 현황</h1>
          <span>수강 과목과 관심 직무를 한곳에서 관리해 보세요.</span>
        </div>
      </header>

      <section className="learning-summary" aria-label="학습 현황 요약">
        <article>
          <h2>수강 완료 과목</h2>
          <strong>{completedCount}개</strong>
          <p>등록한 과목 기준</p>
        </article>
        <article>
          <h2>수강 예정 과목</h2>
          <strong>{plannedCount}개</strong>
          <p>앞으로 배울 과목</p>
        </article>
        <article>
          <h2>관심 직무</h2>
          <strong>{interestedCareers.length}개</strong>
          <p>저장한 직무</p>
        </article>
      </section>

      <section className="learning-courses" aria-labelledby="learning-courses-title">
        <div className="learning-status-tabs" aria-label="학습 항목 선택">
          <button
            type="button"
            aria-pressed={activeTab === 'completed'}
            onClick={() => setActiveTab('completed')}
          >
            수강 완료 과목
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'planned'}
            onClick={() => setActiveTab('planned')}
          >
            수강 예정 과목
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'career'}
            onClick={() => setActiveTab('career')}
          >
            관심 직무
          </button>
        </div>
        {activeTab !== null && <p id="learning-courses-title">
          {activeTab === 'career'
            ? `관심 직무 · 총 ${interestedCareers.length}개`
            : `${statusLabels[activeTab]} · 총 ${visibleCourses.length}개 과목`}
        </p>}
        {activeTab === null ? null : activeTab === 'career' ? (
          interestedCareers.length > 0 ? (
            <ul className="learning-course-list">
              {interestedCareers.map((careerName) => {
                const noteKey = `career:${careerName}`
                const isExpanded = expandedItems.has(noteKey)
                return (
                  <li key={careerName}>
                    <button className="learning-item-toggle" type="button" aria-expanded={isExpanded} onClick={() => toggleItem(noteKey)}>
                      <span>{careerName}</span><span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                    </button>
                    <div className="learning-item-details" hidden={!isExpanded}>
                      <p className="learning-course-description">관심 직무로 저장한 직무예요. 상세 페이지에서 관련 과목과 로드맵을 확인할 수 있어요.</p>
                      <div className="learning-item-actions">
                        <a className="learning-career-link" href={`#career-${encodeURIComponent(careerName)}`}>직무 상세 보기</a>
                        <button className="learning-delete-button" type="button" onClick={() => setDeleteTarget({ type: 'career', id: careerName, name: careerName, noteKey })}>관심 직무 삭제</button>
                      </div>
                      <div className="learning-course-note">
                      <label htmlFor={`career-note-${encodeURIComponent(careerName)}`}>간단 메모</label>
                      <p className="learning-note-guide" id={`career-note-guide-${encodeURIComponent(careerName)}`}>
                        이 직무에 대해 기억할 내용을 적어보세요.
                      </p>
                      <textarea
                        id={`career-note-${encodeURIComponent(careerName)}`}
                        aria-describedby={`career-note-guide-${encodeURIComponent(careerName)}`}
                        value={notes[noteKey] ?? ''}
                        onChange={(event) => updateNote(noteKey, event.target.value)}
                        maxLength={300}
                      />
                      <div className="learning-note-footer">
                        <small>{(notes[noteKey] ?? '').length}/300</small>
                        <div>
                          {savedCourseId === noteKey && <span role="status">저장됨</span>}
                          <button type="button" onClick={() => saveNote(noteKey)}>메모 저장</button>
                        </div>
                      </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="learning-empty">
              <div aria-hidden="true">💼</div>
              <h2>관심 직무가 없어요</h2>
              <p>직무 상세 화면에서 관심 직무로 등록하면 이곳에 표시돼요.</p>
              <a href="#career">직무 탐색하기</a>
            </div>
          )
        ) : visibleCourses.length > 0 ? (
          <ul className="learning-course-list">
            {visibleCourses.map((course) => {
              const isExpanded = expandedItems.has(course.id)
              return (
              <li key={course.id}>
                <button className="learning-item-toggle" type="button" aria-expanded={isExpanded} onClick={() => toggleItem(course.id)}>
                  <span>{course.name}</span><span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                </button>
                <div className="learning-item-details" hidden={!isExpanded}>
                  <p className="learning-course-meta">
                  <span>{course.category}</span>
                  <span>{course.credits}학점</span>
                  <span>{course.year}학년</span>
                  </p>
                  <p className="learning-course-description">{course.description}</p>
                  <div className="learning-item-actions">
                    <a className="learning-career-link" href={`#explore/concepts/${course.id}`}>과목 상세 보기</a>
                    <button className="learning-delete-button" type="button" onClick={() => setDeleteTarget({ type: 'course', id: course.id, name: course.name, noteKey: course.id })}>과목 삭제</button>
                  </div>
                  <div className="learning-course-note">
                  <label htmlFor={`course-note-${course.id}`}>간단 메모</label>
                  <p className="learning-note-guide" id={`course-note-guide-${course.id}`}>
                    이 과목에 대해 기억할 내용을 적어보세요.
                  </p>
                  <textarea
                    id={`course-note-${course.id}`}
                    aria-describedby={`course-note-guide-${course.id}`}
                    value={notes[course.id] ?? ''}
                    onChange={(event) => updateNote(course.id, event.target.value)}
                    maxLength={300}
                  />
                  <div className="learning-note-footer">
                    <small>{(notes[course.id] ?? '').length}/300</small>
                    <div>
                      {savedCourseId === course.id && <span role="status">저장됨</span>}
                      <button type="button" onClick={() => saveNote(course.id)}>메모 저장</button>
                    </div>
                  </div>
                  </div>
                </div>
              </li>
            )})}
          </ul>
        ) : (
          <div className="learning-empty">
            <div aria-hidden="true">📚</div>
            <h2>{statusLabels[activeTab]} 과목이 없어요</h2>
            <p>과목 관리에서 과목을 {statusLabels[activeTab]}로 등록하면 이곳에 표시돼요.</p>
            <a href="#explore">과목 등록하기</a>
          </div>
        )}
      </section>
      {deleteTarget && (
        <div className="learning-delete-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section className="learning-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="learning-delete-title" aria-describedby="learning-delete-description" onMouseDown={(event) => event.stopPropagation()}>
            <div className="learning-delete-icon" aria-hidden="true">!</div>
            <h2 id="learning-delete-title">정말 삭제할까요?</h2>
            <p id="learning-delete-description">
              <strong>{deleteTarget.name}</strong>{deleteTarget.type === 'course' ? ' 과목을 내 학습에서 삭제해요.' : ' 직무를 관심 직무에서 삭제해요.'}<br />작성한 메모도 함께 삭제됩니다.
            </p>
            <div className="learning-delete-actions">
              <button type="button" autoFocus onClick={() => setDeleteTarget(null)}>취소</button>
              <button className="learning-delete-confirm" type="button" onClick={confirmDelete}>삭제</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
