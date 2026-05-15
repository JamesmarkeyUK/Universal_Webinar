/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_PLATFORM_SUPABASE_URL: string
  readonly VITE_PLATFORM_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_LIVEKIT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
