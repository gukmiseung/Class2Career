import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { loadProfile, type Profile } from './profiles'

type ProfileResult = {
  userId: string
  profile: Profile | null
  error: string | null
}

export function useProfile() {
  const { user, recoveringPassword } = useAuth()
  const userId = recoveringPassword ? null : user?.id ?? null
  const email = user?.email ?? ''
  const name: unknown = user?.user_metadata.name
  const signupName = typeof name === 'string' ? name.trim() : ''
  const [result, setResult] = useState<ProfileResult | null>(null)
  const [attempt, setAttempt] = useState(0)
  const current = result?.userId === userId ? result : null

  useEffect(() => {
    if (!userId) return

    const controller = new AbortController()
    loadProfile(userId, email, signupName, controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) setResult({ userId, profile, error: null })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ userId, profile: null, error: '프로필을 불러오지 못했어요.' })
        }
      })
    return () => controller.abort()
  }, [userId, email, signupName, attempt])

  return {
    userId,
    email,
    profile: current?.profile ?? null,
    error: current?.error ?? null,
    retry: () => {
      setResult(null)
      setAttempt((value) => value + 1)
    },
  }
}
