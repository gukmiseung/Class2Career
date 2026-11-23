export type DevEventListing = {
  devEventId: number
  title: string
  organizer: string
  startsAt: string
  endsAt: string
  endDateOnly: boolean
  kind: 'RECRUIT' | 'DATE'
  tags: string[]
}

const careerMatches: Readonly<Partial<Record<string, readonly [RegExp, string]>>> = {
  'frontend-developer': [/프론트엔드|\bfrontend\b|웹\s*(?:앱|서비스|개발)|공공\s*데이터|프로토타입|\bMVP\b/i, '검색·필터와 사용자의 핵심 동선을 구현하고, 모바일 화면과 오류 상태까지 보여주는 데모를 만들어 보세요.'],
  'backend-developer': [/백엔드|\bbackend\b|\bAPI\b|웹\s*(?:앱|서비스|개발)|풀스택|공공\s*데이터|정산|월렛/i, '서비스에 필요한 API와 데이터 구조를 설계하고, 정상 응답과 실패 응답의 테스트 결과를 남겨 보세요.'],
  'ai-engineer': [/\bAI\b|인공지능|머신러닝|딥러닝|\bLLM\b|\bRAG\b|프롬프톤/i, '과제에 맞는 모델을 고르고, 성공 기준과 대표 실패 사례를 함께 기록해 보세요.'],
  'data-analyst': [/공공\s*데이터|데이터\s*(?:분석|활용|시각화)|통계|대시보드|\banalytics\b/i, '공고 주제와 관련된 지표를 고르고, 데이터에서 확인한 패턴과 개선안을 차트로 설명해 보세요.'],
  'ui-ux-designer': [/\b(?:UI|UX|MVP)\b|프로토타입|서비스\s*(?:기획|디자인)|사용자\s*경험|접근성/i, '참가 과제의 사용자 흐름을 설계하고, 사용성 테스트에서 찾은 문제와 수정 전후 화면을 기록해 보세요.'],
  'cloud-engineer': [/클라우드|\bcloud\b|쿠버네티스|\b(?:kubernetes|k8s)\b/i, '클라우드에서 데모를 배포하고, 서비스 구성도와 부하를 측정한 결과를 남겨 보세요.'],
  'mobile-app-developer': [/모바일|앱\s*(?:개발|서비스|공모전)|\b(?:android|ios|flutter)\b/i, '핵심 기능을 모바일에서 구현하고, 권한 거부나 네트워크 연결이 끊긴 상태에서도 동작하는지 확인해 보세요.'],
  'game-programmer': [/게임|로블록스|마인크래프트|\b(?:game|roblox|minecraft|unity|unreal)\b/i, '핵심 게임 규칙을 구현하고, 조작과 피드백이 드러나는 플레이 영상을 남겨 보세요.'],
  'systems-software-developer': [/시스템\s*(?:소프트웨어|통합)|운영체제|커널|컴파일러|\b(?:kernel|compiler)\b/i, '주요 모듈 간 인터페이스를 정의하고, 상태 전환과 오류 복구를 검증해 보세요.'],
  'embedded-software-developer': [/임베디드|펌웨어|마이크로컨트롤러|로봇|\b(?:embedded|firmware|robotics)\b/i, '센서 입력과 제어 출력을 연결하고, 입력이 달라질 때 동작의 안정성을 비교해 보세요.'],
  'iot-developer': [/사물인터넷|센서|스마트(?:시티|도시)|\bIoT\b/i, '기기에서 수집한 데이터를 서비스로 전달하고, 연결 지연이나 누락이 생겼을 때의 동작을 기록해 보세요.'],
  'qa-engineer': [/\bQA\b|품질\s*(?:보증|검증)|테스트\s*자동화|\b(?:testing|quality assurance)\b/i, '과제의 주요 사용 흐름별 기대 결과를 정의하고, 재현 절차와 검증 결과를 테스트 표에 남겨 보세요.'],
  'xr-developer': [/실감형|가상현실|증강현실|\b(?:XR|AR|VR)\b/i, '사용자의 위치나 동작과 연동되는 장면을 만들고, 인터랙션을 영상으로 시연해 보세요.'],
  'blockchain-developer': [/블록체인|스마트\s*(?:계약|컨트랙트)|온체인|\b(?:blockchain|web3|on-chain|defi)\b/i, '공모 주제에 맞는 거래 상태와 스마트 계약의 역할을 정의하고, 검증 결과와 데모를 기록해 보세요.'],
  'data-engineer': [/공공\s*데이터|데이터\s*(?:수집|파이프라인|엔지니어링)|\b(?:ETL|data engineering)\b/i, '서로 다른 데이터의 시간·단위·필드 형식을 맞추고, 누락과 중복 검증을 파이프라인에 포함해 보세요.'],
  'data-scientist': [/공공\s*데이터|머신러닝|데이터\s*(?:분석|과학)|예측|\bdata science\b/i, '데이터에서 검증할 가설을 정하고, 비교 기준과 평가 지표를 명시해 결과를 설명해 보세요.'],
  'database-developer': [/데이터베이스|\b(?:database|postgresql|SQL|DBMS)\b/i, '공모 과제의 데이터 관계를 정리하고, 핵심 조회의 쿼리 성능을 변경 전후로 비교해 보세요.'],
  'nlp-engineer': [/자연어|언어모델|챗봇|프롬프톤|\b(?:LLM|NLP|RAG|AutoRAG|prompt-thon)\b/i, '언어 모델의 입력과 답변 평가 기준을 정하고, 잘못된 답변 사례를 모아 개선 전후를 비교해 보세요.'],
  'computer-vision-engineer': [/컴퓨터\s*비전|영상\s*(?:인식|분석)|객체\s*탐지|\b(?:computer vision|vision ai)\b/i, '영상 데이터에 기준을 정해 라벨을 붙이고, 조명이나 가림에 따른 오탐·미탐을 비교해 보세요.'],
  'game-designer': [/게임|로블록스|마인크래프트|\b(?:game|roblox|minecraft)\b/i, '주제를 게임 목표와 미션으로 바꾸고, 플레이 테스트를 통해 난이도와 보상을 조정해 보세요.'],
  'web-service-planner': [/서비스\s*(?:기획|디자인)|웹\s*(?:앱|서비스)|창업\s*아이디어|\bMVP\b/i, '해결할 사용자의 문제를 정하고, 검증할 가설과 첫 버전의 기능 우선순위를 기획안으로 작성해 보세요.'],
  'network-engineer': [/네트워크|통신망|라우팅|\b(?:network|networking|routing)\b/i, '서비스 연결 구조를 그린 뒤 정상 상태와 연결 장애 때의 지연·복구 결과를 비교해 보세요.'],
  'systems-architect': [/시스템\s*(?:설계|통합|아키텍처)|\b(?:system architecture|FDE)\b/i, '업무 요구사항을 정리하고, 기존 시스템과 새 기능이 연결되는 방식과 검증 기준을 설계해 보세요.'],
  'devops-engineer': [/데브옵스|배포\s*자동화|쿠버네티스|\b(?:devops|ci\/cd|kubernetes|k8s|mlops)\b/i, '팀의 빌드·테스트·배포 과정을 자동화하고, 다른 팀원이 그대로 재현할 수 있는 절차를 남겨 보세요.'],
  'systems-administrator': [/서버\s*운영|시스템\s*운영|인프라\s*(?:운영|관측)|\b(?:linux|sre|observability)\b/i, '서비스 상태를 관측하고, 장애 발생 시 점검 순서와 복구 기준을 운영 문서로 남겨 보세요.'],
  'security-analyst': [/보안|위협\s*탐지|침해\s*사고|\b(?:security|cybersecurity|SOC)\b/i, '공개 과제나 주최 측 환경에서 관찰한 보안 위험과 대응 근거를 분석 보고서로 정리해 보세요.'],
  'security-engineer': [/보안|암호화|접근\s*제어|\b(?:security|cybersecurity)\b/i, '보호가 필요한 데이터와 동작을 정리하고, 권한 검증이나 방어 개선의 테스트 결과를 남겨 보세요.'],
  'digital-forensics-analyst': [/포렌식|디지털\s*증거|사고\s*조사|\b(?:forensics|dfir)\b/i, '제공된 증거를 관찰 순서대로 정리하고, 각 판단을 뒷받침하는 기록을 보고서에 연결해 보세요.'],
}

export function getDevEventMatch(careerSlug: string, { title, tags }: DevEventListing) {
  const rule = Object.hasOwn(careerMatches, careerSlug) ? careerMatches[careerSlug] : undefined
  return rule?.[0].test([title, ...tags].join(' ')) ? rule[1] : undefined
}
