/**
 * @fileoverview Client-side providers wrapper for Next.js App Router
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Enterprise-grade providers configuration
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // 5 minutes cache time for enterprise performance
          staleTime: 1000 * 60 * 5,
          // 10 minutes garbage collection
          gcTime: 1000 * 60 * 10,
          // Enable background refetch for real-time updates
          refetchOnWindowFocus: true,
          // Retry failed requests (enterprise resilience)
          retry: (failureCount, error) => {
          // Don't retry auth errors or 404s
          if (error && 'status' in error) {
            const status = (error as { status: number }).status
            if (status === 404 || status === 401) return false
          }
          return failureCount < 2
        },
        },
        mutations: {
          // Optimistic updates for better UX
          retry: 1,
        }
      }
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        // Refetch session when window gains focus
        refetchOnWindowFocus={true}
        // Check for session updates every 5 minutes
        refetchInterval={5 * 60}
        // Enable background sync for multi-tab scenarios
        refetchWhenOffline={false}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </SessionProvider>
      
      {/* React Query DevTools would go here in development */}
    </QueryClientProvider>
  )
}