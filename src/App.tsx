import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AppLayout, PublicLayout } from './components/Layouts'
import LoginPage from './pages/LoginPage'
import RequestsPage from './pages/RequestsPage'
import NewRequestPage from './pages/NewRequestPage'
import RequestPage from './pages/RequestPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/new" element={<NewRequestPage />} />
          <Route path="/requests/:id" element={<RequestPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/requests" replace />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  )
}
