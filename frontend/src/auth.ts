import { useEffect, useState } from 'react'

const authStorageKey = 'class2career.is-logged-in'
const savedEmailKey = 'class2career.saved-email'
const authChangeEvent = 'class2career:auth-change'

export function getLoginStatus() {
  try {
    return window.localStorage.getItem(authStorageKey) === 'true' ||
      window.sessionStorage.getItem(authStorageKey) === 'true'
  } catch {
    return false
  }
}

export function setLoginStatus(isLoggedIn: boolean, remember = true) {
  try {
    if (isLoggedIn) {
      window.localStorage.removeItem(authStorageKey)
      window.sessionStorage.removeItem(authStorageKey)
      const storage = remember ? window.localStorage : window.sessionStorage
      storage.setItem(authStorageKey, 'true')
    } else {
      window.localStorage.removeItem(authStorageKey)
      window.sessionStorage.removeItem(authStorageKey)
    }
  } catch {
    // 저장소를 사용할 수 없는 환경에서도 현재 탭의 UI는 갱신합니다.
  }

  window.dispatchEvent(new CustomEvent(authChangeEvent, { detail: isLoggedIn }))
}

export function getSavedEmail() {
  try {
    return window.localStorage.getItem(savedEmailKey) ?? ''
  } catch {
    return ''
  }
}

export function saveEmail(email: string | null) {
  try {
    if (email) window.localStorage.setItem(savedEmailKey, email)
    else window.localStorage.removeItem(savedEmailKey)
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 이메일을 저장하지 않습니다.
  }
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
