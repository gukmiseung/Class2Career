import { useEffect, useState } from 'react'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'
import DashboardPage from './DashboardPage'
import CareerPage from './CareerPage'
import CareerDetailPage from './CareerDetailPage'
import CareerConceptPage from './CareerConceptPage'
import RoadmapPage from './RoadmapPage'
import ConceptAnalysisPage from './ConceptAnalysisPage'
import ConceptSelectionPage from './ConceptSelectionPage'
import CourseAddPage from './CourseAddPage'
import LoadingPage from './LoadingPage'
import LearningPage from './LearningPage'
import PasswordResetPage from './PasswordResetPage'
import SiteHeader from './SiteHeader'
import { getCourseConcepts } from './courseConcepts'
import { courses } from './courses'
import { useLoginStatus } from './auth'
import './App.css'

const loadingDuration = 700

function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [isLoading, setIsLoading] = useState(false)
  const isLoggedIn = useLoginStatus()

  useEffect(() => {
    let loadingTimer: number | undefined

    const updateHash = () => {
      if (loadingTimer !== undefined) window.clearTimeout(loadingTimer)

      const nextHash = window.location.hash
      setHash(nextHash)

      if (nextHash.includes('/analysis')) {
        setIsLoading(true)
        loadingTimer = window.setTimeout(() => setIsLoading(false), loadingDuration)
      } else {
        setIsLoading(false)
      }
    }

    window.addEventListener('hashchange', updateHash)
    return () => {
      if (loadingTimer !== undefined) window.clearTimeout(loadingTimer)
      window.removeEventListener('hashchange', updateHash)
    }
  }, [])

  if (isLoading) {
    return <LoadingPage message="선택한 전공 개념을 분석하고 있어요..." />
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
      <div className="home-page dashboard-shell learning-shell">
        <SiteHeader />
        <LearningPage locked={!isLoggedIn} />
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

  const jobConceptRoute = '#job-concept/'
  if (hash.startsWith(jobConceptRoute)) {
    const [encodedCareerName, encodedCourseName, encodedConceptSummary] = hash.slice(jobConceptRoute.length).split('/', 3)
    const careerName = decodeURIComponent(encodedCareerName ?? '')
    const courseName = decodeURIComponent(encodedCourseName ?? '')
    const conceptSummary = decodeURIComponent(encodedConceptSummary ?? '')

    if (careerName && courseName && conceptSummary) {
      return (
        <div className="home-page dashboard-shell">
          <SiteHeader />
          <CareerConceptPage
            careerName={careerName}
            courseName={courseName}
            conceptSummary={conceptSummary}
          />
        </div>
      )
    }
  }

  return (
    <div className={`home-page${hash !== '#login' && hash !== '#signup' ? ' dashboard-shell' : ''}${hash === '' || hash === '#dashboard' ? ' dashboard-home-shell' : ''}`}>
      <SiteHeader />

      {hash === '#login' ? (
        <LoginPage />
      ) : hash === '#reset-password' ? (
        <PasswordResetPage />
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
