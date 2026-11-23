import assert from 'node:assert/strict'
import { test } from 'node:test'
import { courseStatuses, type CourseStatus } from '../src/courseRegistrations.ts'
import { changeLearningCourseStatus } from '../src/learningCourseStatus.ts'

test('sends the existing course ID and the new status for each transition', async () => {
  for (const currentStatus of courseStatuses) {
    for (const nextStatus of courseStatuses.filter((status) => status !== currentStatus)) {
      const calls: [number, CourseStatus][] = []
      const error = await changeLearningCourseStatus(42, currentStatus, nextStatus, async (id, status) => {
        calls.push([id, status])
        return true
      }, () => {})
      assert.equal(error, null)
      assert.deepEqual(calls, [[42, nextStatus]])
    }
  }
})

test('does not save the current status or an invalid selection', async () => {
  const save = async () => assert.fail('Unexpected save')
  const collapse = () => assert.fail('Unexpected collapse')
  assert.equal(await changeLearningCourseStatus(42, 'completed', 'completed', save, collapse), null)
  assert.match((await changeLearningCourseStatus(42, 'completed', 'unknown', save, collapse)) ?? '', /유효한 수강 상태/)
})

test('reports a failed or declined save without committing a new status', async () => {
  for (const save of [async () => { throw new Error('offline') }, async () => false]) {
    assert.equal(
      await changeLearningCourseStatus(42, 'completed', 'planned', save, () => assert.fail('Card must stay expanded')),
      '수강 상태를 변경하지 못했어요. 다시 시도해 주세요.',
    )
  }
})

test('requests collapse once and only after the save succeeds', async () => {
  let collapses = 0
  const change = changeLearningCourseStatus(42, 'completed', 'planned', async () => true, () => { collapses++ })
  assert.equal(collapses, 0)
  assert.equal(await change, null)
  assert.equal(collapses, 1)
})
