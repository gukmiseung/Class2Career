import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateExamples } from '../../supabase/functions/generate-concept-examples/openai.ts'
const examples = Array.from({ length: 3 }, () => ({ title: '알림 대기열', description: '큐로 알림을 순서대로 처리합니다.', topic: '메시징' }))
test('sends the server key and selected DB concepts to OpenAI with a strict schema', async () => {
  const concepts = [{ id: 1, name: '큐' }]
  const request: typeof fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/chat/completions')
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer test-key')
    const body = JSON.parse(options?.body as string)
    assert.equal(body.model, 'gpt-4.1-mini')
    assert.equal(body.messages[1].content, JSON.stringify(concepts))
    assert.equal(body.response_format.json_schema.strict, true)
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ examples }) } }] })
  }
  assert.deepEqual(await generateExamples(concepts, 'test-key', 'gpt-4.1-mini', request), { examples })
})
test('rejects provider errors, refusals, truncation and invalid generated cards', async () => {
  const responses = [
    new Response(null, { status: 429 }),
    Response.json({ choices: [{ finish_reason: 'stop', message: { refusal: 'Refused', content: '{}' } }] }),
    Response.json({ choices: [{ finish_reason: 'length', message: { content: '{}' } }] }),
    Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{invalid' } }] }),
    Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"examples":[]}' } }] }),
  ]
  for (const response of responses) await assert.rejects(generateExamples([], 'test-key', 'gpt-4.1-mini', async () => response))
})
test('distinguishes quota, authentication and model errors without leaking provider messages', async () => {
  for (const [status, providerCode, expected] of [[401, 'invalid_api_key', 'OPENAI_INVALID_KEY'], [401, null, 'OPENAI_AUTH'], [429, 'insufficient_quota', 'OPENAI_QUOTA'], [404, 'model_not_found', 'OPENAI_MODEL']] as const) {
    await assert.rejects(generateExamples([], 'secret-key', 'gpt-4.1-mini', async () => Response.json({ error: { code: providerCode, message: 'secret-key' } }, { status })), (error: Error & { code?: string }) => error.code === expected && !error.message.includes('secret-key'))
  }
})

test('trims surrounding secret whitespace and rejects malformed keys before making a request', async () => {
  const request: typeof fetch = async (_url, options) => {
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer test-key')
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ examples }) } }] })
  }
  await generateExamples([], '  test-key\n', 'gpt-4.1-mini', request)
  for (const key of [' ', 'test key', '"test-key"']) {
    await assert.rejects(generateExamples([], key, 'gpt-4.1-mini', async () => { assert.fail('must not send malformed secrets') }), (error: Error & { code?: string }) => ['OPENAI_KEY_MISSING', 'OPENAI_KEY_FORMAT'].includes(error.code ?? ''))
  }
})
