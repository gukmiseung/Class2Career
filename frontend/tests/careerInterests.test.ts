import { deepEqual, equal, match, rejects } from 'node:assert/strict'
import { test } from 'node:test'
import { createClient } from '@supabase/supabase-js'
import { loadCareerInterests, removeCareerInterest, saveCareerInterest } from '../src/careerInterests.ts'

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

test('loads all interests and scopes every read to the current account', async () => {
  const { client, requests } = mockClient([Response.json([
    { career_slug: 'backend-developer', career_name: '백엔드 개발자' },
    { career_slug: 'data-analyst', career_name: '데이터 분석가' },
  ]), Response.json([])])
  deepEqual(await loadCareerInterests(client, 'user-a'), [
    { slug: 'backend-developer', name: '백엔드 개발자' },
    { slug: 'data-analyst', name: '데이터 분석가' },
  ])
  deepEqual(await loadCareerInterests(client, 'user-b'), [])
  deepEqual(requests.map((request) => new URL(request.url).searchParams.get('user_id')), ['eq.user-a', 'eq.user-b'])
})

test('adds independent career rows and ignores conflicts only on the same user and career', async () => {
  const responses = ['기존 직무', '기존 직무', '새 직무'].flatMap((title) => [
    Response.json([{ title }]), new Response(null, { status: 201 }),
  ])
  const { client, requests } = mockClient(responses)
  deepEqual(await saveCareerInterest(client, 'user-a', 'existing-career'), { slug: 'existing-career', name: '기존 직무' })
  await saveCareerInterest(client, 'user-a', 'existing-career')
  await saveCareerInterest(client, 'user-a', 'new-career')
  equal(new URL(requests[4].url).searchParams.get('slug'), 'eq.new-career')
  for (const request of [requests[1], requests[3], requests[5]]) {
    equal(request.method, 'POST')
    equal(new URL(request.url).searchParams.get('on_conflict'), 'user_id,career_slug')
    match(request.headers.get('prefer') ?? '', /resolution=ignore-duplicates/)
  }
  deepEqual(await requests[1].json(), await requests[3].json())
  deepEqual(await requests[5].json(), { user_id: 'user-a', career_slug: 'new-career', career_name: '새 직무' })
})

test('does not write for malformed or missing career IDs', async () => {
  const { client, requests } = mockClient([Response.json([])])
  await rejects(saveCareerInterest(client, 'user-a', 'invalid/id'), /직무 ID/)
  await rejects(saveCareerInterest(client, 'user-a', 'missing-career'), /찾을 수 없어요/)
  deepEqual(requests.map(({ method }) => method), ['GET'])
})

test('deletes only the intended account and career and treats an absent row as removed', async () => {
  const { client, requests } = mockClient([Response.json({ career_slug: 'old-career' }), Response.json(null), Response.json([])])
  await removeCareerInterest(client, 'user-a', 'old-career')
  await removeCareerInterest(client, 'user-b', 'old-career')
  deepEqual(requests.map((request) => {
    const filter = new URL(request.url).searchParams
    return [request.method, filter.get('user_id'), filter.get('career_slug')]
  }), [['DELETE', 'eq.user-a', 'eq.old-career'], ['DELETE', 'eq.user-b', 'eq.old-career'], ['GET', 'eq.user-b', 'eq.old-career']])
})

test('reports expired sessions and rejects deletion when the target remains', async () => {
  const { client } = mockClient([
    Response.json({ message: 'JWT expired' }, { status: 401 }),
    Response.json(null), Response.json([{ career_slug: 'existing-career' }]),
  ])
  await rejects(loadCareerInterests(client, 'user-a'), /세션이 만료/)
  await rejects(removeCareerInterest(client, 'user-a', 'existing-career'), /삭제하지 못했어요/)
})
