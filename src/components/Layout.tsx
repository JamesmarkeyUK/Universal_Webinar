import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { CompanyMenu } from './CompanyMenu'
import { HeaderBrandMark } from './HeaderBrandMark'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

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
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const navItems = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/settings', label: 'Settings' },
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="relative z-10 flex items-center gap-8">
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
          <div className="relative flex items-center gap-2 text-sm">
            <HeaderBrandMark variant="compact" />
            {user?.email && (
              <span className="relative z-10 hidden sm:inline truncate max-w-[200px] text-slate-500">
                {user.email}
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="relative z-10 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </button>
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
    <header className="relative overflow-hidden border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="relative z-10 flex items-center">
          <Logo />
        </Link>
        <nav className="relative flex items-center gap-1 text-sm">
          <HeaderBrandMark variant="compact" />
          <span className="relative z-10">
            <CompanyMenu />
          </span>
          <Link
            to="/admin/login"
            className="relative z-10 rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
      <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
        <div className="relative">
          <HeaderBrandMark />
          <p className="relative z-10 whitespace-nowrap">
            &copy; {new Date().getFullYear()} Universal Webinar
          </p>
        </div>
        <a
          href="https://www.unisim.co.uk"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-slate-600 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
        >
          Hosted by UNI SIM
        </a>
      </div>
    </footer>
  )
}
