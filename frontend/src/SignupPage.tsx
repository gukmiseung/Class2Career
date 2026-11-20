import { useRef, useState, type FormEvent } from 'react'
import './SignupPage.css'
import { signUp } from './auth'

export default function SignupPage({ returnTo }: { returnTo: string }) {
  const [passwordError, setPasswordError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const pending = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    setPasswordError('')
    setMessage('')

    if (!name) {
      setMessage('이름을 입력해 주세요.')
      return
    }
    if (password.length < 8) {
      setPasswordError('비밀번호를 8자 이상 입력해 주세요.')
      return
    }
    if (password !== formData.get('confirmPassword')) {
      setPasswordError('비밀번호가 일치하지 않아요.')
      return
    }

    pending.current = true
    setSubmitting(true)
    try {
      const { data, error } = await signUp(email, password, name)
      if (error) {
        setMessage(`회원가입 실패: ${error.message}`)
        return
      }
      form.reset()
      if (data.session) window.location.hash = returnTo
      else setMessage('회원가입 요청이 완료되었습니다. 이메일에서 인증 링크를 확인해 주세요.')
    } catch {
      setMessage('회원가입 요청 중 오류가 발생했습니다.')
    } finally {
      pending.current = false
      setSubmitting(false)
    }
  }

  return (
    <main className="signup-page">
      <p className="signup-eyebrow">GET STARTED</p>
      <h1>Class2Career 시작하기</h1>
      <p className="signup-description">계정을 만들고 나의 전공 학습과 희망 직무를 연결해 보세요.</p>

      <div className="signup-layout">
        <form
          className="signup-card"
          onSubmit={handleSubmit}
          onChange={() => {
            setPasswordError('')
            setMessage('')
          }}
        >
          <label htmlFor="signup-name">이름</label>
          <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="이름을 입력하세요" required />

          <label htmlFor="signup-email">이메일</label>
          <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="이메일을 입력하세요" required />

          <label htmlFor="signup-password">비밀번호</label>
          <input id="signup-password" name="password" type="password" autoComplete="new-password" placeholder="8자 이상 비밀번호를 입력하세요" minLength={8} required />

          <label htmlFor="signup-confirm">비밀번호 확인</label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 다시 입력하세요"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? 'signup-password-error' : undefined}
            required
          />

          {passwordError && <p className="signup-error" id="signup-password-error" role="alert">{passwordError}</p>}
          <button type="submit" disabled={submitting}>{submitting ? '가입 요청 중…' : '회원가입'}</button>
          {message && <p role="status">{message}</p>}
        </form>

        <aside className="signup-guide">
          <p className="signup-eyebrow">YOUR CAREER, CONNECTED</p>
          <h2>배운 것을 연결하면<br />진로가 더 선명해져요.</h2>
          <p>수강한 과목과 관심 있는 직무를 바탕으로<br />나에게 필요한 다음 학습을 찾아보세요.</p>
        </aside>
      </div>
    </main>
  )
}
