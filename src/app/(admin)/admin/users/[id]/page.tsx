/**
 * @fileoverview User Detail Page with Tabs
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChevronLeft,
  Edit,
  Trash2,
  Unlock,
  CheckCircle,
  Mail,
  Phone,
  Building2,
  Clock,
  Lock,
  Shield,
  Activity,
  Laptop,
  Key,
  User
} from 'lucide-react'
import {
  useUser,
  useUserActivity,
  useDeleteUser,
  useVerifyEmail,
  useUnlockAccount,
} from '@/features/admin/user-management/hooks'
import {
  formatUserDisplayName,
  getUserInitials,
  getUserStatusVariant,
  getUserStatusLabel,
  getRoleBadgeColor,
  formatLastLogin,
  formatDateTime,
  isUserLocked,
  getLockedRemainingTime,
} from '@/features/admin/user-management/lib'
import { getRoleLabel, getTypeLabel } from '@/features/admin/user-management/types'

/**
 * User Detail Page
 * Shows comprehensive user information with tabs
 */
export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [activeTab, setActiveTab] = useState('info')
  const { data: user, isLoading, error } = useUser(userId)
  const { data: activity, isLoading: activityLoading } = useUserActivity(userId, 50)

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail()
  const { mutate: unlockAccount, isPending: isUnlocking } = useUnlockAccount()

  const handleDelete = () => {
    if (!user) return
    
    if (confirm(`Delete ${formatUserDisplayName(user)}? This action cannot be undone.`)) {
      deleteUser(userId, {
        onSuccess: () => {
          router.push('/admin/users')
        },
      })
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <p className="text-destructive font-medium">Failed to load user</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          <Button asChild className="mt-4">
            <Link href="/admin/users">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">User not found</p>
          <Button asChild className="mt-4">
            <Link href="/admin/users">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const locked = isUserLocked(user.lockedUntil)
  const statusVariant = getUserStatusVariant(user.isActive, user.emailVerified, user.lockedUntil)
  const statusLabel = getUserStatusLabel(user.isActive, user.emailVerified, user.lockedUntil)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{formatUserDisplayName(user)}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {user.email}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          asChild
        >
          <Link href="/admin/users">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>

      {/* User Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
                <AvatarFallback className="text-lg">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                  <Badge className={getRoleBadgeColor(user.userRole)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(user.userRole)}
                  </Badge>
                  <Badge variant="outline">{getTypeLabel(user.userType)}</Badge>
                </div>
                
                {user.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/users/${userId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              
              {locked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unlockAccount(userId)}
                  disabled={isUnlocking}
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  {isUnlocking ? 'Unlocking...' : 'Unlock'}
                </Button>
              )}
              
              {!user.emailVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => verifyEmail(userId)}
                  disabled={isVerifying}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          {locked && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 text-destructive">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Account Locked - {getLockedRemainingTime(user.lockedUntil)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">
            <Shield className="h-4 w-4 mr-2" />
            Information
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Laptop className="h-4 w-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Tab: Information */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                User profile and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Full Name</span>
                  <p className="font-medium">{user.name || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <p className="font-medium flex items-center gap-1">
                    {user.phone ? (
                      <>
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Timezone</span>
                  <p className="font-medium">{user.timezone || 'WIB'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">User Role</span>
                  <p className="font-medium">{getRoleLabel(user.userRole)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">User Type</span>
                  <p className="font-medium">{getTypeLabel(user.userType)}</p>
                </div>
                {user.sppg && (
                  <>
                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">SPPG Assignment</span>
                      <p className="font-medium flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {user.sppg.name} ({user.sppg.code})
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <p className="font-medium">{user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <p className="font-medium">{user.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Last Login</span>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatLastLogin(user.lastLoginAt)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Account Created</span>
                  <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Activity */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent user actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !activity || activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">No Activity Yet</h3>
                  <p className="text-center text-muted-foreground max-w-sm">
                    This user hasn&apos;t performed any actions yet. Activity will be logged here when the user interacts with the system.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">{log.eventType}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sessions */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
              <CardDescription>
                User login history and session information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Session Info */}
              <div>
                <h3 className="font-semibold mb-3">Session Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Laptop className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Last Login</p>
                        <p className="text-sm text-muted-foreground">
                          {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never logged in'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={user.lastLoginAt ? "default" : "secondary"}>
                      {user.lastLoginAt ? "Active" : "No Activity"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Last Activity</p>
                        <p className="text-sm text-muted-foreground">
                          {user.updatedAt ? formatDateTime(user.updatedAt) : 'No recent activity'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user.lastLoginIp && (
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                          <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">Last IP Address</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {user.lastLoginIp}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${locked ? 'bg-destructive/10' : 'bg-green-100 dark:bg-green-900'}`}>
                        {locked ? (
                          <Lock className="h-5 w-5 text-destructive" />
                        ) : (
                          <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Account Status</p>
                        <p className="text-sm text-muted-foreground">
                          {locked ? `Locked until ${formatDateTime(user.lockedUntil!)}` : 'Active and accessible'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={locked ? "destructive" : "default"}>
                      {locked ? "Locked" : "Unlocked"}
                    </Badge>
                  </div>

                  {user.loginAttempts > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium">Failed Login Attempts</p>
                          <p className="text-sm text-muted-foreground">
                            {user.loginAttempts} failed attempt(s) recorded
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                        {user.loginAttempts}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Session Actions */}
              <div>
                <h3 className="font-semibold mb-3">Session Management</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Laptop className="h-4 w-4 mr-2" />
                    View All Active Sessions
                    <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Revoke All Sessions
                    <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Permissions */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
              <CardDescription>
                Role-based access control and feature permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Information */}
              <div>
                <h3 className="font-semibold mb-3">Assigned Role</h3>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{getRoleLabel(user.userRole)}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.userType === 'SUPERADMIN' ? 'Platform Administrator' : 
                         user.userType === 'SPPG_ADMIN' ? 'SPPG Administrator' : 
                         'SPPG User'}
                      </p>
                    </div>
                  </div>
                  
                  {user.sppg && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Assigned to SPPG:</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.sppg.name}</span>
                        <Badge variant="outline">{user.sppg.code}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Platform Permissions */}
              <div>
                <h3 className="font-semibold mb-3">Platform Access</h3>
                <div className="grid gap-3">
                  <PermissionItem
                    icon={<Shield className="h-4 w-4" />}
                    title="Admin Dashboard"
                    description="Access to platform administration"
                    granted={user.userRole.startsWith('PLATFORM_')}
                  />
                  <PermissionItem
                    icon={<User className="h-4 w-4" />}
                    title="User Management"
                    description="Create, edit, and delete users"
                    granted={user.userRole === 'PLATFORM_SUPERADMIN' || user.userRole === 'SPPG_ADMIN' || user.userRole === 'SPPG_KEPALA'}
                  />
                  <PermissionItem
                    icon={<Building2 className="h-4 w-4" />}
                    title="SPPG Management"
                    description="Manage SPPG organizations"
                    granted={user.userRole === 'PLATFORM_SUPERADMIN'}
                  />
                </div>
              </div>

              <Separator />

              {/* SPPG Features */}
              {user.userRole.startsWith('SPPG_') && (
                <div>
                  <h3 className="font-semibold mb-3">SPPG Feature Access</h3>
                  <div className="grid gap-3">
                    <PermissionItem
                      icon={<Activity className="h-4 w-4" />}
                      title="Menu Management"
                      description="Create and manage nutrition menus"
                      granted={['SPPG_ADMIN', 'SPPG_KEPALA', 'SPPG_AHLI_GIZI'].includes(user.userRole)}
                    />
                    <PermissionItem
                      icon={<Activity className="h-4 w-4" />}
                      title="Procurement"
                      description="Manage procurement and inventory"
                      granted={['SPPG_ADMIN', 'SPPG_KEPALA', 'SPPG_AKUNTAN', 'SPPG_PRODUKSI_MANAGER'].includes(user.userRole)}
                    />
                    <PermissionItem
                      icon={<Activity className="h-4 w-4" />}
                      title="Production"
                      description="Food production management"
                      granted={['SPPG_ADMIN', 'SPPG_KEPALA', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR'].includes(user.userRole)}
                    />
                    <PermissionItem
                      icon={<Activity className="h-4 w-4" />}
                      title="Distribution"
                      description="Food distribution tracking"
                      granted={['SPPG_ADMIN', 'SPPG_KEPALA', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_STAFF_DISTRIBUSI'].includes(user.userRole)}
                    />
                    <PermissionItem
                      icon={<Activity className="h-4 w-4" />}
                      title="Financial Reports"
                      description="Access financial data and reports"
                      granted={['SPPG_ADMIN', 'SPPG_KEPALA', 'SPPG_AKUNTAN'].includes(user.userRole)}
                    />
                    <PermissionItem
                      icon={<Activity className="h-4 w-4" />}
                      title="HR Management"
                      description="Manage staff and attendance"
                      granted={['SPPG_ADMIN', 'SPPG_KEPALA', 'SPPG_HRD_MANAGER'].includes(user.userRole)}
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* Permission Actions */}
              <div>
                <h3 className="font-semibold mb-3">Permission Management</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/admin/users/${userId}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Change User Role
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Key className="h-4 w-4 mr-2" />
                    Manage Custom Permissions
                    <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Permission Item Component
 * Shows individual permission status
 */
interface PermissionItemProps {
  icon: React.ReactNode
  title: string
  description: string
  granted: boolean
}

function PermissionItem({ icon, title, description, granted }: PermissionItemProps) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${granted ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900' : 'bg-muted/30'}`}>
      <div className={`p-2 rounded-full ${granted ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
        <div className={granted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          <Badge variant={granted ? "default" : "secondary"} className="text-xs">
            {granted ? "Granted" : "Not Granted"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      {granted ? (
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
      ) : (
        <Lock className="h-5 w-5 text-muted-foreground mt-1" />
      )}
    </div>
  )
}
