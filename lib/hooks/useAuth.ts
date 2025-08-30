'use client'

import { useState, useEffect } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../supabase/browserClient'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }))
      } else {
        setState(prev => ({ ...prev, user: session?.user ?? null, loading: false }))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null, loading: false, error: null }))
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      return { success: false, error: error.message }
    }

    setState(prev => ({ ...prev, user: data.user, loading: false, error: null }))
    return { success: true, user: data.user }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
    } else {
      setState(prev => ({ ...prev, user: null, loading: false, error: null }))
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
  }
}
