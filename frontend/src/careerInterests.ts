import { useCallback, useSyncExternalStore } from 'react'

const interestsChangedEvent = 'class2career:career-interests-changed'

function careerInterestsStorageKey(userId: string) {
  return `class2career.career-interests:${userId}`
}

function parseCareerInterests(stored: string | null): string[] {
  try {
    const value: unknown = JSON.parse(stored ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function setCareerInterest(userId: string, careerName: string, interested: boolean) {
  const key = careerInterestsStorageKey(userId)
  const interests = new Set(parseCareerInterests(window.localStorage.getItem(key)))
  if (interested) interests.add(careerName)
  else interests.delete(careerName)
  window.localStorage.setItem(key, JSON.stringify([...interests]))
  window.dispatchEvent(new Event(interestsChangedEvent))
}

export function useCareerInterests(userId: string | null) {
  const key = userId ? careerInterestsStorageKey(userId) : null
  const subscribe = useCallback((onChange: () => void) => {
    if (!key) return () => {}

    function syncFromOtherTab(event: StorageEvent) {
      if (event.key === key || event.key === null) onChange()
    }

    window.addEventListener('storage', syncFromOtherTab)
    window.addEventListener(interestsChangedEvent, onChange)
    return () => {
      window.removeEventListener('storage', syncFromOtherTab)
      window.removeEventListener(interestsChangedEvent, onChange)
    }
  }, [key])

  const getSnapshot = useCallback(() => {
    try {
      return key ? window.localStorage.getItem(key) : null
    } catch {
      return null
    }
  }, [key])

  return parseCareerInterests(useSyncExternalStore(subscribe, getSnapshot))
}
