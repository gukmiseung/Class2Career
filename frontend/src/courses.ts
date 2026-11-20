import { supabase } from './lib/supabase'

export const departments: string[] = []
export const courseCategories: string[] = []
export const courseYears = [1, 2, 3, 4] as const

export type Department = string
export type CourseCategory = string
export type CourseYear = typeof courseYears[number]

export type Course = {
  id: string
  slug: string
  name: string
  code: string
  department: Department
  category: CourseCategory
  credits: number
  year: CourseYear
  description: string
  major: string
}

export const courses: Course[] = []

type CurriculumCourseRow = {
  recommended_year: number | null
  requirement_label: string | null
  course_category: string | null
  c2c_courses: {
    id: number
    slug: string
    name: string
    course_code: string
    department: string
    credits: number
    description: string | null
  } | null
  c2c_curricula: { curriculum_year: number; c2c_majors: { name: string } | null } | null
}

export type CourseCatalog = { courses: Course[]; majors: string[]; categories: string[]; departments: string[] }

export async function getCourseCatalog(): Promise<CourseCatalog> {
  const rows: CurriculumCourseRow[] = []
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from('c2c_curriculum_courses')
      .select('recommended_year, requirement_label, course_category, c2c_courses!inner(id, slug, name, course_code, department, credits, description), c2c_curricula!inner(curriculum_year, c2c_majors(name))')
      .range(start, start + 999)
    if (error) throw error
    rows.push(...(data ?? [] as never) as unknown as CurriculumCourseRow[])
    if (!data || data.length < 1000) break
  }

  const majors = new Set<string>()
  const categories = new Set<string>()
  const departments = new Set<string>()
  const catalog: Course[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    const source = row.c2c_courses
    const major = row.c2c_curricula?.c2c_majors?.name
    if (!source || !major) continue
    majors.add(major)
    departments.add(source.department)
    const category = row.requirement_label ?? row.course_category
    if (category) categories.add(category)
    const key = `${source.slug}:${major}`
    if (seen.has(key)) continue
    seen.add(key)
    catalog.push({
      id: source.slug,
      slug: source.slug,
      name: source.name,
      code: source.course_code,
      department: source.department,
      category: category ?? '미분류',
      credits: source.credits,
      year: row.recommended_year && row.recommended_year >= 1 && row.recommended_year <= 4 ? row.recommended_year as CourseYear : 1,
      description: source.description ?? '',
      major,
    })
  }
  return { courses: catalog, majors: [...majors].sort(), categories: [...categories].sort(), departments: [...departments].sort() }
}
