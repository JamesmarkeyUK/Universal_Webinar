import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Camera,
  Eye,
  EyeOff,
  Hand,
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

export function AdminControl() {
  const { slug } = useParams()
  const [live, setLive] = useState(false)
  const [showGuestCount, setShowGuestCount] = useState(true)
  const [allowSpeakRequests, setAllowSpeakRequests] = useState(false)
  const [pinLocked, setPinLocked] = useState(false)

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Control room
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome to Universal Webinar{' '}
            <span className="text-slate-400">·</span>{' '}
            <span className="text-slate-500 text-base">/{slug}</span>
          </h1>
        </div>
        <Button
          size="lg"
          variant={live ? 'destructive' : 'default'}
          onClick={() => setLive((v) => !v)}
        >
          <Power className="h-4 w-4" />
          {live ? 'End webinar' : 'Go live'}
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
                <Button variant="outline">
                  <Camera className="h-4 w-4" />
                  Test camera
                </Button>
                <Button variant="outline">
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
            <CardContent className="space-y-2">
              <ToggleRow
                icon={showGuestCount ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                label="Show attendee count"
                hint="Guests see how many people are watching."
                checked={showGuestCount}
                onChange={setShowGuestCount}
              />
              <ToggleRow
                icon={<Hand className="h-4 w-4" />}
                label="Allow speaker requests"
                hint="Guests can request to join the conversation."
                checked={allowSpeakRequests}
                onChange={setAllowSpeakRequests}
              />
              <ToggleRow
                icon={<Lock className="h-4 w-4" />}
                label="PIN-lock the webinar"
                hint="Guests must enter a PIN to join."
                checked={pinLocked}
                onChange={setPinLocked}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                The roster (name + email) shows here once guests join. Phase 3.
              </p>
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
  onChange,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start justify-between gap-3 rounded-lg p-2.5 text-left transition hover:bg-slate-50"
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
