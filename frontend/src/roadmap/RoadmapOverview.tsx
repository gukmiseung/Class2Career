import { useAuth } from '../contexts/AuthContext'
import { useCourseRegistrations } from '../contexts/CourseRegistrationsContext'
import type { useCareerCatalog } from '../useCareerCatalog'
import { useCourseCatalog } from '../useCourseCatalog'
import { buildGeneralRoadmap } from './generalRoadmap'
import { getRoadmapProject } from './roadmapProject'

type Career = ReturnType<typeof useCareerCatalog>['careers'][number]

export default function RoadmapOverview({ career, contestsHref, weeklyHref }: {
  career: Career
  contestsHref: string
  weeklyHref: string
}) {
  const { user, loading: authLoading } = useAuth()
  const { registrations, ready, error: registrationsError } = useCourseRegistrations()
  const { catalog, error: coursesError } = useCourseCatalog()
  const { recommendedCourses = [], steps = [] } = buildGeneralRoadmap(career.title, [career], catalog?.courses ?? []) ?? {}
  const isBackend = career.slug === 'backend-developer'
  const isExample = isBackend && !authLoading && !user
  const hasProgress = Boolean(user && ready && catalog)
  const completed = recommendedCourses.filter(({ course }) => registrations[course.dbId] === 'completed')
  const inProgress = recommendedCourses.filter(({ course }) => registrations[course.dbId] === 'in_progress')
  const planned = recommendedCourses.filter(({ course }) => registrations[course.dbId] === 'planned')
  const recommended = recommendedCourses.filter(({ course }) => !registrations[course.dbId])
  const completedCount = isExample ? 3 : completed.length
  const courseCount = isExample ? 6 : recommendedCourses.length
  const percent = courseCount > 0 && (isExample || hasProgress)
    ? Math.round(completedCount / courseCount * 100)
    : null

  const currentCourses = isExample ? ['컴퓨터프로그래밍', '자료구조'] : [...completed, ...inProgress]
    .slice(0, 2).map(({ course }) => course.name)
  const nextCourses = isBackend && !hasProgress ? ['데이터베이스', '컴퓨터네트워크']
    : [...planned, ...recommended].slice(0, 2).map(({ course }) => course.name)
  const project = getRoadmapProject(career.slug, career.title)
  const projectStep = steps.find(({ kind }) => kind === '프로젝트')
  const route = [
    {
      title: '현재 수강 이력',
      subjects: currentCourses.length ? currentCourses : [user ? '수강 기록 확인하기' : '내 수강 과목 확인하기'],
      description: isExample ? '기초 프로그래밍 및 자료구조 관련 과목 이수' : '직무와 관련된 수강 완료·수강 중 과목을 확인해요.',
      label: completedCount > 0 ? '수강 완료' : inProgress.length ? '수강 중' : '이력 확인',
      complete: completedCount > 0,
    },
    {
      title: '다음 전공 학습하기',
      subjects: nextCourses.length ? nextCourses : ['직무 관련 과목 확인하기'],
      description: isBackend && !hasProgress ? 'SQL, 데이터 모델링, 통신 구조 학습 과목 추천'
        : '수강 예정 과목과 다음에 들을 추천 과목을 살펴봐요.',
      label: '수강 추천',
    },
    {
      title: '프로젝트 경험 쌓기',
      subjects: [projectStep && !isBackend ? projectStep.title : project.title],
      description: projectStep && !isBackend ? projectStep.description : project.description,
      label: '활동 추천',
    },
    {
      title: '직무 준비 점검하기',
      subjects: [career.title],
      description: '프로젝트 결과물과 채용 요구사항 비교',
      label: '목표',
    },
  ]

  let progressStatus = '로그인하면 내 수강 현황을 확인할 수 있어요.'
  if (isExample) progressStatus = '수강 완료 3 · 예정 1 · 추천 2 · 예시'
  else if (hasProgress) {
    progressStatus = `수강 완료 ${completedCount} · 수강 중 ${inProgress.length} · 예정 ${planned.length} · 추천 ${recommended.length}`
  } else if (authLoading || (user && !registrationsError && !coursesError)) {
    progressStatus = '수강 현황을 불러오고 있어요.'
  } else if (user) {
    progressStatus = '수강 현황을 불러오지 못했어요.'
  }

  return (
    <>
      <header className="roadmap-heading">
        <h1>나의 {career.title} 준비 경로</h1>
        <p>전공 수강 이력에서 시작해 다음 학습과 프로젝트 경험까지 연결합니다.</p>
      </header>

      <section className="roadmap-summary" aria-label="직무 및 관련 과목 수강 현황">
        <div>
          <p>희망 직무</p>
          <strong>{career.title}</strong>
        </div>
        <div>
          <p>관련 과목 이수 현황</p>
          <strong className="roadmap-accent">{percent === null ? '—' : `${completedCount} / ${courseCount}과목`}</strong>
          <p className="roadmap-course-status">{progressStatus}</p>
        </div>
        <div className="roadmap-rate">
          <strong>전공 과목 이수율 {percent === null ? '—' : `${percent}%`}</strong>
          <p>선정된 직무 관련 과목 중 수강을 마친 과목의 비율이에요. 다음 학습을 고를 때 참고해 주세요.</p>
        </div>
      </section>

      <section className="roadmap-preparation" aria-labelledby="roadmap-preparation-title">
        <h2 id="roadmap-preparation-title">추천 준비 경로</h2>
        <p>준비 순서를 제안하는 참고용 경로예요. 내 상황에 맞게 조정해서 활용해 보세요.</p>
        <ol className="roadmap-stage-list">
          {route.map(({ title, subjects, description, label, complete }, index) => (
            <li key={title} className={`roadmap-stage${complete ? ' roadmap-stage--complete' : ''}`}>
              <div className="roadmap-stage-meta">
                <span aria-hidden="true" className="roadmap-stage-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="roadmap-stage-label">{label}</span>
              </div>
              <h3>{title}</h3>
              <div className="roadmap-stage-subjects">
                {[...new Set(subjects)].map((subject) => <strong key={subject}>{subject}</strong>)}
              </div>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="roadmap-next" aria-labelledby="roadmap-next-title">
        <div>
          <h2 id="roadmap-next-title">다음으로 확인할 내용</h2>
          <p>직무와 관련된 공모전을 확인한 후,<br />이번 주 실행할 활동을 선택해 보세요.</p>
        </div>
        <div className="roadmap-actions">
          <a className="roadmap-button" href={contestsHref}>직무 관련 공모전 확인하기 <span aria-hidden="true">→</span></a>
          <a className="roadmap-button" href={weeklyHref}>이번 주 실행 계획 <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </>
  )
}
