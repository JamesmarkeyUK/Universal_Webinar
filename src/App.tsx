import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout, PublicLayout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Landing } from '@/pages/Landing'
import { Join } from '@/pages/Join'
import { Live } from '@/pages/Live'
import { Register } from '@/pages/Register'
import { AdminLogin } from '@/pages/admin/Login'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminControl } from '@/pages/admin/Control'
import { AdminSettings } from '@/pages/admin/Settings'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/w/:slug" element={<Join />} />
        <Route path="/w/:slug/register" element={<Register />} />
        <Route path="/w/:slug/live" element={<Live />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/w/:slug" element={<AdminControl />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
