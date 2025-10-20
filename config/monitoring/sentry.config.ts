/**
 * Sentry Configuration for SPPG Phase 1
 * 
 * Error tracking and performance monitoring
 * Configure in production environment
 */

export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',
  
  // Phase 1 specific tags
  tags: {
    phase: 'phase1',
    module: 'sppg',
  },
  
  // Ignore common errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Before send hook
  beforeSend(event: any) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      return null
    }
    return event
  },
}

/**
 * Custom Sentry contexts for Phase 1
 */
export function setPhase1Context(fixName: string, action: string) {
  // Add Sentry context here when Sentry is configured
  console.log(`[Phase 1] ${fixName} - ${action}`)
}
