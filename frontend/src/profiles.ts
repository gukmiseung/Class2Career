import { supabase } from './lib/supabase'

export type Profile = {
  name: string
  department: string
  grade: string
  goal: string
  introduction: string
  avatar: string
}

export type ProfileMajor = { id: number; name: string }

const profileFields = 'name, department, grade, goal, introduction, avatar'

function initialProfile(email: string, signupName: string): Profile {
  const defaults = {
    name: signupName,
    department: '',
    grade: '1학년',
    goal: '',
    introduction: '',
    avatar: '',
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem('class2career.profile') ?? 'null') as (
      Partial<Record<keyof Profile | 'email', unknown>> | null
    )
    // The old storage key was shared by accounts. Only reuse data tied to this email.
    if (!email || typeof saved?.email !== 'string' || saved.email.toLowerCase() !== email.toLowerCase()) {
      return defaults
    }

    for (const field of Object.keys(defaults) as (keyof Profile)[]) {
      const value = saved[field]
      if (typeof value === 'string') defaults[field] = value
    }
  } catch {
    // A missing or invalid browser record does not prevent profile editing.
  }

  return defaults
}

export async function loadProfile(userId: string, email: string, signupName: string, signal: AbortSignal): Promise<Profile> {
  const { data } = await supabase
    .from('c2c_profiles')
    .select(profileFields)
    .eq('user_id', userId)
    .abortSignal(signal)
    .maybeSingle()
    .throwOnError()

  return data ?? initialProfile(email, signupName)
}

export async function saveProfile(userId: string, profile: Profile) {
  await supabase
    .from('c2c_profiles')
    .upsert({ ...profile, name: profile.name.trim(), user_id: userId }, { onConflict: 'user_id' })
    .throwOnError()
}

export async function loadProfileMajors(signal: AbortSignal): Promise<ProfileMajor[]> {
  const majors: ProfileMajor[] = []
  const pageSize = 1000

  for (let start = 0; ; start += pageSize) {
    const { data } = await supabase
      .from('c2c_majors')
      .select('id, name')
      .order('id')
      .range(start, start + pageSize - 1)
      .abortSignal(signal)
      .throwOnError()

    majors.push(...data)
    if (data.length < pageSize) return majors
  }
}
