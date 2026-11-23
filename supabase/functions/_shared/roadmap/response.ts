import type { RoadmapCourse, RoadmapProjectPlan, RoadmapResponse, RoadmapStepDetails } from './contracts.ts'

export type CandidateCourse = Readonly<RoadmapCourse & { candidateRef: string }>

export type GeneratedRoadmap = {
  steps: {
    title: string
    learningGoals: string[]
    details?: RoadmapStepDetails
    recommendedCourses: { candidateRef: string; reason: string; application?: string }[]
    practiceProjects: { title: string; description: string; plan?: RoadmapProjectPlan }[]
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

function isActionList(value: unknown, max: number): value is string[] {
  return isArrayInRange(value, 2, max) && value.every((action) => isText(action, 240))
}

function readDetails(value: unknown): RoadmapStepDetails | null {
  if (!isRecord(value)) return null
  const { weeks, outcome, competition, experience } = value
  if (typeof weeks !== 'number' || !Number.isInteger(weeks) || weeks < 1 || weeks > 12 || !isText(outcome, 240)) return null
  if (!isRecord(competition) || !isRecord(experience)) return null
  const { type, query, submission, whatToCheck } = competition
  const { setting, actions, evidence } = experience
  if (!isText(type, 100) || !isText(query, 100) || !isText(submission, 300) || !isText(whatToCheck, 240) ||
    !isText(setting, 120) || !isActionList(actions, 2) || !isText(evidence, 300)) return null
  return {
    weeks, outcome,
    competition: { type, query, submission, whatToCheck },
    experience: { setting, actions, evidence },
  }
}

function readProjectPlan(value: unknown): RoadmapProjectPlan | null {
  if (!isRecord(value)) return null
  const { tasks, deliverable, doneWhen } = value
  if (!isActionList(tasks, 3) || !isText(deliverable, 300) || !isText(doneWhen, 300)) return null
  return { tasks, deliverable, doneWhen }
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

    const details = step.details === undefined ? undefined : readDetails(step.details)
    if (details === null || (details && step.practiceProjects.length !== 1)) return null

    const learningGoals = step.learningGoals.filter((goal): goal is string => isText(goal, 300))
    if (learningGoals.length !== step.learningGoals.length) return null

    const recommendedCourses: RoadmapResponse['steps'][number]['recommendedCourses'] = []
    const usedRefs = new Set<string>()
    for (const recommendation of step.recommendedCourses) {
      if (!isRecord(recommendation) || typeof recommendation.candidateRef !== 'string' ||
        !isText(recommendation.reason, 500)) return null
      const { candidateRef, reason, application } = recommendation
      const course = coursesByRef.get(candidateRef)
      if (!course || usedRefs.has(candidateRef)) return null
      if ((details || application !== undefined) && !isText(application, 360)) return null
      usedRefs.add(candidateRef)
      recommendedCourses.push({ course, reason, ...(typeof application === 'string' && { application }) })
    }

    const practiceProjects: RoadmapResponse['steps'][number]['practiceProjects'] = []
    for (const project of step.practiceProjects) {
      if (!isRecord(project) || !isText(project.title, 120) || !isText(project.description, 600)) return null
      const plan = project.plan === undefined ? undefined : readProjectPlan(project.plan)
      if (plan === null || (details && !plan)) return null
      practiceProjects.push({ title: project.title, description: project.description, ...(plan && { plan }) })
    }

    steps.push({ title: step.title, learningGoals, recommendedCourses, practiceProjects, ...(details && { details }) })
  }

  return { steps }
}
