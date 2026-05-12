import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Hand, Heart, MessageSquare, Smile, Users, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Live() {
  const { slug } = useParams()
  const [draft, setDraft] = useState('')

  // Phase 1 stubs — these will come from Supabase/LiveKit in later phases.
  const showGuestCount = true
  const guestCount = 42
  const allowSpeakRequests = false

  return (
    <div className="container py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Live webinar <span className="text-slate-400">·</span>{' '}
            <span className="text-slate-500">{slug}</span>
          </h1>
          <p className="text-sm text-slate-500">Welcome — enjoy the show.</p>
        </div>
        <div className="flex items-center gap-2">
          {showGuestCount && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-soft">
              <Users className="h-3.5 w-3.5" />
              {guestCount} watching
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
            LIVE
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-soft">
            <div className="absolute inset-0 grid place-items-center text-center text-slate-300">
              <div>
                <Video className="mx-auto h-12 w-12 text-slate-500" />
                <p className="mt-3 text-sm">
                  Video will appear here when the host goes live.
                </p>
                <p className="text-xs text-slate-500">
                  (LiveKit player wires up in Phase 4.)
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2">
              <Heart className="h-7 w-7 text-brand-500 drop-shadow" />
              <Heart className="h-5 w-5 text-brand-400" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={allowSpeakRequests ? 'default' : 'secondary'}
              disabled={!allowSpeakRequests}
            >
              <Hand className="h-4 w-4" />
              {allowSpeakRequests
                ? 'Request to speak'
                : 'Speaker requests are off'}
            </Button>
            <Button variant="outline">
              <Smile className="h-4 w-4" />
              Send a reaction
            </Button>
          </div>
        </div>

        <aside className="flex h-[600px] flex-col rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Chat</h2>
            </div>
            <span className="text-xs text-slate-400">Phase 3</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            <StubMessage author="Host" body="Welcome everyone! We'll start in a moment." mine={false} />
            <StubMessage author="Sara" body="Hello from London 👋" mine={false} />
            <StubMessage author="You" body="Excited!" mine={true} />
          </div>
          <form className="border-t border-slate-200 p-3">
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Say something kind…"
              />
              <Button type="button" disabled>
                Send
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              Chat wires up in Phase 3.
            </p>
          </form>
        </aside>
      </div>
    </div>
  )
}

function StubMessage({
  author,
  body,
  mine,
}: {
  author: string
  body: string
  mine: boolean
}) {
  return (
    <div className={mine ? 'text-right' : ''}>
      <span className="text-[11px] font-medium text-slate-500">{author}</span>
      <div
        className={
          'mt-0.5 inline-block max-w-[85%] rounded-xl px-3 py-1.5 ' +
          (mine
            ? 'bg-brand-600 text-white'
            : 'bg-slate-100 text-slate-800')
        }
      >
        {body}
      </div>
    </div>
  )
}
