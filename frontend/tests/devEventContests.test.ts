import { deepEqual, equal, notEqual } from 'node:assert/strict'
import { test } from 'node:test'
import { getDevEventContests } from '../src/roadmap/devEventContests.ts'

const snapshot = Date.parse('2026-11-24T12:00:00+09:00')

test('selects contests for the chosen career in date order and gives shared events different activities', () => {
  const frontend = getDevEventContests('frontend-developer', snapshot)
  const backend = getDevEventContests('backend-developer', snapshot)
  const mobile = getDevEventContests('mobile-app-developer', snapshot)
  deepEqual(frontend.map(({ devEventId }) => devEventId), [3617, 3604, 3605])
  deepEqual(backend.map(({ devEventId }) => devEventId), [3616, 3617, 3604, 3605, 3517])
  deepEqual(mobile.map(({ devEventId }) => devEventId), [3617, 3605])
  notEqual(frontend[0].reason, mobile[0].reason)
  deepEqual(getDevEventContests('network-engineer', snapshot), [])
})

test('removes listings at their Korean deadline or event start, including in the new year', () => {
  equal(getDevEventContests('data-analyst', Date.parse('2026-12-01T17:59:59+09:00')).length, 1)
  equal(getDevEventContests('data-analyst', Date.parse('2026-12-01T18:00:00+09:00')).length, 0)
  equal(getDevEventContests('security-engineer', Date.parse('2026-12-11T13:29:59+09:00')).length, 1)
  equal(getDevEventContests('security-engineer', Date.parse('2026-12-11T13:30:00+09:00')).length, 0)
  equal(getDevEventContests('computer-vision-engineer', Date.parse('2027-01-10T23:58:59+09:00')).length, 1)
  equal(getDevEventContests('computer-vision-engineer', Date.parse('2027-01-10T23:59:00+09:00')).length, 0)
})
