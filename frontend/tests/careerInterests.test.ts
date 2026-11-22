import { deepEqual, equal, match, rejects } from 'node:assert/strict'
import { test } from 'node:test'
import { createClient } from '@supabase/supabase-js'
import { loadCareerInterest, removeCareerInterest, saveCareerInterest } from '../src/careerInterests.ts'

function mockClient(responses: Response[]) {
  const requests: Request[] = []
  const client = createClient('https://project.example', 'test-publishable-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      requests.push(new Request(input, init))
      const response = responses.shift()
      if (!response) throw new Error('Unexpected request')
      return response
    } },
  })
  return { client, requests }
}

test('loads the current account’s optional interest without reading another account', async () => {
  const { client, requests } = mockClient([Response.json([{ career_name: '백엔드 개발자' }]), Response.json([])])
  equal(await loadCareerInterest(client, 'user-a'), '백엔드 개발자')
  equal(await loadCareerInterest(client, 'user-b'), null)
  deepEqual(requests.map((request) => new URL(request.url).searchParams.get('user_id')), ['eq.user-a', 'eq.user-b'])
})

test('validates the catalog slug and upserts by user for duplicate saves and replacements', async () => {
  const responses = ['기존 직무', '기존 직무', '새 직무'].flatMap((title) => [
    Response.json([{ title }]), Response.json({ career_name: title }),
  ])
  const { client, requests } = mockClient(responses)
  equal(await saveCareerInterest(client, 'user-a', 'existing-career'), '기존 직무')
  equal(await saveCareerInterest(client, 'user-a', 'existing-career'), '기존 직무')
  equal(await saveCareerInterest(client, 'user-a', 'new-career'), '새 직무')
  equal(new URL(requests[4].url).searchParams.get('slug'), 'eq.new-career')
  for (const request of [requests[1], requests[3], requests[5]]) {
    equal(request.method, 'POST')
    equal(new URL(request.url).searchParams.get('on_conflict'), 'user_id')
    match(request.headers.get('prefer') ?? '', /resolution=merge-duplicates/)
  }
  deepEqual(await requests[5].json(), { user_id: 'user-a', career_name: '새 직무' })
})

test('does not write for malformed or missing career IDs', async () => {
  const { client, requests } = mockClient([Response.json([])])
  await rejects(saveCareerInterest(client, 'user-a', 'invalid/id'), /직무 ID/)
  await rejects(saveCareerInterest(client, 'user-a', 'missing-career'), /찾을 수 없어요/)
  deepEqual(requests.map(({ method }) => method), ['GET'])
})

test('deletes only the intended account and career and preserves a newer replacement', async () => {
  const { client, requests } = mockClient([Response.json({ career_name: '이전 직무' }), Response.json(null), Response.json([{ career_name: '새 직무' }])])
  equal(await removeCareerInterest(client, 'user-a', '이전 직무'), null)
  equal(await removeCareerInterest(client, 'user-b', '이전 직무'), '새 직무')
  const filter = new URL(requests[1].url).searchParams
  equal(filter.get('user_id'), 'eq.user-b')
  equal(filter.get('career_name'), 'eq.이전 직무')
})

test('reports expired sessions and rejects deletion when the target remains', async () => {
  const { client } = mockClient([
    Response.json({ message: 'JWT expired' }, { status: 401 }),
    Response.json(null), Response.json([{ career_name: '기존 직무' }]),
  ])
  await rejects(loadCareerInterest(client, 'user-a'), /세션이 만료/)
  await rejects(removeCareerInterest(client, 'user-a', '기존 직무'), /삭제하지 못했어요/)
})
