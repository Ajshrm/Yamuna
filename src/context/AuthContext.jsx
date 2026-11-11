import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthContext from './auth'
import { apiRequest } from '../lib/api'

function readSession() {
  const token = sessionStorage.getItem('shopToken')
  const storedUser = sessionStorage.getItem('shopUser')
  if (!token || !storedUser) {
    return null
  }

  try {
    return { token, user: JSON.parse(storedUser) }
  } catch (error) {
    console.error('Unable to read the saved login session:', error)
    sessionStorage.removeItem('shopToken')
    sessionStorage.removeItem('shopUser')
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [isLoading, setIsLoading] = useState(() => Boolean(session?.token))

  useEffect(() => {
    localStorage.removeItem('currentUser')
  }, [])

  useEffect(() => {
    if (!session?.token) {
      return undefined
    }

    let active = true
    apiRequest('/api/auth/me', { token: session.token })
      .then(({ user }) => {
        if (active) {
          sessionStorage.setItem('shopUser', JSON.stringify(user))
          setSession({ token: session.token, user })
        }
      })
      .catch((error) => {
        if (active) {
          console.error('Unable to verify the saved login session:', error)
          sessionStorage.removeItem('shopToken')
          sessionStorage.removeItem('shopUser')
          setSession(null)
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [session?.token])

  const authenticate = useCallback(async (endpoint, credentials) => {
    const result = await apiRequest(`/api/auth/${endpoint}`, {
      method: 'POST',
      body: credentials,
    })
    sessionStorage.setItem('shopToken', result.token)
    sessionStorage.setItem('shopUser', JSON.stringify(result.user))
    setSession({ token: result.token, user: result.user })
    localStorage.removeItem('currentUser')
    return result.user
  }, [])

  const login = useCallback((credentials) => authenticate('login', credentials), [authenticate])
  const register = useCallback((credentials) => authenticate('register', credentials), [authenticate])

  const logout = useCallback(() => {
    sessionStorage.removeItem('shopToken')
    sessionStorage.removeItem('shopUser')
    localStorage.removeItem('currentUser')
    setSession(null)
  }, [])

  const value = useMemo(() => ({
    token: session?.token || null,
    user: session?.user || null,
    isLoading,
    login,
    register,
    logout,
  }), [isLoading, login, logout, register, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

