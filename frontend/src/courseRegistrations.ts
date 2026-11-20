export const registrationKey = 'class2career.course-registrations'
export const statusLabels = { completed: '수강 완료', planned: '수강 예정' } as const

export type CourseStatus = keyof typeof statusLabels
export type Registrations = Partial<Record<string, CourseStatus>>

export function parseRegistrations(value: string | null): Registrations {
  if (value === null) return {}

  try {
    const stored: unknown = JSON.parse(value)
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}

    const entries = stored as Record<string, unknown>
    const registrations: Registrations = {}

    for (const [id, status] of Object.entries(entries)) {
      if (status === 'completed' || status === 'planned') registrations[id] = status
    }

    return registrations
  } catch {
    return {}
  }
}

export function loadRegistrations(): Registrations {
  try {
    return parseRegistrations(window.localStorage.getItem(registrationKey))
  } catch {
    return {}
  }
}
