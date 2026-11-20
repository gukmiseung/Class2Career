export function createAuthenticator(
  configuration: () => { url: string; publishableKey: string },
  request: typeof fetch = fetch,
) {
  return async (token: string): Promise<{ userId: string } | null> => {
    const { url, publishableKey } = configuration()
    const response = await request(new URL('/auth/v1/user', url), {
      headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    })

    if (response.status === 401 || response.status === 403) return null
    if (!response.ok) throw new Error('Supabase Auth verification failed')

    const user = await response.json()
    if (typeof user?.id !== 'string' || !user.id || user.role !== 'authenticated') return null
    return { userId: user.id }
  }
}
