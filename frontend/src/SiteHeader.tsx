import { useEffect, useRef, useState } from 'react'
import { signOut } from './auth'
import { useAuth } from './contexts/AuthContext'

export default function SiteHeader() {
  const { user, loading, recoveringPassword } = useAuth()
  const isLoggedIn = Boolean(user) && !recoveringPassword
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const logoutPending = useRef(false)

  useEffect(() => {
    if (!showLogoutModal) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLogoutModal(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showLogoutModal])

  async function confirmLogout() {
    if (logoutPending.current) return
    logoutPending.current = true
    setSigningOut(true)
    setLogoutError('')
    try {
      const { error } = await signOut()
      if (error) {
        setLogoutError(`로그아웃 실패: ${error.message}`)
        return
      }
      setShowLogoutModal(false)
      window.location.hash = '#dashboard'
    } catch {
      setLogoutError('로그아웃 중 오류가 발생했습니다.')
    } finally {
      logoutPending.current = false
      setSigningOut(false)
    }
  }

  return (
    <header className="site-header">
      <a className="header-logo" href="#dashboard" aria-label="C2C 대시보드">C2C</a>
      <nav className="header-nav" aria-label="주요 메뉴">
        <a href="#career">직무 탐색</a>
        <a href="#explore">전공 탐색</a>
        <a href="#explore/learning">내 학습</a>
        {loading ? (
          <span role="status">로그인 확인 중…</span>
        ) : recoveringPassword ? (
          <span>비밀번호 재설정 중</span>
        ) : isLoggedIn ? (
          <span className="auth-links logged-in-links">
            <a className="login-link" href="#profile">프로필</a>
            <span aria-hidden="true">/</span>
            <button className="login-link" type="button" onClick={() => {
              setLogoutError('')
              setShowLogoutModal(true)
            }}>로그아웃</button>
          </span>
        ) : (
          <span className="auth-links">
            <a className="login-link" href="#login">로그인</a>
            <span aria-hidden="true">/</span>
            <a className="login-link" href="#signup">회원가입</a>
          </span>
        )}
      </nav>
      {showLogoutModal && isLoggedIn && (
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
            {logoutError && <p role="alert">{logoutError}</p>}
            <div className="logout-modal-actions">
              <button type="button" autoFocus onClick={() => setShowLogoutModal(false)}>취소</button>
              <button className="logout-confirm-button" type="button" disabled={signingOut} onClick={confirmLogout}>{signingOut ? '로그아웃 중…' : '로그아웃'}</button>
            </div>
          </section>
        </div>
      )}
    </header>
  )
}
