import { useEffect, useRef } from 'react'
import { authHref } from './authNavigation'

export default function LearningLoginModal({ destination, onClose, description }: {
  destination: string
  onClose: () => void
  description?: string
}) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    closeButton.current?.focus()
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  return (
    <div className="learning-login-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="learning-login-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="learning-login-title"
        aria-describedby="learning-login-description"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
          if (event.key === 'Tab') {
            const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first.focus()
            }
          }
        }}
      >
        <button className="learning-login-close" type="button" ref={closeButton} aria-label="안내창 닫기" onClick={onClose}>×</button>
        <div className="learning-login-lock" aria-hidden="true"><span /></div>
        <h2 id="learning-login-title">로그인 후 이용해주세요</h2>
        <p id="learning-login-description">{description ?? <>로그인하면 나의 수강 과목과 학습 현황을<br />확인하고 관리할 수 있어요.</>}</p>
        <a className="learning-login-button" href={authHref('#login', destination)}>로그인하기</a>
        <p className="learning-signup-prompt">아직 계정이 없으신가요? <a href={authHref('#signup', destination)}>회원가입</a></p>
      </section>
    </div>
  )
}
