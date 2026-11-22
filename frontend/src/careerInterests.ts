import type { SupabaseClient } from '@supabase/supabase-js'

const table = 'c2c_user_career_interests'

function checkRequest(result: { status: number; error: unknown }, message: string) {
  if (!result.error) return
  if (result.status === 401) throw new Error('로그인 세션이 만료되었어요. 다시 로그인해 주세요.')
  throw new Error(message)
}

export async function loadCareerInterest(client: SupabaseClient, userId: string, signal?: AbortSignal) {
  const query = client.from(table).select('career_name').eq('user_id', userId)
  if (signal) query.abortSignal(signal)
  const result = await query.maybeSingle<{ career_name: string }>()
  checkRequest(result, '관심 직무를 불러오지 못했어요.')
  return result.data?.career_name ?? null
}

export async function saveCareerInterest(client: SupabaseClient, userId: string, careerSlug: string) {
  if (!/^[\w-]{1,80}$/.test(careerSlug)) throw new Error('유효하지 않은 직무 ID입니다.')

  const career = await client.from('c2c_careers').select('title').eq('slug', careerSlug).maybeSingle<{ title: string }>()
  checkRequest(career, '직무 정보를 확인하지 못했어요.')
  if (!career.data) throw new Error('등록할 직무를 찾을 수 없어요.')

  const result = await client.from(table)
    .upsert({ user_id: userId, career_name: career.data.title }, { onConflict: 'user_id' })
    .select('career_name').single<{ career_name: string }>()
  checkRequest(result, '관심 직무를 저장하지 못했어요.')
  if (!result.data) throw new Error('저장한 관심 직무를 확인하지 못했어요.')
  return result.data.career_name
}

export async function removeCareerInterest(client: SupabaseClient, userId: string, careerName: string) {
  const result = await client.from(table).delete().eq('user_id', userId).eq('career_name', careerName)
    .select('career_name').maybeSingle<{ career_name: string }>()
  checkRequest(result, '관심 직무를 삭제하지 못했어요.')
  if (result.data) return null

  const remaining = await loadCareerInterest(client, userId)
  if (remaining === careerName) throw new Error('관심 직무를 삭제하지 못했어요.')
  return remaining
}
