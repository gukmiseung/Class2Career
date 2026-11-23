import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cacheKey, createExampleCache } from '../../supabase/functions/generate-concept-examples/cache.ts'
const examples = Array.from({ length: 3 }, () => ({ title: '작업 큐', description: '우선순위 큐로 작업을 처리합니다.', topic: '스케줄링' }))
test('cache key ignores selection order and changes when concept text changes', async () => {
  const a = { id: 1, name: '큐', description: 'a', concept_group: 'g' }
  const b = { id: 2, name: '스택', description: 'b', concept_group: 'g' }
  assert.equal(await cacheKey([a, b]), await cacheKey([b, a]))
  assert.notEqual(await cacheKey([a, b]), await cacheKey([{ ...a, description: 'changed' }, b]))
  assert.match(await cacheKey([a]), /^[0-9a-f]{64}$/)
})
test('reads valid cached examples and treats misses or malformed rows as a miss', async () => {
  const hit = createExampleCache('https://x.supabase.co', 'svc', async () => Response.json([{ examples }]))
  assert.deepEqual(await hit.read('k'), examples)
  const empty = createExampleCache('https://x.supabase.co', 'svc', async () => Response.json([]))
  assert.equal(await empty.read('k'), null)
  const bad = createExampleCache('https://x.supabase.co', 'svc', async () => Response.json([{ examples: [1] }]))
  assert.equal(await bad.read('k'), null)
  const down = createExampleCache('https://x.supabase.co', 'svc', async () => new Response(null, { status: 500 }))
  assert.equal(await down.read('k'), null)
})
test('writes with the service key and upsert preference', async () => {
  let seen: { url: string; init?: RequestInit } | undefined
  const cache = createExampleCache('https://x.supabase.co', 'svc', async (url, init) => { seen = { url: String(url), init }; return new Response(null, { status: 201 }) })
  await cache.write('k', ['1', '2'], examples, 'm')
  const headers = new Headers(seen?.init?.headers)
  assert.equal(headers.get('apikey'), 'svc')
  assert.match(headers.get('prefer') ?? '', /merge-duplicates/)
  assert.deepEqual(JSON.parse(seen?.init?.body as string).concept_ids, [1, 2])
})
