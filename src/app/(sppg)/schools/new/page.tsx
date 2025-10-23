/**
 * @fileoverview Create New School Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'

import { CreateSchoolForm } from './CreateSchoolForm'

/**
 * Page metadata
 */
export const metadata: Metadata = {
  title: 'Tambah Sekolah Baru | Bagizi-ID',
  description: 'Daftarkan sekolah baru sebagai penerima manfaat program pangan',
}

/**
 * Create School Page Component
 * 
 * Form page for creating new school beneficiary.
 * Features:
 * - Multi-step form with validation
 * - Regional cascade selects
 * - Auto-calculation of fields
 * - Form persistence
 * - Success/error notifications
 * 
 * @returns Create school page
 */
export default function CreateSchoolPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Tambah Sekolah Baru
        </h1>
        <p className="text-muted-foreground">
          Daftarkan sekolah atau institusi pendidikan baru sebagai penerima manfaat
        </p>
      </div>

      {/* Form */}
      <CreateSchoolForm />
    </div>
  )
}
