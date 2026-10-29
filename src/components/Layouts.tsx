import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PublicLayout() {
  return (
    <div className="public">
      <h1>Сервісні заявки</h1>
      <Outlet />
    </div>
  )
}

export function AppLayout() {
  const { user, role, logout } = useAuth()
  return (
    <div>
      <header className="header">
        <Link to="/requests" className="logo">Сервісні заявки</Link>
        <nav>
          <NavLink to="/requests" end>{role === 'operator' ? 'Усі заявки' : 'Мої заявки'}</NavLink>
          {role === 'user' && <NavLink to="/requests/new">Нова заявка</NavLink>}
        </nav>
        <div className="who">
          <span>{user?.name} ({role})</span>
          <button onClick={logout}>Вийти</button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
