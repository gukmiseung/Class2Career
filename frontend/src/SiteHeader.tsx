import { useEffect, useState } from 'react'
import { setLoginStatus, useLoginStatus } from './auth'

export default function SiteHeader() {
  const isLoggedIn = useLoginStatus()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showLearningLoginModal, setShowLearningLoginModal] = useState(false)

  useEffect(() => {
    if (!showLogoutModal && !showLearningLoginModal) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLogoutModal(false)
        setShowLearningLoginModal(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showLogoutModal, showLearningLoginModal])

  function confirmLogout() {
    setLoginStatus(false)
    setShowLogoutModal(false)
    window.location.hash = 'dashboard'
  }

  return (
    <header className="site-header">
      <a className="header-logo" href="#dashboard" aria-label="C2C 대시보드">C2C</a>
      <nav className="header-nav" aria-label="주요 메뉴">
        <a href="#career">직무 탐색</a>
        <a href="#explore">전공 탐색</a>
        {isLoggedIn ? (
          <a href="#explore/learning">내 학습</a>
        ) : (
          <button type="button" onClick={() => setShowLearningLoginModal(true)}>내 학습</button>
        )}
        {isLoggedIn ? (
          <span className="auth-links logged-in-links">
            <a className="login-link" href="#profile">프로필</a>
            <span aria-hidden="true">/</span>
            <button className="login-link" type="button" onClick={() => setShowLogoutModal(true)}>로그아웃</button>
          </span>
        ) : (
          <span className="auth-links">
            <a className="login-link" href="#login">로그인</a>
            <span aria-hidden="true">/</span>
            <a className="login-link" href="#signup">회원가입</a>
          </span>
        )}
      </nav>
      {showLogoutModal && (
        <div className="logout-modal-backdrop" role="presentation" onMouseDown={() => setShowLogoutModal(false)}>
          <section
            className="logout-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="logout-modal-icon" aria-hidden="true">↪</div>
            <h2 id="logout-modal-title">로그아웃 할까요?</h2>
            <p id="logout-modal-description">언제든 다시 로그인해서 학습을 이어갈 수 있어요.</p>
            <div className="logout-modal-actions">
              <button type="button" autoFocus onClick={() => setShowLogoutModal(false)}>취소</button>
              <button className="logout-confirm-button" type="button" onClick={confirmLogout}>로그아웃</button>
            </div>
          </section>
        </div>
      )}
      {showLearningLoginModal && (
        <div className="learning-login-backdrop" role="presentation" onMouseDown={() => setShowLearningLoginModal(false)}>
          <section
            className="learning-login-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="header-learning-login-title"
            aria-describedby="header-learning-login-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="learning-login-close" type="button" aria-label="안내창 닫기" onClick={() => setShowLearningLoginModal(false)}>×</button>
            <div className="learning-login-lock" aria-hidden="true"><span /></div>
            <h2 id="header-learning-login-title">로그인 후 이용해주세요</h2>
            <p id="header-learning-login-description">로그인하면 나의 수강 과목과 학습 현황을<br />확인하고 관리할 수 있어요.</p>
            <a className="learning-login-button" href="#login" onClick={() => setShowLearningLoginModal(false)}>로그인하기</a>
            <p className="learning-signup-prompt">아직 계정이 없으신가요? <a href="#signup" onClick={() => setShowLearningLoginModal(false)}>회원가입</a></p>
          </section>
        </div>
      )}
    </header>
  )
}
