import { useEffect, useRef } from 'react'
import { hasCourseCatalog, useCourseDetail } from './courseCatalog'
import './CourseAddPage.css'

export default function CourseDetailPage({ slug }: { slug: string }) {
  const title = useRef<HTMLHeadingElement>(null)
  const { data: course, loading, error, retry } = useCourseDetail(slug)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    title.current?.focus({ preventScroll: true })
  }, [])

  return (
    <main className="course-page">
      <div className="course-page-content">
        <a className="course-concept-link" href="#explore">← 과목 목록</a>
        <header className="course-page-heading">
          <h1 ref={title} tabIndex={-1}>{course?.name ?? '과목 상세'}</h1>
          {course && <p>{[course.course_code, course.credits === null ? null : `${course.credits}학점`, course.department].filter(Boolean).join(' · ')}</p>}
        </header>
        {!hasCourseCatalog && <p>Supabase 연결 설정이 필요해요.</p>}
        {loading && <p role="status">과목 정보를 불러오는 중이에요.</p>}
        {error && <div role="alert"><p>{error}</p><button className="course-primary-button" type="button" onClick={retry}>다시 시도</button></div>}
        {course === null && <p>해당 과목을 찾을 수 없어요.</p>}
        {course && (
          <>
            {course.description && <p>{course.description}</p>}
            <section aria-labelledby="course-placement-title">
              <h2 id="course-placement-title">전공별 권장 교육과정</h2>
              <ul className="course-list">
                {course.c2c_curriculum_courses.map(({ c2c_curricula: curriculum, recommended_year, semester, course_category, requirement_label }) => (
                  <li className="course-card" key={`${curriculum.c2c_majors.name}-${curriculum.curriculum_year}`}>
                    <div>
                      <h3>{curriculum.c2c_majors.name}</h3>
                      <p className="course-card-meta">
                        <span>{curriculum.curriculum_year}학년도 기준</span>
                        {recommended_year !== null && <span>{recommended_year}학년</span>}
                        {semester !== null && <span>{semester}학기</span>}
                        {course_category && <span className="course-category">{course_category}</span>}
                        {requirement_label && requirement_label !== course_category && <span>{requirement_label}</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {course.c2c_curriculum_courses.length === 0 && <p>등록된 교육과정 정보가 없어요.</p>}
            </section>
            <section aria-labelledby="course-concepts-title">
              <h2 id="course-concepts-title">세부 개념</h2>
              {course.c2c_course_concepts.length === 0 ? <p>등록된 개념이 없어요.</p> : (
                <ul className="course-list">
                  {course.c2c_course_concepts.map((concept) => (
                    <li className="course-card" key={concept.id}>
                      <div>
                        <h3>{concept.name}</h3>
                        <p className="course-card-meta">{concept.concept_group}</p>
                        {concept.description && <p>{concept.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {course.course_code === 'COME0331' && <a className="course-concept-link" href="#explore/concepts/cs-data-structures">자료구조 개념 탐색하기</a>}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
