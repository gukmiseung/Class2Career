import { deepEqual, equal, notEqual, throws } from 'node:assert/strict'
import { test } from 'node:test'
import { readDevEventListings } from '../server/devEventFeed.ts'
import { getDevEventContests } from '../src/roadmap/devEventContests.ts'
import type { DevEventListing } from '../src/roadmap/devEventMatching.ts'

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

test('reads public contest metadata across months without copying event descriptions or images', () => {
  const raw = {
    id: 7273,
    title: '신규 공공데이터 활용 경진대회',
    organizer: '테스트 기관',
    description: 'Published description',
    cover_image_link: 'https://example.com/image.png',
    event_time_type: 'RECRUIT',
    start_date_time: '2026-11-24T00:00',
    end_date_time: '2026-12-14T00:00',
    use_end_date_time_yn: 'N',
    tags: [{ tag_name: '대회' }, { tag_name: '온라인' }],
  }
  const data = { props: { pageProps: { fallbackData: [
    { dev_event: [raw, { ...raw, id: 10, tags: [{ tag_name: '세미나' }] }] },
    { dev_event: [raw, { ...raw, id: 11, end_date_time: 'invalid' }] },
  ] } } }
  const html = `<script type="application/json" id="__NEXT_DATA__">${JSON.stringify(data)}</script>`
  deepEqual(readDevEventListings(html), [{
    devEventId: 7273,
    title: raw.title,
    organizer: '테스트 기관',
    kind: 'RECRUIT',
    startsAt: '2026-11-24T00:00+09:00',
    endsAt: '2026-12-14T23:59:59.999+09:00',
    endDateOnly: true,
    tags: ['대회', '온라인'],
  }])
  throws(() => readDevEventListings('<script id="__NEXT_DATA__">{}</script>'), /format changed/)
})

test('matches newly published contests, updates old deadlines, and removes old entries absent from the live list', () => {
  const base: Omit<DevEventListing, 'devEventId' | 'title'> = {
    organizer: '테스트 기관',
    startsAt: '2026-11-24T00:00+09:00',
    endsAt: '2026-12-14T18:00+09:00',
    endDateOnly: false,
    kind: 'RECRUIT',
    tags: ['대회'],
  }
  const live: DevEventListing[] = [
    { ...base, devEventId: 3617, title: '공공데이터 활용 경진대회' },
    { ...base, devEventId: 7273, title: '웹 서비스 공모전' },
    { ...base, devEventId: 7275, title: '모바일 앱 개발 대회', startsAt: '2026-12-10T09:00+09:00' },
  ]
  const frontend = getDevEventContests('frontend-developer', snapshot, live)
  deepEqual(frontend.map(({ devEventId }) => devEventId), [3617, 7273])
  equal(frontend[0].date, base.endsAt)
  equal(frontend[0].reason, getDevEventContests('frontend-developer', snapshot)[0].reason)
  equal(frontend[1].officialUrl, 'https://dev-event.vercel.app/event/detail/7273')
  deepEqual(getDevEventContests('mobile-app-developer', snapshot, live).map(({ devEventId }) => devEventId), [3617])
  deepEqual(getDevEventContests('frontend-developer', snapshot, []), [])
})
