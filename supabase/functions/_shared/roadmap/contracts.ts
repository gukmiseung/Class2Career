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

export type RoadmapStep = {
  title: string
  learningGoals: string[]
  recommendedCourses: {
    course: RoadmapCourse
    reason: string
  }[]
  practiceProjects: {
    title: string
    description: string
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
