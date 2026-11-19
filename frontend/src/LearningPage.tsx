import { useEffect, useState } from 'react'
import { loadRegistrations, parseRegistrations, registrationKey, statusLabels } from './courseRegistrations'
import { courses } from './courses'
import './LearningPage.css'

export default function LearningPage() {
  const [registrations, setRegistrations] = useState(loadRegistrations)
  const registeredCourses = courses.flatMap((course) => {
    const status = registrations[course.id]
    return status ? [{ ...course, status }] : []
  })
  const completedCount = registeredCourses.filter(({ status }) => status === 'completed').length
  const plannedCount = registeredCourses.filter(({ status }) => status === 'planned').length
  const learningSummary = [
    { label: '수강 완료 과목', value: completedCount, caption: '등록한 과목 기준' },
    { label: '수강 예정 과목', value: plannedCount, caption: '앞으로 배울 과목' },
    { label: '관심 직무', value: 0, caption: '저장한 직무' },
  ]

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
        {learningSummary.map((item) => (
          <article key={item.label}>
            <h2>{item.label}</h2>
            <strong>{item.value}개</strong>
            <p>{item.caption}</p>
          </article>
        ))}
      </section>

      <section className="learning-courses" aria-labelledby="learning-courses-title">
        <p id="learning-courses-title">총 {registeredCourses.length}개 과목</p>
        {registeredCourses.length > 0 ? (
          <ul className="learning-course-list">
            {registeredCourses.map((course) => (
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
              </li>
            ))}
          </ul>
        ) : (
          <div className="learning-empty">
            <div aria-hidden="true">📚</div>
            <h2>아직 등록한 과목이 없어요</h2>
            <p>수강 완료 또는 수강 예정 과목을 등록하면 이곳에서 학습 현황을 확인할 수 있어요.</p>
            <a href="#explore">과목 등록하기</a>
          </div>
        )}
      </section>
    </main>
  )
}
