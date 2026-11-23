import type { CourseConcept } from './courseConcepts'

type AnalysisExample = {
  title: string
  description: string
  topic: string
}

export type ConceptAnalysis = {
  title: string
  examples: readonly AnalysisExample[]
  recommendation: string
  steps: readonly string[]
}

export const conceptAnalyses: Record<string, ConceptAnalysis> = {
  lists: {
    title: '배열과 연결 리스트는 실무에서 이렇게 활용돼요',
    examples: [
      {
        title: '상품 목록 화면',
        description: '상품 데이터를 배열에 순서대로 담아 화면에 표시하고, 위치를 기준으로 필요한 항목을 바로 읽어요.',
        topic: '순서와 인덱스',
      },
      {
        title: '최근 사용 항목 캐시',
        description: '해시 맵으로 항목을 찾고 이중 연결 리스트로 최근 사용 순서를 관리해, 오래 쓰지 않은 항목을 빠르게 지워요.',
        topic: 'LRU 캐시',
      },
      {
        title: '오디오 샘플 처리',
        description: '연속된 오디오 샘플을 배열에 담고 구간별 신호의 크기를 계산해 파형을 표시해요.',
        topic: '연속 데이터',
      },
    ],
    recommendation: '배열과 연결 리스트의 접근·삽입 비용을 비교하고 최근 사용 항목 캐시를 만들어 보세요.',
    steps: [
      '배열과 연결 리스트에서 인덱스 조회, 삽입, 삭제에 드는 시간을 비교해 보세요.',
      '이중 연결 리스트의 노드를 맨 앞으로 옮기는 연산을 구현해 보세요.',
      '해시 맵을 결합해 용량을 초과하면 가장 오래 쓰지 않은 항목을 제거하는 캐시를 만들어 보세요.',
    ],
  },
  'stacks-queues': {
    title: '스택과 큐는 실무에서 이렇게 활용돼요',
    examples: [
      {
        title: '문서 편집기 실행 취소',
        description: '수정 내역을 스택에 쌓고, 실행 취소를 누르면 가장 최근에 한 수정부터 되돌려요.',
        topic: '후입선출',
      },
      {
        title: '알림 발송 대기열',
        description: '발송 요청을 큐에 담아 두고 작업자가 차례대로 가져가도록 해, 한꺼번에 요청이 몰려도 처리할 수 있어요.',
        topic: '비동기 작업',
      },
      {
        title: '코드의 괄호 검사',
        description: '여는 괄호를 스택에 담고 닫는 괄호를 만날 때마다 짝을 확인해 중첩 오류를 찾아요.',
        topic: '중첩 검사',
      },
    ],
    recommendation: '스택으로 실행 취소를 만들고 큐로 발송 요청을 처리하는 미니 프로젝트를 해 보세요.',
    steps: [
      '스택과 큐의 저장 및 꺼내기 순서를 같은 입력으로 비교해 보세요.',
      '수정 내역을 스택에 저장하는 간단한 메모장을 만들어 보세요.',
      '여러 발송 요청을 큐에 넣고 하나씩 처리하는 작업자를 구현해 보세요.',
    ],
  },
  'trees-graphs': {
    title: '그래프 탐색은 실무에서 이렇게 활용돼요',
    examples: [
      {
        title: 'SNS 친구 추천',
        description: '사용자와 친구 관계를 그래프로 표현하고, 연결 관계를 분석해 새로운 친구를 추천해요.',
        topic: '관계 네트워크',
      },
      {
        title: '지도 길 찾기',
        description: '장소를 정점으로, 이동 경로를 간선으로 표현해 목적지까지의 경로를 탐색해요.',
        topic: '경로 탐색',
      },
      {
        title: '웹 페이지 연결 분석',
        description: '페이지 간 링크 구조를 분석해 정보의 연결 관계와 중요도를 파악해요.',
        topic: '링크 분석',
      },
    ],
    recommendation: '그래프 탐색 알고리즘을 더 이해하고, 간단한 친구 추천 프로젝트를 만들어 보세요.',
    steps: [
      '폴더 계층을 트리로, 친구 관계를 인접 리스트 그래프로 표현해 보세요.',
      '같은 그래프에서 너비 우선 탐색(BFS)과 깊이 우선 탐색(DFS)의 방문 순서를 비교해 보세요.',
      '두 단계 안에 연결된 사용자 중 이미 친구인 사람을 걸러내고, 공통 친구 수로 추천 순위를 매겨 보세요.',
    ],
  },
  'sorting-search': {
    title: '정렬과 탐색은 실무에서 이렇게 활용돼요',
    examples: [
      {
        title: '쇼핑 상품 정렬',
        description: '가격, 판매량, 등록일 같은 기준에 맞춰 상품을 정렬해 사용자가 원하는 순서로 비교할 수 있게 해요.',
        topic: '다중 정렬 기준',
      },
      {
        title: '시계열 로그 탐색',
        description: '시간순으로 정렬한 로그에서 이진 탐색으로 원하는 시간 범위의 시작과 끝을 빠르게 찾아요.',
        topic: '이진 탐색',
      },
      {
        title: '인기 검색어 집계',
        description: '검색 빈도를 집계하고 상위 항목만 골라 실시간 인기 검색어 목록을 만들어요.',
        topic: '상위 K개 선택',
      },
    ],
    recommendation: '여러 정렬 기준과 이진 탐색을 적용해 상품을 좁혀 보는 검색 화면을 만들어 보세요.',
    steps: [
      '상품 목록을 가격순과 등록일순으로 정렬해 보세요.',
      '정렬된 가격 목록에서 검색 범위의 시작과 끝을 이진 탐색으로 찾아보세요.',
      '상품 수를 늘리며 순차 검색과 이진 탐색의 비교 횟수를 측정해 보세요.',
    ],
  },
}

export function getConceptAnalysis(concept: CourseConcept): ConceptAnalysis {
  const savedAnalysis = conceptAnalyses[concept.id]
  if (savedAnalysis) return savedAnalysis

  return {
    title: `${concept.name}은 실무에서 이렇게 활용돼요`,
    examples: [
      {
        title: '서비스 기능 설계',
        description: `${concept.name}의 원리를 활용해 사용자 요구사항을 기능과 데이터 흐름으로 구체화해요.`,
        topic: '서비스 설계',
      },
      {
        title: '문제 원인 분석',
        description: `${concept.name}의 핵심 요소를 기준으로 문제의 원인을 나누고 해결 방법을 비교해요.`,
        topic: '문제 해결',
      },
      {
        title: '프로젝트 구현',
        description: `작은 프로젝트에 ${concept.name}을 적용하고 결과를 측정하며 개선해요.`,
        topic: '프로젝트 실습',
      },
    ],
    recommendation: `${concept.name}의 기본 원리를 익힌 뒤 작은 예제 프로젝트에 직접 적용해 보세요.`,
    steps: [
      `${concept.name}의 핵심 용어와 동작 과정을 정리해 보세요.`,
      '대표 예제를 따라 만들며 각 요소가 하는 일을 확인해 보세요.',
      '직접 정한 문제에 개념을 적용하고 결과를 기록해 보세요.',
    ],
  }
}
