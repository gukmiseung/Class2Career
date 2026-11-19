import './ConceptLayout.css'

export default function ConceptHeader() {
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
