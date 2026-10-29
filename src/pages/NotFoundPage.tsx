import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="center">
      <h2>404 — сторінку не знайдено</h2>
      <Link to="/requests">На головну</Link>
    </div>
  )
}
