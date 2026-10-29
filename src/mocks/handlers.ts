import { http, HttpResponse, delay } from 'msw'
import { db, nextId } from './db'
import type { NewRequestBody } from '../types'

const base = '/api'

function getUser(req: Request) {
  const header = req.headers.get('Authorization')
  if (!header) return null
  const token = header.replace('Bearer ', '')
  return db.users.find((u) => 'token-' + u.id === token) || null
}

const unauth = () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
const forbidden = () => HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
const notFound = () => HttpResponse.json({ message: 'Not found' }, { status: 404 })

const withComments = (id: number) => {
  const r = db.requests.find((x) => x.id === id)
  if (!r) return null
  return { ...r, comments: db.comments.filter((c) => c.requestId === id) }
}

export const handlers = [
  http.post(base + '/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    const found = db.users.find((u) => u.email === body.email && u.password === body.password)
    if (!found) return HttpResponse.json({ message: 'Невірний email або пароль' }, { status: 400 })
    return HttpResponse.json({ accessToken: 'token-' + found.id, role: found.role })
  }),

  http.get(base + '/auth/me', ({ request }) => {
    const u = getUser(request)
    if (!u) return unauth()
    const { password, ...safe } = u
    return HttpResponse.json(safe)
  }),

  http.get(base + '/requests/my', async ({ request }) => {
    const u = getUser(request)
    if (!u) return unauth()
    await delay(900)
    return HttpResponse.json(db.requests.filter((r) => r.userId === u.id))
  }),

  http.get(base + '/requests', async ({ request }) => {
    const u = getUser(request)
    if (!u) return unauth()
    if (u.role !== 'operator') return forbidden()
    await delay(900)
    return HttpResponse.json(db.requests)
  }),

  http.get(base + '/requests/:id', ({ request, params }) => {
    const u = getUser(request)
    if (!u) return unauth()
    const r = withComments(Number(params.id))
    if (!r) return notFound()
    if (u.role === 'user' && r.userId !== u.id) return forbidden()
    return HttpResponse.json(r)
  }),

  http.post(base + '/requests', async ({ request }) => {
    const u = getUser(request)
    if (!u) return unauth()
    const body = (await request.json()) as NewRequestBody
    if (body.subject.toLowerCase().includes('server500')) {
      return HttpResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 })
    }
    if (body.subject.toLowerCase().includes('neterror')) {
      return HttpResponse.error()
    }
    const newReq = {
      id: nextId(),
      ...body,
      statusId: 1,
      createdAt: new Date().toISOString(),
      userId: u.id,
    }
    db.requests = [newReq, ...db.requests]
    return HttpResponse.json(newReq, { status: 201 })
  }),

  http.patch(base + '/requests/:id/status', async ({ request, params }) => {
    const u = getUser(request)
    if (!u) return unauth()
    if (u.role !== 'operator') return forbidden()
    const id = Number(params.id)
    const { statusId } = (await request.json()) as { statusId: number }
    const old = db.requests.find((r) => r.id === id)
    if (!old) return notFound()
    db.history = [
      ...db.history,
      { id: nextId(), requestId: id, from_status: old.statusId, to_status: statusId, changedAt: new Date().toISOString() },
    ]
    db.requests = db.requests.map((r) => (r.id === id ? { ...r, statusId } : r))
    return HttpResponse.json(withComments(id))
  }),

  http.post(base + '/requests/:id/comments', async ({ request, params }) => {
    const u = getUser(request)
    if (!u) return unauth()
    if (u.role !== 'operator') return forbidden()
    const id = Number(params.id)
    const { text } = (await request.json()) as { text: string }
    if (!db.requests.find((r) => r.id === id)) return notFound()
    const c = { id: nextId(), requestId: id, author: u.name, text, createdAt: new Date().toISOString() }
    db.comments = [...db.comments, c]
    return HttpResponse.json(c, { status: 201 })
  }),

  http.get(base + '/requests/:id/history', ({ request, params }) => {
    if (!getUser(request)) return unauth()
    return HttpResponse.json(db.history.filter((h) => h.requestId === Number(params.id)))
  }),

  http.get(base + '/categories', ({ request }) => {
    if (!getUser(request)) return unauth()
    return HttpResponse.json(db.categories)
  }),

  http.get(base + '/priorities', ({ request }) => {
    if (!getUser(request)) return unauth()
    return HttpResponse.json(db.priorities)
  }),

  http.get(base + '/request-statuses', ({ request }) => {
    if (!getUser(request)) return unauth()
    return HttpResponse.json(db.statuses)
  }),
]
