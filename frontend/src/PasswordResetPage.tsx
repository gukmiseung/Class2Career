import { useRef, useState, type FormEvent } from 'react'
import { resetPassword, signOut, updatePassword } from './auth'
import { useAuth } from './contexts/AuthContext'
import './PasswordResetPage.css'

export default function PasswordResetPage({ callbackMessage }: { callbackMessage: string }) {
  const { loading, recoveringPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [complete, setComplete] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const pending = useRef(false)

  async function runRequest(request: () => Promise<void>, failureMessage: string) {
    if (pending.current || loading) return
    pending.current = true
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await request()
    } catch {
      setError(failureMessage)
    } finally {
      pending.current = false
      setSubmitting(false)
    }
  }

  function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || recoveringPassword) return
    void runRequest(async () => {
      const { error } = await resetPassword(email.trim())
      if (error) setError(`재설정 요청 실패: ${error.message}`)
      else setMessage('메일함에서 비밀번호 재설정 링크를 확인해 주세요.')
    }, '재설정 메일 요청 중 오류가 발생했습니다.')
  }

  async function leaveRecovery(changed: boolean) {
    const { error } = await signOut()
    if (error) {
      setError(`로그아웃 실패: ${error.message}`)
      return
    }
    if (changed) setComplete(true)
    else window.location.hash = '#login'
  }

  function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || !recoveringPassword || passwordChanged) return
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password.length < 8) {
      setError('새 비밀번호를 8자 이상 입력해 주세요.')
      return
    }

    if (password !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않아요.')
      return
    }

    void runRequest(async () => {
      const { error } = await updatePassword(password)
      if (error) {
        setError(`비밀번호 변경 실패: ${error.message}`)
        return
      }
      setPasswordChanged(true)
      await leaveRecovery(true)
    }, '비밀번호 재설정 중 오류가 발생했습니다.')
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
        {complete ? (
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
              {passwordChanged
                ? '비밀번호를 변경했습니다. 새 비밀번호로 로그인하려면 로그아웃해 주세요.'
                : recoveringPassword ? '계정의 새 비밀번호를 입력해 주세요.' : '가입한 이메일을 입력해 주세요.'}
            </p>

            {passwordChanged ? (
              <button className="password-primary-button" type="button" disabled={submitting} onClick={() => {
                void runRequest(() => leaveRecovery(true), '로그아웃 중 오류가 발생했습니다.')
              }}>로그아웃</button>
            ) : !recoveringPassword ? (
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
                <button className="password-primary-button" type="submit" disabled={loading || submitting}>
                  {submitting ? '발송 중…' : '재설정 링크 보내기'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordUpdate} onChange={() => setError('')}>
                <label htmlFor="reset-password">새 비밀번호</label>
                <input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="8자 이상 입력하세요" required />
                <label htmlFor="reset-password-confirm">새 비밀번호 확인</label>
                <input id="reset-password-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} placeholder="새 비밀번호를 다시 입력하세요" required />
                <button className="password-primary-button" type="submit" disabled={loading || submitting}>
                  {submitting ? '변경 중…' : '비밀번호 변경하기'}
                </button>
                <button className="password-back-button" type="button" disabled={submitting} onClick={() => {
                  void runRequest(() => leaveRecovery(false), '로그아웃 중 오류가 발생했습니다.')
                }}>재설정 취소</button>
              </form>
            )}

            {error && <p className="password-reset-error" role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}
            {callbackMessage && <p role="status">{callbackMessage}</p>}
            {!recoveringPassword && !passwordChanged && <a className="password-login-link" href="#login">로그인으로 돌아가기</a>}
          </>
        )}
      </section>
    </main>
  )
}
