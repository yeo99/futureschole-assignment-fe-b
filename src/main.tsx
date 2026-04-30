import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { AppProviders } from '@/app/providers/app-providers'
import './index.css'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('@/mocks/browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  )
}

enableMocking().then(renderApp)
