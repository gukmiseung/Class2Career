import { validateExamples, type Example } from './handler.ts'

type Concept = { id: number | string; name?: string; description?: string; concept_group?: string }

// The key changes whenever a selected concept's text changes, so edited concepts regenerate automatically.
export async function cacheKey(concepts: Concept[]): Promise<string> {
  const normalized = concepts
    .map(c => [String(c.id), c.name ?? '', c.description ?? '', c.concept_group ?? ''])
    .sort((a, b) => Number(a[0]) - Number(b[0]))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(normalized)))
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export function createExampleCache(url: string, serviceKey: string, request: typeof fetch = fetch) {
  const endpoint = new URL('/rest/v1/c2c_concept_examples', url)
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
  return {
    async read(key: string): Promise<Example[] | null> {
      const query = new URL(endpoint)
      query.searchParams.set('select', 'examples')
      query.searchParams.set('cache_key', `eq.${key}`)
      query.searchParams.set('limit', '1')
      const response = await request(query, { headers, signal: AbortSignal.timeout(5000) })
      if (!response.ok) return null
      const rows = await response.json().catch(() => null)
      try { return validateExamples({ examples: rows?.[0]?.examples }) } catch { return null }
    },
    async write(key: string, conceptIds: string[], examples: Example[], model: string): Promise<void> {
      await request(endpoint, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ cache_key: key, concept_ids: conceptIds.map(Number), examples, model }),
        signal: AbortSignal.timeout(5000),
      })
    },
  }
}
