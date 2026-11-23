export type RoadmapCourse = {
  name: string
  department?: string
}

export type RoadmapRequest = {
  targetCareer: {
    name: string
    description?: string
  }
  completedCourses: RoadmapCourse[]
  plannedCourses: RoadmapCourse[]
  skillGaps: {
    name: string
    context?: string
  }[]
}

export type RoadmapStepDetails = {
  weeks: number
  outcome: string
  competition: {
    type: string
    query: string
    submission: string
    whatToCheck: string
  }
  experience: {
    setting: string
    actions: string[]
    evidence: string
  }
}

export type RoadmapProjectPlan = {
  tasks: string[]
  deliverable: string
  doneWhen: string
}

export type RoadmapStep = {
  title: string
  learningGoals: string[]
  details?: RoadmapStepDetails
  recommendedCourses: {
    course: RoadmapCourse
    reason: string
    application?: string
  }[]
  practiceProjects: {
    title: string
    description: string
    plan?: RoadmapProjectPlan
  }[]
}

export type RoadmapResponse = {
  /** Steps appear in their recommended learning order. */
  steps: RoadmapStep[]
}

export type RoadmapInputSelection = {
  learnerKey: string
  careerName: string
}

export interface RoadmapInputSource {
  /**
   * Return null when input for this learner and career is unavailable.
   * Empty arrays represent available input with no entries in that category.
   * Keep the learner key at the data source boundary.
   */
  load(selection: RoadmapInputSelection): Promise<RoadmapRequest | null>
}
