import type { RoadmapRequest } from './contracts.ts'
import {
  compareConceptCoverage,
  toRoadmapSkillGaps,
  type ConceptCoverageInput,
} from './compareConceptCoverage.ts'
import { isRecord, validateGeneratedRoadmap, type CandidateCourse } from './response.ts'
import { RoadmapProviderError } from './openai.ts'

export type RoadmapData = {
  request: Omit<RoadmapRequest, 'skillGaps'>
  coverage: ConceptCoverageInput
  candidates: readonly CandidateCourse[]
}

export type RoadmapDependencies = {
  authenticate(token: string): Promise<{ userId: string } | null>
  isAllowedUser(userId: string): boolean
  load(selection: { userId: string; accessToken: string; careerId?: string }): Promise<
    RoadmapData | { status: 'career_selection_required' } | null
  >
  generate(request: RoadmapRequest, candidates: readonly CandidateCourse[]): Promise<unknown>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
}

export function createRoadmapHandler(dependencies: RoadmapDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })

    const requestId = crypto.randomUUID()
    const failure = (status: number, code: string, message: string) =>
      Response.json({ code, message, requestId }, { status, headers: corsHeaders })

    if (request.method !== 'POST') return failure(405, 'METHOD_NOT_ALLOWED', 'POST 요청을 사용해 주세요.')

    try {
      const authorization = request.headers.get('Authorization') ?? ''
      const token = /^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/i.exec(authorization)?.[1]
      const user = token ? await dependencies.authenticate(token) : null
      if (!token || !user) return failure(401, 'UNAUTHORIZED', '로그인이 필요합니다.')
      if (!dependencies.isAllowedUser(user.userId)) {
        return failure(403, 'ROADMAP_ACCESS_DENIED', 'AI 로드맵 접근 권한이 없습니다.')
      }

      const body = await request.json().catch(() => null)
      if (!isRecord(body) || Object.keys(body).some((key) => key !== 'careerId') ||
        ('careerId' in body && (typeof body.careerId !== 'string' || !/^[\w-]{1,80}$/.test(body.careerId)))) {
        return failure(400, 'INVALID_REQUEST', '유효한 careerId를 보내 주세요.')
      }

      const careerId = typeof body.careerId === 'string' ? body.careerId : undefined
      const data = await dependencies.load({ ...user, accessToken: token, careerId })
      if (!data) return failure(400, 'UNKNOWN_CAREER', '지원하는 직무를 선택해 주세요.')
      if ('status' in data) return failure(400, 'CAREER_SELECTION_REQUIRED', '로드맵을 생성할 직무를 선택해 주세요.')

      const coverage = compareConceptCoverage(data.coverage)
      if (coverage.requirementsStatus === 'pending') {
        return failure(409, 'CAREER_REQUIREMENTS_NOT_READY', '직무 요구 개념을 준비 중입니다.')
      }
      if (coverage.unknown.length) {
        return failure(409, 'COURSE_CONCEPT_MAPPING_NOT_READY', '완료 과목의 개념 매핑을 준비 중입니다.')
      }
      const generated = await dependencies.generate({
        ...data.request,
        skillGaps: toRoadmapSkillGaps(coverage),
      }, data.candidates)
      const roadmap = validateGeneratedRoadmap(generated, data.candidates)
      if (!roadmap) return failure(500, 'INVALID_ROADMAP_RESPONSE', '로드맵 응답을 검증하지 못했습니다.')

      return Response.json(roadmap, { headers: corsHeaders })
    } catch (error) {
      if (error instanceof RoadmapProviderError) {
        console.error(JSON.stringify({ event: 'roadmap_generation_failed', requestId, code: error.code }))
        return failure(error.status, error.code, error.message)
      }
      console.error(JSON.stringify({ event: 'roadmap_generation_failed', requestId, code: 'INTERNAL_ERROR' }))
      return failure(500, 'INTERNAL_ERROR', '로드맵 생성 중 오류가 발생했습니다.')
    }
  }
}
