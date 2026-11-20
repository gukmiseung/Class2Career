import { useMemo, useState } from 'react'
import './CareerPage.css'
import { EmptyState } from './AsyncState'
import { careerCourseConnections } from './careerCourses'

const categories = ['전체', '개발', '데이터·AI', '디자인', '인프라'] as const

const careers = [
  { category: '개발', title: '프론트엔드 개발자', description: '사용자에게 보이는 웹 화면과 인터랙션을 개발해요.' },
  { category: '개발', title: '백엔드 개발자', description: '서비스의 데이터와 서버 기능을 설계하고 구현해요.' },
  { category: '데이터·AI', title: 'AI 엔지니어', description: '인공지능 모델을 서비스에 적용하고 개선해요.' },
  { category: '데이터·AI', title: '데이터 분석가', description: '데이터를 분석해 의미 있는 인사이트를 찾아요.' },
  { category: '디자인', title: 'UI/UX 디자이너', description: '사용자 경험을 조사하고 서비스 화면을 설계해요.' },
  { category: '인프라', title: '클라우드 엔지니어', description: '클라우드 기반 시스템과 운영 환경을 구축해요.' },
]

export default function CareerPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>('전체')
  const [query, setQuery] = useState('')

  const visibleCareers = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('ko')

    return careers.filter((career) => {
      const matchesCategory = category === '전체' || career.category === category
      const matchesQuery = !keyword || `${career.title} ${career.category} ${career.description}`.toLocaleLowerCase('ko').includes(keyword)
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  return (
    <main className="career-page">
      <section className="career-intro">
        <h1>어떤 직무에 관심이 있나요?</h1>
        <p>희망 직무를 선택하면 관련 전공 과목과 필요한 개념을 정리해 드려요.</p>
      </section>

      <label className="career-search">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">직무 검색</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="직무명 또는 관심 분야를 검색하세요"
        />
      </label>

      <section className="career-list" aria-labelledby="category-title">
        <h2 id="category-title">분야별로 찾아보기</h2>
        <div className="category-tabs" aria-label="직무 분야 필터">
          {categories.map((item) => (
            <button
              type="button"
              className={category === item ? 'active' : ''}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        {visibleCareers.length > 0 ? (
          <div className="career-grid">
            {visibleCareers.map((career) => (
              <article className="career-card" key={career.title}>
                <span className="career-category">{career.category}</span>
                <h3>
                  <a className="career-title-link" href={`#career-${encodeURIComponent(career.title)}`}>
                    {career.title}
                  </a>
                </h3>
                <p>{career.description}</p>
                <span className="career-course-count">관련 과목 {careerCourseConnections[career.title]?.length ?? 0}개</span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="검색 결과가 없어요" message="검색어나 분야를 바꿔 보세요." />
        )}
      </section>
    </main>
  )
}
