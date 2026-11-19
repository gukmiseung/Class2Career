export function isLearningRoute(hash: string) {
  return hash === '#explore' ||
    hash === '#explore/learning' ||
    hash.startsWith('#explore/concepts/')
}

export function authHref(route: '#login' | '#signup', returnTo: string) {
  return `${route}?${new URLSearchParams({ next: returnTo })}`
}

export function getAuthReturnTo(hash: string) {
  const queryStart = hash.indexOf('?')
  if (queryStart === -1) return '#dashboard'
  const destination = new URLSearchParams(hash.slice(queryStart + 1)).get('next')
  return destination && (destination === '#profile' || isLearningRoute(destination))
    ? destination
    : '#dashboard'
}
