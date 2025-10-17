/**
 * @fileoverview Edit Procurement Form Wrapper - Client component for handling edit submission
 * @version Next.js 15.5.4 / TanStack Query v5 / React Hook Form
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Client Component for interactive form handling
 * - TanStack Query mutation for API calls (UPDATE)
 * - Pre-populated form with existing data
 * - Loading state management
 * - Success redirect back to detail page
 * - Error handling with toast notifications
 * - Optimistic updates
 * - Type-safe with TypeScript strict mode
 */

'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProcurementForm } from '@/features/sppg/procurement/components'
import { useUpdateProcurement } from '@/features/sppg/procurement/hooks'
import { type UpdateProcurementInput, type Procurement } from '@/features/sppg/procurement/types'

interface EditProcurementFormWrapperProps {
  procurement: Procurement // Full procurement data with relations
  procurementId: string
}

/**
 * EditProcurementFormWrapper Component
 * 
 * Client-side wrapper that provides edit form submission logic to ProcurementForm.
 * This pattern keeps the parent page as Server Component (for SSR benefits)
 * while allowing interactive form functionality.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {any} props.procurement - Existing procurement data (pre-populates form)
 * @param {string} props.procurementId - Procurement ID for update mutation
 * @returns {JSX.Element} Form wrapper with edit submission handling
 * 
 * @architecture
 * - Server Component (page.tsx) renders static content + fetches data
 * - Client Component (this file) handles form interactivity
 * - Maintains SSR benefits while enabling client-side features
 * 
 * @flow
 * 1. ProcurementForm receives `procurement` prop (enters EDIT mode)
 * 2. All fields pre-populated with existing values
 * 3. User modifies desired fields
 * 4. onSubmit triggered with updated data
 * 5. TanStack Query mutation calls PUT /api/sppg/procurement/[id]
 * 6. On success: redirect back to /procurement/[id]
 * 7. On error: display toast notification
 * 
 * @example
 * // In Server Component page.tsx:
 * import { EditProcurementFormWrapper } from './EditProcurementFormWrapper'
 * 
 * export default async function EditProcurementPage({ params }) {
 *   const procurement = await getProcurementById(params.id)
 *   
 *   return (
 *     <div>
 *       <EditProcurementFormWrapper 
 *         procurement={procurement}
 *         procurementId={params.id}
 *       />
 *     </div>
 *   )
 * }
 */
export function EditProcurementFormWrapper({ 
  procurement,
  procurementId
}: EditProcurementFormWrapperProps) {
  const router = useRouter()
  
  // TanStack Query mutation for updating procurement
  const updateProcurement = useUpdateProcurement()

  /**
   * Handle form submission
   * 
   * @param {UpdateProcurementInput} data - Validated form data from ProcurementForm
   * @returns {void}
   * 
   * @validation
   * - Data already validated by ProcurementForm (Zod schema)
   * - Only modified fields are sent to API
   * - Additional validation happens in API endpoint
   * 
   * @sideEffects
   * - Calls PUT /api/sppg/procurement/[id]
   * - Shows loading toast during submission
   * - Redirects back to detail page on success
   * - Shows error toast on failure
   * - Invalidates procurement queries cache
   */
  const handleSubmit = (data: UpdateProcurementInput) => {
    // Show loading toast
    const loadingToast = toast.loading('Menyimpan perubahan...', {
      description: 'Mohon tunggu sebentar'
    })

    // Execute mutation
    updateProcurement.mutate(
      { id: procurementId, data },
      {
        onSuccess: (result) => {
          // Dismiss loading toast
          toast.dismiss(loadingToast)
          
          // Show success toast
          toast.success('Perubahan berhasil disimpan!', {
            description: `Pengadaan ${result.data?.procurementCode || ''} telah diperbarui`,
            duration: 5000
          })

          // Redirect back to detail page
          router.push(`/procurement/${procurementId}`)
        },
        onError: (error) => {
          // Dismiss loading toast
          toast.dismiss(loadingToast)
          
          // Show error toast
          toast.error('Gagal menyimpan perubahan', {
            description: error instanceof Error ? error.message : 'Terjadi kesalahan',
            duration: 7000
          })
        }
      }
    )
  }

  /**
   * Handle form cancellation
   * 
   * @returns {void}
   * 
   * @sideEffects
   * - Navigates back to procurement detail page
   * - Form changes are lost (no draft saving)
   */
  const handleCancel = () => {
    // Confirm before canceling if form is dirty
    const confirmCancel = confirm(
      'Apakah Anda yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.'
    )
    
    if (confirmCancel) {
      router.push(`/procurement/${procurementId}`)
    }
  }

  return (
    <ProcurementForm 
      procurement={procurement}  // Pre-populate form (enables EDIT mode)
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={updateProcurement.isPending}
    />
  )
}
