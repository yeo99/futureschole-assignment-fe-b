import type { PropsWithChildren } from 'react'
import { AppQueryClientProvider } from './query-client-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return <AppQueryClientProvider>{children}</AppQueryClientProvider>
}
