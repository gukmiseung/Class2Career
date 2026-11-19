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

const features = [
  { icon: '📖', title: '01. 전공 개념 탐색', description: '수강한 과목을 선택하고 세부 개념을\n살펴보세요.' },
  { icon: '💼', title: '02. 실무와 직무 연결', description: '배운 개념이 실제 업무에서 어떻게 활\n용되는지 알아보세요.' },
  { icon: '🎓', title: '03. 학습 방향 추천', description: '관심 직무에 필요한 학습과 프로젝트\n를 추천받으세요.' },
]

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
      <div className="home-page dashboard-shell">
        <SiteHeader />
        <CourseAddPage />
      </div>
    )
  }

  if (hash === '#explore/learning') {
    return (
      <div className="home-page dashboard-shell">
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
    <div className={`home-page${hash === '#dashboard' || hash === '#career' || hash.startsWith('#career-') || hash.startsWith('#roadmap-') ? ' dashboard-shell' : ''}`}>
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
      <main>
      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">전공지식과 미래를 연결하다</p>
          <h1>Class2Career</h1>
          <h2>내가 배우는 수업은 어디에 쓰일까?</h2>
          <p className="intro">
            전공 수업에서 배운 지식을 실제 직무와 연결해 보세요.<br />
            내가 공부한 개념이 산업 현장에서 어떻게 활용되는지 알아볼 수 있어요.
          </p>
          <div className="hero-actions">
            <div className="primary-actions">
              <a className="button button-primary" href="#explore">내 전공 탐색하기 <span aria-hidden="true">→</span></a>
              <a className="button button-job" href="#career">희망 직무 탐색하기 <span aria-hidden="true">→</span></a>
            </div>
            <a className="button button-secondary" href="#features">이용 방법 알아보기</a>
          </div>
        </div>
      </section>

      <section className="features-section" id="features" aria-label="서비스 이용 방법">
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
      )}
    </div>
  )
}

export default App
