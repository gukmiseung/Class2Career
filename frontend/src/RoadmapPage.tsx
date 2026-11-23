import { useEffect } from 'react'
import { ErrorMessage, Loading } from './AsyncState'
import { useCareerCatalog } from './useCareerCatalog'
import DevEventContestNotices from './roadmap/DevEventContestNotices'
import KnuContestNotices from './roadmap/KnuContestNotices'
import RoadmapOverview from './roadmap/RoadmapOverview'
import WeeklyPlan from './roadmap/WeeklyPlan'
import './RoadmapPage.css'

const viewLabels = {
  overview: '전체 경로',
  contests: '추천 활동',
  weekly: '실행 계획',
}

export default function RoadmapPage({ careerName, view }: {
  careerName: string
  view: keyof typeof viewLabels
}) {
  const { careers, loading, error, retry } = useCareerCatalog()
  const career = careers.find(({ title }) => title === careerName)
  const careerHref = `#career-${encodeURIComponent(careerName)}`
  const roadmapHref = `#roadmap-${encodeURIComponent(careerName)}`
  const contestsHref = `${roadmapHref}/contests`
  const weeklyHref = `${roadmapHref}/weekly`

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [careerName, view])

  if (loading || error) {
    return (
      <main className="roadmap-page">
        {error ? <ErrorMessage message={error} onRetry={retry} /> : <Loading message="직무 로드맵을 불러오고 있어요." />}
      </main>
    )
  }

  if (!career) {
    return (
      <main className="roadmap-page">
        <h1>로드맵 정보를 찾을 수 없어요.</h1>
        <a href="#career">직무 목록으로 돌아가기</a>
      </main>
    )
  }

  return (
    <main className={`roadmap-page roadmap-page--${view}`}>
      <nav className="roadmap-breadcrumb" aria-label="현재 위치">
        <a href={roadmapHref}>로드맵</a><span aria-hidden="true">/</span>
        <a href={careerHref}>{careerName}</a><span aria-hidden="true">/</span>
        <span aria-current="page">{viewLabels[view]}</span>
      </nav>

      {view === 'overview' ? (
        <RoadmapOverview career={career} contestsHref={contestsHref} weeklyHref={weeklyHref} />
      ) : view === 'contests' ? (
        <>
          <header className="roadmap-heading">
            <h1>직무 관련 공모전</h1>
            <p>희망 직무와 학교 활동을 함께 살펴보고 실제 프로젝트 경험으로 연결해 보세요.</p>
          </header>
          <DevEventContestNotices careerSlug={career.slug} careerName={career.title} />
          <KnuContestNotices />
          <footer className="roadmap-footer">
            <div className="roadmap-actions">
              <a className="roadmap-button roadmap-button--secondary" href={roadmapHref}>
                <span aria-hidden="true">←</span> 이전으로 돌아가기
              </a>
              <a className="roadmap-button" href={weeklyHref}>이번 주 실행 계획 바로가기</a>
            </div>
          </footer>
        </>
      ) : (
        <WeeklyPlan
          key={career.slug}
          careerSlug={career.slug}
          careerName={career.title}
          roadmapHref={roadmapHref}
          contestsHref={contestsHref}
        />
      )}
    </main>
  )
}
