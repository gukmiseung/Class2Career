
import { supabase } from './lib/supabase'
import { legacyLearningNotesKey } from './learningNotes'

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
  const result = await supabase.auth.signOut()
  if (!result.error) clearPersonalData()
  return result
}

const personalDataKeys = [
  'class2career.profile',
  'class2career.course-registrations',
  'class2career.career-interests',
  legacyLearningNotesKey,
  'class2career.saved-email',
]

export function clearPersonalData() {
  try {
    personalDataKeys.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // 로그아웃은 성공했으므로 저장소 접근 실패가 화면 이동을 막지 않게 합니다.
  }
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
