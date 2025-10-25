/**
 * @fileoverview Admin Create Demo Request Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useCreateDemoRequest } from '@/features/admin/demo-requests'
import { DemoRequestForm } from '@/features/admin/demo-requests/components'
import type { DemoRequestFormInput } from '@/features/admin/demo-requests/types/demo-request.types'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Create Demo Request Page - Form untuk membuat permintaan demo baru
 *
 * Features:
 * - Multi-section form (Contact, Organization, Demo Details)
 * - React Hook Form + Zod validation
 * - Success redirect to detail page
 * - Error handling with toast
 *
 * @example
 * // Route: /admin/demo-requests/new
 */
export default function CreateDemoRequestPage() {
  const router = useRouter()
  const createMutation = useCreateDemoRequest()

  const handleSubmit = async (data: DemoRequestFormInput) => {
    try {
      const result = await createMutation.mutateAsync(data)
      if (result && result.id) {
        router.push(`/admin/demo-requests/${result.id}`)
      }
    } catch (error) {
      // Error handled by mutation with toast
      console.error('Create error:', error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Permintaan Demo Baru
          </h1>
          <p className="text-muted-foreground mt-1">
            Buat permintaan demo dari calon pelanggan
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Form Permintaan Demo</CardTitle>
          <CardDescription>
            Lengkapi informasi kontak, organisasi, dan preferensi demo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemoRequestForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
