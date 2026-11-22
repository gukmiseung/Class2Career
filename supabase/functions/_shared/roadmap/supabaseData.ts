import type { CareerConceptRequirements } from './compareConceptCoverage.ts'
import type { RoadmapData, RoadmapDependencies } from './handler.ts'
import { isRecord } from './response.ts'

type Row = Record<string, unknown>
type Course = { id: number; name: string; department: string; concepts: { id: string; name: string }[] }
type Registration = { course: Course; status: 'completed' | 'in_progress' | 'planned' }
type Career = { slug: string; title: string; description: string }

const courseColumns = 'c2c_courses(id,name,department,c2c_course_concepts(id,name,sort_order))'

function rows(value: unknown): Row[] {
  if (!Array.isArray(value) || !value.every(isRecord)) throw new Error('Invalid catalog rows')
  return value
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Invalid catalog text')
  return value
}

function id(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) throw new Error('Invalid catalog ID')
  return value
}

function course(value: unknown): Course {
  if (!isRecord(value)) throw new Error('Missing catalog course')
  const concepts = rows(value.c2c_course_concepts).map((row) => ({
    id: String(id(row.id)),
    name: text(row.name),
  }))
  return { id: id(value.id), name: text(value.name), department: text(value.department), concepts }
}

function registration(row: Row): Registration {
  if (row.status !== 'completed' && row.status !== 'in_progress' && row.status !== 'planned') {
    throw new Error('Invalid registration status')
  }
  return { course: course(row.c2c_courses), status: row.status }
}

function personalize(career: Career, related: Course[], registrations: Registration[]): RoadmapData {
  const completed = registrations.filter(({ status }) => status === 'completed').map(({ course }) => course)
  const planned = registrations.filter(({ status }) => status === 'planned').map(({ course }) => course)
  const relatedIds = new Set(related.map(({ id }) => id))
  const completedIds = new Set(completed.map(({ id }) => id))
  const summary = ({ name, department }: Course) => ({ name, department })

  // Career links contain prose summaries, not concept IDs. Their linked course concepts
  // are the available requirements. A concept row ID is course-specific.
  const requirements: CareerConceptRequirements =
    related.length && related.every(({ concepts }) => concepts.length)
      ? { status: 'ready', concepts: related.flatMap(({ concepts }) => concepts) }
      : { status: 'pending' }

  return {
    request: {
      targetCareer: { name: career.title, description: career.description },
      completedCourses: completed.map(summary),
      plannedCourses: planned.map(summary),
    },
    coverage: {
      requirements,
      completedCourses: completed.filter(({ id }) => relatedIds.has(id)).map(({ id, concepts }) => ({
        courseId: String(id),
        status: concepts.length ? 'ready' : 'pending',
        conceptIds: concepts.map(({ id }) => id),
      })),
    },
    candidates: related.filter(({ id }) => !completedIds.has(id)).map((course) => ({
      candidateRef: `c${course.id}`,
      ...summary(course),
    })),
  }
}

export function createSupabaseRoadmapLoader(
  configuration: () => { url: string; publishableKey: string },
  request: typeof fetch = fetch,
): RoadmapDependencies['load'] {
  return async ({ userId, accessToken, careerId }) => {
    const { url, publishableKey } = configuration()
    const signal = AbortSignal.timeout(8000)
    async function select(table: string, params: Record<string, string>) {
      const target = new URL(`/rest/v1/${table}`, url)
      target.search = new URLSearchParams(params).toString()
      const response = await request(target, {
        headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` },
        redirect: 'error',
        signal,
      })
      if (!response.ok) throw new Error('Supabase roadmap lookup failed')
      return rows(await response.json())
    }

    let slug = careerId
    if (!slug) {
      const interests = await select('c2c_user_career_interests', {
        select: 'career_slug', user_id: `eq.${userId}`, limit: '2',
      })
      if (interests.length !== 1) return { status: 'career_selection_required' }
      slug = text(interests[0].career_slug)
    }
    const [selected] = await select('c2c_careers', { select: 'slug,title,description', slug: `eq.${slug}` })
    if (!selected) return null

    const career = { slug: text(selected.slug), title: text(selected.title), description: text(selected.description) }
    const [relations, registrations] = await Promise.all([
      select('c2c_career_courses', {
        select: courseColumns,
        career_slug: `eq.${career.slug}`,
        order: 'sort_order.asc,course_id.asc',
        'c2c_courses.c2c_course_concepts.order': 'sort_order.asc,id.asc',
      }),
      select('c2c_user_courses', {
        select: `status,${courseColumns}`,
        user_id: `eq.${userId}`,
        order: 'course_id.asc',
        'c2c_courses.c2c_course_concepts.order': 'sort_order.asc,id.asc',
      }),
    ])
    return personalize(career, relations.map((row) => course(row.c2c_courses)), registrations.map(registration))
  }
}
