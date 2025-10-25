/**
 * @fileoverview Public Pages Layout - No authentication required
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { ReactNode } from 'react'

interface PublicLayoutProps {
  children: ReactNode
}

/**
 * Public Layout - Simple layout for public pages like access-denied, unauthorized
 * No authentication or role checks
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return <>{children}</>
}
