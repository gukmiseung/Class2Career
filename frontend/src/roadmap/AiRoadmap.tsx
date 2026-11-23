import { useRef, useState } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { useAuth } from '../contexts/AuthContext'
import { getPersonalizedRoadmapAccess } from '../authNavigation'
import LearningLoginModal from '../LearningLoginModal'
import { supabase } from '../lib/supabase'
import type { RoadmapResponse } from './contracts'
import RoadmapGuide from './RoadmapGuide'
import './AiRoadmap.css'

type RoadmapState =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; roadmap: RoadmapResponse }
  | { status: 'error'; message: string }

async function roadmapError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    if (error.context.status === 401) return '세션이 만료되었습니다. 다시 로그인해 주세요.'
    const details = await error.context.json().catch(() => null)
    if (typeof details?.requestId === 'string' && typeof details?.message === 'string') return details.message
  }
  return 'AI 로드맵을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function RoadmapGenerator({ careerSlug }: { careerSlug: string }) {
  const [state, setState] = useState<RoadmapState>({ status: 'idle' })
  const inFlight = useRef(false)

  async function generate() {
    if (inFlight.current) return
    inFlight.current = true
    setState({ status: 'loading' })

    try {
      const { data, error } = await supabase.functions.invoke<RoadmapResponse>('generate-roadmap', {
        body: { careerId: careerSlug },
      })
      if (error) throw error
      if (!Array.isArray(data?.steps) || !data.steps.length) throw new Error('Missing roadmap steps')
      setState({ status: 'success', roadmap: data })
    } catch (error) {
      setState({ status: 'error', message: await roadmapError(error) })
    } finally {
      inFlight.current = false
    }
  }

  return (
    <>
      {state.status !== 'success' && (
        <button className="roadmap-ai-button" type="button" onClick={generate} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'AI 로드맵 생성 중…' : state.status === 'error' ? '다시 시도하기' : 'AI 로드맵 생성'}
        </button>
      )}
      {state.status === 'loading' && <p role="status">로드맵을 생성하고 있어요.</p>}
      {state.status === 'error' && <p role="alert">{state.message}</p>}
      {state.status === 'success' && <RoadmapGuide roadmap={state.roadmap} />}
    </>
  )
}

export default function AiRoadmap({ careerSlug }: { careerSlug: string }) {
  const access = getPersonalizedRoadmapAccess(useAuth())
  const [loginDestination, setLoginDestination] = useState<string | null>(null)

  return (
    <section className="roadmap-intro roadmap-ai" aria-labelledby="ai-roadmap-title">
      <h2 id="ai-roadmap-title">AI 맞춤형 학습 로드맵</h2>
      <p>수강 이력에 맞춰 들을 과목, 만들 프로젝트, 도전할 공모전, 실무 경험 계획을 살펴보세요.</p>
      {access.status === 'checking' ? (
        <p role="status">로그인 상태를 확인하고 있어요.</p>
      ) : access.status === 'ready' ? (
        <RoadmapGenerator key={`${access.userId}:${careerSlug}`} careerSlug={careerSlug} />
      ) : (
        <>
          <button className="roadmap-ai-button" type="button" onClick={() => setLoginDestination(window.location.hash)}>
            로그인해서 생성하기
          </button>
          {loginDestination !== null && (
            <LearningLoginModal
              destination={loginDestination}
              onClose={() => setLoginDestination(null)}
              description="로그인하면 수강 이력을 분석해 부족한 역량과 추가 추천 과목을 확인할 수 있어요."
            />
          )}
        </>
      )}
    </section>
  )
}
