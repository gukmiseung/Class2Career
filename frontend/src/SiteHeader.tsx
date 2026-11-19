import { setLoginStatus, useLoginStatus } from './auth'

export default function SiteHeader() {
  const isLoggedIn = useLoginStatus()

  function handleLogout() {
    if (!window.confirm('로그아웃 할까요?')) return

    setLoginStatus(false)
    window.location.hash = 'dashboard'
  }

  return (
    <header className="site-header">
      <a className="header-logo" href="#dashboard" aria-label="C2C 대시보드">C2C</a>
      <nav className="header-nav" aria-label="주요 메뉴">
        <a href="#career">직무 탐색</a>
        <a href="#explore">전공 탐색</a>
        <a href="#explore/learning">내 학습</a>
        {isLoggedIn ? (
          <button className="login-link" type="button" onClick={handleLogout}>로그아웃</button>
        ) : (
          <a className="login-link" href="#login">로그인 / 회원가입</a>
        )}
      </nav>
    </header>
  )
}
