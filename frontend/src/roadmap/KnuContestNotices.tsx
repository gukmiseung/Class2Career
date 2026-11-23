import { getKnuContests, knuNoticeBoard } from './knuContests'

const koreanDate = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeZone: 'Asia/Seoul' })

export default function KnuContestNotices() {
  const { open, closed } = getKnuContests()

  return (
    <section className="roadmap-contests" aria-labelledby="roadmap-contests-title">
      <header className="roadmap-contests-header">
        <div>
          <h2 id="roadmap-contests-title">경북대학교 공모전</h2>
          <p>본교와 교내 기관에서 진행하는 활동을 모았어요.</p>
        </div>
        <a href={knuNoticeBoard} target="_blank" rel="noreferrer">경북대 전체 공지 <span aria-hidden="true">↗</span></a>
      </header>

      {open.length ? (
        <ul className="roadmap-contest-list" aria-label="접수 중인 공모전">
          {open.map((contest) => (
            <li className="roadmap-contest-card" key={contest.url}>
              <div className="roadmap-contest-meta">
                <span className="roadmap-contest-status">접수 중</span>
                <time dateTime={contest.closesAt ? `${contest.closesOn}T${contest.closesAt}+09:00` : contest.closesOn}>
                  {koreanDate.format(new Date(`${contest.closesOn}T00:00:00+09:00`))}{contest.closesAt && ` ${contest.closesAt}`}
                </time>
              </div>
              <h3>{contest.title}</h3>
              <p>{contest.organizer}</p>
              <p><strong>참가 대상</strong> {contest.audience}</p>
              {contest.activity && <p className="roadmap-contest-activity"><strong>활동 내용</strong> {contest.activity}</p>}
              <a href={contest.url} target="_blank" rel="noreferrer" aria-label={`${contest.title} 공식 공고 확인`}>
                공식 공고 확인 <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : <p className="roadmap-contest-empty">등록된 공고 중 접수 중인 공모전이 없어요. 최신 일정은 경북대 전체 공지에서 확인할 수 있어요.</p>}

      {closed.length > 0 && (
        <details className="roadmap-contest-archive">
          <summary>마감된 공고 {closed.length}개</summary>
          <ul>
            {closed.map((contest) => (
              <li key={contest.url}>
                <a href={contest.url} target="_blank" rel="noreferrer">{contest.title} <span aria-hidden="true">↗</span></a>
                <time dateTime={contest.closesOn}>{koreanDate.format(new Date(`${contest.closesOn}T00:00:00+09:00`))} 마감</time>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
