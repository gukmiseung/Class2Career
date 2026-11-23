// Pre-generates and caches practice examples (one concept at a time) by calling the deployed
// generate-concept-examples function as a logged-in user. Safe to re-run: cached concepts return instantly.
//
// PowerShell:
//   $env:C2C_EMAIL="you@example.com"; $env:C2C_PASSWORD="your-password"
//   node scripts/prefill-concept-examples.mjs            # default courses: 1,2,5
//   node scripts/prefill-concept-examples.mjs 1 40 62    # or choose course ids
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* file is optional */ }
}
const { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key, C2C_EMAIL: email, C2C_PASSWORD: password } = process.env
if (!url || !key || !email || !password) {
  console.error('VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, C2C_EMAIL, C2C_PASSWORD 환경변수가 필요합니다.')
  process.exit(1)
}
const courseIds = (process.argv.slice(2).length ? process.argv.slice(2) : ['1', '2', '5']).map(Number)
const supabase = createClient(url, key)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const login = await supabase.auth.signInWithPassword({ email, password })
if (login.error) { console.error('로그인 실패:', login.error.message); process.exit(1) }

const { data: concepts, error } = await supabase.from('c2c_course_concepts')
  .select('id,name,course_id').in('course_id', courseIds).order('course_id').order('sort_order')
if (error || !concepts?.length) { console.error('개념을 불러오지 못했습니다.', error?.message ?? ''); process.exit(1) }
console.log(`${concepts.length}개 개념을 채웁니다 (과목 ${courseIds.join(', ')})`)

async function generate(concept) {
  const { data, error } = await supabase.functions.invoke('generate-concept-examples', { body: { conceptIds: [String(concept.id)] } })
  if (!error) return { ok: Array.isArray(data?.examples) && data.examples.length === 3 }
  const details = error.context instanceof Response ? await error.context.json().catch(() => null) : null
  return { ok: false, code: details?.code, message: details?.message ?? error.message }
}

let done = 0, generated = 0
for (const [index, concept] of concepts.entries()) {
  const started = Date.now()
  let result = await generate(concept)
  if (!result.ok && result.code !== 'GEMINI_RATE_LIMIT') { await sleep(15000); result = await generate(concept) }
  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  if (result.ok) {
    done++
    const fresh = Date.now() - started > 2500
    if (fresh) generated++
    console.log(`✓ [${index + 1}/${concepts.length}] ${concept.name} (${seconds}s${fresh ? ', 새로 생성' : ', 이미 저장됨'})`)
    if (fresh) await sleep(13000) // stay under 5 requests per minute on free tier
  } else {
    console.error(`✗ [${index + 1}/${concepts.length}] ${concept.name}: ${result.message}`)
    if (result.code === 'GEMINI_RATE_LIMIT') {
      console.error(`\nGemini 한도에 도달해 중단합니다. 한도가 풀린 뒤 같은 명령을 다시 실행하면 남은 개념부터 이어서 채웁니다. (완료 ${done}/${concepts.length})`)
      process.exit(2)
    }
  }
}
console.log(`\n완료: ${done}/${concepts.length}개 저장됨 (이번에 새로 생성 ${generated}개)`)
