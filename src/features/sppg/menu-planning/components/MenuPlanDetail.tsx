/**
 * @fileoverview Menu Plan Detail Component with Tabs
 * @version Next.js 15.5.4 / shadcn/ui Tabs / TanStack Query
 * @see {@link /docs/copilot-instructions.md} Detail page patterns
 */

'use client'

import { type FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  Info,
  History,
  Bell,
  CheckCircle2,
  Eye,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  useMenuPlan,
  useDeleteMenuPlan,
} from '../hooks/useMenuPlans'
import {
  useSubmitPlan,
  useApprovePlan,
  useRejectPlan,
  usePublishPlan,
} from '../hooks/useWorkflowActions'
import { useMenuPlanAnalytics } from '../hooks/useMenuPlans'
import type { MenuPlanDetail as MenuPlanDetailType } from '../types'
import { MenuPlanStatus } from '@prisma/client'
import { MenuPlanCalendar } from './MenuPlanCalendar'
import { ApprovalWorkflow } from './ApprovalWorkflow'
import { PlanAnalytics } from './PlanAnalytics'
import { ApprovalDialog } from './ApprovalDialog'
import type {
  SubmitForReviewInput,
  ApproveActionInput,
  RejectActionInput,
  PublishActionInput,
} from '../schemas'

interface MenuPlanDetailProps {
  planId: string
  defaultTab?: 'overview' | 'calendar' | 'analytics'
}

export const MenuPlanDetail: FC<MenuPlanDetailProps> = ({ planId, defaultTab = 'overview' }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  // Check if user can approve/reject plans (SPPG_KEPALA or SPPG_ADMIN only)
  const canApproveReject = session?.user?.userRole && 
    ['SPPG_KEPALA', 'SPPG_ADMIN'].includes(session.user.userRole)

  // Fetch plan data
  const { data: plan, isLoading, error } = useMenuPlan(planId)

  // Mutations
  const { mutate: deletePlan, isPending: isDeleting } = useDeleteMenuPlan()
  const { mutate: submitPlan, isPending: isSubmitting } = useSubmitPlan(planId)
  const { mutate: approvePlan, isPending: isApproving } = useApprovePlan(planId)
  const { mutate: rejectPlan, isPending: isRejecting } = useRejectPlan(planId)
  const { mutate: publishPlan, isPending: isPublishing } = usePublishPlan(planId)

  const isPending = isDeleting || isSubmitting || isPublishing || isApproving || isRejecting

  // Handlers
  const handleEdit = () => {
    router.push(`/menu-planning/${planId}/edit`)
  }

  const handleDelete = () => {
    deletePlan(planId, {
      onSuccess: () => {
        router.push('/menu-planning')
      },
    })
    setShowDeleteDialog(false)
  }

  // Workflow action handlers with dialog data
  const handleSubmitWithData = (data: SubmitForReviewInput) => {
    submitPlan(data)
  }

  const handleApproveWithData = (data: ApproveActionInput) => {
    approvePlan(data)
  }

  const handleRejectWithData = (data: RejectActionInput) => {
    rejectPlan(data)
  }

  const handlePublishWithData = (data: PublishActionInput) => {
    publishPlan(data)
  }

  // Loading state
  if (isLoading) {
    return <DetailSkeleton />
  }

  // Error state
  if (error || !plan) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="rounded-full bg-destructive/10 p-6">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Gagal Memuat Rencana Menu</h3>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'Rencana menu tidak ditemukan atau Anda tidak memiliki akses.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => window.location.reload()}
                variant="default"
                className="w-full sm:w-auto"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
              <Button 
                onClick={() => router.push('/menu-planning')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Kembali ke Daftar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="space-y-6 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {plan.name}
                  </CardTitle>
                  <StatusBadge status={plan.status} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="font-normal w-fit">
                    {plan.program.programCode}
                  </Badge>
                  <span className="hidden sm:inline">•</span>
                  <span className="line-clamp-1">{plan.program.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1">
                    {format(new Date(plan.startDate), 'PPP', { locale: localeId })} - {format(new Date(plan.endDate), 'PPP', { locale: localeId })}
                  </span>
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    disabled={isPending}
                    aria-label="Menu aksi rencana"
                    className="shrink-0 h-10 w-10 sm:h-11 sm:w-11"
                  >
                    <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Buka menu aksi</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {plan.status === 'DRAFT' && (
                    <>
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Rencana
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowSubmitDialog(true)}>
                        <Send className="mr-2 h-4 w-4" />
                        Kirim untuk Review
                      </DropdownMenuItem>
                    </>
                  )}

                  {plan.status === 'PENDING_REVIEW' && canApproveReject && (
                    <>
                      <DropdownMenuItem onClick={() => setShowApproveDialog(true)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Setujui Rencana
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak Rencana
                      </DropdownMenuItem>
                    </>
                  )}

                  {plan.status === 'APPROVED' && canApproveReject && (
                    <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Publikasikan Rencana
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Rencana
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Visual Separator */}
            <Separator />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <QuickStat
                icon={<CalendarDays className="h-5 w-5" />}
                label="Total Hari"
                value={plan.metrics?.dateRange?.days || plan.totalDays || 0}
              />
              <QuickStat
                icon={<Users className="h-5 w-5" />}
                label="Penugasan"
                value={plan.metrics?.totalAssignments || plan._count?.assignments || 0}
              />
              <QuickStat
                icon={<DollarSign className="h-5 w-5" />}
                label="Biaya Rata-rata/Hari"
                value={`Rp ${(() => {
                  // Calculate average cost per day from total cost and coverage
                  if (plan.metrics?.totalEstimatedCost && plan.metrics?.coverage?.daysWithAssignments) {
                    const avgCostPerDay = plan.metrics.totalEstimatedCost / plan.metrics.coverage.daysWithAssignments
                    return avgCostPerDay.toLocaleString('id-ID', { maximumFractionDigits: 0 })
                  }
                  return plan.averageCostPerDay?.toLocaleString('id-ID', { maximumFractionDigits: 0 }) || 0
                })()}`}
              />
              <QuickStat
                icon={<TrendingUp className="h-5 w-5" />}
                label="Total Biaya"
                value={`Rp ${(plan.metrics?.totalEstimatedCost || plan.totalEstimatedCost || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`}
              />
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger 
                  value="overview"
                  className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-background"
                  aria-label="Tab ringkasan rencana menu"
                >
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">Ringkasan</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="calendar"
                  className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-background relative"
                  aria-label="Tab kalender penugasan menu"
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">Kalender</span>
                  {plan.assignments && plan.assignments.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      aria-label={`${plan.assignments.length} penugasan`}
                    >
                      {plan.assignments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-background"
                  aria-label="Tab analitik dan laporan"
                >
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">Analitik</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                  <div className="lg:col-span-8">
                    <OverviewTab plan={plan} setActiveTab={setActiveTab} />
                  </div>
                  <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-4">
                      <ApprovalWorkflow 
                        plan={plan}
                        onSubmit={() => setShowSubmitDialog(true)}
                        onApprove={() => setShowApproveDialog(true)}
                        onReject={() => setShowRejectDialog(true)}
                        onPublish={() => setShowPublishDialog(true)}
                        isSubmitting={isSubmitting || isApproving || isRejecting || isPublishing}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar" className="space-y-4">
                <CalendarTab planId={planId} plan={plan} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <AnalyticsTab planId={planId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rencana Menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus rencana menu &ldquo;{plan.name}&rdquo;? 
              Tindakan ini tidak dapat dibatalkan. Semua assignment dalam rencana ini juga akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Workflow Action Dialogs */}
      {plan && (
        <>
          {/* Submit Dialog */}
          <ApprovalDialog
            open={showSubmitDialog}
            onOpenChange={setShowSubmitDialog}
            mode="submit"
            plan={plan}
            onSubmit={handleSubmitWithData}
            onApprove={() => {}}
            onReject={() => {}}
            onPublish={() => {}}
            isPending={isSubmitting}
          />

          {/* Approve Dialog */}
          <ApprovalDialog
            open={showApproveDialog}
            onOpenChange={setShowApproveDialog}
            mode="approve"
            plan={plan}
            onSubmit={() => {}}
            onApprove={handleApproveWithData}
            onReject={() => {}}
            onPublish={() => {}}
            isPending={isApproving}
          />

          {/* Reject Dialog */}
          <ApprovalDialog
            open={showRejectDialog}
            onOpenChange={setShowRejectDialog}
            mode="reject"
            plan={plan}
            onSubmit={() => {}}
            onApprove={() => {}}
            onReject={handleRejectWithData}
            onPublish={() => {}}
            isPending={isRejecting}
          />

          {/* Publish Dialog */}
          <ApprovalDialog
            open={showPublishDialog}
            onOpenChange={setShowPublishDialog}
            mode="publish"
            plan={plan}
            onSubmit={() => {}}
            onApprove={() => {}}
            onReject={() => {}}
            onPublish={handlePublishWithData}
            isPending={isPublishing}
          />
        </>
      )}
    </>
  )
}

/**
 * Status Badge Component
 */
const StatusBadge: FC<{ status: MenuPlanStatus }> = ({ status }) => {
  const config = {
    DRAFT: { label: 'Draf', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    PENDING_REVIEW: { label: 'Menunggu Review', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    REVIEWED: { label: 'Direview', variant: 'default' as const, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    PENDING_APPROVAL: { label: 'Menunggu Persetujuan', variant: 'default' as const, className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    APPROVED: { label: 'Disetujui', variant: 'default' as const, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    PUBLISHED: { label: 'Dipublikasikan', variant: 'default' as const, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    ACTIVE: { label: 'Aktif', variant: 'default' as const, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    COMPLETED: { label: 'Selesai', variant: 'outline' as const, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    ARCHIVED: { label: 'Diarsipkan', variant: 'outline' as const, className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    CANCELLED: { label: 'Dibatalkan', variant: 'destructive' as const, className: '' },
  }

  const { label, variant, className } = config[status] || config.DRAFT

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

/**
 * Status Timeline Entry Interface
 */
interface StatusTimelineEntry {
  status: MenuPlanStatus
  timestamp: Date
  actor: {
    name: string
    role: string
  }
  action: string
  notes?: string
}

/**
 * Generate Real Timeline Data from Database
 * @description Uses actual MenuPlan timestamps instead of mock data
 */
const generateRealTimeline = (plan: MenuPlanDetailType): StatusTimelineEntry[] => {
  const timeline: StatusTimelineEntry[] = []

  // Helper function to get user-friendly role label
  const getRoleLabel = (role?: string | null): string => {
    if (!role) return 'Staff'
    
    const roleMap: Record<string, string> = {
      SPPG_KEPALA: 'Kepala SPPG',
      SPPG_ADMIN: 'Administrator',
      SPPG_AHLI_GIZI: 'Ahli Gizi',
      SPPG_AKUNTAN: 'Akuntan',
      SPPG_STAFF_ADMIN: 'Staff Admin',
      SPPG_STAFF_DAPUR: 'Staff Dapur',
      PLATFORM_SUPERADMIN: 'Superadmin'
    }
    
    return roleMap[role] || 'Staff'
  }
  
  // 1. DRAFT - Always exists (creation)
  timeline.push({
    status: 'DRAFT',
    timestamp: new Date(plan.createdAt),
    actor: {
      name: plan.creator?.name || 'System',
      role: getRoleLabel(plan.creator?.userRole)
    },
    action: 'Dibuat sebagai Draf',
    notes: 'Rencana menu awal dibuat dan dapat diedit'
  })

  // 2. PENDING_REVIEW - Only if actually submitted
  if (plan.submittedAt) {
    timeline.push({
      status: 'PENDING_REVIEW',
      timestamp: new Date(plan.submittedAt),
      actor: {
        name: plan.submittedByUser?.name || plan.creator?.name || 'Staff',
        role: getRoleLabel(plan.submittedByUser?.userRole || plan.creator?.userRole)
      },
      action: 'Dikirim untuk Review',
      notes: 'Menunggu review dan persetujuan dari Kepala SPPG'
    })
  }

  // 3. APPROVED - Only if actually approved
  if (plan.approvedAt && plan.approver) {
    timeline.push({
      status: 'APPROVED',
      timestamp: new Date(plan.approvedAt),
      actor: {
        name: plan.approver.name,
        role: getRoleLabel(plan.approver.userRole)
      },
      action: 'Disetujui',
      notes: 'Rencana menu telah disetujui dan siap untuk dipublikasi'
    })
  }

  // 4. REJECTION - Only if actually rejected (shows as annotation, not a separate status)
  // Note: Rejection doesn't change status to 'REJECTED', plan stays in PENDING_REVIEW or goes back to DRAFT
  // We'll add this as a timeline note but not a status change

  // 5. PUBLISHED - Only if actually published
  if (plan.publishedAt) {
    timeline.push({
      status: 'PUBLISHED',
      timestamp: new Date(plan.publishedAt),
      actor: {
        name: plan.publishedByUser?.name || plan.approver?.name || 'Admin',
        role: getRoleLabel(plan.publishedByUser?.userRole || plan.approver?.userRole)
      },
      action: 'Dipublikasikan',
      notes: 'Rencana menu dipublikasi dan dapat digunakan untuk operasional'
    })
  }

  // 6. ACTIVE - Only if published and currently active
  if (plan.publishedAt && plan.isActive) {
    const now = new Date()
    const startDate = new Date(plan.startDate)
    
    // Only add ACTIVE entry if we're in the active period
    if (now >= startDate) {
      timeline.push({
        status: 'ACTIVE',
        timestamp: startDate,
        actor: {
          name: 'System',
          role: 'Sistem'
        },
        action: 'Mulai Berlaku',
        notes: `Rencana menu aktif dari ${format(startDate, 'PPP', { locale: localeId })} hingga ${format(new Date(plan.endDate), 'PPP', { locale: localeId })}`
      })
    }
  }

  // Sort by timestamp (oldest first)
  return timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

/**
 * Status Timeline Card Component
 * @description Shows workflow progress, timeline history, and next actions
 */
interface StatusTimelineCardProps {
  plan: MenuPlanDetailType
  isExpanded: boolean
  onToggle: () => void
}

const StatusTimelineCard: FC<StatusTimelineCardProps> = ({ plan, isExpanded, onToggle }) => {
  const timeline = generateRealTimeline(plan)

  // Define workflow steps
  const workflowSteps = [
    { status: 'DRAFT' as MenuPlanStatus, icon: FileText, label: 'Draf', color: 'gray' },
    { status: 'PENDING_REVIEW' as MenuPlanStatus, icon: Eye, label: 'Review', color: 'yellow' },
    { status: 'APPROVED' as MenuPlanStatus, icon: CheckCircle, label: 'Approval', color: 'green' },
    { status: 'PUBLISHED' as MenuPlanStatus, icon: Send, label: 'Publish', color: 'purple' },
    { status: 'ACTIVE' as MenuPlanStatus, icon: Activity, label: 'Aktif', color: 'emerald' },
  ]

  const currentStepIndex = workflowSteps.findIndex(step => step.status === plan.status)

  // Get next action based on status
  const getNextAction = () => {
    switch (plan.status) {
      case 'DRAFT':
        return {
          message: 'Review rencana dan kirim untuk persetujuan',
          action: 'Kirim untuk Review',
          icon: Send,
          variant: 'default' as const,
        }
      case 'PENDING_REVIEW':
        return {
          message: 'Menunggu review dari Ahli Gizi',
          estimatedTime: '1-2 hari kerja',
          canRemind: true,
        }
      case 'REVIEWED':
        return {
          message: 'Review selesai, akan dikirim untuk approval',
          estimatedTime: 'Segera diproses',
        }
      case 'PENDING_APPROVAL':
        return {
          message: 'Menunggu persetujuan dari Kepala SPPG',
          estimatedTime: '2-3 hari kerja',
          canRemind: true,
        }
      case 'APPROVED':
        return {
          message: 'Publikasikan rencana untuk digunakan',
          action: 'Publikasikan Sekarang',
          icon: Send,
          variant: 'default' as const,
        }
      case 'PUBLISHED':
        return {
          message: 'Rencana sudah dipublikasikan',
          estimatedTime: `Menunggu tanggal mulai: ${format(new Date(plan.startDate), 'PPP', { locale: localeId })}`,
        }
      case 'ACTIVE':
        return {
          message: 'Rencana sedang aktif berjalan',
          estimatedTime: `Sampai: ${format(new Date(plan.endDate), 'PPP', { locale: localeId })}`,
        }
      case 'COMPLETED':
        return {
          message: 'Rencana telah selesai dilaksanakan',
        }
      case 'ARCHIVED':
        return {
          message: 'Rencana telah diarsipkan',
        }
      case 'CANCELLED':
        return {
          message: 'Rencana telah dibatalkan',
        }
      default:
        return null
    }
  }

  const nextAction = getNextAction()

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Status Workflow & Timeline
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Workflow Progress */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Workflow Progress
            </h4>
            <div className="relative">
              {/* Desktop: Horizontal Stepper */}
              <div className="hidden sm:flex items-center justify-between relative">
                {workflowSteps.map((step, idx) => {
                  const Icon = step.icon
                  const isActive = idx === currentStepIndex
                  const isPassed = idx < currentStepIndex
                  const isFuture = idx > currentStepIndex

                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1 relative">
                      {/* Connector Line */}
                      {idx > 0 && (
                        <div 
                          className={cn(
                            "absolute h-0.5 top-5 -translate-y-1/2",
                            isPassed ? 'bg-primary' : 'bg-muted',
                            "transition-colors duration-300"
                          )}
                          style={{
                            left: '-50%',
                            width: '100%',
                            zIndex: 0,
                          }}
                        />
                      )}

                      {/* Step Circle */}
                      <div 
                        className={cn(
                          "rounded-full p-2.5 mb-2 z-10 transition-all duration-300 relative",
                          "border-2",
                          isActive && "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20 scale-110",
                          isPassed && "bg-primary text-primary-foreground border-primary",
                          isFuture && "bg-muted text-muted-foreground border-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Step Label */}
                      <p className={cn(
                        "text-xs text-center font-medium transition-colors duration-300",
                        isActive && "text-primary font-semibold",
                        isPassed && "text-primary",
                        isFuture && "text-muted-foreground"
                      )}>
                        {step.label}
                      </p>

                      {/* Status Icon */}
                      <div className="mt-1 h-4 flex items-center justify-center">
                        {isPassed && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        )}
                        {isActive && (
                          <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile: Vertical Stepper */}
              <div className="flex sm:hidden flex-col gap-3">
                {workflowSteps.map((step, idx) => {
                  const Icon = step.icon
                  const isActive = idx === currentStepIndex
                  const isPassed = idx < currentStepIndex
                  const isFuture = idx > currentStepIndex

                  return (
                    <div key={step.status} className="flex items-start gap-3 relative">
                      {/* Connector Line */}
                      {idx < workflowSteps.length - 1 && (
                        <div 
                          className={cn(
                            "absolute w-0.5 left-[15px] top-10 h-[calc(100%+12px)]",
                            isPassed || isActive ? 'bg-primary' : 'bg-muted',
                            "transition-colors duration-300"
                          )}
                        />
                      )}

                      {/* Step Circle */}
                      <div 
                        className={cn(
                          "rounded-full p-2 z-10 transition-all duration-300 flex-shrink-0",
                          "border-2",
                          isActive && "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20",
                          isPassed && "bg-primary text-primary-foreground border-primary",
                          isFuture && "bg-muted text-muted-foreground border-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isActive && "text-primary font-semibold",
                            isPassed && "text-primary",
                            isFuture && "text-muted-foreground"
                          )}>
                            {step.label}
                          </p>
                          {isPassed && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          )}
                          {isActive && (
                            <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline History */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Timeline History
            </h4>
            <div className="space-y-3">
              {timeline.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Belum ada history untuk rencana ini
                  </AlertDescription>
                </Alert>
              ) : (
                timeline.map((entry, idx) => (
                  <Card key={idx} className="border-l-4 border-l-primary bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm font-medium">
                            {entry.action}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {entry.actor.name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(entry.timestamp), 'PPp', { locale: localeId })}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              &ldquo;{entry.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Next Action */}
          {nextAction && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Next Action
                </h4>
                <Alert className={cn(
                  plan.status === 'DRAFT' && "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20",
                  plan.status === 'PENDING_REVIEW' && "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20",
                  plan.status === 'PENDING_APPROVAL' && "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-900/20",
                  plan.status === 'APPROVED' && "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                )}>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription className="space-y-3">
                    <p className="text-sm font-medium">
                      {nextAction.message}
                    </p>
                    {nextAction.estimatedTime && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Estimasi: {nextAction.estimatedTime}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {nextAction.action && nextAction.icon && (
                        <Button size="sm" variant={nextAction.variant}>
                          <nextAction.icon className="mr-2 h-4 w-4" />
                          {nextAction.action}
                        </Button>
                      )}
                      {nextAction.canRemind && (
                        <Button variant="outline" size="sm">
                          <Bell className="mr-2 h-4 w-4" />
                          Kirim Reminder
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Quick Stat Component
 */
interface QuickStatProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

const QuickStat: FC<QuickStatProps> = ({ icon, label, value }) => {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md border-muted">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="rounded-xl bg-primary/10 p-2.5 sm:p-3 text-primary ring-2 ring-primary/5 shrink-0">
            {icon}
          </div>
          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {label}
            </p>
            <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none" />
    </Card>
  )
}

/**
 * Overview Tab Component with Collapsible Sections
 */
const OverviewTab: FC<{ 
  plan: MenuPlanDetailType
  setActiveTab: (tab: 'overview' | 'calendar' | 'analytics') => void
}> = ({ plan, setActiveTab }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'details', 'metrics', 'workflow' // Default expanded sections - added workflow
  ])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Description - Always visible with better styling */}
      {plan.description && (
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm leading-relaxed">
            {plan.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Collapsible Section: Plan Details */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('details')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detail Rencana
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {expandedSections.includes('details') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.includes('details') && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Informasi Program
                </h4>
                <dl className="space-y-3">
                  <DetailRow label="Program" value={plan.program.name} />
                  <DetailRow label="Kode Program" value={plan.program.programCode} />
                  <DetailRow 
                    label="Target Penerima" 
                    value={plan.program.targetRecipients?.toLocaleString() || 'N/A'} 
                  />
                  <DetailRow 
                    label="Total Hari" 
                    value={plan.metrics?.dateRange?.days || plan.totalDays || 0} 
                  />
                  <DetailRow 
                    label="Total Menu" 
                    value={plan.metrics?.totalAssignments || plan.totalMenus || 0} 
                  />
                </dl>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Informasi Pembuatan
                </h4>
                <dl className="space-y-3">
                  <DetailRow label="Dibuat Oleh" value={plan.creator.name} />
                  <DetailRow
                    label="Dibuat Pada"
                    value={format(new Date(plan.createdAt), 'PPP', { locale: localeId })}
                  />
                  {plan.approver && (
                    <DetailRow label="Disetujui Oleh" value={plan.approver.name} />
                  )}
                  {plan.publishedAt && (
                    <DetailRow
                      label="Dipublikasi Pada"
                      value={format(new Date(plan.publishedAt), 'PPP', { locale: localeId })}
                    />
                  )}
                </dl>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Collapsible Section: Quality Metrics */}
      {(plan.nutritionScore || plan.varietyScore || plan.costEfficiency || plan.metrics) && (
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('metrics')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Metrik Kualitas & Analisis
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {expandedSections.includes('metrics') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          {expandedSections.includes('metrics') && (
            <CardContent className="pt-0 space-y-6">
              {/* Quality Scores */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Skor Kualitas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plan.nutritionScore && (
                    <MetricCard
                      label="Skor Nutrisi"
                      value={plan.nutritionScore}
                      max={100}
                    />
                  )}
                  {plan.varietyScore && (
                    <MetricCard
                      label="Skor Variasi"
                      value={plan.varietyScore}
                      max={100}
                    />
                  )}
                  {plan.costEfficiency && (
                    <MetricCard
                      label="Efisiensi Biaya"
                      value={plan.costEfficiency}
                      max={100}
                    />
                  )}
                </div>
              </div>
              
              {/* Cost & Coverage Analysis */}
              {plan.metrics && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Analisis Biaya & Cakupan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-muted">
                        <CardContent className="pt-6">
                          <dl className="space-y-3">
                            <DetailRow 
                              label="Total Estimasi Biaya" 
                              value={`Rp ${plan.metrics.totalEstimatedCost.toLocaleString('id-ID')}`} 
                            />
                            <DetailRow 
                              label="Rata-rata Biaya per Porsi" 
                              value={`Rp ${plan.metrics.averageCostPerPortion.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`} 
                            />
                            <DetailRow 
                              label="Total Porsi Direncanakan" 
                              value={plan.metrics.totalPlannedPortions.toLocaleString('id-ID')} 
                            />
                          </dl>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-muted">
                        <CardContent className="pt-6">
                          <dl className="space-y-3">
                            <DetailRow 
                              label="Hari dengan Assignment" 
                              value={`${plan.metrics.coverage.daysWithAssignments} / ${plan.metrics.dateRange.days}`} 
                            />
                            <DetailRow 
                              label="Persentase Cakupan" 
                              value={`${plan.metrics.coverage.coveragePercentage.toFixed(1)}%`} 
                            />
                            <DetailRow 
                              label="Total Assignment" 
                              value={plan.metrics.totalAssignments.toLocaleString('id-ID')} 
                            />
                          </dl>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Collapsible Section: Status Workflow & Timeline */}
      <StatusTimelineCard 
        plan={plan}
        isExpanded={expandedSections.includes('workflow')}
        onToggle={() => toggleSection('workflow')}
      />

      {/* Collapsible Section: Recent Assignments */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('assignments')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Assignment Terkini
              {plan.assignments && plan.assignments.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {plan.assignments.length}
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {expandedSections.includes('assignments') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.includes('assignments') && (
          <CardContent className="pt-0">
            {plan.assignments && plan.assignments.length > 0 ? (
              <>
                <div className="space-y-2">
                  {plan.assignments.slice(0, 5).map((assignment) => (
                    <Card key={assignment.id} className="border-muted hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{assignment.menu.menuName}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {assignment.mealType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(assignment.assignedDate), 'PPP', { locale: localeId })}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {assignment.plannedPortions || 0} porsi
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {plan.assignments.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('calendar')}
                      className="w-full sm:w-auto"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Lihat Semua {plan.assignments.length} Assignment
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="rounded-full bg-muted p-6">
                    <CalendarDays className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Belum Ada Assignment
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Mulai atur menu harian dengan membuka kalender dan menugaskan menu untuk tanggal tertentu
                    </p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('calendar')}
                    size="sm"
                    className="mt-4"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Buka Kalender
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

/**
 * Calendar Tab Component
 */
const CalendarTab: FC<{ planId: string; plan: MenuPlanDetailType }> = ({ planId, plan }) => {
  return (
    <div className="pt-4">
      <MenuPlanCalendar
        planId={planId}
        startDate={new Date(plan.startDate)}
        endDate={new Date(plan.endDate)}
        assignments={plan.assignments || []}
        programTargetRecipients={plan.program?.targetRecipients || undefined}
      />
    </div>
  )
}

/**
 * Analytics Tab Component
 */
const AnalyticsTab: FC<{ planId: string }> = ({ planId }) => {
  const { data: analytics, isLoading, error } = useMenuPlanAnalytics(planId)

  if (isLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Memuat analitik...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gagal memuat analitik. {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    console.log('Exporting analytics as:', format)
    // TODO: Implement export functionality
    alert(`Mengekspor sebagai ${format.toUpperCase()}... (segera hadir)`)
  }

  return (
    <div className="pt-4">
      <PlanAnalytics 
        analytics={analytics}
        onExport={handleExport}
      />
    </div>
  )
}

/**
 * Detail Row Component
 */
const DetailRow: FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-start">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  )
}

/**
 * Metric Card Component
 */
const MetricCard: FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => {
  const percentage = (value / max) * 100
  const color = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="p-4 rounded-lg border bg-card space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Detail Skeleton Component
 */
const DetailSkeleton: FC = () => {
  return (
    <Card>
      <CardHeader className="space-y-6 pb-6">
        {/* Title Section Skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        </div>
        
        <Separator />
        
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-4 pt-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
