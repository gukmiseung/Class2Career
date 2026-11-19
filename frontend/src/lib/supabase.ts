
import { createClient } from '@supabase/supabase-js'

const { hash, search } = window.location
const fragment = new URLSearchParams(hash.slice(1))
const query = new URLSearchParams(search)
const callbackType = fragment.get('type') ?? query.get('type')
const hasCallbackError = [fragment, query].some((params) =>
  params.has('error') || params.has('error_code') || params.has('error_description'),
)

// Capture the route hint before Supabase consumes the authentication fragment.
export const authCallback =
  fragment.has('access_token') || hasCallbackError
    ? { recovery: callbackType === 'recovery', hasError: hasCallbackError }
    : null

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
