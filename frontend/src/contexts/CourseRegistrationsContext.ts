import { createContext, useContext } from 'react'
import type { CourseStatus, Registrations } from '../courseRegistrations'
import type { CareerInterest } from '../careerInterests'

type CourseRegistrationsContextValue = {
  registrations: Registrations
  loading: boolean
  ready: boolean
  error: string | null
  savingCourseIds: ReadonlySet<number>
  retryLoad: () => void
  saveCourseStatus: (courseId: number, status: CourseStatus | null) => Promise<boolean>
  careerInterest: {
    items: readonly CareerInterest[]
    loading: boolean
    error: string | null
    saving: boolean
    retry: () => void
    save: (careerSlug: string) => Promise<boolean>
    remove: (careerSlug: string) => Promise<boolean>
  }
}

export const CourseRegistrationsContext = createContext<CourseRegistrationsContextValue | null>(null)

export function useCourseRegistrations() {
  const context = useContext(CourseRegistrationsContext)
  if (!context) throw new Error('CourseRegistrationsProvider가 필요해요.')
  return context
}
