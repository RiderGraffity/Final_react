import { api } from '../api/client'

describe('mock api', () => {
  it('логін користувача', async () => {
    const res = await api.post('/auth/login', { email: 'user@example.com', password: 'user123' })
    expect(res.data.role).toBe('user')
    expect(res.data.accessToken).toBeTruthy()
  })

  it('без токена віддає 401', async () => {
    await expect(api.get('/auth/me')).rejects.toMatchObject({ response: { status: 401 } })
  })

  it('оператор бачить усі заявки', async () => {
    localStorage.setItem('accessToken', 'token-2')
    const res = await api.get('/requests')
    expect(res.data.length).toBeGreaterThanOrEqual(5)
  })

  it('користувач не бачить загальний список', async () => {
    localStorage.setItem('accessToken', 'token-1')
    await expect(api.get('/requests')).rejects.toMatchObject({ response: { status: 403 } })
  })

  it('тема server500 дає помилку 500', async () => {
    localStorage.setItem('accessToken', 'token-1')
    const body = { subject: 'server500', description: 'test test test', categoryId: 1, priorityId: 1, contact: { name: 'a', phone: '1234567', email: 'a@a.com' } }
    await expect(api.post('/requests', body)).rejects.toMatchObject({ response: { status: 500 } })
  })
})
