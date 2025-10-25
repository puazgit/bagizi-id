/**
 * @fileoverview Demo Request Actions Component - Standalone action dropdown
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw,
  Trash2,
  Edit,
} from 'lucide-react'
import type { DemoRequestStatus } from '@prisma/client'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export type DemoRequestAction =
  | 'view'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'convert'
  | 'edit'
  | 'delete'

interface DemoRequestActionsProps {
  /**
   * Demo request ID
   */
  requestId: string

  /**
   * Demo request status
   */
  status: DemoRequestStatus

  /**
   * Organization name (for display in dialogs)
   */
  organizationName?: string

  /**
   * Action callback
   */
  onAction: (action: DemoRequestAction, requestId: string, organizationName?: string) => void

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Show trigger button
   * @default true
   */
  showTrigger?: boolean

  /**
   * Trigger variant
   * @default 'ghost'
   */
  triggerVariant?: 'default' | 'outline' | 'ghost'

  /**
   * Allowed actions (if not provided, will be determined by status)
   */
  allowedActions?: DemoRequestAction[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get allowed actions based on status
 */
function getAllowedActionsByStatus(status: DemoRequestStatus): DemoRequestAction[] {
  const baseActions: DemoRequestAction[] = ['view', 'edit']

  switch (status) {
    case 'SUBMITTED':
      return [...baseActions, 'approve', 'reject', 'assign']

    case 'UNDER_REVIEW':
      return [...baseActions, 'approve', 'reject', 'assign']

    case 'APPROVED':
      return [...baseActions, 'assign', 'convert']

    case 'DEMO_ACTIVE':
      return [...baseActions, 'convert']

    case 'REJECTED':
    case 'EXPIRED':
    case 'CANCELLED':
      return [...baseActions, 'delete']

    case 'CONVERTED':
      return ['view'] // Read-only

    default:
      return baseActions
  }
}

/**
 * Get action label
 */
function getActionLabel(action: DemoRequestAction): string {
  const labels: Record<DemoRequestAction, string> = {
    view: 'Lihat Detail',
    approve: 'Setujui',
    reject: 'Tolak',
    assign: 'Tugaskan',
    convert: 'Konversi ke SPPG',
    edit: 'Edit',
    delete: 'Hapus',
  }

  return labels[action]
}

/**
 * Get action icon
 */
function getActionIcon(action: DemoRequestAction) {
  const icons: Record<DemoRequestAction, typeof Eye> = {
    view: Eye,
    approve: CheckCircle,
    reject: XCircle,
    assign: UserPlus,
    convert: RefreshCw,
    edit: Edit,
    delete: Trash2,
  }

  return icons[action]
}

/**
 * Get action color class
 */
function getActionColorClass(action: DemoRequestAction): string {
  const colors: Record<DemoRequestAction, string> = {
    view: '',
    approve: 'text-green-600 dark:text-green-400',
    reject: 'text-red-600 dark:text-red-400',
    assign: 'text-blue-600 dark:text-blue-400',
    convert: 'text-purple-600 dark:text-purple-400',
    edit: '',
    delete: 'text-red-600 dark:text-red-400',
  }

  return colors[action]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DemoRequestActions - Standalone action dropdown component
 *
 * Features:
 * - Status-based action filtering
 * - Color-coded action items
 * - Icon indicators
 * - Destructive action highlighting
 * - Keyboard navigation
 * - Dark mode support
 * - Customizable trigger
 *
 * @example
 * ```tsx
 * <DemoRequestActions
 *   requestId="clxx123"
 *   status="SUBMITTED"
 *   organizationName="Yayasan ABC"
 *   onAction={(action, id, name) => {
 *     if (action === 'approve') {
 *       setApproveDialogOpen(true)
 *     }
 *   }}
 * />
 * ```
 */
export function DemoRequestActions({
  requestId,
  status,
  organizationName,
  onAction,
  disabled = false,
  showTrigger = true,
  triggerVariant = 'ghost',
  allowedActions,
}: DemoRequestActionsProps) {
  const [open, setOpen] = useState(false)

  // Determine allowed actions
  const actions = allowedActions || getAllowedActionsByStatus(status)

  const handleAction = (action: DemoRequestAction) => {
    setOpen(false)
    onAction(action, requestId, organizationName)
  }

  // Split actions into groups
  const primaryActions = actions.filter((a) => ['view'].includes(a))
  const mainActions = actions.filter((a) =>
    ['approve', 'reject', 'assign'].includes(a)
  )
  const secondaryActions = actions.filter((a) =>
    ['convert', 'edit'].includes(a)
  )
  const destructiveActions = actions.filter((a) => ['delete'].includes(a))

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {showTrigger ? (
          <Button variant={triggerVariant} size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        ) : (
          <button className="sr-only">Open actions menu</button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>

        {/* Primary Actions (View) */}
        {primaryActions.length > 0 && (
          <>
            {primaryActions.map((action) => {
              const Icon = getActionIcon(action)
              const colorClass = getActionColorClass(action)

              return (
                <DropdownMenuItem
                  key={action}
                  onClick={() => handleAction(action)}
                  className={colorClass}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {getActionLabel(action)}
                </DropdownMenuItem>
              )
            })}
            {mainActions.length > 0 && <DropdownMenuSeparator />}
          </>
        )}

        {/* Main Actions (Approve, Reject, Assign) */}
        {mainActions.length > 0 && (
          <>
            {mainActions.map((action) => {
              const Icon = getActionIcon(action)
              const colorClass = getActionColorClass(action)

              return (
                <DropdownMenuItem
                  key={action}
                  onClick={() => handleAction(action)}
                  className={colorClass}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {getActionLabel(action)}
                </DropdownMenuItem>
              )
            })}
            {(secondaryActions.length > 0 || destructiveActions.length > 0) && (
              <DropdownMenuSeparator />
            )}
          </>
        )}

        {/* Secondary Actions (Convert, Edit) */}
        {secondaryActions.length > 0 && (
          <>
            {secondaryActions.map((action) => {
              const Icon = getActionIcon(action)
              const colorClass = getActionColorClass(action)

              return (
                <DropdownMenuItem
                  key={action}
                  onClick={() => handleAction(action)}
                  className={colorClass}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {getActionLabel(action)}
                </DropdownMenuItem>
              )
            })}
            {destructiveActions.length > 0 && <DropdownMenuSeparator />}
          </>
        )}

        {/* Destructive Actions (Delete) */}
        {destructiveActions.length > 0 && (
          <>
            {destructiveActions.map((action) => {
              const Icon = getActionIcon(action)

              return (
                <DropdownMenuItem
                  key={action}
                  onClick={() => handleAction(action)}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {getActionLabel(action)}
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Get allowed actions for a status (utility export)
 */
export { getAllowedActionsByStatus }
