import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock, ShieldCheck } from 'lucide-react'
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

export function Join() {
  const { slug = 'demo' } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Phase 1 stub: would fetch webinar metadata to know if PIN required.
  const requiresPin = false

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    // Phase 1: just navigate to the live room.
    setTimeout(() => navigate(`/w/${slug}/live`), 300)
  }

  return (
    <div className="container py-12 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Hosted on Universal Webinar
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join the webinar</CardTitle>
            <CardDescription>
              Tell us who you are so the host can welcome you in.
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

              {requiresPin && (
                <div className="space-y-1.5">
                  <Label htmlFor="pin" className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Webinar PIN
                  </Label>
                  <Input
                    id="pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Joining…' : 'Join now'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-500">
          By joining, you agree to be visible to the host and may be invited to
          speak.
        </p>
      </div>
    </div>
  )
}
