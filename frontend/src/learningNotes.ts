export const legacyLearningNotesKey = 'class2career.course-notes'

export function courseNotesStorageKey(userId: string) {
  return `${legacyLearningNotesKey}:${userId}`
}

export function loadLearningNotes(storageKey: string): Record<string, string> {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}

    return Object.fromEntries(
      Object.entries(stored).filter(([, value]) => typeof value === 'string'),
    )
  } catch {
    return {}
  }
}

export function storeLearningNote(storageKey: string, noteKey: string, note: string) {
  const notes = { ...loadLearningNotes(storageKey), [noteKey]: note }
  if (note === '') delete notes[noteKey]
  window.localStorage.setItem(storageKey, JSON.stringify(notes))
}
