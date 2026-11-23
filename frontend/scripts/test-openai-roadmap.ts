import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import {
  compareConceptCoverage,
  toRoadmapSkillGaps,
} from '../../supabase/functions/_shared/roadmap/compareConceptCoverage.ts'
import { generateMockRoadmap, loadMockRoadmap } from '../../supabase/functions/_shared/roadmap/mock.ts'
import {
  createOpenAiRoadmapGenerator,
  RoadmapProviderError,
} from '../../supabase/functions/_shared/roadmap/openai.ts'
import { validateGeneratedRoadmap } from '../../supabase/functions/_shared/roadmap/response.ts'

const envFile = new URL('../roadmap-openai.env.local', import.meta.url)
const responsesUrl = 'https://api.openai.com/v1/responses'
const settings: Record<string, string> = {
  ROADMAP_AI_MODEL: 'gpt-5.4-nano',
  ROADMAP_MAX_INPUT_TOKENS: '2048',
  ROADMAP_MAX_OUTPUT_TOKENS: '1200',
  ROADMAP_PROVIDER_TIMEOUT_MS: '20000',
}

async function run() {
  const [mode, ...extra] = process.argv.slice(2)
  if (extra.length || (mode !== '--live' && mode !== '--dry-run')) {
    console.error('Choose exactly one mode: --dry-run or --live.')
    process.exitCode = 2
    return
  }

  let apiKey: string | undefined
  if (mode === '--live') {
    try {
      apiKey = parseEnv(readFileSync(envFile, 'utf8')).OPENAI_API_KEY?.trim()
    } catch {
      console.error('Could not read frontend/roadmap-openai.env.local.')
      process.exitCode = 1
      return
    }
    if (!apiKey) {
      console.error('Set OPENAI_API_KEY in frontend/roadmap-openai.env.local.')
      process.exitCode = 1
      return
    }
  } else {
    apiKey = crypto.randomUUID()
  }

  const data = await loadMockRoadmap({
    careerId: 'backend-developer',
    userId: 'local-mock',
    accessToken: '',
  })
  if (!data) throw new Error('Mock roadmap is unavailable')
  const request = { ...data.request, skillGaps: toRoadmapSkillGaps(compareConceptCoverage(data.coverage)) }

  const allowedUrls = [`${responsesUrl}/input_tokens`, responsesUrl]
  let calls = 0
  const requestOnce: typeof fetch = async (url, options) => {
    if (String(url) !== allowedUrls[calls]) throw new Error('Unexpected or repeated provider request')
    calls++
    if (mode === '--live') return fetch(url, options)
    if (calls === 1) return Response.json({ input_tokens: 250 })
    const mock = await generateMockRoadmap(request, data.candidates)
    return Response.json({
      status: 'completed',
      output: [{
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: JSON.stringify(mock) }],
      }],
    })
  }

  const generate = createOpenAiRoadmapGenerator(
    (name) => name === 'OPENAI_API_KEY' ? apiKey : settings[name],
    requestOnce,
  )
  const generated = await generate(request, data.candidates)
  const roadmap = validateGeneratedRoadmap(generated, data.candidates)
  if (!roadmap) throw new RoadmapProviderError('INVALID_ROADMAP_RESPONSE')

  // Keep generated text and all provider request details out of the test logs.
  console.log(JSON.stringify({
    mode,
    model: settings.ROADMAP_AI_MODEL,
    steps: roadmap.steps.length,
    recommendedCourses: roadmap.steps.flatMap((step) => step.recommendedCourses.map(({ course }) => course.name)),
  }, null, 2))
}

try {
  await run()
} catch (error) {
  console.error(error instanceof RoadmapProviderError ? error.code : 'ROADMAP_SMOKE_TEST_FAILED')
  process.exitCode = 1
}
