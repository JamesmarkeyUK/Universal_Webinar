import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
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
import { getWebinarBySlug, registerForWebinar } from '@/lib/db'
import { getErrorMessage } from '@/lib/errors'
import type { WebinarRow } from '@/lib/database.types'

export function Register() {
  const { slug = '' } = useParams()
  const [webinar, setWebinar] = useState<WebinarRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!webinar) return
    setError(null)
    setSubmitting(true)
    try {
      await registerForWebinar(webinar.id, name, email)
      setRegistered(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not register.'))
    } finally {
      setSubmitting(false)
    }
  }

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
            Save your seat
          </span>
        </div>

        {registered ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                You're in.
              </CardTitle>
              <CardDescription>
                We saved your spot for <strong>{webinar.title}</strong>.
                When the room opens, come back to this page or use the join
                link below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to={`/w/${webinar.slug}`}>Open the join page</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setRegistered(false)
                  setName('')
                  setEmail('')
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
                {webinar.scheduled_at && (
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(webinar.scheduled_at).toLocaleString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering…
                    </>
                  ) : (
                    'Save my seat'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          Already registered? Open <Link to={`/w/${webinar.slug}`} className="underline">the join page</Link>.
        </p>
      </div>
    </div>
  )
}
