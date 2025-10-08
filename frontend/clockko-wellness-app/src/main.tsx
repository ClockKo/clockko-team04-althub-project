import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppErrorBoundary from './components/AppErrorBoundary'
import { createHead, UnheadProvider } from '@unhead/react/client'

// Enable global debug functions in development
import './utils/globalDebug'

const queryClient = new QueryClient()
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'disabled-google';
if (!import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.DEV) {
  console.warn('[Auth] VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will be disabled locally.');
}

const head = createHead()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnheadProvider head={head}>
    <AppErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </AppErrorBoundary>
    </UnheadProvider>
  </StrictMode>
)
