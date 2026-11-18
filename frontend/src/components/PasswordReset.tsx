
import { useEffect, useState } from 'react'
import { resetPassword, updatePassword } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function PasswordReset() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true)
          setMessage('새 비밀번호를 입력해 주세요.')
        }
      }
    )

    const hash = new URLSearchParams(
      window.location.hash.slice(1)
    )

    if (hash.get('error')) {
      setMessage(
        '인증 링크가 만료되었거나 유효하지 않습니다. 새 재설정 메일을 요청해 주세요.'
      )
    }

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  async function handleResetRequest() {
    if (loading || !email.trim()) return

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
      setLoading(false)
    }
  }

  async function handlePasswordUpdate() {
    if (loading) return

    if (newPassword.length < 6) {
      setMessage('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await updatePassword(newPassword)

      if (error) {
        setMessage(`변경 오류: ${error.message}`)
      } else {
        setMessage('비밀번호 변경 완료! 다시 로그인해 주세요.')
        setRecoveryMode(false)
        setNewPassword('')
        setConfirmPassword('')
        await supabase.auth.signOut()
      }
    } catch {
      setMessage('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{
      maxWidth: 420,
      margin: '40px auto',
      padding: 24,
    }}>
      <h2>비밀번호 재설정</h2>

      {recoveryMode ? (
        <div>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={handlePasswordUpdate}
            disabled={loading}
          >
            비밀번호 변경
          </button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="가입한 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="button"
            onClick={handleResetRequest}
            disabled={loading}
          >
            재설정 메일 보내기
          </button>
        </div>
      )}

      <p role="status">{message}</p>
    </section>
  )
}