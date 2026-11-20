import './AsyncState.css'

type AsyncStateProps = {
  title?: string
  message: string
  compact?: boolean
}

export function Loading({ message, compact = false }: AsyncStateProps) {
  return (
    <div className={`async-state${compact ? ' compact' : ''}`} role="status" aria-live="polite" aria-busy="true">
      <span className="async-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export function ErrorMessage({ title = '문제가 발생했어요', message, onRetry, retrying = false }: AsyncStateProps & {
  onRetry?: () => void
  retrying?: boolean
}) {
  return (
    <div className="async-state async-error" role="alert">
      <span className="async-state-icon" aria-hidden="true">!</span>
      <div><h3>{title}</h3><p>{message}</p></div>
      {onRetry && <button type="button" disabled={retrying} onClick={onRetry}>{retrying ? '다시 불러오는 중…' : '다시 시도'}</button>}
    </div>
  )
}

export function EmptyState({ title = '표시할 내용이 없어요', message, action }: AsyncStateProps & {
  action?: { label: string; href: string }
}) {
  return (
    <div className="async-state async-empty">
      <span className="async-state-icon" aria-hidden="true">○</span>
      <div><h3>{title}</h3><p>{message}</p></div>
      {action && <a href={action.href}>{action.label}</a>}
    </div>
  )
}
