import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { api, getErrorText } from '../api/client'
import { useCategories, usePriorities } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'
import type { NewRequestBody, RequestDto } from '../types'

const schema = z.object({
  subject: z.string().min(3, 'Тема занадто коротка'),
  description: z.string().min(10, 'Опишіть проблему детальніше (мін. 10 символів)'),
  categoryId: z.string().min(1, 'Оберіть категорію'),
  priorityId: z.string().min(1, 'Оберіть пріоритет'),
  contactName: z.string().min(2, "Вкажіть ім'я"),
  contactPhone: z.string().regex(/^\+?[0-9\s-]{7,15}$/, 'Некоректний телефон'),
  contactEmail: z.string().email('Некоректний email'),
})
type FormValues = z.infer<typeof schema>

export default function NewRequestPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const notify = useNotify()
  const qc = useQueryClient()
  const categories = useCategories()
  const priorities = usePriorities()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: async (body: NewRequestBody) => (await api.post<RequestDto>('/requests', body)).data,
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      notify('success', 'Заявку створено')
      navigate('/requests/' + created.id)
    },
    onError: (err) => notify('error', 'Не вдалося створити заявку: ' + getErrorText(err)),
  })

  if (role === 'operator') return <Navigate to="/requests" replace />

  const onSubmit = (v: FormValues) => {
    mutation.mutate({
      subject: v.subject,
      description: v.description,
      categoryId: Number(v.categoryId),
      priorityId: Number(v.priorityId),
      contact: { name: v.contactName, phone: v.contactPhone, email: v.contactEmail },
    })
  }

  return (
    <form className="card form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Нова заявка</h2>
      <label>
        Тема
        <input {...register('subject')} />
        {errors.subject && <span className="err">{errors.subject.message}</span>}
      </label>
      <label>
        Опис проблеми
        <textarea rows={4} {...register('description')} />
        {errors.description && <span className="err">{errors.description.message}</span>}
      </label>
      <label>
        Категорія
        <select {...register('categoryId')} defaultValue="">
          <option value="">Оберіть...</option>
          {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.categoryId && <span className="err">{errors.categoryId.message}</span>}
      </label>
      <label>
        Пріоритет
        <select {...register('priorityId')} defaultValue="">
          <option value="">Оберіть...</option>
          {priorities.data?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.priorityId && <span className="err">{errors.priorityId.message}</span>}
      </label>
      <label>
        Контактна особа
        <input {...register('contactName')} />
        {errors.contactName && <span className="err">{errors.contactName.message}</span>}
      </label>
      <label>
        Телефон
        <input {...register('contactPhone')} />
        {errors.contactPhone && <span className="err">{errors.contactPhone.message}</span>}
      </label>
      <label>
        Email для зв'язку
        <input {...register('contactEmail')} />
        {errors.contactEmail && <span className="err">{errors.contactEmail.message}</span>}
      </label>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Відправляємо...' : 'Створити заявку'}
      </button>
    </form>
  )
}
