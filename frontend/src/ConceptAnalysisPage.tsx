import { useEffect, useRef, useState } from 'react'
import ConceptHeader from './ConceptHeader'
import { getConceptAnalysis } from './conceptAnalysis'
import type { CourseConcept } from './courseConcepts'
import './ConceptAnalysisPage.css'

type ConceptAnalysisPageProps = {
  courseName: string
  concepts: readonly CourseConcept[]
  selectionHref: string
}

const roleDescriptions: Record<string, string> = {
  '프론트엔드 개발자': '사용자가 직접 보는 웹 화면을 만들고, 데이터와 사용자 동작을 빠르고 편리한 경험으로 연결해요.',
  '백엔드 개발자': '서비스의 API와 데이터 처리 로직을 설계하고, 서버가 안정적으로 동작하도록 관리해요.',
  '오디오 소프트웨어 개발자': '소리 데이터를 처리·분석하고 녹음, 재생, 편집 기능을 소프트웨어로 구현해요.',
  '개발 도구 엔지니어': '개발자가 더 빠르고 안전하게 일할 수 있도록 편집기, 빌드, 테스트 도구를 만들어요.',
  '데이터 엔지니어': '많은 데이터를 안정적으로 수집·저장·가공해 분석과 서비스에서 사용할 수 있게 해요.',
  '검색·추천 시스템 개발자': '사용자의 의도와 행동 데이터를 분석해 가장 관련성 높은 결과를 빠르게 보여줘요.',
  '소프트웨어 개발자': '사용자의 문제를 분석하고 요구사항을 실제로 동작하는 프로그램으로 구현해요.',
  '서비스 기획자': '사용자 문제와 사업 목표를 연결해 서비스 기능, 정책, 화면 흐름을 설계해요.',
  '데이터 분석가': '데이터에서 의미 있는 패턴을 찾고 의사결정에 필요한 인사이트를 전달해요.',
}

type RoleLearningPlan = { summary: string; steps: [string, string, string] }

function getRoleLearningPlan(role: string, courseName: string, conceptNames: string): RoleLearningPlan {
  const plans: Record<string, RoleLearningPlan> = {
    '프론트엔드 개발자': {
      summary: '사용자의 화면과 상호작용에 개념을 적용하는 연습이 중요해요. 상태 변화와 화면 성능을 함께 확인해 보세요.',
      steps: [`${conceptNames}을 브라우저의 상태 관리와 화면 렌더링 관점에서 다시 정리해 보세요.`, '검색·정렬·되돌리기 기능이 있는 작은 웹 화면을 구현하고 사용자 입력에 따른 변화를 확인해 보세요.', '구현 이유와 성능 개선 과정을 README에 정리해 인터랙티브 웹 프로젝트로 완성해 보세요.'],
    },
    '백엔드 개발자': {
      summary: '많은 요청과 데이터를 안정적으로 처리할 수 있도록 성능, 동시성, 데이터 흐름을 중심으로 학습해 보세요.',
      steps: [`${conceptNames}의 조회·삽입·삭제 비용을 비교하고 서버에서 어떤 상황에 쓰이는지 정리해 보세요.`, 'REST API에 캐시, 작업 큐 또는 검색 기능을 적용하고 요청량이 늘어날 때의 성능을 측정해 보세요.', 'API 문서와 부하 테스트 결과를 포함한 서버 프로젝트를 만들어 보세요.'],
    },
    '오디오 소프트웨어 개발자': {
      summary: '연속적으로 들어오는 소리 데이터를 빠르게 처리하는 방법과 지연 시간을 줄이는 연습이 필요해요.',
      steps: [`${conceptNames}을 오디오 샘플의 순서, 버퍼, 실시간 처리 관점에서 학습해 보세요.`, '소리 파형 구간을 저장하고 재생 순서를 제어하는 간단한 오디오 편집 기능을 구현해 보세요.', '처리 지연과 메모리 사용량을 측정한 오디오 도구 프로젝트로 정리해 보세요.'],
    },
    '개발 도구 엔지니어': {
      summary: '개발자의 반복 작업을 줄이고 오류를 빠르게 발견할 수 있는 자동화 도구로 개념을 연결해 보세요.',
      steps: [`${conceptNames}을 명령 기록, 작업 순서, 의존성 관리에 어떻게 적용할지 정리해 보세요.`, '실행 취소, 작업 대기열 또는 코드 구조 분석 기능이 있는 작은 개발 도구를 만들어 보세요.', '설치 방법과 사용 전후의 작업 시간 차이를 문서화해 도구 프로젝트로 공개해 보세요.'],
    },
    '데이터 엔지니어': {
      summary: '대용량 데이터의 수집 순서와 저장 구조를 설계하고, 처리 실패에도 복구 가능한 흐름을 연습해 보세요.',
      steps: [`${conceptNames}을 데이터 파이프라인의 저장·조회·처리 순서와 연결해 정리해 보세요.`, '여러 파일의 데이터를 수집해 정제하고 적절한 구조로 저장하는 배치 파이프라인을 구현해 보세요.', '처리량, 실패 재시도, 데이터 품질 결과를 포함한 파이프라인 프로젝트를 완성해 보세요.'],
    },
    '검색·추천 시스템 개발자': {
      summary: '빠른 탐색과 관련성 높은 결과를 만들기 위해 알고리즘의 정확도와 응답 속도를 함께 비교해 보세요.',
      steps: [`${conceptNames}을 인덱싱, 그래프 탐색, 순위 계산 관점에서 다시 학습해 보세요.`, '사용자 행동 데이터를 이용해 검색 결과나 콘텐츠 추천 순위를 만드는 기능을 구현해 보세요.', '추천 기준과 정확도·응답 시간 평가를 포함한 검색 또는 추천 프로젝트로 정리해 보세요.'],
    },
    '서비스 기획자': {
      summary: '기술 개념을 사용자 문제와 기능 정책으로 번역하고 개발자와 명확히 소통하는 연습을 해보세요.',
      steps: [`${conceptNames}이 서비스 기능과 사용자 경험에 미치는 영향을 쉬운 언어로 정리해 보세요.`, '이 개념이 필요한 기능을 정해 사용자 흐름, 예외 상황, 데이터 요구사항을 기획서로 작성해 보세요.', '화면 흐름과 기능 명세가 포함된 서비스 제안서 또는 프로토타입을 완성해 보세요.'],
    },
    '데이터 분석가': {
      summary: '데이터를 올바르게 정리하고 탐색해 의사결정에 도움이 되는 근거로 전달하는 연습이 중요해요.',
      steps: [`${conceptNames}을 데이터 정제, 탐색, 집계 과정과 연결해 정리해 보세요.`, '공개 데이터를 불러와 질문을 정하고 분석한 뒤 표와 차트로 핵심 패턴을 확인해 보세요.', '분석 과정과 결론, 한계가 담긴 대시보드 또는 분석 보고서를 완성해 보세요.'],
    },
  }
  return plans[role] ?? {
    summary: `${role} 업무에서 ${courseName} 개념을 실제 문제에 적용할 수 있도록 기초부터 프로젝트까지 연결해 보세요.`,
    steps: [`${conceptNames}의 핵심 원리와 주요 용어를 직무 관점에서 정리해 보세요.`, `${role}가 자주 만나는 문제를 골라 ${courseName} 개념으로 해결해 보세요.`, '문제 정의, 구현 과정, 결과를 기록해 작은 포트폴리오로 완성해 보세요.'],
  }
}

export default function ConceptAnalysisPage({ courseName, concepts, selectionHref }: ConceptAnalysisPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const analyses = concepts.map((concept) => ({
    id: concept.id,
    name: concept.name,
    ...getConceptAnalysis(concept),
  }))
  const primaryAnalysis = analyses[0]
  const multipleConcepts = analyses.length > 1
  const roles = [...new Set(analyses.flatMap(({ roles }) => roles))]
  const activeRole = selectedRole || roles[0]
  const activePlan = getRoleLearningPlan(activeRole, courseName, concepts.map(({ name }) => name).join('·'))
  const ExampleHeading = multipleConcepts ? 'h4' : 'h3'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="concept-page analysis-page">
      <ConceptHeader />

      <main className="analysis-content">
        <nav className="concept-breadcrumb" aria-label="현재 위치">
          <a href="#explore">전공 탐색</a>
          <span aria-hidden="true">/</span>
          <a href={selectionHref}>{courseName}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">분석 결과</span>
        </nav>

        <header className="analysis-intro">
          <h1 ref={titleRef} tabIndex={-1}>
            {multipleConcepts ? '선택한 개념은 실무에서 이렇게 활용돼요' : primaryAnalysis.title}
          </h1>
          <p>선택한 개념이 실제 서비스와 직무에서 어떻게 쓰이는지 정리했어요.</p>
        </header>

        <section className="analysis-examples" aria-labelledby="analysis-examples-title">
          <h2 id="analysis-examples-title">실무 활용 사례</h2>
          {analyses.map(({ id, name, examples }) => (
            <div className="analysis-example-group" key={id}>
              {multipleConcepts && <h3>{name}</h3>}
              <ul className="analysis-example-grid">
                {examples.map(({ title, description, topic }) => (
                  <li className="analysis-example" key={title}>
                    <ExampleHeading>{title}</ExampleHeading>
                    <p>{description}</p>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="analysis-roles" aria-labelledby="analysis-roles-title">
          <h2 id="analysis-roles-title">관련 직무</h2>
          <p>관심 있는 직무를 선택하면 그 직무에 맞는 다음 학습 내용을 볼 수 있어요.</p>
          <div className="analysis-role-list" role="list">
            {roles.map((role) => (
              <button
                type="button"
                role="listitem"
                className={activeRole === role ? 'active' : ''}
                aria-pressed={activeRole === role}
                onClick={() => setSelectedRole(role)}
                key={role}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="analysis-role-description" aria-live="polite">
            <strong>{activeRole}</strong>
            <p>{roleDescriptions[activeRole] ?? `${activeRole}는 배운 전공 개념을 활용해 서비스의 문제를 분석하고 해결하는 직무예요.`}</p>
          </div>
        </section>

        <section className="analysis-roadmap" aria-labelledby="analysis-roadmap-title">
          <div className="analysis-roadmap-summary">
            <div>
              <span className="analysis-roadmap-role">{activeRole} 맞춤 추천</span>
              <h2 id="analysis-roadmap-title">다음으로 학습하면 좋은 내용</h2>
              <p>{activePlan.summary}</p>
            </div>
          </div>

          <div className="analysis-roadmap-steps" id="analysis-roadmap-steps" aria-live="polite">
            <ol>
              {activePlan.steps.map((step, index) => (
                <li key={step}>
                  <strong>{index === 0 ? '개념 다지기' : index === 1 ? '직무 예제' : '포트폴리오'}</strong>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}
