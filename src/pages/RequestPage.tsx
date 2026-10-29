import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, getErrorText } from '../api/client'
import { fmtDate, nameById, useCategories, usePriorities, useStatuses } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'
import type { HistoryDto, RequestDto } from '../types'

export default function RequestPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const notify = useNotify()
  const qc = useQueryClient()
  const [new_comment, setNewComment] = useState('')

  const statuses = useStatuses()
  const categories = useCategories()
  const priorities = usePriorities()

  const request = useQuery({
    queryKey: ['request', id],
    queryFn: async () => (await api.get<RequestDto>('/requests/' + id)).data,
  })
  const history = useQuery({
    queryKey: ['history', id],
    queryFn: async () => (await api.get<HistoryDto[]>('/requests/' + id + '/history')).data,
  })

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ['request', id] })
    qc.invalidateQueries({ queryKey: ['history', id] })
    qc.invalidateQueries({ queryKey: ['requests'] })
  }

  const statusMutation = useMutation({
    mutationFn: async (statusId: number) => (await api.patch('/requests/' + id + '/status', { statusId })).data,
    onSuccess: () => {
      refreshAll()
      notify('success', 'Статус змінено')
    },
    onError: (err) => notify('error', 'Не вдалося змінити статус: ' + getErrorText(err)),
  })

  const commentMutation = useMutation({
    mutationFn: async (text: string) => (await api.post('/requests/' + id + '/comments', { text })).data,
    onSuccess: () => {
      setNewComment('')
      qc.invalidateQueries({ queryKey: ['request', id] })
      notify('success', 'Коментар додано')
    },
    onError: (err) => notify('error', getErrorText(err)),
  })

  if (request.isLoading) return <p>Завантаження заявки...</p>
  if (request.isError || !request.data) {
    return (
      <div className="err-box">
        <p>{getErrorText(request.error)}</p>
        <Link to="/requests">До списку заявок</Link>
      </div>
    )
  }

  const r = request.data

  return (
    <div className="details">
      <Link to="/requests">← Назад</Link>
      <h2>#{r.id} {r.subject}</h2>
      <div className="card">
        <p>{r.description}</p>
        <p><b>Категорія:</b> {nameById(categories.data, r.categoryId)}</p>
        <p><b>Пріоритет:</b> {nameById(priorities.data, r.priorityId)}</p>
        <p><b>Створено:</b> {fmtDate(r.createdAt)}</p>
        <p><b>Статус:</b> {nameById(statuses.data, r.statusId)}</p>
        <p><b>Контакти:</b> {r.contact.name}, {r.contact.phone}, {r.contact.email}</p>

        {role === 'operator' && (
          <label>
            Змінити статус
            <select
              value={r.statusId}
              disabled={statusMutation.isPending}
              onChange={(e) => statusMutation.mutate(Number(e.target.value))}
            >
              {statuses.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        )}
      </div>

      <h3>Історія статусів</h3>
      {history.isLoading && <p>Завантаження історії...</p>}
      {history.data?.length === 0 && <p>Змін статусу ще не було</p>}
      <ul>
        {history.data?.map((h) => (
          <li key={h.id}>
            {h.from_status ? nameById(statuses.data, h.from_status) : '—'} → {nameById(statuses.data, h.to_status)} ({fmtDate(h.changedAt)})
          </li>
        ))}
      </ul>

      <h3>Коментарі</h3>
      {r.comments?.length === 0 && <p>Коментарів поки немає</p>}
      {r.comments?.map((c) => (
        <div key={c.id} className="comment">
          <b>{c.author}</b> <small>{fmtDate(c.createdAt)}</small>
          <p>{c.text}</p>
        </div>
      ))}

      {role === 'operator' && (
        <div className="form">
          <textarea rows={3} value={new_comment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ваш коментар" />
          <button
            disabled={commentMutation.isPending || new_comment.trim().length === 0}
            onClick={() => commentMutation.mutate(new_comment.trim())}
          >
            {commentMutation.isPending ? 'Додаємо...' : 'Додати коментар'}
          </button>
        </div>
      )}
    </div>
  )
}
