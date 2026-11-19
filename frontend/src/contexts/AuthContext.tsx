
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextType = {
  user: User | null
  loading: boolean
  recoveringPassword: boolean
}

let recoveringPassword = false
const recoveryListeners = new Set<() => void>()

// Register before React mounts so a fast email callback is also captured.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    recoveringPassword = true
  } else if (!session) {
    recoveringPassword = false
  } else {
    return
  }

  recoveryListeners.forEach((listener) => listener())
})

function subscribeToRecovery(listener: () => void) {
  recoveryListeners.add(listener)
  return () => { recoveryListeners.delete(listener) }
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
  const recovery = useSyncExternalStore(
    subscribeToRecovery,
    () => recoveringPassword,
  )

  useEffect(() => {
    // INITIAL_SESSION and subsequent events use the same source of truth.
    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, recoveringPassword: recovery }}>
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
