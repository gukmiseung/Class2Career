import { hasCareerRoadmap, roadmaps, type RoadmapStep } from '../careerRoadmaps.ts'
import type { Course } from '../courses'
import type { useCareerCatalog } from '../useCareerCatalog'

type Career = ReturnType<typeof useCareerCatalog>['careers'][number]

export type GeneralRoadmap = {
  career: Pick<Career, 'slug' | 'title' | 'description'>
  skillKeywords: readonly string[]
  recommendedCourses: readonly {
    course: Course
    relatedConcepts: string | null
    reason: string | null
  }[]
  steps: readonly RoadmapStep[]
}

export function buildGeneralRoadmap(
  careerTitle: string,
  careers: readonly Career[],
  courses: readonly Course[],
): GeneralRoadmap | null {
  const career = careers.find(({ title }) => title === careerTitle)
  if (!career) return null

  const coursesById = new Map(courses.map((course) => [course.dbId, course]))
  const recommendedCourses = [...career.courses]
    .sort((left, right) => left.sort_order - right.sort_order || left.course_id - right.course_id)
    .flatMap(({ course_id, concepts }) => {
      const course = coursesById.get(course_id)
      if (!course) return []

      const relatedConcepts = concepts.trim() || null
      return [{
        course,
        relatedConcepts,
        reason: relatedConcepts ? `관련 학습 개념: ${relatedConcepts}` : null,
      }]
    })

  return {
    career: { slug: career.slug, title: career.title, description: career.description },
    skillKeywords: career.keywords,
    recommendedCourses,
    steps: hasCareerRoadmap(career.title) ? roadmaps[career.title] : [],
  }
}
