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
import { getCourseConcepts } from './courseConcepts'
import { courses } from './courses'
import './App.css'

function SiteHeader() {
  return (
    <header className="site-header">
      <a className="header-logo" href="#dashboard" aria-label="C2C 대시보드">C2C</a>
      <nav className="header-nav" aria-label="주요 메뉴">
        <a href="#career">직무 탐색</a>
        <a href="#explore">전공 탐색</a>
        <a href="#explore/learning">내 학습</a>
        <a className="login-link" href="#login">로그인</a>
      </nav>
    </header>
  )
}

function App() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash)

    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

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
