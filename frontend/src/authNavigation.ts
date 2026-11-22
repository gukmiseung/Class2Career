export function isLearningRoute(hash: string) {
  return hash === '#explore' ||
    hash === '#explore/learning' ||
    hash.startsWith('#explore/concepts/')
}

export function authHref(route: '#login' | '#signup', returnTo: string) {
  return `${route}?${new URLSearchParams({ next: returnTo })}`
}

function isRoadmapRoute(hash: string) {
  const prefix = '#roadmap-'
  if (!hash.startsWith(prefix)) return false

  try {
    const encodedTitle = hash.slice(prefix.length)
    const title = decodeURIComponent(encodedTitle)
    return title.trim().length > 0 && !encodedTitle.includes('/') &&
      !title.startsWith('/') && !title.includes('//') && !/[\p{Cc}\p{Cf}\\?#%:]/u.test(title)
  } catch {
    return false
  }
}

export function getAuthReturnTo(hash: string) {
  const queryStart = hash.indexOf('?')
  if (queryStart === -1) return '#dashboard'
  const destinations = new URLSearchParams(hash.slice(queryStart + 1)).getAll('next')
  const [destination] = destinations
  return destinations.length === 1 && destination &&
    (destination === '#profile' || isLearningRoute(destination) || isRoadmapRoute(destination))
    ? destination
    : '#dashboard'
}

export function getPersonalizedRoadmapAccess({ loading, user, recoveringPassword }: {
  loading: boolean
  user: { id: string } | null
  recoveringPassword: boolean
}) {
  if (loading) return { status: 'checking' } as const
  if (!user || recoveringPassword) return { status: 'login-required' } as const
  return { status: 'ready', userId: user.id } as const
}
