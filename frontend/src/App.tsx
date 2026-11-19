import { useEffect, useRef, useState } from 'react'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'
import { useAuth } from './contexts/AuthContext'
import { signOut } from './lib/auth'
import { authCallback, supabase } from './lib/supabase'
import './App.css'
import c2cLogo from './assets/c2c-logo.png'
import PasswordReset from './components/PasswordReset'

const postLoginDestination = '#top'

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
  const [callbackMessage, setCallbackMessage] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState('')
  const logoutPending = useRef(false)
  const { user, loading, recoveringPassword } = useAuth()

  useEffect(() => {
    function updateHash(event: HashChangeEvent) {
      if (event.newURL !== window.location.href) return
      setHash(window.location.hash)
      setCallbackMessage('')
    }

    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  useEffect(() => {
    if (!authCallback) return
    const { recovery, hasError } = authCallback
    let active = true

    void supabase.auth.initialize().then(({ error }) => {
      const currentHash = window.location.hash
      if (!active || (currentHash && !currentHash.includes('='))) return

      const destination = recovery ? '#password-reset' : '#login'
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

  function handleLoginSuccess() {
    setLogoutMessage('')
    window.location.hash = postLoginDestination
  }

  async function handleLogout() {
    if (logoutPending.current) return
    logoutPending.current = true
    setSigningOut(true)
    setLogoutMessage('')

    try {
      const { error } = await signOut()
      setLogoutMessage(error ? `로그아웃 실패: ${error.message}` : '로그아웃했습니다.')
    } catch {
      setLogoutMessage('로그아웃 중 오류가 발생했습니다.')
    } finally {
      logoutPending.current = false
      setSigningOut(false)
    }
  }

  const screen = recoveringPassword ? '#password-reset' : hash

  return (
    <div className="home-page">
      <header className="site-header">
        <a className="logo-link" href="#top"><Logo /></a>
        <nav aria-label="주요 메뉴">
          <a href="#top">홈</a>
          {loading ? (
            <span role="status">로그인 상태 확인 중…</span>
          ) : recoveringPassword ? (
            <a href="#password-reset">비밀번호 변경</a>
          ) : user ? (
            <>
              <span>로그인됨</span>
              <button className="header-logout" type="button" onClick={handleLogout} disabled={signingOut}>
                {signingOut ? '로그아웃 중…' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <a href="#login">로그인</a>
              <a href="#signup">회원가입</a>
            </>
          )}
        </nav>
      </header>

      <p className="header-auth-status" role="status">{logoutMessage}</p>

      {screen === '#password-reset' ? (
        <main className="login-page">
          <PasswordReset />
          {callbackMessage && <p role="status">{callbackMessage}</p>}
        </main>
      ) : screen === '#login' ? (
        <LoginPage callbackMessage={callbackMessage} onSuccess={handleLoginSuccess} />
      ) : screen === '#signup' ? (
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
