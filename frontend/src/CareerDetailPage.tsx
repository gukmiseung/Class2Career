import { useState } from 'react'
import { loadCareerInterests, toggleCareerInterest } from './careerInterests'
import { useCourseCatalog } from './useCourseCatalog'
import { statusLabels } from './courseRegistrations'
import { useCourseRegistrations } from './contexts/CourseRegistrationsContext'
import { useAuth } from './contexts/AuthContext'
import LearningLoginModal from './LearningLoginModal'
import { EmptyState, ErrorMessage, Loading } from './AsyncState'
import { careerCourseConnections } from './careerCourses'
import './CareerDetailPage.css'

type CareerDetail = {
  title: string
  description: string
  tags: string[]
}

const careerDetails: Record<string, CareerDetail> = {
  '프론트엔드 개발자': {
    title: '프론트엔드 개발자',
    description: '웹 서비스의 사용자 화면을 구현하고, 사용자가 편리하게 이용할 수 있도록 경험을 개선하는 직무예요.',
    tags: ['개발 분야', '웹 서비스'],
  },
  '백엔드 개발자': {
    title: '백엔드 개발자',
    description: '서비스의 데이터와 서버 기능을 안정적으로 설계하고 구현하는 직무예요.',
    tags: ['개발 분야', '서버·API'],
  },
  'AI 엔지니어': {
    title: 'AI 엔지니어',
    description: '인공지능 모델을 개발하고 실제 서비스 환경에 적용해 지속적으로 개선하는 직무예요.',
    tags: ['데이터·AI', '인공지능'],
  },
  '데이터 분석가': {
    title: '데이터 분석가',
    description: '데이터를 수집하고 분석하여 의사결정에 도움이 되는 의미 있는 인사이트를 찾는 직무예요.',
    tags: ['데이터·AI', '데이터 분석'],
  },
  'UI/UX 디자이너': {
    title: 'UI/UX 디자이너',
    description: '사용자의 요구와 행동을 이해하고 편리하고 일관된 서비스 경험과 화면을 설계하는 직무예요.',
    tags: ['디자인', '사용자 경험'],
  },
  '클라우드 엔지니어': {
    title: '클라우드 엔지니어',
    description: '클라우드 환경에서 안정적이고 확장 가능한 시스템과 서비스 운영 기반을 구축하는 직무예요.',
    tags: ['인프라', '클라우드'],
  },
}

export default function CareerDetailPage({ careerName }: { careerName: string }) {
  const career = careerDetails[careerName]
  const [isInterested, setIsInterested] = useState(() => loadCareerInterests().includes(careerName))
  const { registrations, loading: registrationsLoading, error: registrationsError, retryLoad } = useCourseRegistrations()
  const { catalog, loading: catalogLoading, error: catalogError, retry: retryCatalog } = useCourseCatalog()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { loading, user } = useAuth()

  const connections = careerCourseConnections[careerName] ?? []
  const coursesByCode = new Map((catalog?.courses ?? []).map((course) => [course.code, course]))
  const relatedCourses = connections.flatMap((connection) => {
    const course = coursesByCode.get(connection.code)
    return course ? [{ course, concepts: connection.concepts }] : []
  })

  if (!career) {
    return (
      <main className="career-detail-page career-not-found">
        <h1>직무 정보를 찾을 수 없어요.</h1>
        <a href="#career">직무 목록으로 돌아가기</a>
      </main>
    )
  }

  return (
    <>
    <main className="career-detail-page">
      <nav className="career-breadcrumb" aria-label="현재 위치">
        <a href="#career">직무 탐색</a><span aria-hidden="true">/</span><span>{career.title}</span>
      </nav>

      <section className="career-detail-intro">
        <h1>{career.title}</h1>
        <p>{career.description}</p>
        <div className="career-tags">
          {career.tags.map((tag, index) => <span className={index === 0 ? 'primary' : ''} key={tag}>{tag}</span>)}
        </div>
        <div className="career-detail-actions">
          <a className="roadmap-link" href={`#roadmap-${encodeURIComponent(career.title)}`}>로드맵 확인하기 →</a>
          <button
            className="career-interest-button"
            type="button"
            aria-pressed={isInterested}
            onClick={() => {
              if (!user) {
                if (!loading) setShowLoginModal(true)
                return
              }
              setIsInterested(toggleCareerInterest(career.title))
            }}
          >
            {isInterested ? '관심 직무 해제' : '관심 직무 등록'}
          </button>
        </div>
      </section>

      <section className="connected-courses" aria-labelledby="course-heading">
        <h2 id="course-heading">이 직무와 연결되는 전공 과목</h2>
        <p>과목을 수강했는지에 따라 현재 학습 이력을 비교해요.</p>

        {catalogLoading && <Loading message="수강 이력을 확인하고 있어요." compact />}
        {catalogError && <ErrorMessage message={catalogError} onRetry={retryCatalog} compact />}
        {!catalogLoading && !catalogError && registrationsError && relatedCourses.length > 0 && (
          <ErrorMessage message={registrationsError} onRetry={retryLoad} compact />
        )}
        {!catalogLoading && !catalogError && relatedCourses.length === 0 && <EmptyState title="연결된 교과목 정보가 없어요" message="전공탐색 과목이 등록되면 이곳에 표시됩니다." compact />}

        {!catalogLoading && !catalogError && relatedCourses.length > 0 && <div className="course-list">
          {relatedCourses.map(({ course, concepts }) => {
            const status = registrations[course.dbId]
            const statusLabel = status ? statusLabels[status]
              : registrationsLoading ? '확인 중'
                : registrationsError ? '확인 불가' : '미수강'
            return (
            <article className={`course-row${status ? ` ${status}` : ''}`} key={course.id}>
              <div>
                <h3>{course.name}</h3>
                <p>{concepts}</p>
                <p className="career-course-meta">{course.code} · {course.credits}학점 · {course.categories.join(' · ')}</p>
              </div>
              <div className="course-actions">
                <span className={`course-status${status ? ` ${status}` : ''}`}>
                  {statusLabel}
                </span>
                <a href={`#job-concept/${encodeURIComponent(career.title)}/${encodeURIComponent(course.name)}/${encodeURIComponent(concepts)}`}>과목 노트</a>
              </div>
            </article>
          )})}
        </div>}

        <p className="course-note">※ 과목 수강 이력은 학습 경험을 나타내며, 개별 개념의 숙련도를 의미하지는 않아요.</p>
      </section>
    </main>
    {showLoginModal && (
      <LearningLoginModal
        destination={window.location.hash || `#career-${encodeURIComponent(career.title)}`}
        onClose={() => setShowLoginModal(false)}
      />
    )}
    </>
  )
}
