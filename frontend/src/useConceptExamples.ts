import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

type Example = { title: string; description: string; topic: string }
const requests = new Map<string, { expires: number; result: Promise<Example[]> }>()
async function loadExamples(key: string): Promise<Example[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Login required')
  const cacheKey = `${session.user.id}:${key}`
  const cached = requests.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.result
  const result = (async () => {
    const { data, error } = await supabase.functions.invoke('generate-concept-examples', { body: { conceptIds: key.split(',') } })
    if (error || !Array.isArray(data?.examples) || data.examples.length !== 3 || data.examples.some((item: Example) => !item || ['title', 'description', 'topic'].some(field => typeof item[field as keyof Example] !== 'string'))) throw new Error('Invalid response')
    return data.examples as Example[]
  })()
  if (requests.size >= 50) requests.delete(requests.keys().next().value!)
  requests.set(cacheKey, { expires: Date.now() + 300000, result })
  try { return await result } catch (error) { requests.delete(cacheKey); throw error }
}
export function useConceptExamples(ids: readonly string[]) {
  const key = [...ids].sort().join(',')
  const [state, setState] = useState<{ key: string; examples?: Example[]; error?: string }>({ key: '' })
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const examples = await loadExamples(key)
        if (active) setState({ key, examples })
      } catch {
        if (active) setState({ key, error: '실무 사례를 불러오지 못했습니다. 잠시 후 페이지에 다시 접속해 주세요.' })
      }
    }
    if (key) void load()
    return () => { active = false }
  }, [key])
  return state.key === key ? state : { key }
}
