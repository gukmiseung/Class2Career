import { useEffect, useState } from 'react'
import { getCourseCatalog, type CourseCatalog } from './courses'

type CourseCatalogState = {
  catalog: CourseCatalog | null
  loading: boolean
  error: string | null
}

export function useCourseCatalog(): CourseCatalogState {
  const [state, setState] = useState<CourseCatalogState>({ catalog: null, loading: true, error: null })

  useEffect(() => {
    let active = true
    getCourseCatalog()
      .then((catalog) => {
        if (active) setState({ catalog, loading: false, error: null })
      })
      .catch(() => {
        if (active) setState({ catalog: null, loading: false, error: '과목 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' })
      })
    return () => { active = false }
  }, [])

  return state
}
