/**
 * @fileoverview User Card Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Mail,
  Phone,
  Building2,
  Clock,
  Lock,
  Unlock,
  CheckCircle
} from 'lucide-react'
import { useDeleteUser, useUnlockAccount, useVerifyEmail } from '../hooks'
import { getRoleLabel, getTypeLabel } from '../types'
import type { UserListItem } from '../types'
import {
  formatUserDisplayName,
  getUserInitials,
  getUserStatusVariant,
  getUserStatusLabel,
  getRoleBadgeColor,
  formatLastLogin,
  isUserLocked
} from '../lib'

interface UserCardProps {
  user: UserListItem
  variant?: 'default' | 'compact'
}

/**
 * User Card Component
 * Displays user information in card format with actions
 */
export function UserCard({ user, variant = 'default' }: UserCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { mutate: unlockAccount, isPending: isUnlocking } = useUnlockAccount()
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail()

  const isLocked = isUserLocked(user.lockedUntil)
  const statusVariant = getUserStatusVariant(user.isActive, user.emailVerified, user.lockedUntil)
  const statusLabel = getUserStatusLabel(user.isActive, user.emailVerified, user.lockedUntil)

  const handleDelete = () => {
    deleteUser(user.id, {
      onSuccess: () => {
        setShowDeleteDialog(false)
      }
    })
  }

  const handleUnlock = () => {
    unlockAccount(user.id)
  }

  const handleVerifyEmail = () => {
    verifyEmail(user.id)
  }

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
              <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {formatUserDisplayName(user)}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    {isLocked && (
                      <DropdownMenuItem onClick={handleUnlock} disabled={isUnlocking}>
                        <Unlock className="mr-2 h-4 w-4" />
                        Unlock Account
                      </DropdownMenuItem>
                    )}
                    {!user.emailVerified && (
                      <DropdownMenuItem onClick={handleVerifyEmail} disabled={isVerifying}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify Email
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={statusVariant} className="text-xs">
                  {statusLabel}
                </Badge>
                <Badge className={`text-xs ${getRoleBadgeColor(user.userRole)}`}>
                  {getRoleLabel(user.userRole)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{formatUserDisplayName(user)}</strong>? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
            <AvatarFallback className="text-lg">{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <Link href={`/admin/users/${user.id}`} className="group">
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {formatUserDisplayName(user)}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${user.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </Link>
                  </DropdownMenuItem>
                  {isLocked && (
                    <DropdownMenuItem onClick={handleUnlock} disabled={isUnlocking}>
                      <Unlock className="mr-2 h-4 w-4" />
                      Unlock Account
                    </DropdownMenuItem>
                  )}
                  {!user.emailVerified && (
                    <DropdownMenuItem onClick={handleVerifyEmail} disabled={isVerifying}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Email
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={statusVariant}>
                {statusLabel}
              </Badge>
              <Badge className={getRoleBadgeColor(user.userRole)}>
                <Shield className="h-3 w-3 mr-1" />
                {getRoleLabel(user.userRole)}
              </Badge>
              <Badge variant="outline">
                {getTypeLabel(user.userType)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {user.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}
              
              {user.sppg && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.sppg.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>Last login: {formatLastLogin(user.lastLoginAt)}</span>
              </div>
              
              {isLocked && (
                <div className="flex items-center gap-2 text-destructive">
                  <Lock className="h-3 w-3 flex-shrink-0" />
                  <span>Account Locked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{formatUserDisplayName(user)}</strong>? 
              This action cannot be undone and will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User account and credentials</li>
                <li>All associated data and permissions</li>
                <li>Activity logs and history</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
