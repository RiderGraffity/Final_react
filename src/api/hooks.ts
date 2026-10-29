import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { RefItem } from '../types'

const refQuery = (key: string, url: string) => ({
  queryKey: [key],
  queryFn: async () => (await api.get<RefItem[]>(url)).data,
  staleTime: 60000,
})

export const useStatuses = () => useQuery(refQuery('statuses', '/request-statuses'))
export const useCategories = () => useQuery(refQuery('categories', '/categories'))
export const usePriorities = () => useQuery(refQuery('priorities', '/priorities'))

export const nameById = (list: RefItem[] | undefined, id: number) =>
  list?.find((i) => i.id === id)?.name ?? '—'

export const fmtDate = (d: string) => new Date(d).toLocaleString('uk-UA')
