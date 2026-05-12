import { Link, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'

export function PublicLayout() {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <TopBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const navItems = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/settings', label: 'Settings' },
  ]
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="flex items-center">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.to ||
                  (item.to !== '/admin' && pathname.startsWith(item.to))
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              Admin
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/login"
            className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Universal Webinar</p>
        <p>Built for live conversations.</p>
      </div>
    </footer>
  )
}
