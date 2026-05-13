import { supabase } from './supabase'
import type {
  RegistrationRow,
  WebinarInsert,
  WebinarRow,
  WebinarUpdate,
} from './database.types'

export async function listWebinars(): Promise<WebinarRow[]> {
  const { data, error } = await supabase
    .from('webinars')
    .select('*')
    .order('scheduled_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as WebinarRow[]
}

export async function getWebinarBySlug(slug: string): Promise<WebinarRow | null> {
  const { data, error } = await supabase
    .from('webinars')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as WebinarRow | null
}

export async function createWebinar(insert: WebinarInsert): Promise<WebinarRow> {
  const { data, error } = await supabase
    .from('webinars')
    .insert(insert)
    .select('*')
    .single()
  if (error) throw error
  return data as WebinarRow
}

export async function updateWebinar(
  id: string,
  patch: WebinarUpdate,
): Promise<WebinarRow> {
  const { data, error } = await supabase
    .from('webinars')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as WebinarRow
}

export async function deleteWebinar(id: string): Promise<void> {
  const { error } = await supabase.from('webinars').delete().eq('id', id)
  if (error) throw error
}

export async function countRegistrations(webinarId: string): Promise<number> {
  const { count, error } = await supabase
    .from('registrations')
    .select('id', { head: true, count: 'exact' })
    .eq('webinar_id', webinarId)
  if (error) throw error
  return count ?? 0
}

export async function listRegistrations(
  webinarId: string,
): Promise<RegistrationRow[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('webinar_id', webinarId)
    .order('registered_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as RegistrationRow[]
}

// Anonymous guests have INSERT permission on registrations but no SELECT, so
// we can't do INSERT ... RETURNING. Plain insert + treat "already registered"
// (unique_violation, Postgres SQLSTATE 23505) as a successful no-op.
export async function registerForWebinar(
  webinarId: string,
  name: string,
  email: string,
): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase()
  const { error } = await supabase.from('registrations').insert({
    webinar_id: webinarId,
    name: name.trim(),
    email: trimmedEmail,
  })
  if (error) {
    if (error.code === '23505') return
    throw error
  }
}
