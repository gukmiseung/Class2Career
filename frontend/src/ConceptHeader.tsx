import './ConceptLayout.css'

export default function ConceptHeader() {
  return (
    <header className="concept-header">
      <div className="concept-header-inner">
        <a className="concept-brand" href="#top" aria-label="Class2Career 홈">C2C</a>
        <nav aria-label="주요 메뉴">
          <span role="link" aria-disabled="true">직무 탐색</span>
          <a href="#explore">전공 탐색</a>
          <a href="#explore/learning">내 학습</a>
          <a className="concept-login" href="#login">로그인</a>
        </nav>
      </div>
    </header>
  )
}
