import type { Course, CourseYear } from './courses'

export function filterCourses(
  courses: Course[],
  filters: { major: string; category: string; year: CourseYear | null },
  query: string,
): Course[] {
  const search = query.trim().toLocaleLowerCase()
  return courses.flatMap((course) => {
    const matches = course.curricula.filter((entry) =>
      (filters.major === '전체' || entry.major === filters.major) &&
      (filters.category === '전체' || entry.category === filters.category) &&
      (filters.year === null || entry.year === filters.year),
    )
    const matchesSearch = [course.name, course.code, course.description]
      .some((value) => value.toLocaleLowerCase().includes(search))
    if (matches.length === 0 || !matchesSearch) return []
    return [{
      ...course,
      categories: [...new Set(matches.map((entry) => entry.category))].sort(),
      years: [...new Set(matches.flatMap((entry) => entry.year === null ? [] : [entry.year]))].sort((a, b) => a - b),
    }]
  })
}
