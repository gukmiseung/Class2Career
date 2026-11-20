import { useEffect, useState } from 'react'
import { getCourseCatalog, type CourseCatalog } from './courses'

type CourseCatalogState = {
  catalog: CourseCatalog | null
  loading: boolean
  error: string | null
  retry: () => void
}

let cachedCatalog: CourseCatalog | null = null
let catalogRequest: Promise<CourseCatalog> | null = null

function requestCatalog(force = false) {
  if (force) {
    cachedCatalog = null
    catalogRequest = null
  }
  if (cachedCatalog) return Promise.resolve(cachedCatalog)
  if (!catalogRequest) {
    catalogRequest = getCourseCatalog()
      .then((catalog) => {
        cachedCatalog = catalog
        return catalog
      })
      .finally(() => { catalogRequest = null })
  }
  return catalogRequest
}

export function useCourseCatalog(): CourseCatalogState {
  const [state, setState] = useState({ catalog: cachedCatalog, loading: !cachedCatalog, error: null as string | null })
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let active = true
    requestCatalog(requestVersion > 0)
      .then((catalog) => {
        if (active) setState({ catalog, loading: false, error: null })
      })
      .catch(() => {
        if (active) setState({ catalog: null, loading: false, error: '과목 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' })
      })
    return () => { active = false }
  }, [requestVersion])

  return {
    ...state,
    retry: () => {
      if (state.loading) return
      setState((current) => ({ ...current, loading: true, error: null }))
      setRequestVersion((version) => version + 1)
    },
  }
}
