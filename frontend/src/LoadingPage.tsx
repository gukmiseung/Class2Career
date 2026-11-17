import './LoadingPage.css'

export default function LoadingPage() {
  return (
    <main className="loading-page" aria-live="polite" aria-busy="true">
      <div className="loading-content">
        <div className="loader" role="status" aria-label="선택한 전공 개념을 분석하는 중">
          <div className="loader-ring" aria-hidden="true" />
          <div className="loading-brand-mark" aria-hidden="true">C2C</div>
        </div>
        <div className="loading-copy">
          <h1>잠시만 기다려주세요.</h1>
          <p>선택한 전공 개념을 분석하고 있어요...</p>
        </div>
      </div>
    </main>
  )
}
