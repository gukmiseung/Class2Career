import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import { getCourseConcepts } from './courseConcepts'
import {
  courseCategories,
  courses,
  courseYears,
  departments,
  type CourseCategory,
  type CourseYear,
  type Department,
} from './courses'
import './CourseAddPage.css'

const pageSize = 4
const registrationKey = 'class2career.course-registrations'
const categoryOptions = ['전체', ...courseCategories] as const
const statusLabels = { completed: '수강 완료', planned: '수강 예정' } as const

type CourseStatus = keyof typeof statusLabels
type Registrations = Partial<Record<string, CourseStatus>>
type Filters = {
  department: Department
  category: CourseCategory | '전체'
  year: CourseYear | null
}

const defaultFilters: Filters = { department: '컴퓨터학부', category: '전체', year: null }

function parseRegistrations(value: string | null): Registrations {
  if (value === null) return {}

  try {
    const stored: unknown = JSON.parse(value)
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}

    const entries = stored as Record<string, unknown>
    const registrations: Registrations = {}

    for (const { id } of courses) {
      const status = entries[id]
      if (status === 'completed' || status === 'planned') registrations[id] = status
    }

    return registrations
  } catch {
    return {}
  }
}

function loadRegistrations(): Registrations {
  try {
    return parseRegistrations(window.localStorage.getItem(registrationKey))
  } catch {
    return {}
  }
}

function CoursePagination({ page, pageCount, onPageChange }: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  if (pageCount <= 1) return null

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
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [registrations, setRegistrations] = useState(loadRegistrations)

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

  const results = courses.filter((course) =>
    course.department === filters.department &&
    (filters.category === '전체' || course.category === filters.category) &&
    (filters.year === null || course.year === filters.year) &&
    (course.name.toLowerCase().includes(query) || course.description.toLowerCase().includes(query)),
  )
  const pageCount = Math.ceil(results.length / pageSize)
  const visibleCourses = results.slice((page - 1) * pageSize, page * pageSize)

  function changeFilters(nextFilters: Filters) {
    setFilters(nextFilters)
    setPage(1)
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
          <aside className="course-filters" aria-labelledby="course-filters-title">
            <div className="course-filters-heading">
              <h2 id="course-filters-title">필터</h2>
              <button type="button" onClick={() => changeFilters(defaultFilters)}>초기화</button>
            </div>

            <fieldset>
              <legend>학과</legend>
              <div className="course-filter-options">
                {departments.map((department) => (
                  <button
                    type="button"
                    key={department}
                    aria-pressed={filters.department === department}
                    onClick={() => changeFilters({ ...filters, department })}
                  >
                    {department}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>이수 구분</legend>
              <div className="course-filter-options">
                {categoryOptions.map((category) => (
                  <button
                    type="button"
                    key={category}
                    aria-pressed={filters.category === category}
                    onClick={() => changeFilters({ ...filters, category })}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>수강 학년</legend>
              <div className="course-filter-options course-filter-years">
                {courseYears.map((year) => (
                  <button
                    type="button"
                    key={year}
                    aria-pressed={filters.year === year}
                    onClick={() => changeFilters({ ...filters, year: filters.year === year ? null : year })}
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
                <p>{filters.department}에서 개설하는 과목을 보여드려요.</p>
              </div>
              <p className="course-result-count" aria-live="polite">총 {results.length}개 과목</p>
            </header>

            {visibleCourses.length > 0 ? (
              <ul className="course-list">
                {visibleCourses.map((course) => {
                  const status = registrations[course.id]
                  return (
                    <li className="course-card" key={course.id}>
                      <div>
                        <h3>
                          {getCourseConcepts(course.id) ? (
                            <a className="course-concept-link" href={`#explore/concepts/${course.id}`}>
                              {course.name}
                            </a>
                          ) : course.name}
                        </h3>
                        <p className="course-card-meta">
                          <span className="course-category">{course.category}</span>
                          <span>{course.credits}학점</span>
                          <span aria-hidden="true">·</span>
                          <span>{course.year}학년</span>
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
              <p className="course-empty">검색 결과가 없어요. 검색어나 필터를 바꿔 보세요.</p>
            )}

            <CoursePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </section>
        </div>
      </div>
    </main>
  )
}
