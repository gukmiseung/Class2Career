import type { SupabaseClient } from '@supabase/supabase-js'

const table = 'c2c_user_career_interests'
type InterestRow = { career_slug: string; career_name: string }

export type CareerInterest = { slug: string; name: string }

function checkRequest(result: { status: number; error: unknown }, message: string) {
  if (!result.error) return
  if (result.status === 401) throw new Error('로그인 세션이 만료되었어요. 다시 로그인해 주세요.')
  throw new Error(message)
}

export async function loadCareerInterests(client: SupabaseClient, userId: string, signal?: AbortSignal): Promise<CareerInterest[]> {
  const query = client.from(table).select('career_slug, career_name').eq('user_id', userId).order('career_slug')
  if (signal) query.abortSignal(signal)
  const result = await query.overrideTypes<InterestRow[], { merge: false }>()
  checkRequest(result, '관심 직무를 불러오지 못했어요.')
  return (result.data ?? []).map(({ career_slug, career_name }) => ({ slug: career_slug, name: career_name }))
}

export async function saveCareerInterest(client: SupabaseClient, userId: string, careerSlug: string) {
  if (!/^[\w-]{1,80}$/.test(careerSlug)) throw new Error('유효하지 않은 직무 ID입니다.')

  const career = await client.from('c2c_careers').select('title').eq('slug', careerSlug).maybeSingle<{ title: string }>()
  checkRequest(career, '직무 정보를 확인하지 못했어요.')
  if (!career.data) throw new Error('등록할 직무를 찾을 수 없어요.')

  const result = await client.from(table)
    .upsert({ user_id: userId, career_slug: careerSlug, career_name: career.data.title }, {
      onConflict: 'user_id,career_slug', ignoreDuplicates: true,
    })
  checkRequest(result, '관심 직무를 저장하지 못했어요.')
  return { slug: careerSlug, name: career.data.title }
}

export async function removeCareerInterest(client: SupabaseClient, userId: string, careerSlug: string) {
  const result = await client.from(table).delete().eq('user_id', userId).eq('career_slug', careerSlug)
    .select('career_slug').maybeSingle<{ career_slug: string }>()
  checkRequest(result, '관심 직무를 삭제하지 못했어요.')
  if (result.data) return

  const remaining = await client.from(table).select('career_slug').eq('user_id', userId).eq('career_slug', careerSlug).maybeSingle()
  checkRequest(remaining, '관심 직무를 삭제하지 못했어요.')
  if (remaining.data) throw new Error('관심 직무를 삭제하지 못했어요.')
}
