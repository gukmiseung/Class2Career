import { supabase } from './lib/supabase'

export type CourseConcept = {
  id: string
  name: string
  group: string
  description: string
  sortOrder: number
}

type CourseConceptRow = {
  id: number
  name: string
  concept_group: string
  description: string | null
  sort_order: number
}

export async function getCourseConcepts(courseDbId: number): Promise<CourseConcept[]> {
  const { data, error } = await supabase
    .from('c2c_course_concepts')
    .select('id, name, concept_group, description, sort_order')
    .eq('course_id', courseDbId)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw error

  return ((data ?? []) as CourseConceptRow[]).map(({ id, name, concept_group, description, sort_order }) => ({
    id: String(id),
    name,
    group: concept_group,
    description: description ?? '',
    sortOrder: sort_order,
  }))
}
