import { useState } from 'react'
import { CalendarPlus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  buildGoogleCalendarUrl,
  buildIcsString,
  downloadIcs,
} from '@/lib/calendar'
import type { WebinarRow } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface Props {
  webinar: WebinarRow
  joinUrl: string
  className?: string
}

export function AddToCalendarButton({ webinar, joinUrl, className }: Props) {
  const [open, setOpen] = useState(false)

  function handleIcs() {
    setOpen(false)
    const ics = buildIcsString({ webinar, joinUrl })
    const filename = `${webinar.slug || 'webinar'}.ics`
    downloadIcs(ics, filename)
  }

  function handleGoogle() {
    setOpen(false)
    window.open(buildGoogleCalendarUrl({ webinar, joinUrl }), '_blank')
  }

  if (!webinar.scheduled_at) return null

  return (
    <div className={cn('relative inline-block', className)}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarPlus className="h-4 w-4" />
        Add to calendar
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            open && 'rotate-180',
          )}
        />
      </Button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 z-40 mt-1 rounded-lg border border-slate-200 bg-white p-1 shadow-md">
            <button
              type="button"
              onClick={handleGoogle}
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Google Calendar
            </button>
            <button
              type="button"
              onClick={handleIcs}
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Apple Calendar / Outlook (.ics)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
