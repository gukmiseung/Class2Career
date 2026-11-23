import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

type Example = { title: string; description: string; topic: string }
const requests = new Map<string, { expires: number; result: Promise<Example[]> }>()
async function loadExamples(key: string): Promise<Example[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('로그인 후 다시 시도해 주세요.')
  const cacheKey = `${session.user.id}:${key}`
  const cached = requests.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.result
  const result = (async () => {
    const { data, error } = await supabase.functions.invoke('generate-concept-examples', { body: { conceptIds: key.split(',') } })
    if (error) {
      const details = error.context instanceof Response ? await error.context.json().catch(() => null) : null
      throw new Error(typeof details?.message === 'string' ? details.message : '사례 생성 서버에 연결하지 못했습니다.')
    }
    if (!Array.isArray(data?.examples) || data.examples.length !== 3 || data.examples.some((item: Example) => !item || ['title', 'description', 'topic'].some(field => typeof item[field as keyof Example] !== 'string'))) throw new Error('생성된 사례의 형식을 확인하지 못했습니다.')
    return data.examples as Example[]
  })()
  const entry = { expires: Infinity, result }
  requests.set(cacheKey, entry)
  try {
    const examples = await result
    entry.expires = Date.now() + 300000
    if (requests.size > 50) {
      for (const [storedKey, stored] of requests) {
        if (stored.expires === Infinity) continue
        requests.delete(storedKey)
        if (requests.size <= 50) break
      }
    }
    return examples
  } catch (error) {
    requests.delete(cacheKey)
    throw error
  }
}
export function useConceptExamples(ids: readonly string[]) {
  const key = [...ids].sort().join(',')
  const [state, setState] = useState<{ key: string; examples?: Example[]; error?: string }>({ key: '' })
  const [attempt, setAttempt] = useState(0)
  if (state.key !== key) setState({ key })
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const examples = await loadExamples(key)
        if (active) setState({ key, examples })
      } catch (error) {
        if (active) setState({ key, error: error instanceof Error ? error.message : '실무 사례를 불러오지 못했습니다.' })
      }
    }
    const timer = key ? setTimeout(() => void load(), 250) : undefined
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [key, attempt])
  const retry = () => {
    setState({ key })
    setAttempt(value => value + 1)
  }
  return { ...(state.key === key ? state : { key }), retry }
}
