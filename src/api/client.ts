import axios from 'axios'

let on_unauthorized: (() => void) | null = null

export function setOnUnauthorized(fn: () => void) {
  on_unauthorized = fn
}

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('role')
      if (on_unauthorized) on_unauthorized()
    }
    return Promise.reject(err)
  }
)

export function getErrorText(err: unknown): string {
  const e = err as any
  if (e?.response?.data?.message) return e.response.data.message
  if (e?.code === 'ERR_NETWORK') return 'Помилка мережі. Перевірте підключення'
  return 'Щось пішло не так'
}
