import { getDevEventMatch, type DevEventListing } from './devEventMatching.ts'

type ContestCard = {
  title: string
  organizer: string
  audience?: string
  devEventId: number
  officialUrl: string
  date: string
  dateOnly?: boolean
  dateLabel: '접수 마감' | '접수·제출 마감' | '작품 제출 마감' | '행사 시작'
  reason: string
  isCurated: boolean
}

type DevEventContest = Omit<ContestCard, 'reason' | 'isCurated' | 'dateOnly'> & {
  recommendations: Readonly<Partial<Record<string, string>>>
}

export const devEventListUrl = 'https://dev-event.vercel.app/events'

// One-time selection of public listings verified on 2026-11-24. Dates use Korea Standard Time.
const contests: readonly DevEventContest[] = [
  {
    title: 'Build with Qwen: AutoRAG Hackathon 2026',
    organizer: '알리바바 클라우드 · Markr · 브레인크루',
    audience: 'RAG·LLM 서비스 개발에 관심 있는 개인 또는 1~4인 팀',
    devEventId: 3616,
    officialUrl: 'https://luma.com/pcd9sjr8',
    date: '2026-11-29T23:59:00+09:00',
    dateLabel: '접수 마감',
    recommendations: {
      'ai-engineer': '문서 검색과 답변 생성을 연결한 RAG 서비스를 만들고, 평가 질문으로 답변 품질을 비교해 보세요.',
      'nlp-engineer': '문서 분할 방식이나 검색 순서를 바꿔 보고, 인용 근거가 틀린 사례를 모아 개선 전후를 기록해 보세요.',
      'backend-developer': '검색과 답변 생성에 필요한 서버 API를 맡고, 요청 흐름과 오류 응답을 문서로 남겨 보세요.',
      'cloud-engineer': '자유 아이디어 트랙의 RAG 데모를 클라우드에서 실행해 보고, 서비스 구성도와 요청 지연 측정 결과를 남겨 보세요.',
      'devops-engineer': '팀의 RAG 데모가 같은 설정으로 실행되도록 빌드와 테스트를 자동화하고, 재현 절차를 저장소에 남겨 보세요.',
    },
  },
  {
    title: '대구 로컬 AI 그라운드 지역문제 해결형 AI활용 경진대회',
    organizer: '대구정책연구원 · 대구광역시 창의도시재생지원센터',
    audience: '거주지 제한 없이 대한민국 국민 2~5인 팀',
    devEventId: 3591,
    officialUrl: 'https://www.dgucenter.or.kr/bbs/board.php?bo_table=notice&wr_id=744',
    date: '2026-11-30T18:00:00+09:00',
    dateLabel: '접수 마감',
    recommendations: {
      'ai-engineer': '대구의 교통이나 생활 문제 하나를 정하고, AI를 적용한 시제품과 개선 효과를 측정할 방법을 제안해 보세요.',
      'ui-ux-designer': '대구 시민의 이용 상황을 조사해 지역 서비스 프로토타입을 만들고, 사용자 피드백과 수정 과정을 남겨 보세요.',
      'web-service-planner': '대구 지역문제의 당사자와 필요한 기능을 정리하고, 서비스 흐름과 효과 측정 지표를 제안서에 담아 보세요.',
    },
  },
  {
    title: 'ForwardThon 2026',
    organizer: '위시켓 · AIDP × 요즘IT',
    audience: '대학생·직장인·일반인 개인 지원. 참가자 100명 선발',
    devEventId: 3609,
    officialUrl: 'https://forwardthon.com/',
    date: '2026-11-30T23:59:00+09:00',
    dateLabel: '접수 마감',
    recommendations: {
      'data-analyst': '기업이 제공하는 수치에서 개선할 지표를 고르고, 현재 수치와 목표를 근거로 제안해 보세요.',
      'systems-architect': '기업의 업무 절차와 도입 조건을 파악하고, 기존 시스템과 새 기능의 연결 방식과 검증 기준을 설계해 보세요.',
    },
  },
  {
    title: '한국체육산업개발 공공데이터 활용 경진대회',
    organizer: '한국체육산업개발',
    audience: '공공데이터에 관심 있는 국민 누구나, 개인 또는 단체',
    devEventId: 3617,
    officialUrl: 'https://www.ksponco.or.kr/contestParticipation/62?mid=a10201030000',
    date: '2026-12-01T18:00:00+09:00',
    dateLabel: '접수 마감',
    recommendations: {
      'backend-developer': '올림픽공원 데이터를 활용해 검색·필터 기능을 갖춘 서비스 기획',
      'frontend-developer': '올림픽공원 공연 데이터로 검색·필터가 있는 반응형 화면을 만들고, 로딩과 검색 결과가 없는 상태까지 구현해 보세요.',
      'mobile-app-developer': '공연 일정과 방문 정보를 확인하는 앱을 기획하고, 날짜별 목록과 알림 설정 화면을 만들어 보세요.',
      'data-analyst': '공연과 입출차 데이터를 묶어 방문 혼잡 시간대를 시각화하고, 방문객 분산 방안을 제안해 보세요.',
      'data-engineer': '공연·입출차 데이터의 시간과 장소 형식을 통일하는 수집·변환 파이프라인을 설계해 보세요.',
      'data-scientist': '공연·날씨·입출차 데이터로 혼잡도를 예측하고, 기준 모델과 예측 오차를 비교한 분석을 남겨 보세요.',
      'database-developer': '공연·장소·일정 데이터를 관계형으로 설계하고, 날짜와 장소별 조회 쿼리와 실행 계획을 비교해 보세요.',
      'xr-developer': '올림픽공원 공연장 데이터를 활용한 실감형 무대를 기획하고, 관객 위치에 따라 시야가 달라지는 3D 데모를 만들어 보세요.',
    },
  },
  {
    title: '오렌지파크 해커톤 | 아이디어를 MVP로, 첫 고객을 만나기',
    organizer: '스마일게이트 오렌지플래닛',
    audience: '서비스 아이디어가 있는 개인 또는 팀. 50명 내외 선발',
    devEventId: 3604,
    officialUrl: 'https://www.orangepark.or.kr/articles/A8345675',
    date: '2026-12-01T23:59:00+09:00',
    dateLabel: '접수 마감',
    recommendations: {
      'backend-developer': '아이디어를 웹 서비스 MVP로 구현하고 사용자 피드백 받기',
      'frontend-developer': '첫 고객이 시도할 핵심 기능을 웹에서 구현하고, 피드백으로 달라진 화면을 전후 비교로 남겨 보세요.',
      'ui-ux-designer': '고객 인터뷰로 핵심 사용 흐름을 좁힌 뒤 프로토타입을 테스트하고, 피드백에 따라 화면을 개선해 보세요.',
      'web-service-planner': '고객의 문제와 가장 먼저 검증할 가설을 정하고, MVP 기능 범위와 검증 결과를 문서로 남겨 보세요.',
    },
  },
  {
    title: 'HSK Chain Horizon Hackathon · Seoul',
    organizer: '해시키 체인 · Pentabase',
    audience: '개발자·대학생·창업가 등 개인 또는 팀',
    devEventId: 3618,
    officialUrl: 'https://luma.com/mwn8lt3q?locale=ko',
    date: '2026-12-03T13:00:00+09:00',
    dateLabel: '접수·제출 마감',
    recommendations: {
      'blockchain-developer': '결제·정산 트랙에서 스마트 계약의 역할과 거래 상태를 설계하고, 검증 결과와 데모를 남겨 보세요.',
    },
  },
  {
    title: '2027 MOBIS Robotics Challenge',
    organizer: '현대모비스',
    audience: '국내 대학·대학원 재학생 및 졸업 예정자. 3인 1팀 권장',
    devEventId: 3580,
    officialUrl: 'https://mobis-robotics-challenge.com/',
    date: '2026-12-04T17:00:00+09:00',
    dateLabel: '접수 마감',
    recommendations: {
      'embedded-software-developer': '로봇 손의 센서 입력과 제어 출력을 연결하고, 물체가 달라질 때 동작이 얼마나 안정적인지 측정해 보세요.',
      'iot-developer': '센서에서 읽은 값을 관측 화면에 연결해 보고, 동작 상태와 이상 값을 확인하는 데모를 남겨 보세요.',
      'systems-software-developer': '로봇 제어 모듈과 센서 모듈의 인터페이스를 정의하고, 상태 전환과 오류 복구를 검증해 보세요.',
      'systems-architect': '센서·제어·사용자 인터페이스가 연결되는 구조를 설계하고, 모듈별 연동 기준을 문서화해 보세요.',
    },
  },
  {
    title: '서울 야간경제 활성화 해커톤 (Dopamine Seoul 24)',
    organizer: '서울특별시 · 서울창업허브 · 서울경제진흥원',
    audience: '만 15~39세 청년 대상. 최대 5인, 개발 가능 인원 1명 이상',
    devEventId: 3605,
    officialUrl: 'https://aifactory.space/ko/competitions/9320',
    date: '2026-12-07T23:59:00+09:00',
    dateLabel: '접수·제출 마감',
    recommendations: {
      'backend-developer': '야간 교통·장소 데이터를 활용한 모바일 서비스 개발',
      'frontend-developer': '야간 교통과 장소 데이터를 지도에 보여주고, 이동 중 한 손으로도 경로를 찾을 수 있는 모바일 웹 화면을 구현해 보세요.',
      'mobile-app-developer': '막차와 심야 이동수단을 연결하는 앱 화면을 만들고, 위치 권한을 거부했을 때도 쓸 수 있는 흐름을 설계해 보세요.',
      'data-engineer': '심야 버스와 관광 데이터의 갱신 주기 및 좌표 차이를 정리하고, 지도에 전달할 데이터 형식과 수집 주기를 정해 보세요.',
    },
  },
  {
    title: 'Capture, Explain, Defend — AI Cybersecurity Hackathon',
    organizer: 'AI Builders · GMI Cloud · F5 · NVIDIA',
    audience: '보안·AI에 관심 있는 개발자와 실무자 등. 3~5인 팀 권장, 참가 승인 필요',
    devEventId: 3583,
    officialUrl: 'https://luma.com/aisecurityseoul',
    date: '2026-12-11T13:30:00+09:00',
    dateLabel: '행사 시작',
    recommendations: {
      'security-analyst': '실습 환경에서 관찰한 보안 문제의 증거와 영향을 정리해 대응 보고서를 작성해 보세요.',
      'security-engineer': '주최 측 실습 환경에서 방어 개선안을 적용하고, 개선 전후의 보안 상태를 비교해 보세요.',
      'digital-forensics-analyst': '실습에서 확보한 증거를 관찰 순서와 함께 정리하고, 각 판단을 뒷받침하는 근거를 남겨 보세요.',
    },
  },
  {
    title: 'TripPups AI Game Hackathon 2026',
    organizer: 'Trip-Pups',
    audience: '만 14세 이상 누구나, 개인 또는 팀. 온라인 진행',
    devEventId: 3589,
    officialUrl: 'https://hackon.kr/e/d0c8a7e5',
    date: '2026-12-12T23:59:00+09:00',
    dateLabel: '작품 제출 마감',
    recommendations: {
      'game-programmer': 'Roblox나 Minecraft에서 지역 축제를 소재로 반복 가능한 게임 규칙과 상호작용을 구현하고, 플레이 영상으로 보여주세요.',
      'game-designer': '지역 축제의 특징을 게임 목표·미션·보상으로 바꾸고, 플레이 테스트로 막히는 구간을 찾아 조정해 보세요.',
    },
  },
  {
    title: '2026 HAI! Hecto AI × Wallet Service Challenge',
    organizer: '헥토',
    audience: '학생·일반인 등 누구나, 개인 또는 최대 3인 팀',
    devEventId: 3517,
    officialUrl: 'https://daker.ai/public/hackathons/2026-hai-hecto-ai-challenge',
    date: '2026-12-21T10:00:00+09:00',
    dateLabel: '접수·제출 마감',
    recommendations: {
      'backend-developer': '지갑 API를 활용한 결제·정산 서비스의 상태 흐름을 설계하고, 성공·거절·중복 요청의 처리 기준을 남겨 보세요.',
      'qa-engineer': '월렛 시제품의 승인·거절·연결 끊김 시나리오를 나누고, 기대 결과와 실제 결과를 비교하는 테스트 표를 만들어 보세요.',
    },
  },
  {
    title: '2027 제2회 Superb AI × BDAI Vision AI Hackathon',
    organizer: 'Superb AI · BDAI',
    audience: '대학·대학원생 및 취업 준비생, 개인 또는 최대 4인 팀',
    devEventId: 3608,
    officialUrl: 'https://bdai.co.kr/lectures/contest/18/?section=schedule&tab=overview',
    date: '2027-01-10T23:59:00+09:00',
    dateLabel: '접수 마감',
    recommendations: {
      'ai-engineer': '제조·안전·물류 중 하나를 골라 데이터 준비부터 모델 학습, 평가, 서비스 데모까지 전 과정을 기록해 보세요.',
      'computer-vision-engineer': '산업 현장 이미지에 객체를 라벨링해 탐지 모델을 학습시키고, 조명이나 가림에 따른 오탐·미탐 사례를 비교해 보세요.',
    },
  },
]

const curatedById = new Map(contests.map((contest) => [contest.devEventId, contest]))

function curatedReason({ recommendations }: DevEventContest, careerSlug: string) {
  return Object.hasOwn(recommendations, careerSlug) ? recommendations[careerSlug] : undefined
}

export function getDevEventContests(careerSlug: string, now = Date.now(), live?: readonly DevEventListing[]) {
  const cards = live ? live.flatMap<ContestCard>((listing) => {
    const curated = curatedById.get(listing.devEventId)
    const reason = (curated && curatedReason(curated, careerSlug)) ?? getDevEventMatch(careerSlug, listing)
    if (!reason || (listing.kind === 'RECRUIT' && now < Date.parse(listing.startsAt))) return []

    const dateLabel = listing.kind === 'DATE'
      ? curated?.dateLabel === '작품 제출 마감' ? '작품 제출 마감' : '행사 시작'
      : curated?.dateLabel === '접수·제출 마감' ? '접수·제출 마감' : '접수 마감'
    const eventStart = dateLabel === '행사 시작'

    return [{
      devEventId: listing.devEventId,
      title: listing.title,
      organizer: listing.organizer,
      audience: curated?.audience,
      officialUrl: curated?.officialUrl ?? `https://dev-event.vercel.app/event/detail/${listing.devEventId}`,
      date: eventStart ? listing.startsAt : listing.endsAt,
      dateOnly: !eventStart && listing.endDateOnly,
      dateLabel,
      reason,
      isCurated: Boolean(curated),
    }]
  }) : contests.flatMap<ContestCard>((contest) => {
    const reason = curatedReason(contest, careerSlug)
    return reason ? [{ ...contest, reason, isCurated: true }] : []
  })

  return cards.filter(({ date }) => now < Date.parse(date))
    .sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
}
