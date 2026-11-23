import { useId, useState } from 'react'
import type { RoadmapResponse } from './contracts'

function stageTitle(title: string) {
  return title.replace(/^\s*\d+\s*단계\s*[:：.-]\s*/, '').trim() || title
}

export default function RoadmapGuide({ roadmap }: { roadmap: RoadmapResponse }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const panelId = useId()
  const step = roadmap.steps[selectedIndex] ?? roadmap.steps[0]
  if (!step) return null
  const { details } = step

  return (
    <div className="ai-guide">
      <ol className="ai-guide-stages" aria-label="학습 단계 선택">
        {roadmap.steps.map((stage, index) => (
          <li key={index}>
            <button type="button" className="ai-guide-stage" aria-pressed={selectedIndex === index}
              aria-controls={panelId} onClick={() => setSelectedIndex(index)}>
              <span className="ai-guide-stage-meta">
                <span>{index + 1}단계</span>
                {stage.details && <span>약 {stage.details.weeks}주</span>}
              </span>
              <strong>{stageTitle(stage.title)}</strong>
            </button>
          </li>
        ))}
      </ol>

      <div id={panelId} className="ai-guide-panel" aria-labelledby={`${panelId}-heading`}>
        <header className="ai-guide-overview">
          <h3 id={`${panelId}-heading`}>{stageTitle(step.title)}</h3>
          {details && <p className="ai-guide-outcome"><strong>단계 목표</strong> {details.outcome}</p>}
          <ul className="ai-guide-goals" aria-label="학습 목표">
            {step.learningGoals.map((goal, index) => <li key={index}>{goal}</li>)}
          </ul>
        </header>

        <div className="ai-guide-grid">
          <section className="ai-guide-card ai-guide-courses">
            <h4>추천 과목</h4>
            {step.recommendedCourses.length ? (
              <ul className="ai-guide-items">
                {step.recommendedCourses.map(({ course, reason, application }, index) => (
                  <li key={index}>
                    <h5>{course.name}</h5>
                    <p>{reason}</p>
                    {application && <p><strong>프로젝트에 적용</strong> {application}</p>}
                  </li>
                ))}
              </ul>
            ) : <p>이 단계의 추가 추천 과목이 없어요.</p>}
          </section>

          {step.practiceProjects.length > 0 && (
            <section className="ai-guide-card ai-guide-projects">
              <h4>만들 프로젝트</h4>
              <ul className="ai-guide-items">
                {step.practiceProjects.map(({ title, description, plan }, index) => (
                  <li key={index}>
                    <h5>{title}</h5>
                    <p>{description}</p>
                    {plan && (
                      <>
                        <ol className="ai-guide-actions" aria-label="구현 순서">
                          {plan.tasks.map((task, taskIndex) => <li key={taskIndex}>{task}</li>)}
                        </ol>
                        <dl className="ai-guide-facts">
                          <div><dt>산출물</dt><dd>{plan.deliverable}</dd></div>
                          <div><dt>완료 기준</dt><dd>{plan.doneWhen}</dd></div>
                        </dl>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {details && (
            <>
              <section className="ai-guide-card ai-guide-competitions">
                <h4>도전할 공모전</h4>
                <h5>{details.competition.type}</h5>
                <dl className="ai-guide-facts">
                  <div><dt>제출 아이디어</dt><dd>{details.competition.submission}</dd></div>
                  <div><dt>공고 체크</dt><dd>{details.competition.whatToCheck}</dd></div>
                  <div><dt>검색어</dt><dd>{details.competition.query}</dd></div>
                </dl>
                <a className="ai-guide-search" href={`https://search.naver.com/search.naver?query=${encodeURIComponent(details.competition.query)}`}
                  target="_blank" rel="noreferrer">공고 검색 <span aria-hidden="true">↗</span></a>
              </section>

              <section className="ai-guide-card ai-guide-experience">
                <h4>쌓을 실무 경험</h4>
                <h5>{details.experience.setting}</h5>
                <ol className="ai-guide-actions" aria-label="실무 경험을 위한 실행 순서">
                  {details.experience.actions.map((action, index) => <li key={index}>{action}</li>)}
                </ol>
                <dl className="ai-guide-facts">
                  <div><dt>남길 기록</dt><dd>{details.experience.evidence}</dd></div>
                </dl>
              </section>
            </>
          )}
        </div>

        {details && (
          <div className="ai-guide-sources" aria-label="공모전 공식 확인처">
            <strong>공식 공고 확인처</strong>
            <a href="https://www.swuniv.kr/60" target="_blank" rel="noreferrer">AI·SW중심대학협의회</a>
            <a href="https://www.data.go.kr/suc/startup.do" target="_blank" rel="noreferrer">공공데이터 활용 경진대회</a>
          </div>
        )}
      </div>
    </div>
  )
}
