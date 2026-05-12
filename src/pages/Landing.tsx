import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle, Mic, Sparkles, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Landing() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="absolute -top-10 left-[10%] h-72 w-72 rounded-full bg-brand-100/70 blur-3xl" />
          <div className="absolute top-20 right-[8%] h-64 w-64 rounded-full bg-amber-100/70 blur-3xl" />
        </div>

        <div className="container py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-medium text-brand-700 shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Live, warm, in your pocket
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-6xl">
              Webinars that feel like a{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                real conversation
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              Host a polished live session, let the audience react in real time,
              and invite anyone up on stage with a single tap — no installs, no
              friction.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/admin/login">
                  Host a webinar <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/w/demo">Join the demo room</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Have an invite link? Open it on any device — no signup needed.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="container py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Video className="h-5 w-5" />}
              title="Live, low-latency"
              body="Stream your camera and screen in HD. Guests watch on web or phone with one tap."
            />
            <Feature
              icon={<MessageCircle className="h-5 w-5" />}
              title="Chat & reactions"
              body="Threaded chat with emoji reactions on every message and floating hearts on the video."
            />
            <Feature
              icon={<Mic className="h-5 w-5" />}
              title="Audience speakers"
              body="Approve any guest to share their camera and microphone for live Q&A — on your terms."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Yours, branded"
              body="PIN-lock the room, hide attendee counts, theme it to match — you're in full control."
            />
          </div>
        </div>
      </section>
    </>
  )
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:bg-white hover:shadow-soft">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-600">{body}</p>
    </div>
  )
}
