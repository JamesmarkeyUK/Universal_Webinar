// Hand-written type surface for the tables we touch in Phases 2–3.
// In a later phase we can generate these from the live schema with
// `supabase gen types typescript --project-id <id>`. For now this stays small
// and explicit so the app code is fully typed without depending on a CLI step.

export type WebinarStatus = 'scheduled' | 'live' | 'ended'

export interface WebinarRow {
  id: string
  slug: string
  title: string
  description: string
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  status: WebinarStatus
  allow_speak_requests: boolean
  show_guest_count: boolean
  recording_url: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface WebinarInsert {
  slug: string
  title: string
  description?: string
  scheduled_at?: string | null
  status?: WebinarStatus
  allow_speak_requests?: boolean
  show_guest_count?: boolean
  created_by?: string | null
}

export interface WebinarUpdate {
  slug?: string
  title?: string
  description?: string
  scheduled_at?: string | null
  started_at?: string | null
  ended_at?: string | null
  status?: WebinarStatus
  allow_speak_requests?: boolean
  show_guest_count?: boolean
  recording_url?: string | null
}

export interface RegistrationRow {
  id: string
  webinar_id: string
  name: string
  email: string
  registered_at: string
}

export interface RegistrationInsert {
  webinar_id: string
  name: string
  email: string
}

export interface Database {
  public: {
    Tables: {
      webinars: {
        Row: WebinarRow
        Insert: WebinarInsert
        Update: WebinarUpdate
        Relationships: []
      }
      registrations: {
        Row: RegistrationRow
        Insert: RegistrationInsert
        Update: Partial<RegistrationInsert>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      webinar_status: WebinarStatus
    }
    CompositeTypes: Record<never, never>
  }
}
