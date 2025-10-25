/**
 * @fileoverview Demo Request Navigation Tabs
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { 
  Inbox, 
  FileText, 
  Eye, 
  CheckCircle2, 
  XCircle
} from 'lucide-react'

interface DemoRequestNavProps {
  /**
   * Active tab value
   */
  activeTab: string
  
  /**
   * Tab change handler
   */
  onTabChange: (value: string) => void
  
  /**
   * Statistics for badge counts
   */
  stats: {
    total: number
    submitted: number
    inReview: number
    approved: number
    rejected: number
  }
  
  /**
   * Custom class name
   */
  className?: string
}

interface NavItem {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  count: keyof DemoRequestNavProps['stats']
}

const navItems: NavItem[] = [
  {
    value: 'all',
    label: 'Semua',
    icon: Inbox,
    description: 'Semua permintaan demo',
    count: 'total'
  },
  {
    value: 'submitted',
    label: 'Submitted',
    icon: FileText,
    description: 'Menunggu review',
    count: 'submitted'
  },
  {
    value: 'under_review',
    label: 'Under Review',
    icon: Eye,
    description: 'Sedang direview',
    count: 'inReview'
  },
  {
    value: 'approved',
    label: 'Approved',
    icon: CheckCircle2,
    description: 'Telah disetujui',
    count: 'approved'
  },
  {
    value: 'rejected',
    label: 'Rejected',
    icon: XCircle,
    description: 'Ditolak',
    count: 'rejected'
  }
]

/**
 * Demo Request Navigation Component
 * 
 * Provides tab-style navigation between different demo request status
 * 
 * @example
 * ```tsx
 * <DemoRequestNav 
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   stats={stats}
 * />
 * ```
 */
export function DemoRequestNav({ 
  activeTab, 
  onTabChange, 
  stats,
  className 
}: DemoRequestNavProps) {
  return (
    <div className={cn('border-b bg-background', className)}>
      <nav 
        className="flex gap-1 overflow-x-auto px-2 py-2" 
        aria-label="Demo request status navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeTab === item.value
          const count = stats[item.count]

          return (
            <button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={cn(
                'group flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
              title={item.description}
            >
              <Icon 
                className={cn(
                  'h-4 w-4 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} 
              />
              <span className="whitespace-nowrap">{item.label}</span>
              <Badge 
                variant={active ? 'default' : 'secondary'} 
                className={cn(
                  'h-5 px-2 text-xs font-medium',
                  active && 'bg-primary/20 text-primary hover:bg-primary/30'
                )}
              >
                {count}
              </Badge>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
