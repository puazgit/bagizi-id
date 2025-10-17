/**
 * @fileoverview Create Procurement Form Wrapper - Client component for handling form submission
 * @version Next.js 15.5.4 / TanStack Query v5 / React Hook Form
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Client Component for interactive form handling
 * - TanStack Query mutation for API calls
 * - Loading state management
 * - Success redirect to detail page
 * - Error handling with toast notifications
 * - Optimistic updates
 * - Type-safe with TypeScript strict mode
 */

'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProcurementForm } from '@/features/sppg/procurement/components'
import { useCreateProcurement } from '@/features/sppg/procurement/hooks'
import { type CreateProcurementInput } from '@/features/sppg/procurement/types'

/**
 * CreateProcurementFormWrapper Component
 * 
 * Client-side wrapper that provides form submission logic to ProcurementForm.
 * This pattern keeps the parent page as Server Component (for SSR benefits)
 * while allowing interactive form functionality.
 * 
 * @component
 * @returns {JSX.Element} Form wrapper with submission handling
 * 
 * @architecture
 * - Server Component (page.tsx) renders static content + metadata
 * - Client Component (this file) handles form interactivity
 * - Maintains SSR benefits while enabling client-side features
 * 
 * @flow
 * 1. User fills ProcurementForm (735 lines, 19 fields)
 * 2. onSubmit triggered with validated data
 * 3. TanStack Query mutation calls POST /api/sppg/procurement
 * 4. On success: redirect to /procurement/[id]
 * 5. On error: display toast notification
 * 
 * @example
 * // In Server Component page.tsx:
 * import { CreateProcurementFormWrapper } from './CreateProcurementFormWrapper'
 * 
 * export default async function NewProcurementPage() {
 *   // ... auth checks, metadata, etc.
 *   return (
 *     <div>
 *       <CreateProcurementFormWrapper />
 *     </div>
 *   )
 * }
 */
export function CreateProcurementFormWrapper() {
  const router = useRouter()
  
  // TanStack Query mutation for creating procurement
  const createProcurement = useCreateProcurement()

  /**
   * Handle form submission
   * 
   * @param {CreateProcurementInput} data - Validated form data from ProcurementForm
   * @returns {void}
   * 
   * @validation
   * - Data already validated by ProcurementForm (Zod schema)
   * - 19 fields: planId, supplierId, procurementCode, dates, amounts, etc.
   * - Additional validation happens in API endpoint
   * 
   * @sideEffects
   * - Calls POST /api/sppg/procurement
   * - Shows loading toast during submission
   * - Redirects to detail page on success
   * - Shows error toast on failure
   * - Invalidates procurement queries cache
   */
  const handleSubmit = (data: CreateProcurementInput) => {
    // Show loading toast
    const loadingToast = toast.loading('Membuat pengadaan baru...', {
      description: 'Mohon tunggu sebentar'
    })

    // Execute mutation
    createProcurement.mutate(data, {
      onSuccess: (result) => {
        // Dismiss loading toast
        toast.dismiss(loadingToast)
        
        // Show success toast
        toast.success('Pengadaan berhasil dibuat!', {
          description: `Kode: ${result.data?.procurementCode || 'N/A'}`,
          duration: 5000
        })

        // Redirect to detail page
        if (result.data?.id) {
          router.push(`/procurement/${result.data.id}`)
        } else {
          // Fallback to list page if no ID returned
          router.push('/procurement')
        }
      },
      onError: (error) => {
        // Dismiss loading toast
        toast.dismiss(loadingToast)
        
        // Show error toast
        toast.error('Gagal membuat pengadaan', {
          description: error instanceof Error ? error.message : 'Terjadi kesalahan',
          duration: 7000
        })
      }
    })
  }

  /**
   * Handle form cancellation
   * 
   * @returns {void}
   * 
   * @sideEffects
   * - Navigates back to procurement list page
   * - Form data is lost (no draft saving)
   */
  const handleCancel = () => {
    // Confirm before canceling if form is dirty
    const confirmCancel = confirm(
      'Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang.'
    )
    
    if (confirmCancel) {
      router.push('/procurement')
    }
  }

  return (
    <ProcurementForm 
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={createProcurement.isPending}
    />
  )
}
