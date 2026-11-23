import { deepEqual, equal } from 'node:assert/strict'
import { test } from 'node:test'
import { getKnuContests } from '../src/roadmap/knuContests.ts'

test('shows the confirmed November 24 postings in deadline order and keeps ended contests in the archive', () => {
  const { open, closed } = getKnuContests(Date.parse('2026-11-24T12:00:00+09:00'))
  deepEqual(open.map(({ closesOn }) => closesOn), ['2026-11-27', '2026-11-28', '2026-12-11'])
  deepEqual(closed.map(({ closesOn }) => closesOn), ['2026-11-13', '2026-11-11', '2026-10-29'])
})

test('uses the posted time and keeps date-only deadlines open through the end of their Korean calendar date', () => {
  equal(getKnuContests(Date.parse('2026-11-27T16:59:59+09:00')).open.length, 3)
  equal(getKnuContests(Date.parse('2026-11-27T17:00:00+09:00')).open.length, 2)
  equal(getKnuContests(Date.parse('2026-12-11T23:59:59+09:00')).open.length, 1)
  equal(getKnuContests(Date.parse('2026-12-12T00:00:00+09:00')).open.length, 0)
})
