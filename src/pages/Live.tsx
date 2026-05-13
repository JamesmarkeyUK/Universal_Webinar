import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Hand, Heart, Loader2, Users, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ChatPanel,
} from '@/components/ChatPanel'
import {
  FloatingReactions,
  type FloatingReactionsHandle,
} from '@/components/FloatingReactions'
import {
  addReaction,
  getMyAttendee,
  getWebinarBySlug,
  listMessages,
  listReactionsForWebinar,
  removeReaction,
  sendMessage,
} from '@/lib/db'
import { getErrorMessage } from '@/lib/errors'
import {
  broadcastFloatingReaction,
  joinWebinarChannel,
  leaveChannel,
} from '@/lib/realtime'
import type {
  AttendeeRow,
  MessageRow,
  ReactionRow,
  WebinarRow,
} from '@/lib/database.types'

const FLOATING_EMOJIS = ['❤️', '👏', '🎉', '🔥'] as const

export function Live() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()

  const [webinar, setWebinar] = useState<WebinarRow | null>(null)
  const [attendee, setAttendee] = useState<AttendeeRow | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [reactions, setReactions] = useState<ReactionRow[]>([])
  const [viewerCount, setViewerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const floatingHandleRef = useRef<FloatingReactionsHandle | null>(null)
  const channelRef = useRef<ReturnType<typeof joinWebinarChannel> | null>(null)
  const knownMessageIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const w = await getWebinarBySlug(slug)
        if (!active) return
        if (!w) {
          setError(`No webinar found for "${slug}".`)
          return
        }
        setWebinar(w)

        const me = await getMyAttendee(w.id)
        if (!active) return
        if (!me) {
          navigate(`/w/${w.slug}`, { replace: true })
          return
        }
        setAttendee(me)

        const [initialMessages, initialReactions] = await Promise.all([
          listMessages(w.id),
          listReactionsForWebinar(w.id),
        ])
        if (!active) return
        setMessages(initialMessages)
        setReactions(initialReactions)
        knownMessageIds.current = new Set(initialMessages.map((m) => m.id))
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Could not load the room.'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [slug, navigate])

  // Realtime + presence subscription
  useEffect(() => {
    if (!webinar || !attendee) return
    const channel = joinWebinarChannel(
      webinar.id,
      { attendeeId: attendee.id, name: attendee.name },
      {
        onMessageInsert: (row) => {
          if (knownMessageIds.current.has(row.id)) return
          knownMessageIds.current.add(row.id)
          setMessages((prev) => [...prev, row])
        },
        onMessageUpdate: (row) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? row : m)),
          )
        },
        onReactionInsert: (row) => {
          setReactions((prev) =>
            prev.some((r) => r.id === row.id) ? prev : [...prev, row],
          )
        },
        onReactionDelete: (id) => {
          setReactions((prev) => prev.filter((r) => r.id !== id))
        },
        onFloatingReaction: ({ emoji }) => {
          floatingHandleRef.current?.spawn(emoji)
        },
        onPresence: setViewerCount,
      },
    )
    channelRef.current = channel
    return () => {
      channelRef.current = null
      void leaveChannel(channel)
    }
  }, [webinar, attendee])

  const handleSend = useCallback(
    async (content: string) => {
      if (!webinar || !attendee) return
      await sendMessage(webinar.id, attendee.id, content)
    },
    [webinar, attendee],
  )

  const handleAddReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!attendee) return
      await addReaction(messageId, attendee.id, emoji)
    },
    [attendee],
  )

  const handleRemoveReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!attendee) return
      await removeReaction(messageId, attendee.id, emoji)
    },
    [attendee],
  )

  const handleFloating = useCallback(
    async (emoji: string) => {
      if (!attendee || !channelRef.current) return
      floatingHandleRef.current?.spawn(emoji)
      await broadcastFloatingReaction(channelRef.current, {
        emoji,
        fromName: attendee.name,
      })
    },
    [attendee],
  )

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
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-semibold">{error ?? 'Room unavailable'}</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {webinar.title}
          </h1>
          <p className="text-sm text-slate-500">
            Welcome{attendee ? `, ${attendee.name.split(' ')[0]}` : ''} — enjoy the show.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {webinar.show_guest_count && viewerCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-soft">
              <Users className="h-3.5 w-3.5" />
              {viewerCount} watching
            </span>
          )}
          {webinar.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Waiting to start
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-soft">
            <div className="absolute inset-0 grid place-items-center text-center text-slate-300">
              <div>
                <Video className="mx-auto h-12 w-12 text-slate-500" />
                <p className="mt-3 text-sm">
                  {webinar.status === 'live'
                    ? 'Connecting…'
                    : 'Video will appear when the host goes live.'}
                </p>
                <p className="text-xs text-slate-500">
                  (LiveKit player wires up in Phase 4.)
                </p>
              </div>
            </div>
            <FloatingReactions
              registerHandle={(h) => (floatingHandleRef.current = h)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={webinar.allow_speak_requests ? 'default' : 'secondary'}
              disabled={!webinar.allow_speak_requests}
              title={
                webinar.allow_speak_requests
                  ? 'Phase 5'
                  : 'Speaker requests are off'
              }
            >
              <Hand className="h-4 w-4" />
              {webinar.allow_speak_requests
                ? 'Request to speak'
                : 'Speaker requests are off'}
            </Button>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-soft">
              <Heart className="h-3.5 w-3.5 text-brand-500" />
              {FLOATING_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleFloating(emoji)}
                  className="text-base leading-none p-1 hover:scale-125 transition-transform"
                  aria-label={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex h-[600px] flex-col rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Chat</h2>
            {attendee?.muted_by_admin && (
              <span className="text-[11px] font-medium text-amber-700">
                muted by host
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={messages}
              reactions={reactions}
              currentAttendeeId={attendee?.id ?? null}
              isAdmin={false}
              readOnly={attendee?.muted_by_admin}
              onSend={handleSend}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
