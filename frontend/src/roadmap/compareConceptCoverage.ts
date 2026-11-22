// Generated from the Supabase roadmap modules. Run node frontend/scripts/sync-roadmap-shared.mjs to update.
import type { RoadmapRequest } from './contracts.ts'

export type RequiredConcept = {
  id: string
  name: string
  priority?: number
}

export type CareerConceptRequirements =
  | { status: 'ready'; concepts: readonly RequiredConcept[] }
  | { status: 'pending' }

export type CompletedCourseConcepts = {
  courseId: string
  status: 'ready' | 'pending'
  /** Confirmed mappings only. A pending course can have partial coverage. */
  conceptIds: readonly string[]
}

export type ConceptCoverageInput = {
  requirements: CareerConceptRequirements
  completedCourses: readonly CompletedCourseConcepts[]
}

export type ConceptCoverageResult = {
  requirementsStatus: CareerConceptRequirements['status']
  covered: (RequiredConcept & { courseIds: string[] })[]
  uncovered: RequiredConcept[]
  unknown: (RequiredConcept & { pendingCourseIds: readonly string[] })[]
}

export function compareConceptCoverage({
  requirements,
  completedCourses,
}: ConceptCoverageInput): ConceptCoverageResult {
  const result: ConceptCoverageResult = {
    requirementsStatus: requirements.status,
    covered: [],
    uncovered: [],
    unknown: [],
  }
  if (requirements.status === 'pending') return result

  const coursesByConcept = new Map<string, Set<string>>()
  const pendingCourses = new Set<string>()

  for (const course of completedCourses) {
    if (course.status === 'pending') pendingCourses.add(course.courseId)

    for (const conceptId of course.conceptIds) {
      let courseIds = coursesByConcept.get(conceptId)
      if (!courseIds) {
        courseIds = new Set()
        coursesByConcept.set(conceptId, courseIds)
      }
      courseIds.add(course.courseId)
    }
  }

  const pendingCourseIds = [...pendingCourses]
  const seenConcepts = new Set<string>()

  for (const concept of requirements.concepts) {
    if (seenConcepts.has(concept.id)) continue
    seenConcepts.add(concept.id)

    const courseIds = coursesByConcept.get(concept.id)
    if (courseIds) {
      result.covered.push({ ...concept, courseIds: [...courseIds] })
    } else if (pendingCourseIds.length) {
      result.unknown.push({ ...concept, pendingCourseIds })
    } else {
      result.uncovered.push({ ...concept })
    }
  }

  return result
}

export function toRoadmapSkillGaps(result: ConceptCoverageResult): RoadmapRequest['skillGaps'] {
  return result.uncovered.map(({ name }) => ({
    name,
    context: '수강 완료 과목의 개념 목록에서 이 개념을 확인하지 못했습니다.',
  }))
}
