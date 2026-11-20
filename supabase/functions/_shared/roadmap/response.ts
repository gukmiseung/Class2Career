import type { RoadmapCourse, RoadmapResponse } from './contracts.ts'

export type CandidateCourse = Readonly<RoadmapCourse & { candidateRef: string }>

export type GeneratedRoadmap = {
  steps: {
    title: string
    learningGoals: string[]
    recommendedCourses: { candidateRef: string; reason: string }[]
    practiceProjects: { title: string; description: string }[]
  }[]
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max && value.trim().length > 0
}

function isArrayInRange(value: unknown, min: number, max: number): value is unknown[] {
  return Array.isArray(value) && value.length >= min && value.length <= max
}

export function validateGeneratedRoadmap(
  value: unknown,
  candidates: readonly CandidateCourse[],
): RoadmapResponse | null {
  if (!isRecord(value) || !isArrayInRange(value.steps, 1, 6)) return null
  const coursesByRef = new Map(candidates.map(({ candidateRef, name, department }) => [
    candidateRef,
    { name, department },
  ]))
  const steps: RoadmapResponse['steps'] = []

  for (const step of value.steps) {
    if (!isRecord(step) ||
      !isText(step.title, 120) ||
      !isArrayInRange(step.learningGoals, 1, 5) ||
      !isArrayInRange(step.recommendedCourses, 0, 4) ||
      !isArrayInRange(step.practiceProjects, 0, 3)) return null

    const learningGoals = step.learningGoals.filter((goal): goal is string => isText(goal, 300))
    if (learningGoals.length !== step.learningGoals.length) return null

    const recommendedCourses: RoadmapResponse['steps'][number]['recommendedCourses'] = []
    const usedRefs = new Set<string>()
    for (const recommendation of step.recommendedCourses) {
      if (!isRecord(recommendation) || typeof recommendation.candidateRef !== 'string' ||
        !isText(recommendation.reason, 500)) return null
      const { candidateRef, reason } = recommendation
      const course = coursesByRef.get(candidateRef)
      if (!course || usedRefs.has(candidateRef)) return null
      usedRefs.add(candidateRef)
      recommendedCourses.push({ course, reason })
    }

    const practiceProjects: RoadmapResponse['steps'][number]['practiceProjects'] = []
    for (const project of step.practiceProjects) {
      if (!isRecord(project) || !isText(project.title, 120) || !isText(project.description, 600)) return null
      practiceProjects.push({ title: project.title, description: project.description })
    }

    steps.push({ title: step.title, learningGoals, recommendedCourses, practiceProjects })
  }

  return { steps }
}
