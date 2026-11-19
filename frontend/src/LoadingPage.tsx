import './LoadingPage.css'

export default function LoadingPage({ message }: { message: string }) {
  return (
    <main className="loading-page" aria-live="polite" aria-busy="true">
      <div className="loading-content">
        <div className="loader" role="status" aria-label={message}>
          <div className="loader-ring" aria-hidden="true" />
          <div className="loading-brand-mark" aria-hidden="true">C2C</div>
        </div>
        <div className="loading-copy">
          <h1>잠시만 기다려주세요.</h1>
          <p>{message}</p>
        </div>
      </div>
    </main>
  )
}
