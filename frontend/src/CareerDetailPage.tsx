import { useState } from 'react'
import { useCourseCatalog } from './useCourseCatalog'
import { courseStatuses, statusLabels, type CourseStatus } from './courseRegistrations'
import { useCourseRegistrations } from './contexts/CourseRegistrationsContext'
import { useAuth } from './contexts/AuthContext'
import LearningLoginModal from './LearningLoginModal'
import { EmptyState, ErrorMessage, Loading } from './AsyncState'
import { useCareerCatalog } from './useCareerCatalog'
import './CareerDetailPage.css'

export default function CareerDetailPage({ careerName }: { careerName: string }) {
  const { careers, loading: careersLoading, error: careersError, retry: retryCareers } = useCareerCatalog()
  const career = careers.find((item) => item.title === careerName)
  const [interestActionError, setInterestActionError] = useState('')
  const [courseStatusErrors, setCourseStatusErrors] = useState<Partial<Record<number, string | null>>>({})
  const {
    registrations, ready: registrationsReady, loading: registrationsLoading, error: registrationsError,
    retryLoad, savingCourseIds, saveCourseStatus, careerInterest,
  } = useCourseRegistrations()
  const isInterested = careerInterest.items.some(({ slug }) => slug === career?.slug)
  const { catalog, loading: catalogLoading, error: catalogError, retry: retryCatalog } = useCourseCatalog()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { loading, user } = useAuth()

  async function selectCourseStatus(courseId: number, status: CourseStatus) {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    if (!registrationsReady || savingCourseIds.has(courseId)) return

    const nextStatus = registrations[courseId] === status ? null : status
    setCourseStatusErrors((errors) => ({ ...errors, [courseId]: null }))
    const saved = await saveCourseStatus(courseId, nextStatus).catch(() => false)
    if (!saved) {
      const message = nextStatus === null
        ? '수강 등록을 취소하지 못했어요. 다시 시도해 주세요.'
        : '수강 상태를 저장하지 못했어요. 다시 시도해 주세요.'
      setCourseStatusErrors((errors) => ({ ...errors, [courseId]: message }))
    }
  }

  if (careersLoading || careersError) {
    return (
      <main className="career-detail-page">
        {careersError
          ? <ErrorMessage message={careersError} onRetry={retryCareers} />
          : <Loading message="직무 정보를 불러오고 있어요." />}
      </main>
    )
  }

  if (!career) {
    return (
      <main className="career-detail-page career-not-found">
        <h1>직무 정보를 찾을 수 없어요.</h1>
        <a href="#career">직무 목록으로 돌아가기</a>
      </main>
    )
  }

  const coursesById = new Map((catalog?.courses ?? []).map((course) => [course.dbId, course]))
  const relatedCourses = career.courses.flatMap((connection) => {
    const course = coursesById.get(connection.course_id)
    return course ? [{ course, concepts: connection.concepts }] : []
  })

  return (
    <>
    <main className="career-detail-page">
      <nav className="career-breadcrumb" aria-label="현재 위치">
        <a href="#career">직무 탐색</a><span aria-hidden="true">/</span><span>{career.title}</span>
      </nav>

      <section className="career-detail-intro">
        <h1>{career.title}</h1>
        <p>{career.description}</p>
        <div className="career-tags">
          <span className="primary">{career.category}</span>
          {career.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
        </div>
        <div className="career-detail-actions">
          <a className="roadmap-link" href={`#roadmap-${encodeURIComponent(career.title)}`}>로드맵 확인하기 →</a>
          <button
            className="career-interest-button"
            type="button"
            aria-pressed={isInterested}
            disabled={loading || careerInterest.loading || careerInterest.saving || Boolean(careerInterest.error)}
            onClick={async () => {
              if (!user) {
                setShowLoginModal(true)
                return
              }
              setInterestActionError('')
              try {
                if (isInterested) await careerInterest.remove(career.slug)
                else await careerInterest.save(career.slug)
              } catch (error) {
                setInterestActionError(error instanceof Error ? error.message : '관심 직무를 변경하지 못했어요.')
              }
            }}
          >
            {careerInterest.saving ? '처리 중…' : isInterested ? '관심 직무 해제' : '관심 직무 등록'}
          </button>
        </div>
        {careerInterest.error && <ErrorMessage message={careerInterest.error} onRetry={careerInterest.retry} compact />}
        {interestActionError && <p role="alert">{interestActionError}</p>}
      </section>

      <section className="connected-courses" aria-labelledby="course-heading">
        <h2 id="course-heading">이 직무와 연결되는 전공 과목</h2>
        <p id="career-course-status-hint">수강 상태를 선택하면 내 학습에 저장돼요. 선택한 버튼을 다시 누르면 등록이 취소돼요.</p>

        {catalogLoading && <Loading message="수강 이력을 확인하고 있어요." compact />}
        {catalogError && <ErrorMessage message={catalogError} onRetry={retryCatalog} compact />}
        {!catalogLoading && !catalogError && registrationsError && relatedCourses.length > 0 && (
          <ErrorMessage message={registrationsError} onRetry={retryLoad} compact />
        )}
        {!catalogLoading && !catalogError && registrationsLoading && relatedCourses.length > 0 && (
          <Loading message="수강 상태를 불러오고 있어요." compact />
        )}
        {!catalogLoading && !catalogError && relatedCourses.length === 0 && <EmptyState title="연결된 교과목 정보가 없어요" message="전공탐색 과목이 등록되면 이곳에 표시됩니다." compact />}

        {!catalogLoading && !catalogError && relatedCourses.length > 0 && <div className="course-list">
          {relatedCourses.map(({ course, concepts }) => {
            const status = registrations[course.dbId]
            const saving = savingCourseIds.has(course.dbId)
            const statusError = courseStatusErrors[course.dbId]
            const yearLabel = course.years.length > 0 ? `${course.years.join('·')}학년` : '학년 미지정'
            return (
              <article className={`course-row${status ? ` ${status}` : ''}`} key={course.id}>
                <div>
                  <h3>{course.name}</h3>
                  <p>{concepts}</p>
                  <p className="career-course-meta">{course.code} · {course.credits}학점 · {course.categories.join(' · ')} · {yearLabel}</p>
                </div>
                <div className="course-controls">
                  <div className="course-actions">
                    <div className="course-status-options" role="group" aria-label={`${course.name} 수강 상태`} aria-busy={saving}>
                      {courseStatuses.map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={status === option}
                          aria-describedby={status === option ? 'career-course-status-hint' : undefined}
                          disabled={loading || saving || Boolean(user && !registrationsReady)}
                          onClick={() => void selectCourseStatus(course.dbId, option)}
                        >
                          {statusLabels[option]}
                        </button>
                      ))}
                    </div>
                    <a href={`#job-concept/${encodeURIComponent(career.title)}/${encodeURIComponent(course.name)}/${encodeURIComponent(concepts)}`}>과목 노트</a>
                  </div>
                  {statusError && <p className="course-status-error" role="alert">{statusError}</p>}
                </div>
              </article>
            )
          })}
        </div>}

        <p className="course-note">※ 과목 수강 이력은 학습 경험을 나타내며, 개별 개념의 숙련도를 의미하지는 않아요.</p>
      </section>
    </main>
    {showLoginModal && (
      <LearningLoginModal
        destination={window.location.hash || `#career-${encodeURIComponent(career.title)}`}
        onClose={() => setShowLoginModal(false)}
      />
    )}
    </>
  )
}
