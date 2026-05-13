import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
  Radio,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AddToCalendarButton } from '@/components/AddToCalendarButton'
import { useAuth } from '@/lib/auth'
import {
  getMyAttendee,
  getWebinarBySlug,
  joinAsAttendee,
  registerForWebinar,
} from '@/lib/db'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import type { WebinarRow } from '@/lib/database.types'

const NAME_KEY = 'uw:lastName'
const EMAIL_KEY = 'uw:lastEmail'

export function Register() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading, configured, signInAnonymously } = useAuth()

  const [webinar, setWebinar] = useState<WebinarRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '')
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const w = await getWebinarBySlug(slug)
        if (!active) return
        setWebinar(w)
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

  // If the user already has an attendee row in this webinar (returning visit),
  // treat the page as the success-state view rather than asking for details
  // again. Live webinars send them straight to the room.
  useEffect(() => {
    if (!webinar || authLoading || !user) return
    let active = true
    ;(async () => {
      try {
        const existing = await getMyAttendee(webinar.id)
        if (!active || !existing) return
        if (webinar.status === 'live') {
          navigate(`/w/${webinar.slug}/live`, { replace: true })
        } else {
          setRegistered(true)
        }
      } catch {
        // Non-fatal.
      }
    })()
    return () => {
      active = false
    }
  }, [webinar, authLoading, user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!webinar) return
    setError(null)
    setSubmitting(true)
    try {
      // 1. Make sure we have a Supabase session (anonymous is fine).
      if (!user) {
        const result = await signInAnonymously()
        if (result.error) {
          setError(result.error)
          return
        }
      }
      const { data: userResult } = await supabase.auth.getUser()
      const userId = userResult.user?.id
      if (!userId) {
        setError('Could not start a session. Try again.')
        return
      }
      const trimmedName = name.trim()
      const trimmedEmail = email.trim().toLowerCase()

      // 2. Capture in registrations (idempotent on email).
      await registerForWebinar(webinar.id, trimmedName, trimmedEmail)

      // 3. Create the attendee row tied to this anon user (idempotent).
      const existing = await getMyAttendee(webinar.id)
      if (!existing) {
        await joinAsAttendee({
          webinar_id: webinar.id,
          name: trimmedName,
          email: trimmedEmail,
          auth_user_id: userId,
        })
      }

      localStorage.setItem(NAME_KEY, trimmedName)
      localStorage.setItem(EMAIL_KEY, trimmedEmail)

      // 4. Send live attendees straight into the room — no second prompt.
      if (webinar.status === 'live') {
        navigate(`/w/${webinar.slug}/live`, { replace: true })
        return
      }
      setRegistered(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not register.'))
    } finally {
      setSubmitting(false)
    }
  }

  const joinUrl = useMemo(() => {
    if (!webinar) return ''
    return `${window.location.origin}/w/${webinar.slug}/live`
  }, [webinar])

  const scheduleInfo = useMemo(() => {
    if (!webinar?.scheduled_at) return null
    const date = new Date(webinar.scheduled_at)
    return {
      date,
      isFuture: date.getTime() > Date.now(),
      label: date.toLocaleString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    }
  }, [webinar])

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!webinar) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-semibold">We couldn't find that webinar.</h1>
          <p className="mt-2 text-slate-500">
            The link might be wrong or the room may have been removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {registered ? "You're in" : 'Save your seat'}
          </span>
        </div>

        {registered ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                You're in.
              </CardTitle>
              <CardDescription className="space-y-1.5">
                <p>
                  We saved your spot for <strong>{webinar.title}</strong>.
                </p>
                {scheduleInfo?.isFuture && (
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {scheduleInfo.label}
                  </p>
                )}
                {webinar.status === 'live' && (
                  <p className="flex items-center gap-1.5 font-medium text-red-700">
                    <Radio className="h-3.5 w-3.5" />
                    Happening right now.
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduleInfo?.isFuture && (
                <AddToCalendarButton
                  webinar={webinar}
                  joinUrl={joinUrl}
                />
              )}
              <Button asChild className="w-full" size="lg">
                <Link to={`/w/${webinar.slug}/live`}>
                  {webinar.status === 'live'
                    ? 'Enter the room'
                    : scheduleInfo?.isFuture
                      ? 'Open the waiting room'
                      : 'Enter the room'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500"
                onClick={async () => {
                  await supabase.auth.signOut()
                  setRegistered(false)
                  setName('')
                  setEmail('')
                  localStorage.removeItem(NAME_KEY)
                  localStorage.removeItem(EMAIL_KEY)
                }}
              >
                Register someone else
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{webinar.title}</CardTitle>
              <CardDescription className="space-y-1.5">
                {webinar.description && <p>{webinar.description}</p>}
                {scheduleInfo && (
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {scheduleInfo.label}
                  </p>
                )}
                {webinar.status === 'live' && (
                  <p className="flex items-center gap-1.5 font-medium text-red-700">
                    <Radio className="h-3.5 w-3.5" />
                    Happening right now — register to join in.
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!configured && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Supabase isn't connected yet. The host needs to finish setup.
                </div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Cooper"
                    autoComplete="name"
                    required
                    maxLength={80}
                    disabled={submitting || !configured}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    autoComplete="email"
                    required
                    maxLength={200}
                    disabled={submitting || !configured}
                  />
                  <p className="text-xs text-slate-500">
                    We share this only with the host.
                  </p>
                </div>
                {error && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting || !configured}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : webinar.status === 'live' ? (
                    'Join now'
                  ) : (
                    'Save my seat'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          {registered
            ? 'See you soon.'
            : 'By joining, you agree to be visible to the host.'}
        </p>
      </div>
    </div>
  )
}
