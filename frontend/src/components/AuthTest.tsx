
import { useState } from 'react'
import { signIn, signOut, signUp } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'

export default function AuthTest() {
  const { user, loading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 회원가입 및 로그인 처리
  async function handleAuth(mode: 'signup' | 'login') {
    if (submitting) return

    if (!email.trim() || !password) {
      setMessage('이메일과 비밀번호를 입력해 주세요.')
      return
    }

    if (password.length < 6) {
      setMessage('비밀번호는 6자 이상 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const { error } =
        mode === 'signup'
          ? await signUp(email.trim(), password)
          : await signIn(email.trim(), password)

      if (error) {
        setMessage(`인증 오류: ${error.message}`)
        return
      }

      if (mode === 'signup') {
        setMessage(
          '회원가입 요청이 완료되었습니다. 인증 메일을 확인해 주세요.'
        )
      } else {
        setMessage('로그인 성공!')
        setPassword('')
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `요청 오류: ${error.message}`
          : '요청 처리 중 오류가 발생했습니다.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // 로그아웃 처리
  async function handleLogout() {
    if (submitting) return

    setSubmitting(true)
    setMessage('')

    try {
      const { error } = await signOut()

      if (error) {
        setMessage(`로그아웃 오류: ${error.message}`)
      } else {
        setMessage('로그아웃 완료')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `로그아웃 오류: ${error.message}`
          : '로그아웃 중 오류가 발생했습니다.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // 초기 로그인 상태 확인
  if (authLoading) {
    return (
      <section style={{ padding: 24 }}>
        <p>로그인 상태 확인 중...</p>
      </section>
    )
  }

  return (
    <section
      style={{
        padding: 24,
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      <h2>Class2Career 인증 테스트</h2>

      {user ? (
        <div>
          <p>로그인 상태: 로그인됨</p>
          <p>사용자 이메일: {user.email}</p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
          >
            {submitting ? '처리 중...' : '로그아웃'}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleAuth('login')
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="test-email">
              이메일
            </label>

            <input
              id="test-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              style={{
                display: 'block',
                width: '100%',
                padding: 10,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="test-password">
              비밀번호
            </label>

            <input
              id="test-password"
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={6}
              required
              style={{
                display: 'block',
                width: '100%',
                padding: 10,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
            }}
          >
            <button
              type="submit"
              disabled={submitting}
            >
              로그인
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleAuth('signup')}
            >
              회원가입
            </button>
          </div>
        </form>
      )}

      <p role="status" aria-live="polite">
        {message}
      </p>
    </section>
  )
}
