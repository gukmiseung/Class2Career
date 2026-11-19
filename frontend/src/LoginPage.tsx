import { useRef, useState, type FormEvent } from 'react'
import { useAuth } from './contexts/AuthContext'
import { signIn } from './lib/auth'
import './LoginPage.css'

type LoginPageProps = {
  callbackMessage: string
  onSuccess: () => void
}

export default function LoginPage({ callbackMessage, onSuccess }: LoginPageProps) {
  const { user, loading } = useAuth()
  const pending = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || loading || user) return

    const form = event.currentTarget
    const values = new FormData(form)
    pending.current = true
    setSubmitting(true)
    setMessage('')

    try {
      const { error } = await signIn(
        String(values.get('email')).trim(),
        String(values.get('password')),
      )
      if (error) {
        setMessage(`로그인 실패: ${error.message}`)
        return
      }
      form.reset()
      onSuccess()
    } catch {
      setMessage('로그인 요청 중 오류가 발생했습니다.')
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
      {callbackMessage && <p role="status">{callbackMessage}</p>}

      <form className="login-card" onSubmit={handleSubmit}>
        <h2>로그인</h2>

        {user ? (
          <p role="status">로그인되었습니다.</p>
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

            <p className="login-forgot"><a href="#password-reset">비밀번호를 잊으셨나요?</a></p>

            <button type="submit" disabled={loading || submitting}>
              {submitting ? '로그인 중…' : '로그인'}
            </button>
            {message && <p role="status">{message}</p>}

            <p className="login-signup">
              아직 계정이 없으신가요? <a href="#signup">회원가입</a>
            </p>
          </>
        )}
      </form>
    </main>
  )
}
