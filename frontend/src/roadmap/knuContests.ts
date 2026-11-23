type KnuContest = {
  title: string
  organizer: string
  audience: string
  activity?: string
  closesOn: string
  closesAt?: string
  url: string
}

export const knuNoticeBoard = 'https://www.knu.ac.kr/wbbs/wbbs/bbs/btin/list.action?bbs_cde=1&menu_idx=67'

// Snapshot of confirmed campus notices, checked 2026-11-24. Use the application deadline in the notice body.
const contests: readonly KnuContest[] = [
  {
    title: '2026년도 경북대학교 연구노트 경진대회',
    organizer: '연구윤리센터',
    audience: '연구노트 교육을 이수한 경북대 대학원 재학생',
    activity: '연구 과정과 결과를 체계적으로 기록하는 활동',
    closesOn: '2026-11-27',
    closesAt: '17:00',
    url: 'https://gsee.knu.ac.kr/content/notice.html?fidx=6166&pg=vv',
  },
  {
    title: '2026 지역전략산업 스타트업 아이디어 경진대회',
    organizer: '경북대 창업대학원',
    audience: '대구·경북 거주 중·고등학생, 창업대학원 예비 입학생 및 지역 예비창업자 등',
    activity: '지역 문제 해결을 위한 창업 아이디어 구체화',
    closesOn: '2026-11-28',
    url: 'https://ssu.knu.ac.kr/bbs/board.php?bo_table=tl_notice&wr_id=28',
  },
  {
    title: '제20회 별빛수기 공모전',
    organizer: '교수학습센터',
    audience: '2026학년도 2학기 기준 경북대 학부 재학생. 휴학생 및 수업 연한 초과자 제외',
    activity: '학습 경험과 성장 과정을 글로 정리하는 활동',
    closesOn: '2026-12-11',
    url: 'https://knu.ac.kr/wbbs/wbbs/bbs/btin/viewBtin.action?bbs_cde=1&btin.appl_no=000000&btin.bbs_cde=1&btin.doc_no=1338737&menu_idx=67',
  },
  {
    title: '2026 NEXT BK21 비전 숏폼영상 공모전',
    organizer: '대학원혁신',
    audience: '경북대 일반대학원 재학생 개인 또는 팀',
    closesOn: '2026-11-13',
    closesAt: '15:00',
    url: 'https://www.knu.ac.kr/wbbs/wbbs/bbs/btin/viewBtin.action?btin.appl_no=000000&btin.bbs_cde=11&btin.doc_no=1338685&menu_idx=73',
  },
  {
    title: '2026년 KNU 캡스톤디자인 경진대회',
    organizer: '지역전략산업혁신연구소',
    audience: '학내 교과·비교과 캡스톤디자인 경진대회 참여 팀',
    closesOn: '2026-11-11',
    url: 'https://rlinc.knu.ac.kr/notice/1001',
  },
  {
    title: '내가 듣고 싶은 교양수업 공모전',
    organizer: '기초교육센터',
    audience: '경북대 학부 재학생 4인 이상으로 구성된 팀',
    closesOn: '2026-10-29',
    url: 'https://www.knu.ac.kr/wbbs/wbbs/bbs/btin/viewBtin.action?bbs_cde=1&btin.appl_no=000000&btin.bbs_cde=1&btin.doc_no=1338501&menu_idx=67',
  },
]

export function getKnuContests(now = Date.now()) {
  const open: KnuContest[] = []
  const closed: KnuContest[] = []
  for (const contest of contests) {
    const deadlineTime = contest.closesAt ? `${contest.closesAt}:00` : '24:00:00'
    const deadline = Date.parse(`${contest.closesOn}T${deadlineTime}+09:00`)
    if (now < deadline) open.push(contest)
    else closed.push(contest)
  }
  open.sort((left, right) => left.closesOn.localeCompare(right.closesOn))
  closed.sort((left, right) => right.closesOn.localeCompare(left.closesOn))
  return { open, closed }
}
