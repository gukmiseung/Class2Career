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
