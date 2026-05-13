import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ChevronDown,
  Mail,
  Palette,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  {
    to: '/host/upgrade',
    label: 'Upgrade to Pro',
    icon: Sparkles,
    badge: 'Pro' as const,
    description: 'Unlock branding, statistics, and automated emails.',
  },
  {
    to: '/host/branding',
    label: 'My branding',
    icon: Palette,
    description: 'Logo, accent color, and white-label.',
  },
  {
    to: '/host/statistics',
    label: 'My statistics',
    icon: TrendingUp,
    description: 'Attendance, engagement, and chat insights.',
  },
  {
    to: '/host/emails',
    label: 'Automatic emails',
    icon: Mail,
    description: 'Reminders, recordings, follow-ups.',
  },
]

export function CompanyMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
          open
            ? 'bg-slate-100 text-slate-900'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <Building2 className="h-4 w-4" />
        <span>My company</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          {ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-700">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {item.description}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
