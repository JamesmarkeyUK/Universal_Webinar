import { supabase } from './supabase'
import type { WebinarRow, WebinarUpdate } from './database.types'

const MANAGE_TOKEN_KEY_PREFIX = 'uw:manageToken:'

// ──────────────────────────────────────────────────────────────────────────────
// Local stash of manage tokens
// ──────────────────────────────────────────────────────────────────────────────
// Unverified hosts identify themselves with a per-webinar `manage_token` (a
// UUID). We persist them in localStorage so the host can revisit /host/w/<slug>
// in the same browser without pasting the token URL every time.

export function rememberManageToken(slug: string, token: string): void {
  try {
    localStorage.setItem(MANAGE_TOKEN_KEY_PREFIX + slug, token)
  } catch {
    // localStorage may be unavailable (privacy mode); the token URL still works.
  }
}

export function recallManageToken(slug: string): string | null {
  try {
    return localStorage.getItem(MANAGE_TOKEN_KEY_PREFIX + slug)
  } catch {
    return null
  }
}

export function forgetManageToken(slug: string): void {
  try {
    localStorage.removeItem(MANAGE_TOKEN_KEY_PREFIX + slug)
  } catch {
    // ignore
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Logo upload to the public `logos` bucket
// ──────────────────────────────────────────────────────────────────────────────

export async function uploadLogo(file: File): Promise<string> {
  if (file.size > 1024 * 1024) {
    throw new Error('Logo must be under 1 MB.')
  }
  const safeExt = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'png').toLowerCase()
  const path = `${crypto.randomUUID()}.${safeExt}`
  const { error } = await supabase.storage.from('logos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) throw error
  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}

// ──────────────────────────────────────────────────────────────────────────────
// Token-gated update (RPC defined in migration 0003)
// ──────────────────────────────────────────────────────────────────────────────

export async function updateWebinarByToken(
  slug: string,
  token: string,
  patch: WebinarUpdate,
): Promise<WebinarRow> {
  const { data, error } = await supabase.rpc('update_webinar_by_token', {
    p_slug: slug,
    p_token: token,
    p_patch: patch as Record<string, unknown>,
  })
  if (error) throw error
  return data as WebinarRow
}

// ──────────────────────────────────────────────────────────────────────────────
// OTP verification (Supabase Auth)
// ──────────────────────────────────────────────────────────────────────────────

export async function sendHostOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      // Disable the legacy magic-link redirect — we want a typed OTP code.
      shouldCreateUser: true,
    },
  })
  if (error) throw error
}

export async function verifyHostOtp(
  email: string,
  code: string,
): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code.trim(),
    type: 'email',
  })
  if (error) throw error
}

export async function markWebinarVerified(slug: string): Promise<WebinarRow> {
  const { data, error } = await supabase.rpc('verify_webinar_host', {
    p_slug: slug,
  })
  if (error) throw error
  return data as WebinarRow
}

// ──────────────────────────────────────────────────────────────────────────────
// Listing webinars for a verified host (post-OTP)
// ──────────────────────────────────────────────────────────────────────────────

export async function listWebinarsForHost(email: string): Promise<WebinarRow[]> {
  const { data, error } = await supabase
    .from('webinars')
    .select('*')
    .ilike('host_email', email.trim())
    .order('scheduled_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as WebinarRow[]
}
