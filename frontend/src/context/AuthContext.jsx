import React, { createContext, useState, useEffect } from 'react'
import authApi from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const res = await authApi.getMe()
          const userData = res.data?.data || res.data
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (err) {
          console.error('Failed to restore user session:', err)
          // Interceptor might handle refresh, otherwise clear
          if (!localStorage.getItem('token')) {
            setUser(null)
          }
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username, password) => {
    const res = await authApi.login({ username, password })
    const data = res.data?.data || res.data

    const accessToken = data.token
    const refreshToken = data.refreshToken
    const userInfo = data.user || {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    }

    localStorage.setItem('token', accessToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userInfo))

    setToken(accessToken)
    setUser(userInfo)
    return userInfo
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  const value = {
    user,
    token,
    role: user?.role || '',
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

