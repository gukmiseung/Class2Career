import { ErrorMessage, Loading } from './AsyncState'
import { useAuth } from './contexts/AuthContext'
import { useCourseRegistrations } from './contexts/CourseRegistrationsContext'
import { useCareerCatalog } from './useCareerCatalog'
import { useCourseCatalog } from './useCourseCatalog'
import type { RoadmapStep } from './careerRoadmaps'
import AiRoadmap from './roadmap/AiRoadmap'
import { buildGeneralRoadmap } from './roadmap/generalRoadmap'
import './RoadmapPage.css'

export default function RoadmapPage({ careerName }: { careerName: string }) {
  const auth = useAuth()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useCourseRegistrations()
  const { careers, loading: careersLoading, error: careersError, retry: retryCareers } = useCareerCatalog()
  const { catalog, loading: coursesLoading, error: coursesError } = useCourseCatalog()

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

  const { career, skillKeywords, steps } = roadmap
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
      </section>

      <AiRoadmap key={career.slug} careerSlug={career.slug} />

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

    </main>
  )
}
