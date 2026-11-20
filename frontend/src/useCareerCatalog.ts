import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

type CareerRow = {
  slug: string
  title: string
  category: string
  description: string
  keywords: string[]
  c2c_career_courses: { course_id: number; concepts: string; sort_order: number }[]
}

async function getCareers() {
  const { data, error } = await supabase
    .from('c2c_careers')
    .select(`
      slug, title, category, description, keywords,
      c2c_career_courses(course_id, concepts, sort_order)
    `)
    .order('sort_order')
    .order('slug')
    .order('sort_order', { referencedTable: 'c2c_career_courses' })
    .overrideTypes<CareerRow[], { merge: false }>()

  if (error) throw error
  return data.map(({ c2c_career_courses, ...career }) => ({
    ...career,
    courses: c2c_career_courses,
  }))
}

type Career = Awaited<ReturnType<typeof getCareers>>[number]

let cachedCareers: Career[] | null = null
let pendingRequest: Promise<Career[]> | null = null

function loadCareers() {
  if (cachedCareers) return Promise.resolve(cachedCareers)
  pendingRequest ??= getCareers()
    .then((careers) => {
      cachedCareers = careers
      return careers
    })
    .finally(() => { pendingRequest = null })
  return pendingRequest
}

export function useCareerCatalog() {
  const [careers, setCareers] = useState(cachedCareers)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    loadCareers()
      .then((result) => {
        if (active) setCareers(result)
      })
      .catch(() => {
        if (active) setError('직무 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      })
    return () => { active = false }
  }, [attempt])

  return {
    careers: careers ?? [],
    loading: careers === null && error === null,
    error,
    retry: () => {
      setError(null)
      setAttempt((current) => current + 1)
    },
  }
}
