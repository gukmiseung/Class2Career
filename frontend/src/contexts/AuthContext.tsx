
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextType = {
  user: User | null
  loading: boolean
}

export const AuthContext =
  createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // 처음 접속했을 때 로그인 상태 확인
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return

      setUser(error ? null : data.user)
      setLoading(false)
    })

    // 로그인·로그아웃 상태 변경 감지
    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      'useAuth는 AuthProvider 내부에서 사용해야 합니다.'
    )
  }

  return context
}
