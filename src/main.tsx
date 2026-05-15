import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UniversalProvider } from '@unisim/sdk'
import App from './App'
import { AuthProvider } from './lib/auth'
import './index.css'

const universalConfig = {
  supabaseUrl: import.meta.env.VITE_PLATFORM_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_PLATFORM_SUPABASE_ANON_KEY,
  product: 'webinar' as const,
  cookieDomain: import.meta.env.PROD ? '.unisim.co.uk' : undefined,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UniversalProvider config={universalConfig}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </UniversalProvider>
  </StrictMode>,
)
