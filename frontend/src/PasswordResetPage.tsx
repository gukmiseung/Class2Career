import { useState, type FormEvent } from 'react'
import './PasswordResetPage.css'

export default function PasswordResetPage() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'password' | 'complete'>('email')
  const [error, setError] = useState('')

  function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setStep('password')
  }

  function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않아요.')
      return
    }

    setError('')
    setStep('complete')
  }

  return (
    <main className="password-reset-page">
      <section className="password-reset-visual" aria-hidden="true">
        <div className="password-illustration">
          <div className="password-orbit" />
          <div className="password-laptop">
            <div className="password-lock"><span /></div>
            <div className="password-dots">＊＊＊＊</div>
          </div>
          <div className="password-base" />
        </div>
        <p>안전하게 비밀번호를<br /><strong>재설정하세요</strong></p>
      </section>

      <section className="password-reset-card">
        {step === 'complete' ? (
          <div className="password-reset-complete" role="status">
            <div aria-hidden="true">✓</div>
            <h1>비밀번호 변경 완료</h1>
            <p>새 비밀번호로 다시 로그인해 주세요.</p>
            <a className="password-primary-link" href="#login">로그인으로 돌아가기</a>
          </div>
        ) : (
          <>
            <h1>비밀번호 재설정</h1>
            <p>
              {step === 'email'
                ? '가입한 이메일을 입력해 주세요.'
                : `${email} 계정의 새 비밀번호를 입력해 주세요.`}
            </p>

            {step === 'email' ? (
              <form onSubmit={requestReset}>
                <label htmlFor="reset-email">이메일 주소</label>
                <div className="password-input-wrap">
                  <span aria-hidden="true">✉</span>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    placeholder="이메일 주소를 입력하세요"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <button className="password-primary-button" type="submit">재설정 링크 보내기</button>
              </form>
            ) : (
              <form onSubmit={updatePassword} onChange={() => setError('')}>
                <label htmlFor="reset-password">새 비밀번호</label>
                <input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="8자 이상 입력하세요" required />
                <label htmlFor="reset-password-confirm">새 비밀번호 확인</label>
                <input id="reset-password-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} placeholder="새 비밀번호를 다시 입력하세요" required />
                {error && <p className="password-reset-error" role="alert">{error}</p>}
                <button className="password-primary-button" type="submit">비밀번호 변경하기</button>
                <button className="password-back-button" type="button" onClick={() => setStep('email')}>이메일 다시 입력</button>
              </form>
            )}

            <a className="password-login-link" href="#login">로그인으로 돌아가기</a>
          </>
        )}
      </section>
    </main>
  )
}
