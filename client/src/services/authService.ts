const BASE_URL = 'http://localhost:3000'

const TOKEN_KEY = 'auth_token'
const ROLE_KEY = 'auth_role'
const USER_KEY = 'auth_user'

export type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  success: boolean
  data?: {
    token: string
    user: {
      id: number
      fullName: string
      email: string
      role: string
    }
  }
  message?: string
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY)
}

export function isAdmin() {
  return getRole() === 'admin'
}

export type CurrentUser = {
  id: number
  fullName: string
  email: string
  role: string
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CurrentUser
  } catch {
    return null
  }
}

export async function login(payload: LoginPayload) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = (await res.json()) as LoginResponse

  if (!res.ok || !json.success || !json.data?.token) {
    throw new Error(json.message || 'Login failed')
  }

  setToken(json.data.token)
  localStorage.setItem(ROLE_KEY, json.data.user.role)
  localStorage.setItem(USER_KEY, JSON.stringify(json.data.user))
  return json.data.user
}
