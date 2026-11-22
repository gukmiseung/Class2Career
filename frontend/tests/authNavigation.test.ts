import { deepEqual, equal } from 'node:assert/strict'
import { test } from 'node:test'
import { authHref, getAuthReturnTo, getPersonalizedRoadmapAccess } from '../src/authNavigation.ts'

test('preserves the selected career when navigating through login or signup', () => {
  for (const career of ['백엔드 개발자', 'UI/UX 디자이너']) {
    const destination = `#roadmap-${encodeURIComponent(career)}`
    equal(getAuthReturnTo(authHref('#login', destination)), destination)
    equal(getAuthReturnTo(authHref('#signup', destination)), destination)
  }
})

test('rejects external, malformed, and ambiguous return destinations', () => {
  for (const destination of [
    'https://example.com', '//example.com', 'javascript:alert(1)', '#login',
    '#roadmap-', '#roadmap-%20', '#roadmap-%E0%A4', '#roadmap-%250A',
    '#roadmap-job%0A', '#roadmap-job%3Fnext=other', '#roadmap-job%23other',
  ]) {
    equal(getAuthReturnTo(authHref('#login', destination)), '#dashboard', destination)
  }
  equal(getAuthReturnTo('#login?next=%23profile&next=%23explore'), '#dashboard')
  equal(getAuthReturnTo('#login'), '#dashboard')
})

test('preserves existing profile and learning return destinations', () => {
  for (const destination of ['#profile', '#explore', '#explore/learning', '#explore/concepts/course-1']) {
    equal(getAuthReturnTo(authHref('#login', destination)), destination)
  }
})

test('only a checked, signed-in session outside password recovery enables generation', () => {
  const user = { id: 'test-user' }
  deepEqual(getPersonalizedRoadmapAccess({ loading: true, user, recoveringPassword: false }), { status: 'checking' })
  deepEqual(getPersonalizedRoadmapAccess({ loading: true, user: null, recoveringPassword: false }), { status: 'checking' })
  deepEqual(getPersonalizedRoadmapAccess({ loading: false, user: null, recoveringPassword: false }), { status: 'login-required' })
  deepEqual(getPersonalizedRoadmapAccess({ loading: false, user, recoveringPassword: true }), { status: 'login-required' })
  deepEqual(getPersonalizedRoadmapAccess({ loading: false, user, recoveringPassword: false }), { status: 'ready', userId: 'test-user' })
})
