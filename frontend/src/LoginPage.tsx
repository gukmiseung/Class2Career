import { useRef, useState, type FormEvent } from 'react'
import './LoginPage.css'
import { getSavedEmail, saveEmail, signIn } from './auth'
import { useAuth } from './contexts/AuthContext'
import { authHref } from './authNavigation'

export default function LoginPage({ callbackMessage, returnTo }: { callbackMessage: string; returnTo: string }) {
  const [email, setEmail] = useState(getSavedEmail)
  const [rememberEmail, setRememberEmail] = useState(Boolean(email))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const pending = useRef(false)
  const { loading, user } = useAuth()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || loading || user) return
    const form = event.currentTarget
    const password = String(new FormData(form).get('password') ?? '')
    const loginEmail = email.trim()
    pending.current = true
    setSubmitting(true)
    setError('')
    setShowSignupPrompt(false)

    try {
      const { error } = await signIn(loginEmail, password)
      if (error) {
        if (
          error.code === 'invalid_credentials' ||
          error.message.toLowerCase().includes('invalid login credentials') ||
          (error.status === 400 && error.code !== 'email_not_confirmed')
        ) {
          setShowSignupPrompt(true)
          return
        }
        setError(`로그인 실패: ${error.message}`)
        return
      }
      saveEmail(rememberEmail ? loginEmail : null)
      form.reset()
      window.location.hash = returnTo
    } catch {
      setError('로그인 요청 중 오류가 발생했습니다.')
    } finally {
      pending.current = false
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <p className="login-welcome">WELCOME</p>
      <h1>다시 만나서 반가워요!</h1>
      <p>로그인하고 나에게 맞는 학습과 직무 탐색을 이어가세요.</p>

      <form className="login-card" onSubmit={handleSubmit}>
        <h2>로그인</h2>
        {callbackMessage && <p role="status">{callbackMessage}</p>}
        {user ? (
          <p>로그인되었습니다. <a href={returnTo}>계속하기</a></p>
        ) : (
          <>

            <div>
              <label htmlFor="login-email">이메일</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="학교 이메일 또는 가입한 이메일을 입력하세요"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password">비밀번호</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(event) => setRememberEmail(event.target.checked)}
                />
                <span>이메일 기억하기</span>
              </label>
              <a className="login-forgot" href="#reset-password">비밀번호를 잊으셨나요?</a>
            </div>
            {error && <p role="alert">{error}</p>}
            <button type="submit" disabled={loading || submitting}>{submitting ? '로그인 중…' : '로그인'}</button>

            <p className="login-signup">
              아직 계정이 없으신가요? <a href={authHref('#signup', returnTo)}>회원가입</a>
            </p>
          </>
        )}
      </form>

      {showSignupPrompt && (
        <div className="login-signup-backdrop" role="presentation" onMouseDown={() => setShowSignupPrompt(false)}>
          <section
            className="login-signup-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-signup-title"
            aria-describedby="login-signup-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="login-signup-close"
              type="button"
              aria-label="팝업 닫기"
              onClick={() => setShowSignupPrompt(false)}
            >
              ×
            </button>
            <h2 id="login-signup-title">로그인 정보를 확인해 주세요.</h2>
            <p id="login-signup-description">
              가입한 이메일이라면 비밀번호를 찾고,<br />가입한 이메일이 없다면 회원가입을 시작하세요.
            </p>
            <div className="login-account-actions">
              <a className="login-password-reset-start" href="#reset-password">
                비밀번호 찾기
              </a>
              <a className="login-signup-start" href={authHref('#signup', returnTo)}>
                회원가입
              </a>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
