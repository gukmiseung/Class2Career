export type CourseConcept = {
  id: string
  name: string
  description: string
}

const dataStructuresConcepts: readonly CourseConcept[] = [
  {
    id: 'lists',
    name: '배열과 연결 리스트',
    description: '데이터를 저장하고 순서대로 관리하는 방법',
  },
  {
    id: 'stacks-queues',
    name: '스택과 큐',
    description: '데이터의 삽입과 삭제 순서를 관리하는 구조',
  },
  {
    id: 'trees-graphs',
    name: '트리와 그래프',
    description: '데이터 사이의 계층 및 연결 관계를 표현하는 구조',
  },
  {
    id: 'sorting-search',
    name: '정렬과 탐색',
    description: '데이터를 효율적으로 정리하고 찾는 알고리즘',
  },
]

const dataStructuresCourseIds = new Set(['cs-data-structures', 'sw-data-structures'])

export function getCourseConcepts(courseId: string) {
  return dataStructuresCourseIds.has(courseId) ? dataStructuresConcepts : undefined
}
