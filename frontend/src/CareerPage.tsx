import { useState } from 'react'
import './CareerPage.css'
import { EmptyState, ErrorMessage, Loading } from './AsyncState'
import { useCareerCatalog } from './useCareerCatalog'

export default function CareerPage() {
  const { careers, loading, error, retry } = useCareerCatalog()
  const [category, setCategory] = useState('전체')
  const [query, setQuery] = useState('')
  const categories = ['전체', ...new Set(careers.map((career) => career.category))]
  const keyword = query.trim().replace(/\s+/g, '').toLocaleLowerCase('ko')

  const visibleCareers = careers.filter((career) => {
    const matchesCategory = category === '전체' || career.category === category
    const searchFields = [career.title, career.category, career.description, ...career.keywords]
    const matchesQuery = searchFields.some((field) => field.replace(/\s+/g, '').toLocaleLowerCase('ko').includes(keyword))
    return matchesCategory && matchesQuery
  })

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

        {loading ? (
          <Loading message="직무 정보를 불러오고 있어요." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={retry} />
        ) : careers.length === 0 ? (
          <EmptyState title="등록된 직무가 없어요" message="직무 정보가 등록되면 이곳에 표시됩니다." />
        ) : visibleCareers.length > 0 ? (
          <div className="career-grid">
            {visibleCareers.map((career) => (
              <article className="career-card" key={career.slug}>
                <span className="career-category">{career.category}</span>
                <h3>
                  <a className="career-title-link" href={`#career-${encodeURIComponent(career.title)}`}>
                    {career.title}
                  </a>
                </h3>
                <p>{career.description}</p>
                <span className="career-course-count">관련 과목 {career.courses.length}개</span>
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
