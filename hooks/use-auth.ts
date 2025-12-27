/**
 * Authentication hook
 * Manages user login state and authentication
 */

import { useState, useCallback } from 'react'
import type { Employee } from '../types'

interface AuthState {
  isLoggedIn: boolean
  currentUser: Employee | null
}

export function useAuth(allEmployees: Employee[]) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    currentUser: null
  })

  const login = useCallback(async (code: string, password: string): Promise<void> => {
    const user = allEmployees.find(e => e.code === code && e.password === password)

    if (user) {
      setState({
        isLoggedIn: true,
        currentUser: user
      })
    } else {
      throw new Error("Mã nhân viên hoặc mật khẩu không đúng.")
    }
  }, [allEmployees])

  const logout = useCallback(() => {
    setState({
      isLoggedIn: false,
      currentUser: null
    })
  }, [])

  return {
    ...state,
    login,
    logout
  }
}

export type UseAuth = ReturnType<typeof useAuth>
