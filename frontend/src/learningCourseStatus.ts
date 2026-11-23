import { courseStatuses, type CourseStatus } from './courseRegistrations.ts'

export async function changeLearningCourseStatus(
  courseId: number,
  currentStatus: CourseStatus,
  selection: string,
  saveCourseStatus: (courseId: number, status: CourseStatus) => Promise<boolean>,
  onSaved: () => void,
): Promise<string | null> {
  const nextStatus = courseStatuses.find((status) => status === selection)
  if (nextStatus === currentStatus) return null
  if (!nextStatus) return '유효한 수강 상태를 선택해 주세요.'

  const saveError = '수강 상태를 변경하지 못했어요. 다시 시도해 주세요.'
  try {
    if (!await saveCourseStatus(courseId, nextStatus)) return saveError
  } catch {
    return saveError
  }
  onSaved()
  return null
}
