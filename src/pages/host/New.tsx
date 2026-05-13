import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  ImagePlus,
  Loader2,
  Sparkles,
  X,
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
import { createWebinar } from '@/lib/db'
import { rememberManageToken, uploadLogo } from '@/lib/host'
import { getErrorMessage } from '@/lib/errors'
import { slugifyTitle } from '@/lib/slug'

export function HostNew() {
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [hostName, setHostName] = useState('')
  const [hostEmail, setHostEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [showGuestCount, setShowGuestCount] = useState(true)
  const [allowSpeakRequests, setAllowSpeakRequests] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function pickLogo(file: File | null) {
    if (!file) {
      setLogoFile(null)
      setLogoPreview(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Logo must be an image (PNG, JPG, SVG).')
      return
    }
    if (file.size > 1024 * 1024) {
      setError('Logo must be under 1 MB.')
      return
    }
    setError(null)
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      let logoUrl: string | null = null
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile)
      }
      const slug = slugifyTitle(title)
      const created = await createWebinar({
        slug,
        title: title.trim(),
        description: description.trim(),
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        show_guest_count: showGuestCount,
        allow_speak_requests: allowSpeakRequests,
        host_name: hostName.trim() || null,
        host_email: hostEmail.trim().toLowerCase() || null,
        company_name: companyName.trim() || null,
        logo_url: logoUrl,
      })
      rememberManageToken(created.slug, created.manage_token)
      navigate(`/host/w/${created.slug}?token=${created.manage_token}`, {
        replace: true,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            Free · no signup yet · OTP at go-live
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Set up your webinar
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fill in the basics. You'll verify your email with a 6-digit code
            right before you go live.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About the session</CardTitle>
            <CardDescription>
              What's it called and when does it run?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Product walkthrough — Q4"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short blurb shown on the join page."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scheduledAt">Scheduled for (optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  About you
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="hostName">Your name</Label>
                    <Input
                      id="hostName"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="Jane Cooper"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hostEmail">Your email</Label>
                    <Input
                      id="hostEmail"
                      type="email"
                      value={hostEmail}
                      onChange={(e) => setHostEmail(e.target.value)}
                      placeholder="jane@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  We'll send a 6-digit code here when you click <strong>Go
                  live</strong>.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Branding (optional)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Company name
                    </Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="UNI SIM"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Logo</Label>
                    {logoPreview ? (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
                        <img
                          src={logoPreview}
                          alt="logo preview"
                          className="h-10 w-10 rounded object-contain"
                        />
                        <span className="flex-1 truncate text-xs text-slate-500">
                          {logoFile?.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => pickLogo(null)}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Remove logo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInput.current?.click()}
                      >
                        <ImagePlus className="h-4 w-4" />
                        Upload logo
                      </Button>
                    )}
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => pickLogo(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-slate-500">
                      PNG / JPG / SVG, under 1 MB.
                    </p>
                  </div>
                </div>
              </div>

              <fieldset className="rounded-lg border border-slate-200 p-3">
                <legend className="px-1 text-xs font-medium text-slate-500">
                  Default settings (you can change later)
                </legend>
                <label className="flex items-start gap-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={showGuestCount}
                    onChange={(e) => setShowGuestCount(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-slate-900">
                      Show attendee count to guests
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={allowSpeakRequests}
                    onChange={(e) => setAllowSpeakRequests(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-slate-900">
                      Allow guests to request to speak
                    </span>
                  </span>
                </label>
              </fieldset>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Create webinar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
