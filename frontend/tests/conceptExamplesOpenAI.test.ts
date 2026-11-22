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
