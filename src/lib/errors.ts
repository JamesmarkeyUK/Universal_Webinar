// Extract a user-facing message from any thrown value. Supabase / PostgREST
// errors are plain objects with `message`, not `Error` instances, so a naive
// `err instanceof Error` check hides the real cause.
export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: unknown }).message
    if (typeof msg === 'string' && msg.length > 0) return msg
  }
  return fallback
}
