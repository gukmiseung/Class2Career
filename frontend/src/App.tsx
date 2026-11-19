import { useEffect, useState } from 'react'
import ConceptAnalysisPage from './ConceptAnalysisPage'
import ConceptSelectionPage from './ConceptSelectionPage'
import CourseAddPage from './CourseAddPage'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'
import { getCourseConcepts } from './courseConcepts'
import { courses } from './courses'

import './App.css'
import c2cLogo from './assets/c2c-logo.png'

const features = [
  { icon: '📖', title: '01. 전공 개념 탐색', description: '수강한 과목을 선택하고 세부 개념을\n살펴보세요.' },
  { icon: '💼', title: '02. 실무와 직무 연결', description: '배운 개념이 실제 업무에서 어떻게 활\n용되는지 알아보세요.' },
  { icon: '🎓', title: '03. 학습 방향 추천', description: '관심 직무에 필요한 학습과 프로젝트\n를 추천받으세요.' },
]

function Logo() {
  return <img className="logo" src={c2cLogo} alt="Class2Career" />
}

function App() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    function updateHash() {
      setHash(window.location.hash)
    }

    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  if (hash === '#explore') {
    return <CourseAddPage />
  }

  if (hash === '#explore/learning') {
    return <CourseAddPage showLearning />
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
    <div className="home-page">
      <header className="site-header">
        <a className="logo-link" href="#top"><Logo /></a>
        <nav aria-label="주요 메뉴">
          <a href="#top">홈</a>
          <a href="#login">로그인</a>
          <a href="#signup">회원가입</a>
        </nav>
      </header>

      {hash === '#login' ? (
        <LoginPage />
      ) : hash === '#signup' ? (
        <SignupPage />
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
