import { ErrorMessage, Loading } from './AsyncState'
import { getPersonalizedRoadmapAccess } from './authNavigation'
import { useAuth } from './contexts/AuthContext'
import { useCourseRegistrations } from './contexts/CourseRegistrationsContext'
import { useCareerCatalog } from './useCareerCatalog'
import { useCourseCatalog } from './useCourseCatalog'
import type { RoadmapStep } from './careerRoadmaps'
import AiRoadmapPreview from './roadmap/AiRoadmapPreview'
import { buildGeneralRoadmap } from './roadmap/generalRoadmap'
import './RoadmapPage.css'

export default function RoadmapPage({ careerName }: { careerName: string }) {
  const auth = useAuth()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useCourseRegistrations()
  const { careers, loading: careersLoading, error: careersError, retry: retryCareers } = useCareerCatalog()
  const { catalog, loading: coursesLoading, error: coursesError, retry: retryCourses } = useCourseCatalog()

  if (careersLoading || careersError) {
    return (
      <main className="roadmap-page">
        {careersError
          ? <ErrorMessage message={careersError} onRetry={retryCareers} />
          : <Loading message="직무 로드맵을 불러오고 있어요." />}
      </main>
    )
  }

  const roadmap = buildGeneralRoadmap(careerName, careers, catalog?.courses ?? [])
  if (!roadmap) {
    return (
      <main className="roadmap-page roadmap-not-found">
        <h1>로드맵 정보를 찾을 수 없어요.</h1>
        <a href="#career">직무 목록으로 돌아가기</a>
      </main>
    )
  }

  const { career, skillKeywords, recommendedCourses, steps } = roadmap
  const showLoginNotice = getPersonalizedRoadmapAccess(auth).status === 'login-required'
  const showProgress = Boolean(auth.user && catalog && !coursesLoading && !coursesError && !registrationsLoading && !registrationsError && steps.length > 0)
  const completedCourseNames = new Set(
    showProgress ? catalog?.courses.filter(({ dbId }) => registrations[dbId] === 'completed')
      .map(({ name }) => name.replaceAll(' ', '')) : [],
  )
  const isCompleted = (step: RoadmapStep) => step.courseNames?.some((name) => completedCourseNames.has(name)) ?? false
  const completedCount = steps.filter(isCompleted).length

  return (
    <main className="roadmap-page">
      <nav className="roadmap-breadcrumb" aria-label="현재 위치">
        <a href="#career">직무 탐색</a><span>/</span>
        <a href={`#career-${encodeURIComponent(careerName)}`}>{careerName}</a><span>/</span><span>학습 로드맵</span>
      </nav>

      <section className="roadmap-intro">
        <h1>{careerName} 학습 로드맵</h1>
        <p>{career.description}</p>
        {skillKeywords.length > 0 && <p><strong>핵심 역량</strong> {skillKeywords.join(' · ')}</p>}
        {showLoginNotice && (
          <p className="roadmap-login-notice">
            로그인하면 수강 이력을 바탕으로 나에게 맞는 학습 로드맵을 확인할 수 있어요.
          </p>
        )}
      </section>

      {showProgress && <section className="roadmap-progress" aria-label="학습 진행률">
        <div className="progress-track"><span style={{ width: `${(completedCount / steps.length) * 100}%` }} /></div>
        <p>수강 완료한 관련 과목 {completedCount} / {steps.length}</p>
      </section>}

      {steps.length > 0 ? <ol className="roadmap-list" aria-label="권장 학습 단계">
        {steps.map((step, index) => (
          <li className={`roadmap-step${isCompleted(step) ? ' completed' : ''}`} key={step.title}>
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <div className="step-copy">
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </div>
            <div className="step-action">
              <span>{isCompleted(step) ? '수강 완료' : step.kind}</span>
            </div>
          </li>
        ))}
      </ol> : <div className="roadmap-intro"><p>이 직무의 권장 학습 단계는 준비 중이에요.</p></div>}

      <section className="roadmap-intro" aria-labelledby="roadmap-recommended-courses">
        <h2 id="roadmap-recommended-courses">경북대학교 컴퓨터학부 추천 교과목</h2>
        {coursesLoading && <Loading message="추천 과목을 불러오고 있어요." compact />}
        {coursesError && <ErrorMessage message={coursesError} onRetry={retryCourses} compact />}
        {!coursesLoading && !coursesError && (recommendedCourses.length > 0 ? (
          <ul className="roadmap-list">
            {recommendedCourses.map(({ course, reason }) => (
              <li className="roadmap-step" key={course.dbId}>
                <div className="step-copy">
                  <h3>{course.name}</h3>
                  {reason && <p>{reason}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : <p>이 직무에 연결된 추천 과목이 없어요.</p>)}
      </section>

      {import.meta.env.VITE_ENABLE_AI_ROADMAP === 'true' && (
        <AiRoadmapPreview careerSlug={career.slug} />
      )}
    </main>
  )
}
