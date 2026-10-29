import type { CommentDto, HistoryDto, RefItem, RequestDto, Role } from '../types'

interface DbUser {
  id: number
  email: string
  password: string
  name: string
  role: Role
}

const users: DbUser[] = [
  { id: 1, email: 'user@example.com', password: 'user123', name: 'Іван Петренко', role: 'user' },
  { id: 2, email: 'operator@example.com', password: 'operator123', name: 'Оксана Мельник', role: 'operator' },
]

const categories: RefItem[] = [
  { id: 1, name: 'Ремонт обладнання' },
  { id: 2, name: 'Налаштування' },
  { id: 3, name: 'Консультація' },
]

const priorities: RefItem[] = [
  { id: 1, name: 'Низький' },
  { id: 2, name: 'Середній' },
  { id: 3, name: 'Високий' },
]

const statuses: RefItem[] = [
  { id: 1, name: 'Нова' },
  { id: 2, name: 'В роботі' },
  { id: 3, name: 'Очікує клієнта' },
  { id: 4, name: 'Закрита' },
]

const mkReq = (id: number, subject: string, cat: number, pr: number, st: number, userId: number): RequestDto => ({
  id,
  subject,
  description: 'Опис проблеми для заявки "' + subject + '". Потрібна допомога фахівця.',
  categoryId: cat,
  priorityId: pr,
  statusId: st,
  createdAt: new Date(Date.now() - id * 86400000).toISOString(),
  userId,
  contact: { name: userId === 1 ? 'Іван Петренко' : 'Андрій Коваль', phone: '+380501234567', email: 'client' + id + '@mail.com' },
})

const requests: RequestDto[] = [
  mkReq(1, 'Не вмикається принтер', 1, 3, 1, 1),
  mkReq(2, 'Налаштування Wi-Fi роутера', 2, 2, 2, 1),
  mkReq(3, 'Шум у кондиціонері', 1, 1, 3, 1),
  mkReq(4, 'Питання щодо гарантії', 3, 1, 4, 3),
  mkReq(5, 'Сервер перегрівається', 1, 3, 2, 3),
  mkReq(6, 'Оновлення прошивки', 2, 2, 1, 3),
]

const comments: CommentDto[] = [
  { id: 1, requestId: 2, author: 'Оксана Мельник', text: 'Фахівець виїде завтра зранку.', createdAt: new Date().toISOString() },
  { id: 2, requestId: 5, author: 'Оксана Мельник', text: 'Чекаємо на запчастини.', createdAt: new Date().toISOString() },
]

const history: HistoryDto[] = [
  { id: 1, requestId: 2, from_status: 1, to_status: 2, changedAt: new Date().toISOString() },
  { id: 2, requestId: 4, from_status: 2, to_status: 4, changedAt: new Date().toISOString() },
]

export const db = { users, categories, priorities, statuses, requests, comments, history }

let counter = 100
export const nextId = () => ++counter
