import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import weeklyPlanIllustration from '../assets/weekly-plan.jpg'
import { getRoadmapProject } from './roadmapProject'

const backendTasks = [
  {
    id: 'compare-languages',
    title: '같은 문제를 Python · C · Java로 풀기',
    description: '언어별 자료구조 사용 방식과 구현 차이 정리',
    deliverable: '코드 3개 + 비교 메모',
  },
  {
    id: 'publish-code',
    title: 'GitHub에 코드와 README 올리기',
    description: '실행 방법, 해결 과정, 배운 점을 문서화',
    deliverable: '저장소 링크',
  },
  {
    id: 'specify-api',
    title: '게시판 CRUD API 명세 작성하기',
    description: '생성·조회·수정·삭제 요청과 응답 구조 정의',
    deliverable: 'API 명세 초안',
  },
  {
    id: 'compare-jobs',
    title: '백엔드 채용 공고 2개 비교하기',
    description: '공통 요구 기술과 필요한 프로젝트 경험 확인',
    deliverable: '요구 역량 비교표',
  },
]

function getTasks(careerSlug: string, careerName: string) {
  if (careerSlug === 'backend-developer') return backendTasks

  const project = getRoadmapProject(careerSlug, careerName)
  return [
    {
      id: 'review-courses',
      title: '직무 관련 전공 개념 하나 복습하기',
      description: '전공 수업에서 배운 개념과 직무에 적용할 수 있는 사례 정리',
      deliverable: '개념과 적용 사례 메모',
    },
    {
      id: 'plan-project',
      title: '직무 연계 프로젝트 기획하기',
      description: `${project.title}의 목표와 이번 주에 구현할 기능 정리`,
      deliverable: '프로젝트 계획서 초안',
    },
    {
      id: 'record-work',
      title: '작업 과정과 결과 정리하기',
      description: '시도한 방법과 결과, 다음에 개선할 부분을 문서화',
      deliverable: '작업 기록 또는 포트폴리오 초안',
    },
    {
      ...backendTasks[3],
      title: `${careerName} 채용 공고 2개 비교하기`,
    },
  ]
}

type Task = (typeof backendTasks)[number]

function TaskChecklist({ tasks, storageKey }: { tasks: Task[]; storageKey: string }) {
  const [checked, setChecked] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
      return Array.isArray(stored) ? tasks.filter(({ id }) => stored.includes(id)).map(({ id }) => id) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked))
    } catch {
      // The checklist remains interactive when browser storage is unavailable.
    }
  }, [checked, storageKey])

  return (
    <section className="roadmap-checklist" aria-labelledby="roadmap-checklist-title">
      <h2 id="roadmap-checklist-title">목표를 위해 할 일</h2>
      <p role="status">{tasks.length}개 활동 · 예시 기준 {checked.length}개 완료</p>
      <progress className="roadmap-week-progress" value={checked.length} max={tasks.length} aria-label="실행 과제 진행률" />
      <ul className="roadmap-task-list">
        {tasks.map(({ id, title, description, deliverable }) => (
          <li key={id}>
            <label className="roadmap-task">
              <input
                type="checkbox"
                checked={checked.includes(id)}
                aria-labelledby={`task-title-${id}`}
                aria-describedby={`task-description-${id} task-result-${id}`}
                onChange={(event) => {
                  const selected = event.currentTarget.checked
                  setChecked((previous) => selected ? [...previous, id] : previous.filter((item) => item !== id))
                }}
              />
              <span>
                <strong id={`task-title-${id}`}>{title}</strong>
                <span id={`task-description-${id}`}>{description}</span>
                <span className="roadmap-task-result" id={`task-result-${id}`}>남길 결과물: {deliverable}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function WeeklyPlan({ careerSlug, careerName, roadmapHref, contestsHref }: {
  careerSlug: string
  careerName: string
  roadmapHref: string
  contestsHref: string
}) {
  const { user, loading } = useAuth()
  const storageKey = `c2c:weekly-plan:${careerSlug}:${user?.id ?? 'guest'}`

  return (
    <>
      <header className="roadmap-heading">
        <h1>목표를 향한 다음 한 걸음</h1>
        <p>작은 실행 과제를 통해 눈에 보이는 성과를 만들어 보세요.</p>
      </header>
      <div className="roadmap-week-layout">
        {loading ? <section className="roadmap-checklist"><p role="status">실행 계획을 불러오고 있어요.</p></section> : (
          <TaskChecklist key={storageKey} storageKey={storageKey} tasks={getTasks(careerSlug, careerName)} />
        )}
        <div className="roadmap-week-side">
          <img className="roadmap-week-illustration" src={weeklyPlanIllustration} alt="" width="840" height="840" decoding="async" />
          <nav className="roadmap-week-actions" aria-label="실행 계획 페이지 이동">
            <a className="roadmap-button roadmap-button--secondary" href={roadmapHref}>
              <span aria-hidden="true">←</span> 이전으로 돌아가기
            </a>
            <a className="roadmap-button" href={contestsHref}>직무 관련 공모전 바로가기</a>
          </nav>
        </div>
      </div>
    </>
  )
}
