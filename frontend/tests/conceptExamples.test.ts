import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHandler, validateExamples } from '../../supabase/functions/generate-concept-examples/handler.ts'
const examples = Array.from({ length: 3 }, () => ({ title: '알림 대기열', description: '큐로 알림을 순서대로 처리합니다.', topic: '메시징' }))
const request = (body: unknown, authenticated = true) => new Request('https://example.test', { method: 'POST', headers: authenticated ? { Authorization: 'Bearer token' } : {}, body: JSON.stringify(body) })
test('requires verified authentication before generation', async () => {
  let called = false
  const handler = createHandler({ authenticate: async () => null, generate: async () => { called = true } })
  assert.equal((await handler(request({ conceptIds: ['1'] }))).status, 401)
  assert.equal(called, false)
})
test('rejects invalid and duplicate concept IDs', async () => {
  const handler = createHandler({ authenticate: async () => true, generate: async () => { throw Error('should not run') } })
  for (const conceptIds of [[], ['stack'], ['1', '1'], ['1)'], Array.from({length:21}, (_, i) => String(i+1))]) {
    assert.equal((await handler(request({ conceptIds }))).status, 400)
  }
})
test('returns exactly three validated cards and handles provider failures', async () => {
  const handler = createHandler({ authenticate: async () => true, generate: async () => ({ examples }) })
  assert.deepEqual(await (await handler(request({ conceptIds: ['1'] }))).json(), { examples })
  const broken = createHandler({ authenticate: async () => true, generate: async () => ({ examples: [] }) })
  assert.equal((await broken(request({ conceptIds: ['1'] }))).status, 502)
  assert.throws(() => validateExamples({ examples: [null, null, null] }))
})
