import { useEffect, useState } from 'react'
import { ErrorMessage } from './AsyncState'
import { loadProfileMajors, type ProfileMajor } from './profiles'

type MajorList = { majors: ProfileMajor[]; error: string | null }

export default function ProfileMajorSelect({ value, onChange, disabled }: {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}) {
  const [list, setList] = useState<MajorList | null>(null)
  const [attempt, setAttempt] = useState(0)
  const majors = list?.majors ?? []
  const loading = list === null
  const hasLegacyValue = value !== '' && !majors.some((major) => major.name === value)

  useEffect(() => {
    const controller = new AbortController()
    loadProfileMajors(controller.signal)
      .then((majors) => {
        if (!controller.signal.aborted) setList({ majors, error: null })
      })
      .catch(() => {
        if (!controller.signal.aborted) setList({ majors: [], error: '전공 목록을 불러오지 못했어요.' })
      })
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setList(null)
    setAttempt((current) => current + 1)
  }

  return (
    <div className="profile-major-field">
      <label>
        <span>전공</span>
        <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled || majors.length === 0}>
          <option value="" disabled>전공을 선택하세요</option>
          {hasLegacyValue && <option value={value} disabled>{value}{list && !list.error ? ' (기존 선택)' : ''}</option>}
          {majors.map((major) => <option key={major.id} value={major.name}>{major.name}</option>)}
        </select>
      </label>
      {list?.error ? (
        <ErrorMessage message={list.error} onRetry={retry} compact />
      ) : loading || majors.length === 0 ? (
        <p className="profile-major-status" role="status">{loading ? '전공 목록을 불러오는 중이에요.' : '등록된 전공이 없어요.'}</p>
      ) : null}
    </div>
  )
}
