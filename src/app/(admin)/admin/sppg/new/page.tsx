/**
 * Admin SPPG Create Page
 * Create new SPPG using reusable SppgForm component
 * 
 * @route /admin/sppg/new
 * @access Platform Admin (SUPERADMIN only)
 * 
 * @version Next.js 15.5.4 - Refactored from 1303 lines to <100 lines
 * @author Bagizi-ID Development Team
 * @see {@link /src/features/admin/sppg-management/components/SppgForm.tsx} Form Component
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft } from 'lucide-react'
import { SppgForm } from '@/features/admin/sppg-management/components'

/**
 * SPPG Create Page Component
 * 
 * Features:
 * - Uses reusable SppgForm in create mode
 * - Comprehensive 35-field form with validation
 * - Professional PhoneInput with country selector
 * - Cascading regional dropdowns (Province → Regency → District → Village)
 * - Demo account conditional fields
 * - Budget & finance fields with DatePickers
 * - Automatic toast notifications and navigation
 * 
 * @refactoring
 * Reduced from 1303 lines (inline form implementation)
 * to <100 lines using SppgForm component
 */
export default function CreateSppgPage() {
  const router = useRouter()

  return (
    <div className="container py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/sppg">SPPG</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tambah Baru</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah SPPG Baru</h1>
          <p className="text-muted-foreground mt-1">
            Lengkapi semua informasi untuk mendaftarkan SPPG baru
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/sppg')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar
        </Button>
      </div>

      {/* Create Form - Using Reusable SppgForm Component */}
      <SppgForm mode="create" />
    </div>
  )
}

