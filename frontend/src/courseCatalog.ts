import { useEffect, useState } from 'react'

const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, '')
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
const placements = 'c2c_curriculum_courses(recommended_year,semester,course_category,requirement_label,c2c_curricula(curriculum_year,c2c_majors(name)))'
const courseFields = 'slug,course_code,name,credits,description,category,recommended_year,department,is_sample'

export const hasCourseCatalog = Boolean(url || key)

type Placement = {
  recommended_year: number | null
  semester: number | null
  course_category: string | null
  requirement_label: string | null
  c2c_curricula: {
    curriculum_year: number
    c2c_majors: { name: string }
  }
}

export type CatalogCourse = {
  slug: string
  course_code: string | null
  name: string
  credits: number | null
  description: string | null
  category: string | null
  recommended_year: number | null
  department: string
  is_sample: boolean
  c2c_curriculum_courses: Placement[]
}

type CourseDetail = CatalogCourse & {
  c2c_course_concepts: { id: number; name: string; concept_group: string; description: string | null }[]
}

async function readCatalog<T>(path: string, params: Record<string, string>, signal: AbortSignal) {
  if (!url || !key) throw new Error('Supabase URL과 Publishable key를 모두 설정해 주세요.')

  const response = await fetch(`${url}/rest/v1/${path}?${new URLSearchParams(params)}`, {
    headers: { apikey: key },
    signal,
  })
  if (!response.ok) throw new Error('과목 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
  return response.json() as Promise<T>
}

async function searchCourses(query: string, signal: AbortSignal) {
  const courses: CatalogCourse[] = []
  const limit = 100
  for (let offset = 0; ; offset += limit) {
    const rows = await readCatalog<CatalogCourse[]>('rpc/c2c_search_knu_courses', {
      select: `${courseFields},${placements}`,
      p_query: query || '',
      p_limit: String(limit),
      p_offset: String(offset),
      order: 'name.asc,id.asc',
    }, signal)
    courses.push(...rows.filter((row) => !row.is_sample))
    if (rows.length < limit) return courses
  }
}

async function fetchCourse(slug: string, signal: AbortSignal) {
  const rows = await readCatalog<CourseDetail[]>('c2c_courses', {
    slug: `eq.${slug}`,
    university: 'eq.경북대학교',
    department: 'eq.컴퓨터학부',
    is_sample: 'eq.false',
    select: `${courseFields},${placements},c2c_course_concepts(id,name,concept_group,description)`,
    'c2c_course_concepts.order': 'sort_order.asc,id.asc',
  }, signal)
  return rows[0] ?? null
}

function useCatalogRequest<T>(load: (value: string, signal: AbortSignal) => Promise<T>, value: string, enabled: boolean) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ value: string; attempt: number; data?: T; error?: string }>()

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    load(value, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ value, attempt, data })
      },
      () => {
        if (!controller.signal.aborted) setResult({
          value,
          attempt,
          error: !url || !key ? 'Supabase URL과 Publishable key를 모두 설정해 주세요.' : '과목 정보를 불러오지 못했어요. 다시 시도해 주세요.',
        })
      },
    )
    return () => controller.abort()
  }, [load, value, attempt, enabled])

  const current = result?.value === value && result.attempt === attempt ? result : undefined
  return {
    data: current?.data,
    error: current?.error,
    loading: enabled && !current,
    retry: () => setAttempt((count) => count + 1),
  }
}

export function useCourseCatalog(query = '', enabled = hasCourseCatalog) {
  return useCatalogRequest(searchCourses, query, enabled)
}

export function useCourseDetail(slug: string) {
  return useCatalogRequest(fetchCourse, slug, hasCourseCatalog)
}
