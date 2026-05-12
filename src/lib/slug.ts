const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function randomSuffix(length = 4): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]!).join('')
}

export function slugifyTitle(title: string): string {
  const base = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const root = base || 'webinar'
  return `${root}-${randomSuffix()}`
}
