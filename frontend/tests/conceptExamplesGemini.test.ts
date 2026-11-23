import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateExamples } from '../../supabase/functions/generate-concept-examples/gemini.ts'
const examples = Array.from({ length: 3 }, () => ({ title: '알림 대기열', description: '큐로 알림을 순서대로 처리합니다.', topic: '메시징' }))
test('sends the server key and selected DB concepts to Gemini with a strict schema', async () => {
  const concepts = [{ id: 1, name: '큐' }]
  const request: typeof fetch = async (url, options) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')
    assert.equal(new Headers(options?.headers).get('x-goog-api-key'), 'test-key')
    const body = JSON.parse(options?.body as string)
    assert.equal(body.contents[0].parts[0].text, JSON.stringify(concepts))
    assert.equal(body.generationConfig.responseMimeType, 'application/json')
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ examples }) }] } }] })
  }
  assert.deepEqual(await generateExamples(concepts, 'test-key', 'gemini-2.5-flash', request), { examples })
})

test('recovers from a missing model using an available text Flash model', async () => {
  const urls: string[] = []
  const request: typeof fetch = async url => {
    urls.push(String(url))
    if (urls.length === 1) return new Response(null, { status: 404 })
    if (urls.length === 2) return Response.json({ models: [
      { name: 'models/gemini-3-flash-image', supportedGenerationMethods: ['generateContent'] },
      { name: 'models/gemini-3-flash', supportedGenerationMethods: ['generateContent'] },
    ] })
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ examples }) }] } }] })
  }
  assert.deepEqual(await generateExamples([], 'test-key', 'models/gemini-old', request), { examples })
  assert.ok(urls[0].endsWith('/models/gemini-old:generateContent'))
  assert.ok(urls[1].includes('/models?pageSize='))
  assert.ok(urls[2].endsWith('/models/gemini-3-flash:generateContent'))
})

test('recovers from unsupported generation options using the same selected concept', async () => {
  let calls = 0
  const concepts = [{ name: '큐' }]
  const request: typeof fetch = async (_url, options) => {
    const body = JSON.parse(options?.body as string)
    assert.deepEqual(JSON.parse(body.contents[0].parts[0].text), concepts)
    if (++calls === 1) return Response.json({ error: { status: 'INVALID_ARGUMENT' } }, { status: 400 })
    assert.deepEqual(body.generationConfig, { responseMimeType: 'application/json' })
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ examples }) }] } }] })
  }
  assert.deepEqual(await generateExamples(concepts, 'test-key', 'gemini-3-flash', request), { examples })
  assert.equal(calls, 2)
})

test('falls back to a lighter model when the preferred model is rate limited', async () => {
  const urls: string[] = []
  const request: typeof fetch = async url => {
    urls.push(String(url))
    if (urls.length === 1) return Response.json({ error: { details: [{ retryDelay: '30s' }] } }, { status: 429 })
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ examples }) }] } }] })
  }
  assert.deepEqual(await generateExamples([], 'test-key', 'gemini-2.5-flash', request), { examples })
  assert.ok(urls[1].endsWith('/models/gemini-2.5-flash-lite:generateContent'))
})

test('reports a clear rate limit error when every model is limited', async () => {
  const request: typeof fetch = async () => new Response(null, { status: 429 })
  await assert.rejects(generateExamples([], 'test-key', 'gemini-2.5-flash', request), { code: 'GEMINI_RATE_LIMIT' })
})

test('recovers from a first 503 with a fresh timeout signal', async () => {
  const signals: AbortSignal[] = []
  const request: typeof fetch = async (_url, options) => {
    assert.ok(options?.signal)
    assert.equal(options.signal.aborted, false)
    signals.push(options.signal)
    if (signals.length === 1) return new Response(null, { status: 503 })
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ examples }) }] } }] })
  }
  assert.deepEqual(await generateExamples([], 'test-key', 'gemini-2.5-flash', request), { examples })
  assert.equal(signals.length, 2)
  assert.notEqual(signals[0], signals[1])
})

test('stops after two transient retries and reports the final provider status', async () => {
  const statuses = [500, 502, 504]
  let calls = 0
  const request: typeof fetch = async () => new Response(null, { status: statuses[calls++] })
  await assert.rejects(generateExamples([], 'test-key', 'gemini-2.5-flash', request), {
    code: 'GEMINI_HTTP_504',
    message: '실무 사례 생성 서비스가 일시적으로 지연되고 있어요. 잠시 후 다시 생성해 주세요.',
  })
  assert.equal(calls, 3)
})

test('honors a short 429 hint and retries transient failures on the fallback model', async () => {
  const urls: string[] = []
  const request: typeof fetch = async url => {
    urls.push(String(url))
    if (urls.length === 1) return Response.json({ error: { details: [{ retryDelay: '0.001s' }] } }, { status: 429 })
    if (urls.length === 2) return new Response(null, { status: 429 })
    if (urls.length === 3) return new Response(null, { status: 503 })
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ examples }) }] } }] })
  }
  assert.deepEqual(await generateExamples([], 'test-key', 'gemini-2.5-flash', request), { examples })
  assert.equal(urls.length, 4)
  assert.equal(urls[0], urls[1])
  assert.ok(urls[2].endsWith('/models/gemini-2.5-flash-lite:generateContent'))
  assert.equal(urls[2], urls[3])
})
