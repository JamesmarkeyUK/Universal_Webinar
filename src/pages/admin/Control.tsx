import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Camera,
  Check,
  Copy,
  Eye,
  EyeOff,
  Hand,
  Loader2,
  Lock,
  MonitorUp,
  Power,
  Settings2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  countRegistrations,
  getWebinarBySlug,
  listRegistrations,
  updateWebinar,
} from '@/lib/db'
import { getErrorMessage } from '@/lib/errors'
import type { RegistrationRow, WebinarRow } from '@/lib/database.types'

export function AdminControl() {
  const { slug = '' } = useParams()
  const [webinar, setWebinar] = useState<WebinarRow | null>(null)
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
  const [registrationCount, setRegistrationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const w = await getWebinarBySlug(slug)
        if (!active) return
        if (!w) {
          setError(`No webinar found for slug "${slug}".`)
          return
        }
        setWebinar(w)
        const [count, regs] = await Promise.all([
          countRegistrations(w.id),
          listRegistrations(w.id),
        ])
        if (!active) return
        setRegistrationCount(count)
        setRegistrations(regs)
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Load failed.'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [slug])

  async function patchWebinar(patch: Partial<WebinarRow>, label: string) {
    if (!webinar) return
    setSaving(label)
    try {
      const next = await updateWebinar(webinar.id, patch)
      setWebinar(next)
    } catch (err) {
      setError(getErrorMessage(err, 'Update failed.'))
    } finally {
      setSaving(null)
    }
  }

  async function toggleLive() {
    if (!webinar) return
    const goingLive = webinar.status !== 'live'
    await patchWebinar(
      {
        status: goingLive ? 'live' : 'ended',
        started_at:
          goingLive && !webinar.started_at
            ? new Date().toISOString()
            : webinar.started_at,
        ended_at: goingLive ? null : new Date().toISOString(),
      },
      'status',
    )
  }

  async function copyShareLink() {
    if (!webinar) return
    const url = `${window.location.origin}/w/${webinar.slug}/register`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error || !webinar) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/admin">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Control room
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {webinar.title}{' '}
            <span className="text-slate-400">·</span>{' '}
            <span className="text-slate-500 text-base font-mono">
              /{webinar.slug}
            </span>
          </h1>
          {webinar.description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {webinar.description}
            </p>
          )}
        </div>
        <Button
          size="lg"
          variant={webinar.status === 'live' ? 'destructive' : 'default'}
          onClick={toggleLive}
          disabled={saving === 'status'}
        >
          {saving === 'status' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}
          {webinar.status === 'live' ? 'End webinar' : 'Go live'}
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={copyShareLink}>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy registration link'}
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/w/${webinar.slug}/register`} target="_blank">
            Open registration page ↗
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your stage</CardTitle>
              <CardDescription>
                Camera preview and broadcast controls. Wires up in Phase 4 with
                LiveKit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-xl bg-slate-900 grid place-items-center text-slate-300 text-sm">
                <div className="text-center">
                  <Camera className="mx-auto h-10 w-10 text-slate-500" />
                  <p className="mt-2">Camera preview</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" disabled>
                  <Camera className="h-4 w-4" />
                  Test camera
                </Button>
                <Button variant="outline" disabled>
                  <MonitorUp className="h-4 w-4" />
                  Share screen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-4 w-4 text-slate-500" />
                Speaker queue
              </CardTitle>
              <CardDescription>
                Approve guests to share their camera and mic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                No pending requests. The queue appears here when guests raise
                their hand. (Phase 5.)
              </p>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-slate-500" />
                Room settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ToggleRow
                icon={
                  webinar.show_guest_count ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )
                }
                label="Show attendee count"
                hint="Guests see how many people are watching."
                checked={webinar.show_guest_count}
                disabled={saving === 'show_guest_count'}
                onChange={(next) =>
                  patchWebinar({ show_guest_count: next }, 'show_guest_count')
                }
              />
              <ToggleRow
                icon={<Hand className="h-4 w-4" />}
                label="Allow speaker requests"
                hint="Guests can request to join the conversation."
                checked={webinar.allow_speak_requests}
                disabled={saving === 'allow_speak_requests'}
                onChange={(next) =>
                  patchWebinar(
                    { allow_speak_requests: next },
                    'allow_speak_requests',
                  )
                }
              />
              <ToggleRow
                icon={<Lock className="h-4 w-4" />}
                label="PIN-lock the webinar"
                hint="Lands in Phase 6."
                checked={false}
                disabled
                onChange={() => {}}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                Registrations
              </CardTitle>
              <CardDescription>
                {registrationCount} pre-registered
                {registrations.length > 0 && registrations.length !== registrationCount
                  ? ` (showing ${registrations.length})`
                  : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No one has registered yet. Share the registration link above.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {registrations.slice(0, 10).map((r) => (
                    <li key={r.id} className="flex flex-col py-2">
                      <span className="font-medium text-slate-900">
                        {r.name}
                      </span>
                      <span className="text-xs text-slate-500">{r.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'group flex w-full items-start justify-between gap-3 rounded-lg p-2.5 text-left transition',
        disabled ? 'opacity-60' : 'hover:bg-slate-50',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-slate-500">{icon}</span>
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
      </div>
      <span
        className={cn(
          'mt-0.5 relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-slate-300',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}
