import { courses } from './courses'

export type CourseConcept = {
  id: string
  name: string
  description: string
}

const dataStructuresConcepts = [
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
] satisfies CourseConcept[]

const dataStructuresCourseIds = new Set(['cs-data-structures', 'sw-data-structures'])

export function getCourseConcepts(courseId: string) {
  if (dataStructuresCourseIds.has(courseId)) return dataStructuresConcepts

  const course = courses.find(({ id }) => id === courseId)
  if (!course) return undefined

  return [
    {
      id: `${courseId}-fundamentals`,
      name: `${course.name}의 핵심 원리`,
      description: `${course.name}을 이해하기 위해 필요한 기본 개념과 동작 원리`,
    },
    {
      id: `${courseId}-components`,
      name: `${course.name}의 주요 구성 요소`,
      description: '핵심 요소의 역할과 요소들이 서로 연결되는 방식',
    },
    {
      id: `${courseId}-problem-solving`,
      name: `${course.name} 문제 해결 방법`,
      description: '배운 내용을 활용해 대표적인 문제를 분석하고 해결하는 과정',
    },
    {
      id: `${courseId}-practice`,
      name: `${course.name}의 실무 활용`,
      description: '실제 서비스와 프로젝트에서 개념이 적용되는 사례',
    },
  ] satisfies CourseConcept[]
}
