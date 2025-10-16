/**
 * @fileoverview Menu Planning Layout Component
 * @description Layout wrapper for menu planning section with navigation
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menu Planning | Bagizi-ID',
  description: 'Manage nutrition program menu plans and assignments',
}

interface MenuPlanningLayoutProps {
  children: React.ReactNode
}

export default function MenuPlanningLayout({
  children,
}: MenuPlanningLayoutProps) {
  return <>{children}</>
}
