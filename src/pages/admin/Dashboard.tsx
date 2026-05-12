import { Link } from 'react-router-dom'
import { Calendar, Plus, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const stubWebinars = [
  {
    slug: 'demo',
    title: 'Welcome to Universal Webinar',
    scheduledAt: 'Live now',
    status: 'live' as const,
    registered: 42,
  },
  {
    slug: 'product-q4',
    title: 'Product update — Q4 walkthrough',
    scheduledAt: 'Thu, Jun 5 · 3:00 PM',
    status: 'scheduled' as const,
    registered: 18,
  },
]

export function AdminDashboard() {
  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Your webinars
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Schedule a new room, or jump back into one that's live.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New webinar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stubWebinars.map((w) => (
          <Card key={w.slug}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{w.title}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1.5">
                    {w.status === 'live' ? (
                      <Radio className="h-3.5 w-3.5 text-red-600" />
                    ) : (
                      <Calendar className="h-3.5 w-3.5" />
                    )}
                    {w.scheduledAt}
                  </CardDescription>
                </div>
                {w.status === 'live' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
                    LIVE
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-900">
                  {w.registered}
                </span>{' '}
                registered
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/w/${w.slug}`}>View</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={`/admin/w/${w.slug}`}>
                    {w.status === 'live' ? 'Control room' : 'Manage'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        Demo data — Supabase wiring lands in Phase 2.
      </p>
    </div>
  )
}
