
import { supabase } from './supabase'

// 회원가입
export async function signUp(
  email: string,
  password: string
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
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

// 현재 로그인한 사용자 조회
export async function getCurrentUser() {
  return await supabase.auth.getUser()
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
