import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import { getCourseConcepts } from './courseConcepts'
import {
  loadRegistrations,
  parseRegistrations,
  registrationKey,
  type CourseStatus,
} from './courseRegistrations'
import {
  courseYears,
  type CourseCategory,
  type CourseYear,
} from './courses'
import { filterCourses } from './filterCourses'
import { EmptyState, ErrorMessage, Loading } from './AsyncState'
import { useCourseCatalog } from './useCourseCatalog'
import './CourseAddPage.css'

const pageSize = 4
type Filters = {
  major: string | '전체'
  category: CourseCategory | '전체'
  year: CourseYear | null
}

type FilterSection = 'department' | 'category' | 'year'

const defaultFilters: Filters = { major: '전체', category: '전체', year: null }

function CoursePagination({ page, pageCount, onPageChange }: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  if (pageCount === 0) return null

  const windowStart = Math.min(Math.max(page - 1, 1), pageCount - 2)
  const visiblePages = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter((number) => pageCount <= 5 || number === 1 || number === pageCount ||
      (number >= windowStart && number < windowStart + 3))

  return (
    <nav className="course-pagination" aria-label="과목 검색 결과 페이지">
      <button type="button" aria-label="이전 페이지" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <span aria-hidden="true">‹</span>
      </button>
      {visiblePages.map((number, index) => (
        <Fragment key={number}>
          {index > 0 && number - visiblePages[index - 1] > 1 && <span aria-hidden="true">···</span>}
          <button
            type="button"
            aria-label={`${number}페이지`}
            aria-current={page === number ? 'page' : undefined}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        </Fragment>
      ))}
      <button type="button" aria-label="다음 페이지" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  )
}

export default function CourseAddPage() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const filterPanelRef = useRef<HTMLElement>(null)
  const scrollbarTimer = useRef<number | undefined>(undefined)
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [expandedFilters, setExpandedFilters] = useState<Record<FilterSection, boolean>>({
    department: false,
    category: false,
    year: false,
  })
  const [page, setPage] = useState(1)
  const [registrations, setRegistrations] = useState(loadRegistrations)
  const { catalog, loading: coursesLoading, error: coursesError, retry } = useCourseCatalog()
  const courses = catalog?.courses ?? []
  const majorOptions = catalog?.majors ?? []
  const categoryOptions = catalog?.categories ?? []

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    function syncRegistrations(event: StorageEvent) {
      if (event.key !== registrationKey && event.key !== null) return

      const current = parseRegistrations(event.newValue)
      setRegistrations(current)
    }

    window.addEventListener('storage', syncRegistrations)
    return () => window.removeEventListener('storage', syncRegistrations)
  }, [])

  const results = filterCourses(courses, filters, query)
  const pageCount = Math.ceil(results.length / pageSize)
  const visibleCourses = results.slice((page - 1) * pageSize, page * pageSize)

  function changeFilters(nextFilters: Filters) {
    setFilters(nextFilters)
    setPage(1)
  }

  function selectMajor(major: string) {
    changeFilters({ ...filters, major })
  }

  function selectCategory(category: string) {
    changeFilters({ ...filters, category })
  }

  function selectYear(year: CourseYear) {
    changeFilters({ ...filters, year: filters.year === year ? null : year })
  }

  function resetCoursePage() {
    setFilters(defaultFilters)
    setExpandedFilters({ department: false, category: false, year: false })
    setSearchInput('')
    setQuery('')
    setPage(1)
  }

  function toggleFilter(section: FilterSection) {
    setExpandedFilters((current) => ({ ...current, [section]: !current[section] }))
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuery(searchInput.trim().toLowerCase())
    setPage(1)
  }

  function registerCourse(id: string, status: CourseStatus) {
    try {
      const storage = window.localStorage
      const current = parseRegistrations(storage.getItem(registrationKey))
      if (current[id] === status) {
        delete current[id]
      } else {
        current[id] = status
      }
      storage.setItem(registrationKey, JSON.stringify(current))

      setRegistrations(current)
    } catch {
      return
    }
  }

  return (
    <main className="course-page">
      <div className="course-page-content">
        <header className="course-page-heading">
          <h1 ref={titleRef} tabIndex={-1}>나의 과목 관리</h1>
          <p>수강한 과목과 앞으로 수강할 과목을 등록해 나의 학습 현황을 관리해 보세요.</p>
        </header>

        <form className="course-search" role="search" onSubmit={handleSearch}>
          <span className="course-search-icon" aria-hidden="true" />
          <input
            type="search"
            aria-label="과목명 또는 키워드"
            placeholder="과목명 또는 키워드로 검색하세요"
            value={searchInput}
            onChange={(event) => {
              const value = event.target.value
              setSearchInput(value)
              if (value === '') {
                setQuery('')
                setPage(1)
              }
            }}
          />
          <button className="course-primary-button" type="submit">검색</button>
        </form>

        <div className="course-layout">
          <aside
            ref={filterPanelRef}
            className="course-filters"
            aria-labelledby="course-filters-title"
            onScroll={() => {
              const panel = filterPanelRef.current
              if (!panel) return
              panel.classList.add('is-scrolling')
              if (scrollbarTimer.current !== undefined) window.clearTimeout(scrollbarTimer.current)
              scrollbarTimer.current = window.setTimeout(() => panel.classList.remove('is-scrolling'), 700)
            }}
          >
            <div className="course-filters-heading">
              <h2 id="course-filters-title">필터</h2>
              <button type="button" onClick={resetCoursePage}>초기화</button>
            </div>

            <fieldset>
              <legend>
                <span>학과 · 전공</span>
                <button
                  className="course-filter-toggle"
                  type="button"
                  aria-label={`학과 필터 ${expandedFilters.department ? '접기' : '펼치기'}`}
                  aria-expanded={expandedFilters.department}
                  aria-controls="department-filter-options"
                  onClick={() => toggleFilter('department')}
                >
                  <span aria-hidden="true" />
                </button>
              </legend>
              <div className="course-filter-options" id="department-filter-options" hidden={!expandedFilters.department}>
                {['전체', ...majorOptions].map((major) => (
                  <button
                    type="button"
                    key={major}
                    aria-pressed={filters.major === major}
                    onClick={() => selectMajor(major)}
                  >
                    {major === '전체' ? '전체 (컴퓨터학부)' : major}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>
                <span>이수 구분</span>
                <button
                  className="course-filter-toggle"
                  type="button"
                  aria-label={`이수 구분 필터 ${expandedFilters.category ? '접기' : '펼치기'}`}
                  aria-expanded={expandedFilters.category}
                  aria-controls="category-filter-options"
                  onClick={() => toggleFilter('category')}
                >
                  <span aria-hidden="true" />
                </button>
              </legend>
              <div className="course-filter-options" id="category-filter-options" hidden={!expandedFilters.category}>
                {['전체', ...categoryOptions].map((category) => (
                  <button
                    type="button"
                    key={category}
                    aria-pressed={filters.category === category}
                    onClick={() => selectCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>
                <span>수강 학년</span>
                <button
                  className="course-filter-toggle"
                  type="button"
                  aria-label={`수강 학년 필터 ${expandedFilters.year ? '접기' : '펼치기'}`}
                  aria-expanded={expandedFilters.year}
                  aria-controls="year-filter-options"
                  onClick={() => toggleFilter('year')}
                >
                  <span aria-hidden="true" />
                </button>
              </legend>
              <div className="course-filter-options course-filter-years" id="year-filter-options" hidden={!expandedFilters.year}>
                {courseYears.map((year) => (
                  <button
                    type="button"
                    key={year}
                    aria-pressed={filters.year === year}
                    onClick={() => selectYear(year)}
                  >
                    {year}학년
                  </button>
                ))}
              </div>
            </fieldset>
          </aside>

          <section className="course-results" aria-labelledby="course-results-title">
            <header className="course-results-heading">
              <div>
                <h2 id="course-results-title">과목 검색 결과</h2>
                <p>등록된 전공 교육과정 과목</p>
              </div>
              <p className="course-result-count" aria-live="polite">총 {results.length}개 과목</p>
            </header>

            {coursesLoading ? <Loading message="과목 정보를 불러오고 있어요." /> : coursesError ? <ErrorMessage message={coursesError} onRetry={retry} retrying={coursesLoading} /> : visibleCourses.length > 0 ? (
              <ul className="course-list">
                {visibleCourses.map((course) => {
                  const status = registrations[course.id]
                  return (
                    <li className="course-card" key={course.code || course.slug}>
                      <div>
                        <h3>
                          {getCourseConcepts(course.id, course) ? (
                            <a className="course-concept-link" href={`#explore/concepts/${course.id}`}>
                              {course.name}
                            </a>
                          ) : course.name}
                        </h3>
                        <p className="course-card-meta">
                          {course.categories.map((category) => <span className="course-category" key={category}>{category}</span>)}
                          <span>{course.code}</span>
                          <span>{course.credits}학점</span>
                          <span aria-hidden="true">·</span>
                          <span>{course.years.length > 0 ? `${course.years.join('·')}학년` : '학년 미지정'}</span>
                        </p>
                        <p className="course-card-description">{course.description}</p>
                      </div>
                      <div className="course-register-actions">
                        <button
                          type="button"
                          aria-pressed={status === 'completed'}
                          onClick={() => registerCourse(course.id, 'completed')}
                        >
                          수강 완료
                        </button>
                        <button
                          type="button"
                          aria-pressed={status === 'planned'}
                          onClick={() => registerCourse(course.id, 'planned')}
                        >
                          수강 예정
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState title={courses.length === 0 ? '등록된 과목이 없어요' : '검색 결과가 없어요'} message={courses.length === 0 ? '교과목 정보가 등록되면 이곳에 표시됩니다.' : '검색어나 필터를 바꿔 보세요.'} />
            )}

            <CoursePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </section>
        </div>
      </div>
    </main>
  )
}
