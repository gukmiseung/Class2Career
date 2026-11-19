import { useEffect, useState } from 'react'

const authStorageKey = 'class2career.is-logged-in'
const authChangeEvent = 'class2career:auth-change'

export function getLoginStatus() {
  try {
    return window.localStorage.getItem(authStorageKey) === 'true'
  } catch {
    return false
  }
}

export function setLoginStatus(isLoggedIn: boolean) {
  try {
    if (isLoggedIn) {
      window.localStorage.setItem(authStorageKey, 'true')
    } else {
      window.localStorage.removeItem(authStorageKey)
    }
  } catch {
    // 저장소를 사용할 수 없는 환경에서도 현재 탭의 UI는 갱신합니다.
  }

  window.dispatchEvent(new CustomEvent(authChangeEvent, { detail: isLoggedIn }))
}

export function useLoginStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(getLoginStatus)

  useEffect(() => {
    const updateLoginStatus = () => setIsLoggedIn(getLoginStatus())

    window.addEventListener('storage', updateLoginStatus)
    window.addEventListener(authChangeEvent, updateLoginStatus)
    return () => {
      window.removeEventListener('storage', updateLoginStatus)
      window.removeEventListener(authChangeEvent, updateLoginStatus)
    }
  }, [])

  return isLoggedIn
}
