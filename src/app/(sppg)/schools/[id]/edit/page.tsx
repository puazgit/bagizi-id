/**
 * @fileoverview Edit School Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'

import { EditSchoolForm } from './EditSchoolForm'
import { schoolApi } from '@/features/sppg/school/api'

/**
 * Page props - Next.js 15+ requires params to be a Promise
 */
interface EditSchoolPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata(
  { params }: EditSchoolPageProps
): Promise<Metadata> {
  try {
    const { id } = await params
    const response = await schoolApi.getById(id)
    
    if (!response.success || !response.data) {
      return {
        title: 'Edit Sekolah | Bagizi-ID',
      }
    }

    return {
      title: `Edit ${response.data.schoolName} | Bagizi-ID`,
      description: `Edit data sekolah ${response.data.schoolName}`,
    }
  } catch {
    return {
      title: 'Edit Sekolah | Bagizi-ID',
    }
  }
}

/**
 * Edit School Page Component
 * 
 * Form page for editing existing school.
 * Features:
 * - Pre-filled form with current data
 * - Multi-step validation
 * - Change tracking
 * - Confirmation on unsaved changes
 * 
 * @param params - Route parameters with school ID (Promise in Next.js 15+)
 * @returns Edit school page
 */
export default async function EditSchoolPage({ params }: EditSchoolPageProps) {
  const { id } = await params
  
  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="space-y-3 md:space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Edit Sekolah
          </h1>
          <p className="text-sm text-muted-foreground mt-1 md:mt-2">
            Perbarui data sekolah penerima manfaat
          </p>
        </div>
      </div>

      {/* Form */}
      <EditSchoolForm schoolId={id} />
    </div>
  )
}
