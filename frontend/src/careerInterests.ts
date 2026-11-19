export const careerInterestsKey = 'class2career.career-interests'

export function loadCareerInterests(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(careerInterestsKey) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function toggleCareerInterest(careerName: string) {
  const current = loadCareerInterests()
  const interested = current.includes(careerName)
  const next = interested ? current.filter((name) => name !== careerName) : [...current, careerName]

  try {
    window.localStorage.setItem(careerInterestsKey, JSON.stringify(next))
  } catch {
    return interested
  }

  return !interested
}
