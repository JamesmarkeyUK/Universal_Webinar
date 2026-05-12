import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout, PublicLayout } from '@/components/Layout'
import { Landing } from '@/pages/Landing'
import { Join } from '@/pages/Join'
import { Live } from '@/pages/Live'
import { AdminLogin } from '@/pages/admin/Login'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminControl } from '@/pages/admin/Control'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/w/:slug" element={<Join />} />
        <Route path="/w/:slug/live" element={<Live />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/w/:slug" element={<AdminControl />} />
        <Route
          path="/admin/settings"
          element={
            <div className="container py-12">
              <h1 className="text-2xl font-semibold">Settings</h1>
              <p className="mt-2 text-slate-500">Coming in Phase 2.</p>
            </div>
          }
        />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
