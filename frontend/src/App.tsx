import { useEffect, useState } from 'react'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'
import DashboardPage from './DashboardPage'
import CareerPage from './CareerPage'
import CareerDetailPage from './CareerDetailPage'
import RoadmapPage from './RoadmapPage'
import ConceptAnalysisPage from './ConceptAnalysisPage'
import ConceptSelectionPage from './ConceptSelectionPage'
import CourseAddPage from './CourseAddPage'
import LoadingPage from './LoadingPage'
import SiteHeader from './SiteHeader'
import { getCourseConcepts } from './courseConcepts'
import { courses } from './courses'
import './App.css'

const loadingDuration = 700

function getLoadingMessage(hash: string) {
  if (hash.includes('/analysis')) return '선택한 전공 개념을 분석하고 있어요...'
  if (hash.startsWith('#explore/concepts/')) return '과목의 세부 개념을 불러오고 있어요...'
  if (hash.startsWith('#explore')) return '나의 과목 정보를 불러오고 있어요...'
  if (hash.startsWith('#roadmap-')) return '맞춤 학습 로드맵을 준비하고 있어요...'
  if (hash.startsWith('#career-')) return '선택한 직무의 상세 정보를 찾고 있어요...'
  if (hash === '#career') return '희망 직무 정보를 찾고 있어요...'
  if (hash === '#login') return '로그인 화면을 준비하고 있어요...'
  if (hash === '#signup') return '회원가입 화면을 준비하고 있어요...'
  return '나의 대시보드를 준비하고 있어요...'
}

function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let loadingTimer = window.setTimeout(() => setIsLoading(false), loadingDuration)

    const updateHash = () => {
      window.clearTimeout(loadingTimer)
      setHash(window.location.hash)
      setIsLoading(true)
      loadingTimer = window.setTimeout(() => setIsLoading(false), loadingDuration)
    }

    window.addEventListener('hashchange', updateHash)
    return () => {
      window.clearTimeout(loadingTimer)
      window.removeEventListener('hashchange', updateHash)
    }
  }, [])

  if (isLoading) {
    return <LoadingPage message={getLoadingMessage(hash)} />
  }

  if (hash === '#explore') {
    return (
      <div className="home-page dashboard-shell course-shell">
        <SiteHeader />
        <CourseAddPage />
      </div>
    )
  }

  if (hash === '#explore/learning') {
    return (
      <div className="home-page dashboard-shell course-shell">
        <SiteHeader />
        <CourseAddPage showLearning />
      </div>
    )
  }

  const conceptRoute = '#explore/concepts/'
  if (hash.startsWith(conceptRoute)) {
    const [path, query] = hash.slice(conceptRoute.length).split('?', 2)
    const [courseId] = path.split('/', 1)
    const analysisPath = `${courseId}/analysis`
    const course = courses.find(({ id }) => id === courseId)
    const concepts = getCourseConcepts(courseId)

    if (!course || !concepts || (path !== courseId && path !== analysisPath)) {
      return <CourseAddPage />
    }

    const selectionHref = `${conceptRoute}${courseId}`
    const requestedIds = new Set(new URLSearchParams(query).getAll('concept'))
    const selectedConcepts = concepts.filter(({ id }) => requestedIds.has(id))

    if (path === analysisPath && selectedConcepts.length > 0) {
      return (
        <ConceptAnalysisPage
          key={hash}
          courseName={course.name}
          concepts={selectedConcepts}
          selectionHref={`${selectionHref}?${query}`}
        />
      )
    }

    return (
      <ConceptSelectionPage
        key={hash}
        courseName={course.name}
        concepts={concepts}
        initialSelectedIds={selectedConcepts.map(({ id }) => id)}
        onAnalyze={(conceptIds) => {
          const params = new URLSearchParams()
          for (const id of conceptIds) params.append('concept', id)
          window.history.replaceState(window.history.state, '', `${selectionHref}?${params}`)
          window.location.hash = `${conceptRoute}${analysisPath}?${params}`
        }}
      />
    )
  }

  return (
    <div className={`home-page${hash !== '#login' && hash !== '#signup' ? ' dashboard-shell' : ''}`}>
      <SiteHeader />

      {hash === '#login' ? (
        <LoginPage />
      ) : hash === '#signup' ? (
        <SignupPage />
      ) : hash === '#dashboard' ? (
        <DashboardPage />
      ) : hash === '#career' ? (
        <CareerPage />
      ) : hash.startsWith('#career-') ? (
        <CareerDetailPage careerName={decodeURIComponent(hash.slice('#career-'.length))} />
      ) : hash.startsWith('#roadmap-') ? (
        <RoadmapPage careerName={decodeURIComponent(hash.slice('#roadmap-'.length))} />
      ) : (
        <DashboardPage />
      )}
    </div>
  )
}

export default App
