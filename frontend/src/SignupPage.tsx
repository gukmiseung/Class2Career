import { useState, type FormEvent } from 'react'
import './SignupPage.css'

export default function SignupPage() {
  const [passwordError, setPasswordError] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    if (formData.get('password') !== formData.get('confirmPassword')) {
      setPasswordError('비밀번호가 일치하지 않아요.')
      return
    }

    setPasswordError('')
    setMessage('입력 내용을 확인했어요. 계정 생성은 서버 연결 후 이용할 수 있어요.')
  }

  return (
    <main className="signup-page">
      <p className="signup-eyebrow">GET STARTED</p>
      <h1>Class2Career 시작하기</h1>
      <p className="signup-description">
        계정을 만들고 나의 전공 학습과 희망 직무를 연결해 보세요.
      </p>

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
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="이름을 입력하세요"
            required
          />

          <label htmlFor="signup-email">이메일</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="학교 이메일을 입력하세요"
            required
          />

          <label htmlFor="signup-password">비밀번호</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상 비밀번호를 입력하세요"
            minLength={8}
            required
          />

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

          {passwordError && (
            <p className="signup-error" id="signup-password-error" role="alert">
              {passwordError}
            </p>
          )}

          <button type="submit">회원가입</button>
          {message && <p role="status">{message}</p>}
        </form>

        <aside className="signup-guide">
          <p className="signup-eyebrow">YOUR CAREER, CONNECTED</p>
          <h2>배운 것을 연결하면<br />진로가 더 선명해져요.</h2>
          <p>
            수강한 과목과 관심 있는 직무를 바탕으로<br />
            나에게 필요한 다음 학습을 찾아보세요.
          </p>
        </aside>
      </div>
    </main>
  )
}