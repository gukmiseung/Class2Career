
import { supabase } from './lib/supabase'

// 회원가입
export async function signUp(
  email: string,
  password: string,
  name?: string,
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: name === undefined ? undefined : { name },
    },
  })
}

// 로그인
export async function signIn(
  email: string,
  password: string
) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// 로그아웃
export async function signOut() {
  return await supabase.auth.signOut()
}

// 비밀번호 재설정 이메일 발송
export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  })
}

// 복구 인증 후 새 비밀번호 저장
export async function updatePassword(
  newPassword: string
) {
  return await supabase.auth.updateUser({
    password: newPassword,
  })
}

const savedEmailKey = 'class2career.saved-email'

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
