
import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { resetPassword, signOut, updatePassword } from '../lib/auth'

export default function PasswordReset() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { recoveringPassword, loading: authLoading } = useAuth()
  const pending = useRef(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleResetRequest() {
    if (pending.current || authLoading || !email.trim()) return

    pending.current = true
    setLoading(true)
    setMessage('')

    try {
      const { error } = await resetPassword(email.trim())

      setMessage(
        error
          ? `오류: ${error.message}`
          : '비밀번호 재설정 메일을 확인해 주세요.'
      )
    } catch {
      setMessage('재설정 요청 중 오류가 발생했습니다.')
    } finally {
      pending.current = false
      setLoading(false)
    }
  }

  async function handlePasswordUpdate() {
    if (pending.current || !recoveringPassword) return

    if (newPassword.length < 8) {
      setMessage('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    pending.current = true
    setLoading(true)
    setMessage('')

    try {
      const { error } = await updatePassword(newPassword)

      if (error) {
        setMessage(`변경 오류: ${error.message}`)
      } else {
        setNewPassword('')
        setConfirmPassword('')
        const { error: logoutError } = await signOut()
        setMessage(logoutError
          ? '비밀번호를 변경했지만 로그아웃하지 못했습니다.'
          : '비밀번호를 변경했습니다. 다시 로그인해 주세요.')
      }
    } catch {
      setMessage('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      pending.current = false
      setLoading(false)
    }
  }

  return (
    <section className="login-card">
      <h2>비밀번호 재설정</h2>

      {recoveringPassword ? (
        <form onSubmit={(event) => {
          event.preventDefault()
          void handlePasswordUpdate()
        }}>
          <label htmlFor="reset-password">새 비밀번호</label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label htmlFor="reset-confirm">새 비밀번호 확인</label>
          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            required
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? '변경 중…' : '비밀번호 변경'}
          </button>
        </form>
      ) : (
        <form onSubmit={(event) => {
          event.preventDefault()
          void handleResetRequest()
        }}>
          <label htmlFor="reset-email">가입한 이메일</label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            placeholder="가입한 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading || authLoading}
          >
            {loading ? '발송 중…' : '재설정 메일 보내기'}
          </button>
        </form>
      )}

      <p role="status">{message}</p>
      {!recoveringPassword && <p className="login-signup"><a href="#login">로그인으로 돌아가기</a></p>}
    </section>
  )
}
