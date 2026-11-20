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
import CourseDetailPage from './CourseDetailPage'
import LoadingPage from './LoadingPage'
import LearningPage from './LearningPage'
import PasswordResetPage from './PasswordResetPage'
import ProfilePage from './ProfilePage'
import SiteHeader from './SiteHeader'
import { getCourseConcepts } from './courseConcepts'
import { courses } from './courses'
import { useAuth } from './contexts/AuthContext'
import { authCallback, supabase } from './lib/supabase'
import { getAuthReturnTo, isLearningRoute } from './authNavigation'
import LearningLoginModal from './LearningLoginModal'
import './App.css'

const loadingDuration = 700

function isPublicRoute(hash: string) {
  const [route] = hash.split('?', 1)
  return !isLearningRoute(hash) &&
    route !== '#login' && route !== '#signup' && route !== '#reset-password' && route !== '#profile'
}

function App() {
  const [locationHash, setHash] = useState(window.location.hash)
  const [isLoading, setIsLoading] = useState(false)
  const [callbackMessage, setCallbackMessage] = useState('')
  const [handlingCallback, setHandlingCallback] = useState(Boolean(authCallback))
  const { user, loading, recoveringPassword } = useAuth()
  const [publicHash, setPublicHash] = useState(() => {
    const initialHash = window.location.hash
    return !authCallback && isPublicRoute(initialHash) ? initialHash : '#dashboard'
  })
  const gatedDestination =
    !loading && !user && !recoveringPassword && isLearningRoute(locationHash) ? locationHash : null
  const visibleHash = recoveringPassword ? '#reset-password' : gatedDestination ? publicHash : locationHash
  const [authRoute] = visibleHash.split('?', 1)
  const hash = authRoute === '#login' || authRoute === '#signup' ? authRoute : visibleHash
  const returnTo = getAuthReturnTo(visibleHash)

  useEffect(() => {
    let loadingTimer: number | undefined

    const updateHash = (event: HashChangeEvent) => {
      if (event.newURL !== window.location.href) return
      if (loadingTimer !== undefined) window.clearTimeout(loadingTimer)

      const nextHash = window.location.hash
      setHash(nextHash)
      if (isPublicRoute(nextHash)) setPublicHash(nextHash)
      setCallbackMessage('')

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

  useEffect(() => {
    if (!authCallback) return
    const { recovery, hasError } = authCallback
    let active = true

    void supabase.auth.initialize().then(({ error }) => {
      if (!active) return
      setHandlingCallback(false)
      const currentHash = window.location.hash
      if (currentHash && !currentHash.includes('=')) return

      const destination = recovery ? '#reset-password' : '#login'
      window.history.replaceState(window.history.state, '', window.location.pathname + destination)
      setHash(destination)
      if (error || hasError) {
        setCallbackMessage('이메일 링크가 만료되었거나 유효하지 않습니다. 새 링크를 요청해 주세요.')
      } else if (!recovery) {
        setCallbackMessage('이메일 인증이 완료되었습니다.')
      }
    })

    return () => { active = false }
  }, [])

  if (handlingCallback) {
    return <LoadingPage message="이메일 인증 링크를 확인하고 있어요..." />
  }

  if (loading && (isLearningRoute(locationHash) || locationHash === '#profile')) {
    return <LoadingPage message="로그인 상태를 확인하고 있어요..." />
  }

  const courseDetail = /^#explore\/courses\/([a-z0-9-]+)$/.exec(hash)
  if (courseDetail) {
    return (
      <div className="home-page dashboard-shell course-shell">
        <SiteHeader />
        <CourseDetailPage key={courseDetail[1]} slug={courseDetail[1]} />
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
  if (isLoading && !recoveringPassword && !gatedDestination) {
    return <LoadingPage message="선택한 전공 개념을 분석하고 있어요..." />
  }

  function dismissLearningModal() {
    window.history.replaceState(window.history.state, '', publicHash || '#dashboard')
    setHash(publicHash || '#dashboard')
    setIsLoading(false)
  }

  function renderPage() {
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
          <LearningPage />
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
          <LoginPage callbackMessage={callbackMessage} returnTo={returnTo} />
        ) : hash === '#reset-password' ? (
          <PasswordResetPage callbackMessage={callbackMessage} />
        ) : hash === '#signup' ? (
          <SignupPage returnTo={returnTo} />
        ) : hash === '#profile' ? (
          user ? <ProfilePage /> : <LoginPage callbackMessage={callbackMessage} returnTo="#profile" />
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

  return (
    <>
      {renderPage()}
      {gatedDestination && <LearningLoginModal destination={gatedDestination} onClose={dismissLearningModal} />}
    </>
  )
}

export default App
