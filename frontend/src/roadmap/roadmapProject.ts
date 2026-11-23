export function getRoadmapProject(careerSlug: string, careerName: string) {
  return careerSlug === 'backend-developer'
    ? { title: '게시판 DB 설계 + REST API 구현', description: 'CRUD API 구현, 테스트, GitHub 기록' }
    : { title: `${careerName} 직무 연계 프로젝트`, description: '핵심 역량을 적용한 결과물을 만들고 과정과 결과 기록' }
}
