import type { WebinarRow } from './database.types'

// Build a minimal RFC 5545 calendar entry the user can save to Google /
// Apple / Outlook. We default the event to one hour because we don't track a
// duration column yet — most webinars run roughly that long anyway.

const DEFAULT_DURATION_MINUTES = 60

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

function toIcsDate(date: Date): string {
  return (
    `${date.getUTCFullYear()}` +
    pad2(date.getUTCMonth() + 1) +
    pad2(date.getUTCDate()) +
    'T' +
    pad2(date.getUTCHours()) +
    pad2(date.getUTCMinutes()) +
    pad2(date.getUTCSeconds()) +
    'Z'
  )
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export interface IcsOptions {
  webinar: WebinarRow
  joinUrl: string
}

export function buildIcsString({ webinar, joinUrl }: IcsOptions): string {
  if (!webinar.scheduled_at) {
    throw new Error('Cannot build calendar entry without scheduled_at.')
  }
  const start = new Date(webinar.scheduled_at)
  const end = new Date(
    start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000,
  )
  const dtstamp = toIcsDate(new Date())
  const description = [
    webinar.description?.trim() || `Join ${webinar.title} on Universal Webinar.`,
    '',
    `Join link: ${joinUrl}`,
  ].join('\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Universal Webinar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${webinar.id}@universal-webinar`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(webinar.title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(joinUrl)}`,
    `URL:${escapeIcsText(joinUrl)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function downloadIcs(ics: string, filename: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function buildGoogleCalendarUrl({ webinar, joinUrl }: IcsOptions): string {
  if (!webinar.scheduled_at) {
    throw new Error('Cannot build calendar entry without scheduled_at.')
  }
  const start = new Date(webinar.scheduled_at)
  const end = new Date(
    start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000,
  )
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: webinar.title,
    dates: `${toIcsDate(start)}/${toIcsDate(end)}`,
    details: `${webinar.description?.trim() ?? ''}\n\nJoin link: ${joinUrl}`,
    location: joinUrl,
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
}
