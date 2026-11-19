import { useEffect, useState } from 'react'
import { loadRegistrations, parseRegistrations, registrationKey, statusLabels, type CourseStatus } from './courseRegistrations'
import { courses } from './courses'
import './LearningPage.css'

export default function LearningPage() {
  const [registrations, setRegistrations] = useState(loadRegistrations)
  const [activeStatus, setActiveStatus] = useState<CourseStatus>('completed')
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null)
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
  const visibleCourses = registeredCourses.filter(({ status }) => status === activeStatus)

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

  useEffect(() => {
    function syncRegistrations(event: StorageEvent) {
      if (event.key !== registrationKey && event.key !== null) return
      setRegistrations(parseRegistrations(event.newValue))
    }

    window.addEventListener('storage', syncRegistrations)
    return () => window.removeEventListener('storage', syncRegistrations)
  }, [])

  return (
    <main className="learning-page">
      <h1>나의 학습 현황</h1>

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
          <strong>0개</strong>
          <p>저장한 직무</p>
        </article>
      </section>

      <section className="learning-courses" aria-labelledby="learning-courses-title">
        <div className="learning-status-tabs" aria-label="과목 상태 선택">
          <button
            type="button"
            aria-pressed={activeStatus === 'completed'}
            onClick={() => setActiveStatus('completed')}
          >
            수강 완료
          </button>
          <button
            type="button"
            aria-pressed={activeStatus === 'planned'}
            onClick={() => setActiveStatus('planned')}
          >
            수강 예정
          </button>
        </div>
        <p id="learning-courses-title">
          {statusLabels[activeStatus]} · 총 {visibleCourses.length}개 과목
        </p>
        {visibleCourses.length > 0 ? (
          <ul className="learning-course-list">
            {visibleCourses.map((course) => (
              <li key={course.id}>
                <div className="learning-course-heading">
                  <h2>{course.name}</h2>
                  <span className={`learning-status ${course.status}`}>{statusLabels[course.status]}</span>
                </div>
                <p className="learning-course-meta">
                  <span>{course.category}</span>
                  <span>{course.credits}학점</span>
                  <span>{course.year}학년</span>
                </p>
                <p className="learning-course-description">{course.description}</p>
                <div className="learning-course-note">
                  <label htmlFor={`course-note-${course.id}`}>간단 메모</label>
                  <textarea
                    id={`course-note-${course.id}`}
                    value={notes[course.id] ?? ''}
                    onChange={(event) => updateNote(course.id, event.target.value)}
                    placeholder="이 과목에 대해 기억할 내용을 적어보세요"
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
              </li>
            ))}
          </ul>
        ) : (
          <div className="learning-empty">
            <div aria-hidden="true">📚</div>
            <h2>{statusLabels[activeStatus]} 과목이 없어요</h2>
            <p>과목 관리에서 과목을 {statusLabels[activeStatus]}로 등록하면 이곳에 표시돼요.</p>
            <a href="#explore">과목 등록하기</a>
          </div>
        )}
      </section>
    </main>
  )
}
