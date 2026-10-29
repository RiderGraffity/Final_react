import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'
import { getErrorText } from '../api/client'

const loginSchema = z.object({
  email: z.string().min(1, 'Введіть email').email('Некоректний email'),
  password: z.string().min(6, 'Мінімум 6 символів'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const notify = useNotify()
  const navigate = useNavigate()
  const emailRef = useRef<HTMLInputElement | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })
  const { ref: emailFormRef, ...emailRest } = register('email')

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const mutation = useMutation({
    mutationFn: (v: LoginForm) => login(v.email, v.password),
    onSuccess: (me) => {
      notify('success', 'Вхід виконано успішно')
      navigate('/requests')
    },
    onError: (err) => notify('error', getErrorText(err)),
  })

  return (
    <form className="card form" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
      <h2>Вхід</h2>
      <label>
        Email
        <input
          {...emailRest}
          ref={(el) => {
            emailFormRef(el)
            emailRef.current = el
          }}
        />
        {errors.email && <span className="err">{errors.email.message}</span>}
      </label>
      <label>
        Пароль
        <input type="password" {...register('password')} />
        {errors.password && <span className="err">{errors.password.message}</span>}
      </label>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Входимо...' : 'Увійти'}
      </button>
    </form>
  )
}
