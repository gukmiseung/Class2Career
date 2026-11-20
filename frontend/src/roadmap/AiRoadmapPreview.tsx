import { useRef, useState } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { RoadmapResponse } from './contracts'

type PreviewState =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; roadmap: RoadmapResponse }
  | { status: 'error'; message: string }

function previewError(error: unknown): string {
  if (error instanceof FunctionsHttpError) {
    if (error.context.status === 401) return '세션이 만료되었습니다. 다시 로그인해 주세요.'
    if (error.context.status === 403) return 'AI 로드맵 테스트 접근 권한이 없습니다.'
    if (error.context.status === 409) return '로드맵 생성에 필요한 데이터가 아직 준비되지 않았습니다.'
  }
  return 'AI 로드맵을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function RoadmapGenerator() {
  const [state, setState] = useState<PreviewState>({ status: 'idle' })
  const inFlight = useRef(false)

  async function generate() {
    if (inFlight.current) return
    inFlight.current = true
    setState({ status: 'loading' })

    try {
      const { data, error } = await supabase.functions.invoke<RoadmapResponse>('generate-roadmap', {
        body: { careerId: 'backend-developer' },
      })
      if (error) throw error
      if (!Array.isArray(data?.steps) || !data.steps.length) throw new Error('Missing roadmap steps')
      setState({ status: 'success', roadmap: data })
    } catch (error) {
      setState({ status: 'error', message: previewError(error) })
    } finally {
      inFlight.current = false
    }
  }

  return (
    <>
      <button type="button" onClick={generate} disabled={state.status === 'loading'}>
        {state.status === 'loading' ? 'AI 로드맵 생성 중…' : 'AI 로드맵 생성'}
      </button>
      {state.status === 'loading' && <p role="status">로드맵을 생성하고 있어요.</p>}
      {state.status === 'error' && <p role="alert">{state.message}</p>}
      {state.status === 'success' && (
        <ol className="roadmap-list" aria-label="AI 로드맵 생성 결과">
          {state.roadmap.steps.map((step, index) => (
            <li className="roadmap-step" key={index}>
              <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="step-copy">
                <h3>{step.title}</h3>
                <h4>학습 목표</h4>
                <ul>{step.learningGoals.map((goal, goalIndex) => <li key={goalIndex}>{goal}</li>)}</ul>
                {step.recommendedCourses.length > 0 && (
                  <>
                    <h4>추천 과목</h4>
                    <ul>{step.recommendedCourses.map(({ course, reason }, courseIndex) => (
                      <li key={courseIndex}><strong>{course.name}</strong><p>{reason}</p></li>
                    ))}</ul>
                  </>
                )}
                {step.practiceProjects.length > 0 && (
                  <>
                    <h4>실습 프로젝트</h4>
                    <ul>{step.practiceProjects.map(({ title, description }, projectIndex) => (
                      <li key={projectIndex}><strong>{title}</strong><p>{description}</p></li>
                    ))}</ul>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}

export default function AiRoadmapPreview() {
  const { user, loading, recoveringPassword } = useAuth()

  return (
    <section className="roadmap-intro" aria-labelledby="ai-roadmap-preview-title">
      <h2 id="ai-roadmap-preview-title">AI 로드맵 개발 테스트</h2>
      <p>예시(Mock) 학습 데이터를 사용하며 실제 수강 이력은 반영하지 않습니다.</p>
      {loading ? (
        <p role="status">로그인 상태를 확인하고 있어요.</p>
      ) : user && !recoveringPassword ? (
        <RoadmapGenerator key={user.id} />
      ) : (
        <p>개발자 테스트 계정으로 로그인하면 사용할 수 있습니다.</p>
      )}
    </section>
  )
}
