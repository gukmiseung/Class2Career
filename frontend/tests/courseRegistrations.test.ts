import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createClient } from '@supabase/supabase-js'
import { loadRegistrations, saveRegistration } from '../src/courseRegistrations.ts'

const viewer = 'development-test-user'

function clientFor(respond: (request: Request) => Response | Promise<Response>) {
  return createClient('https://course-test.invalid', 'offline-publishable-fixture', {
    accessToken: async () => 'offline-session-fixture',
    global: {
      fetch: async (input, init) => {
        const request = new Request(input, init)
        assert.equal(new URL(request.url).pathname, '/rest/v1/c2c_user_courses')
        assert.equal(request.headers.get('Authorization'), 'Bearer offline-session-fixture')
        return respond(request)
      },
    },
  })
}

test('loads only the user-scoped registrations and recognizes all three statuses', async () => {
  const client = clientFor((request) => {
    assert.equal(request.method, 'GET')
    assert.equal(new URL(request.url).searchParams.get('user_id'), `eq.${viewer}`)
    return Response.json([
      { course_id: 1, status: 'completed' },
      { course_id: 2, status: 'in_progress' },
      { course_id: 3, status: 'planned' },
      { course_id: 4, status: 'unsupported' },
    ])
  })
  assert.deepEqual(await loadRegistrations(client, viewer, new AbortController().signal), {
    1: 'completed', 2: 'in_progress', 3: 'planned',
  })
})

test('uses the existing composite upsert key for repeated registration and status changes', async () => {
  const writes: unknown[] = []
  const client = clientFor(async (request) => {
    assert.equal(request.method, 'POST')
    assert.equal(new URL(request.url).searchParams.get('on_conflict'), 'user_id,course_id')
    assert.match(request.headers.get('Prefer') ?? '', /resolution=merge-duplicates/)
    writes.push(await request.json())
    return new Response(null, { status: 204 })
  })
  await saveRegistration(client, viewer, 42, 'in_progress')
  await saveRegistration(client, viewer, 42, 'in_progress')
  await saveRegistration(client, viewer, 42, 'completed')
  assert.deepEqual(writes, ['in_progress', 'in_progress', 'completed'].map((status) => ({
    user_id: viewer, course_id: 42, status,
  })))
})

test('rejects malformed IDs before sending a request and propagates the FK error for unknown IDs', async () => {
  let requests = 0
  const client = clientFor(() => {
    requests++
    return Response.json({ code: '23503', message: 'foreign key violation' }, { status: 409 })
  })
  for (const courseId of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(saveRegistration(client, viewer, courseId, 'planned'), /과목 ID/)
  }
  assert.equal(requests, 0)
  await assert.rejects(saveRegistration(client, viewer, 999999, 'planned'), { code: '23503' })
  assert.equal(requests, 1)
})

test('deletes using both keys and rejects a row that remains visible after deletion', async () => {
  for (const blocked of [false, true]) {
    const methods: string[] = []
    const client = clientFor((request) => {
      methods.push(request.method)
      const params = new URL(request.url).searchParams
      assert.equal(params.get('user_id'), `eq.${viewer}`)
      assert.equal(params.get('course_id'), 'eq.42')
      if (request.method === 'DELETE') return Response.json(blocked ? [] : [{ course_id: 42 }])
      return Response.json([{ course_id: 42 }])
    })
    const deletion = saveRegistration(client, viewer, 42, null)
    if (blocked) await assert.rejects(deletion, /삭제하지 못했어요/)
    else await deletion
    assert.deepEqual(methods, blocked ? ['DELETE', 'GET'] : ['DELETE'])
  }
})
