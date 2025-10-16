/**
 * @fileoverview Menu Plan Detail Page
 * @description Detail page for viewing and managing a specific menu plan
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { use } from 'react'
import { MenuPlanDetail } from '@/features/sppg/menu-planning/components'

interface MenuPlanDetailPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

export default function MenuPlanDetailPage({ params, searchParams }: MenuPlanDetailPageProps) {
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  
  const planId = resolvedParams.id
  const tab = resolvedSearchParams.tab
  const defaultTab = tab === 'calendar' || tab === 'analytics' ? tab : 'overview'

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      <MenuPlanDetail planId={planId} defaultTab={defaultTab} />
    </div>
  )
}
