import { devEventListUrl, getDevEventContests } from './devEventContests'

const koreanDateTime = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
  timeZone: 'Asia/Seoul',
})

const backendFeaturedIds = new Set([3617, 3604, 3605])

function ContestCards({ contests }: { contests: ReturnType<typeof getDevEventContests> }) {
  return (
    <ul className="roadmap-contest-list" aria-label="이 직무에 추천하는 공모전과 해커톤">
      {contests.map((contest) => (
        <li className="roadmap-contest-card" key={contest.devEventId}>
          <div className="roadmap-contest-meta">
            <span className="roadmap-contest-status">{contest.dateLabel}</span>
            <time dateTime={contest.date}>{koreanDateTime.format(new Date(contest.date))}</time>
          </div>
          <h3>{contest.title}</h3>
          <p>{contest.organizer}</p>
          <p><strong>참가 대상</strong> {contest.audience}</p>
          <p className="roadmap-contest-activity"><strong>활동 내용</strong> {contest.reason}</p>
          {contest.dateLabel === '행사 시작' && <p>접수 일정은 주최 측 공고에서 확인해 주세요.</p>}
          <a href={contest.officialUrl} target="_blank" rel="noreferrer" aria-label={`${contest.title} 공식 공고 확인`}>
            공식 공고 확인 <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function DevEventContestNotices({ careerSlug, careerName }: { careerSlug: string; careerName: string }) {
  const contests = getDevEventContests(careerSlug)
  const featured = careerSlug === 'backend-developer'
    ? contests.filter(({ devEventId }) => backendFeaturedIds.has(devEventId))
    : contests
  const other = featured.length > 0 && featured.length < contests.length
    ? contests.filter(({ devEventId }) => !backendFeaturedIds.has(devEventId))
    : []

  return (
    <section className="roadmap-contests" aria-labelledby="roadmap-dev-event-title">
      <header className="roadmap-contests-header">
        <div>
          <h2 id="roadmap-dev-event-title">직무 추천 공모전 · 해커톤</h2>
          <p>{careerName} 직무와 관련된 활동을 모았어요.</p>
        </div>
        <a href={devEventListUrl} target="_blank" rel="noreferrer">데브이벤트 전체 공고 <span aria-hidden="true">↗</span></a>
      </header>

      {contests.length > 0
        ? <ContestCards contests={featured.length > 0 ? featured : contests} />
        : <p className="roadmap-contest-empty">현재 확인된 공고 중 이 직무에 추천할 수 있는 공모전이 없어요.</p>}
      {other.length > 0 && (
        <details className="roadmap-contest-archive">
          <summary>추천 공모전 더 보기 ({other.length}개)</summary>
          <ContestCards contests={other} />
        </details>
      )}
    </section>
  )
}
