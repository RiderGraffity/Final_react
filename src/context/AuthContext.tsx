import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api, setOnUnauthorized } from '../api/client'
import type { LoginDto, Role, UserDto } from '../types'

interface AuthValue {
  token: string | null
  role: Role | null
  user: UserDto | null
  loading: boolean
  login: (email: string, password: string) => Promise<UserDto>
  logout: () => void
}

const AuthCtx = createContext<AuthValue>(null as unknown as AuthValue)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'))
  const [role, setRole] = useState<Role | null>(localStorage.getItem('role') as Role | null)
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(!!token)

  const clearAuth = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    setToken(null)
    setRole(null)
    setUser(null)
    qc.clear()
  }

  useEffect(() => {
    setOnUnauthorized(() => {
      clearAuth()
      navigate('/login')
    })
  })

  useEffect(() => {
    if (!token) return
    api
      .get<UserDto>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post<LoginDto>('/auth/login', { email, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('role', res.data.role)
    setToken(res.data.accessToken)
    setRole(res.data.role)
    const me = await api.get<UserDto>('/auth/me')
    setUser(me.data)
    return me.data
  }

  const logout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <AuthCtx.Provider value={{ token, role, user, loading, login, logout }}>{children}</AuthCtx.Provider>
  )
}
