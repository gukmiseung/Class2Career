import { supabase } from './lib/supabase'

export const departments = ['컴퓨터학부'] as const
export const courseCategories = ['전공필수', '전공선택', '전공', '교양'] as const
export const courseYears = [1, 2, 3, 4] as const

export type Department = typeof departments[number]
export type CourseCategory = typeof courseCategories[number]
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
}

function normalizeCategory(value: string | null): CourseCategory {
  if (value === '전공필수' || value === '전공 선택' || value === '전공선택') return value === '전공 선택' ? '전공선택' : value
  if (value === '교양' || value === '기본소양' || value === '기본 소양') return '교양'
  return '전공'
}

export async function getCourses(department: Department): Promise<Course[]> {
  const { data, error } = await supabase
    .from('c2c_curriculum_courses')
    .select('recommended_year, requirement_label, course_category, c2c_courses!inner(id, slug, name, course_code, department, credits, description), c2c_curricula!inner(curriculum_year, c2c_majors(name))')
    .eq('c2c_courses.department', department)
    .eq('c2c_curricula.curriculum_year', 2026)

  if (error) throw error

  const coursesById = new Map<string, Course>()
  for (const row of (data ?? []) as unknown as CurriculumCourseRow[]) {
    const source = row.c2c_courses
    if (!source || coursesById.has(source.slug)) continue
    const category = normalizeCategory(row.requirement_label ?? row.course_category)
    const year = row.recommended_year
    if (year === null || year < 1 || year > 4) continue
    coursesById.set(source.slug, {
      id: source.slug,
      slug: source.slug,
      name: source.name,
      code: source.course_code,
      department: department,
      category,
      credits: source.credits,
      year: year as CourseYear,
      description: source.description ?? '',
    })
  }

  return Array.from(coursesById.values())
}
