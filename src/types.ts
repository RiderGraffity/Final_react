export type Role = 'user' | 'operator'

export interface UserDto {
  id: number
  email: string
  name: string
  role: Role
}

export interface LoginDto {
  accessToken: string
  role: Role
}

export interface RefItem {
  id: number
  name: string
}

export interface ContactDto {
  name: string
  phone: string
  email: string
}

export interface CommentDto {
  id: number
  requestId: number
  author: string
  text: string
  createdAt: string
}

export interface HistoryDto {
  id: number
  requestId: number
  from_status: number | null
  to_status: number
  changedAt: string
}

export interface RequestDto {
  id: number
  subject: string
  description: string
  categoryId: number
  priorityId: number
  statusId: number
  createdAt: string
  userId: number
  contact: ContactDto
  comments?: CommentDto[]
}

export interface NewRequestBody {
  subject: string
  description: string
  categoryId: number
  priorityId: number
  contact: ContactDto
}
