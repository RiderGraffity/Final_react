import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { api, getErrorText } from '../api/client'
import { fmtDate, nameById, usePriorities, useStatuses } from '../api/hooks'
import { useAuth } from '../context/AuthContext'
import type { RequestDto } from '../types'

export default function RequestsPage() {
  const { role } = useAuth()
  const [params, setParams] = useSearchParams()
  const status_filter = params.get('status') || ''
  const statuses = useStatuses()
  const priorities = usePriorities()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['requests', role],
    queryFn: async () => {
      const url = role === 'operator' ? '/requests' : '/requests/my'
      return (await api.get<RequestDto[]>(url)).data
    },
    enabled: !!role,
  })

  const onFilter = (value: string) => {
    if (value) setParams({ status: value })
    else setParams({})
  }

  const list = data?.filter((r) => !status_filter || String(r.statusId) === status_filter)

  return (
    <div>
      <div className="row">
        <h2>{role === 'operator' ? 'Усі заявки' : 'Мої заявки'}</h2>
        <select value={status_filter} onChange={(e) => onFilter(e.target.value)}>
          <option value="">Усі статуси</option>
          {statuses.data?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {role === 'user' && <Link to="/requests/new" className="btn">Створити заявку</Link>}
      </div>

      {isLoading && <p>Завантаження заявок...</p>}
      {isError && (
        <div className="err-box">
          <p>{getErrorText(error)}</p>
          <button onClick={() => refetch()}>Спробувати ще раз</button>
        </div>
      )}
      {list && list.length === 0 && <p>Заявок не знайдено</p>}
      {list && list.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>№</th><th>Тема</th><th>Пріоритет</th><th>Статус</th><th>Створено</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><Link to={'/requests/' + r.id}>{r.subject}</Link></td>
                <td>{nameById(priorities.data, r.priorityId)}</td>
                <td>{nameById(statuses.data, r.statusId)}</td>
                <td>{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
