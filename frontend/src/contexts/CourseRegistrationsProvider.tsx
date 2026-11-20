import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadRegistrations, saveRegistration, type CourseStatus, type Registrations } from '../courseRegistrations'
import { useAuth } from './AuthContext'
import { CourseRegistrationsContext } from './CourseRegistrationsContext'

type Session = {
  userId: string
  writesInProgress: Set<number>
}

type RegistrationsState = {
  session: Session
  registrations: Registrations | null
  error: string | null
  savingCourseIds: ReadonlySet<number>
}

const emptyRegistrations: Registrations = {}
const emptySavingCourseIds: ReadonlySet<number> = new Set()

export function CourseRegistrationsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, recoveringPassword } = useAuth()
  const userId = recoveringPassword ? null : user?.id ?? null
  const session = useMemo<Session | null>(
    () => userId ? { userId, writesInProgress: new Set() } : null,
    [userId],
  )
  const [state, setState] = useState<RegistrationsState | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const current = state?.session === session ? state : null

  useEffect(() => {
    if (!session) return

    const controller = new AbortController()
    loadRegistrations(session.userId, controller.signal)
      .then((registrations) => {
        if (!controller.signal.aborted) {
          setState({ session, registrations, error: null, savingCourseIds: emptySavingCourseIds })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({
            session,
            registrations: null,
            error: '수강 상태를 불러오지 못했어요.',
            savingCourseIds: emptySavingCourseIds,
          })
        }
      })
    return () => controller.abort()
  }, [session, loadAttempt])

  function retryLoad() {
    if (!current?.error) return
    setState(null)
    setLoadAttempt((attempt) => attempt + 1)
  }

  async function saveCourseStatus(courseId: number, status: CourseStatus | null) {
    if (!session || !current?.registrations || session.writesInProgress.has(courseId)) return false

    session.writesInProgress.add(courseId)
    setState((previous) => previous?.session === session
      ? { ...previous, savingCourseIds: new Set(previous.savingCourseIds).add(courseId) }
      : previous)

    try {
      await saveRegistration(session.userId, courseId, status)
      setState((previous) => {
        if (previous?.session !== session || !previous.registrations) return previous

        const registrations = { ...previous.registrations }
        if (status === null) delete registrations[courseId]
        else registrations[courseId] = status
        return { ...previous, registrations }
      })
      return true
    } finally {
      session.writesInProgress.delete(courseId)
      setState((previous) => {
        if (previous?.session !== session) return previous
        const savingCourseIds = new Set(previous.savingCourseIds)
        savingCourseIds.delete(courseId)
        return { ...previous, savingCourseIds }
      })
    }
  }

  return (
    <CourseRegistrationsContext.Provider value={{
      registrations: current?.registrations ?? emptyRegistrations,
      loading: authLoading || Boolean(session && !current),
      ready: Boolean(current?.registrations),
      error: current?.error ?? null,
      savingCourseIds: current?.savingCourseIds ?? emptySavingCourseIds,
      retryLoad,
      saveCourseStatus,
    }}>
      {children}
    </CourseRegistrationsContext.Provider>
  )
}
