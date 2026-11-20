import { useCourseRegistrations } from './contexts/CourseRegistrationsContext'
import { useCourseCatalog } from './useCourseCatalog'
import { hasCareerRoadmap, roadmaps, type RoadmapStep } from './careerRoadmaps'
import AiRoadmapPreview from './roadmap/AiRoadmapPreview'
import './RoadmapPage.css'

export default function RoadmapPage({ careerName }: { careerName: string }) {
  const steps = hasCareerRoadmap(careerName) ? roadmaps[careerName] : undefined
  const { registrations } = useCourseRegistrations()
  const { catalog } = useCourseCatalog()

  if (!steps) {
    return (
      <main className="roadmap-page roadmap-not-found">
        <h1>로드맵 정보를 찾을 수 없어요.</h1>
        <a href="#career">직무 목록으로 돌아가기</a>
      </main>
    )
  }

  const completedCourseNames = new Set(
    catalog?.courses.filter(({ dbId }) => registrations[dbId] === 'completed')
      .map(({ name }) => name.replaceAll(' ', '')),
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
        <p>현재 수강 이력을 바탕으로 다음에 학습하면 좋은 내용을 단계별로 정리했어요.</p>
      </section>

      <section className="roadmap-progress" aria-label="학습 진행률">
        <div className="progress-track"><span style={{ width: `${(completedCount / steps.length) * 100}%` }} /></div>
        <p>수강 완료한 관련 과목 {completedCount} / {steps.length}</p>
      </section>

      <ol className="roadmap-list">
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
      </ol>

      {import.meta.env.VITE_ENABLE_AI_ROADMAP === 'true' && careerName === '백엔드 개발자' && (
        <AiRoadmapPreview />
      )}
    </main>
  )
}
