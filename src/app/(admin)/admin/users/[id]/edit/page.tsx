/**
 * @fileoverview Edit User Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserForm } from '@/features/admin/user-management/components/UserForm'
import { useUser } from '@/features/admin/user-management/hooks'
import { toast } from 'sonner'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { data: user, isLoading, error } = useUser(userId)

  const handleSuccess = () => {
    toast.success('User updated successfully')
    router.push(`/admin/users/${userId}`)
  }

  const handleCancel = () => {
    router.push(`/admin/users/${userId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="text-muted-foreground mt-1">
              Update user information and settings
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Error Loading User</CardTitle>
            <CardDescription>
              {error?.message || 'Failed to load user data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground mt-1">
            Update information for {user.name || user.email}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/users/${userId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Detail
          </Link>
        </Button>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Update user details, role, and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="edit"
            initialData={user}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
