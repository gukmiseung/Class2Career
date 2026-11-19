import { useEffect, useState } from 'react'
import { careerInterestsKey, loadCareerInterests } from './careerInterests'
import { loadRegistrations, parseRegistrations, registrationKey, statusLabels, type CourseStatus } from './courseRegistrations'
import { courses } from './courses'
import './LearningPage.css'

type LearningTab = CourseStatus | 'career'

export default function LearningPage({ locked }: { locked: boolean }) {
  if (!locked) return <LearningContent />

  return (
    <main className="learning-page">
      <h1>?? ?? ??</h1>
      <div className="learning-login-backdrop" role="presentation">
        <section
          className="learning-login-modal"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="learning-login-title"
          aria-describedby="learning-login-description"
        >
          <button
            className="learning-login-close"
            type="button"
            aria-label="안내창 닫기"
            onClick={() => { window.location.hash = 'dashboard' }}
          >
            ×
          </button>
          <div className="learning-login-lock" aria-hidden="true"><span /></div>
          <h2 id="learning-login-title">로그인 후 이용해주세요</h2>
          <p id="learning-login-description">로그인하면 나의 수강 과목과 학습 현황을<br />확인하고 관리할 수 있어요.</p>
          <a className="learning-login-button" href="#login">로그인하기</a>
          <p className="learning-signup-prompt">아직 계정이 없으신가요? <a href="#signup">회원가입</a></p>
        </section>
      </div>
    </main>
  )
}

function LearningContent() {
  const [registrations, setRegistrations] = useState(loadRegistrations)
  const [activeTab, setActiveTab] = useState<LearningTab>('completed')
  const [interestedCareers, setInterestedCareers] = useState(loadCareerInterests)
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
            수강 완료
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'planned'}
            onClick={() => setActiveTab('planned')}
          >
            수강 예정
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'career'}
            onClick={() => setActiveTab('career')}
          >
            관심 직무
          </button>
        </div>
        <p id="learning-courses-title">
          {activeTab === 'career'
            ? `관심 직무 · 총 ${interestedCareers.length}개`
            : `${statusLabels[activeTab]} · 총 ${visibleCourses.length}개 과목`}
        </p>
        {activeTab === 'career' ? (
          interestedCareers.length > 0 ? (
            <ul className="learning-course-list">
              {interestedCareers.map((careerName) => {
                const noteKey = `career:${careerName}`
                return (
                  <li key={careerName}>
                    <div className="learning-course-heading">
                      <h2>{careerName}</h2>
                      <span className="learning-status career">관심 직무</span>
                    </div>
                    <p className="learning-course-description">관심 직무로 저장한 직무예요. 상세 페이지에서 관련 과목과 로드맵을 확인할 수 있어요.</p>
                    <a className="learning-career-link" href={`#career-${encodeURIComponent(careerName)}`}>직무 상세 보기</a>
                    <div className="learning-course-note">
                      <label htmlFor={`career-note-${encodeURIComponent(careerName)}`}>간단 메모</label>
                      <textarea id={`career-note-${encodeURIComponent(careerName)}`} value={notes[noteKey] ?? ''} onChange={(event) => updateNote(noteKey, event.target.value)} placeholder="이 직무에 대해 기억할 내용을 적어보세요" maxLength={300} />
                      <div className="learning-note-footer">
                        <small>{(notes[noteKey] ?? '').length}/300</small>
                        <div>
                          {savedCourseId === noteKey && <span role="status">저장됨</span>}
                          <button type="button" onClick={() => saveNote(noteKey)}>메모 저장</button>
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
            <h2>{statusLabels[activeTab]} 과목이 없어요</h2>
            <p>과목 관리에서 과목을 {statusLabels[activeTab]}로 등록하면 이곳에 표시돼요.</p>
            <a href="#explore">과목 등록하기</a>
          </div>
        )}
      </section>
    </main>
  )
}
