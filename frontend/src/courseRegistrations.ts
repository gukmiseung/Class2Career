import type { SupabaseClient } from '@supabase/supabase-js'

export const courseStatuses = ['completed', 'in_progress', 'planned'] as const
export type CourseStatus = typeof courseStatuses[number]
export const statusLabels: Record<CourseStatus, string> = {
  completed: '수강 완료',
  in_progress: '수강 중',
  planned: '수강 예정',
}

export type Registrations = Partial<Record<number, CourseStatus>>

const registrationTable = 'c2c_user_courses'

export async function loadRegistrations(supabase: SupabaseClient, userId: string, signal: AbortSignal): Promise<Registrations> {
  const registrations: Registrations = {}
  const pageSize = 1000

  for (let start = 0; ; start += pageSize) {
    const { data } = await supabase
      .from(registrationTable)
      .select('course_id, status')
      .eq('user_id', userId)
      .order('course_id')
      .range(start, start + pageSize - 1)
      .abortSignal(signal)
      .throwOnError()

    for (const { course_id, status } of data) {
      if (isCourseId(course_id) && isCourseStatus(status)) registrations[course_id] = status
    }

    if (data.length < pageSize) return registrations
  }
}

function isCourseId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function isCourseStatus(value: unknown): value is CourseStatus {
  return typeof value === 'string' && Object.hasOwn(statusLabels, value)
}

export async function saveRegistration(supabase: SupabaseClient, userId: string, courseId: number, status: CourseStatus | null) {
  if (!isCourseId(courseId)) throw new Error('유효하지 않은 과목 ID입니다.')
  if (status !== null && !isCourseStatus(status)) throw new Error('유효하지 않은 수강 상태입니다.')

  if (status !== null) {
    await supabase
      .from(registrationTable)
      .upsert({ user_id: userId, course_id: courseId, status }, { onConflict: 'user_id,course_id' })
      .throwOnError()
    return
  }

  const { data: deleted } = await supabase
    .from(registrationTable)
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select('course_id')
    .maybeSingle()
    .throwOnError()
  if (deleted) return

  // RLS can filter out the delete without returning an error. Check whether the row still exists.
  const { data: remaining } = await supabase
    .from(registrationTable)
    .select('course_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
    .throwOnError()
  if (remaining) throw new Error('수강 상태를 삭제하지 못했어요.')
}
