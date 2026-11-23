import type { DevEventListing } from '../src/roadmap/devEventMatching.ts'

const source = 'https://dev-event.vercel.app/events'
const cacheSeconds = 60 * 60
const retrySeconds = 5 * 60

type SourceEvent = {
  id?: number
  title?: string
  organizer?: string
  event_time_type?: string
  start_date_time?: string
  end_date_time?: string
  use_end_date_time_yn?: string
  tags?: { tag_name?: string }[]
}

function koreanTime(value: unknown, endOfDay = false) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?$/.test(value)) return null
  const iso = (endOfDay ? `${value.slice(0, 10)}T23:59:59.999` : value) + '+09:00'
  return Number.isFinite(Date.parse(iso)) ? iso : null
}

export function readDevEventListings(html: string): DevEventListing[] {
  const pageData = html.match(/<script\b[^>]*\bid="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!pageData) throw new Error('Dev Event page data is missing')

  const page = JSON.parse(pageData) as { props?: { pageProps?: { fallbackData?: { dev_event?: SourceEvent[] }[] } } }
  const months = page.props?.pageProps?.fallbackData
  if (!Array.isArray(months) || months.length === 0 || months.some((month) => !Array.isArray(month?.dev_event))) {
    throw new Error('Dev Event listing format changed')
  }

  const listings = new Map<number, DevEventListing>()
  for (const event of months.flatMap((month) => month.dev_event ?? [])) {
    const id = event?.id
    if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1 || typeof event.title !== 'string' || !event.title.trim()) continue

    const tags = Array.isArray(event.tags)
      ? event.tags.flatMap((tag) => typeof tag?.tag_name === 'string' ? [tag.tag_name] : [])
      : []
    if (!tags.some((tag) => ['대회', '공모전', '대회/공모전', '해커톤'].includes(tag))) continue

    const kind = event.event_time_type
    if (kind !== 'RECRUIT' && kind !== 'DATE') continue
    const endDateOnly = event.use_end_date_time_yn === 'N'
    const startsAt = koreanTime(event.start_date_time)
    const endsAt = koreanTime(event.end_date_time, endDateOnly)
    if (!startsAt || !endsAt || Date.parse(startsAt) > Date.parse(endsAt)) continue

    listings.set(id, {
      devEventId: id,
      title: event.title.trim(),
      organizer: typeof event.organizer === 'string' ? event.organizer.trim() : '',
      startsAt,
      endsAt,
      endDateOnly,
      kind,
      tags,
    })
  }
  return [...listings.values()]
}

let listings: DevEventListing[] | null = null
let recheckAt = 0
let pending: Promise<void> | undefined

async function refreshFeed() {
  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(8000), redirect: 'error' })
    if (!response.ok) throw new Error('Dev Event did not return its listing')
    const received = readDevEventListings(await response.text())
    const now = Date.now()
    listings = received.filter(({ endsAt }) => now < Date.parse(endsAt))
    recheckAt = now + cacheSeconds * 1000
  } catch {
    recheckAt = Date.now() + retrySeconds * 1000
  }
}

export async function serveDevEventFeed(method: string) {
  if (method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } })

  if (Date.now() >= recheckAt) {
    pending ??= refreshFeed().finally(() => { pending = undefined })
    await pending
  }

  if (!listings) return Response.json({ error: '공고를 불러오지 못했어요.' }, { status: 503 })
  const cacheTime = Math.max(1, Math.floor((recheckAt - Date.now()) / 1000))
  return Response.json(listings, {
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=60, stale-if-error=86400`,
    },
  })
}
