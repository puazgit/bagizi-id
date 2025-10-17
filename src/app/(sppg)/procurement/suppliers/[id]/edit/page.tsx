/**
 * @fileoverview Edit Supplier Page - Edit existing supplier
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Dynamic route with [id] parameter
 * - Data fetching with Prisma
 * - SEO optimization with metadata
 * - Breadcrumb navigation
 * - Client component integration (form wrapper)
 * - Update mutation with optimistic updates
 * - Warning alert for data modification
 * - Dark mode support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { canManageProcurement } from '@/lib/permissions'
import { EditSupplierFormClient } from '.'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { ChevronLeft, FileEdit, AlertTriangle } from 'lucide-react'

/**
 * Generate dynamic metadata for edit page
 */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return { title: 'Edit Supplier' }
    }

    const supplier = await db.supplier.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId
      },
      select: {
        supplierName: true,
        supplierCode: true
      }
    })

    if (!supplier) {
      return { title: 'Supplier Tidak Ditemukan' }
    }

    return {
      title: `Edit Supplier ${supplier.supplierName} | Bagizi-ID`,
      description: `Edit data supplier ${supplier.supplierName} (${supplier.supplierCode})`
    }
  } catch {
    return { title: 'Edit Supplier' }
  }
}

/**
 * Fetch supplier data by ID with multi-tenant filtering
 */
async function getSupplierById(id: string, sppgId: string) {
  try {
    return await db.supplier.findFirst({
      where: {
        id,
        sppgId // CRITICAL: Multi-tenant filter
      }
    })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return null
  }
}

/**
 * Edit Supplier Page Component
 * 
 * Server Component that:
 * - Authenticates user
 * - Checks RBAC permissions
 * - Fetches supplier data with multi-tenant filtering
 * - Renders edit form with warning alert
 * - Handles 404 if supplier not found
 */
export default async function EditSupplierPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================

  const session = await auth()
  
  // Check authentication
  if (!session?.user) {
    redirect(`/login?callbackUrl=/procurement/suppliers/${params.id}/edit`)
  }

  // Check SPPG access
  const sppgId = session.user.sppgId
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  // Check permissions (RBAC)
  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/access-denied?reason=insufficient-permissions')
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  const supplier = await getSupplierById(params.id, sppgId)

  // Handle not found
  if (!supplier) {
    notFound()
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* BREADCRUMB NAVIGATION */}
      {/* ============================================ */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/procurement">Pengadaan</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/procurement/suppliers">Supplier</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/procurement/suppliers/${supplier.id}`}>
              {supplier.supplierName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ============================================ */}
      {/* PAGE HEADER */}
      {/* ============================================ */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
          </div>
          <p className="text-muted-foreground">
            Edit data supplier <span className="font-semibold">{supplier.supplierName}</span> ({supplier.supplierCode})
          </p>
        </div>
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/procurement/suppliers/${supplier.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali ke Detail
          </Link>
        </Button>
      </div>

      <Separator />

      {/* ============================================ */}
      {/* WARNING ALERT */}
      {/* ============================================ */}
      <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">Perhatian</AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Anda sedang mengedit data supplier yang sudah ada. Pastikan perubahan yang Anda lakukan sudah benar 
          sebelum menyimpan. Perubahan data supplier dapat mempengaruhi procurement order yang terkait.
        </AlertDescription>
      </Alert>

      {/* ============================================ */}
      {/* EDIT FORM */}
      {/* ============================================ */}
      <EditSupplierFormClient supplier={supplier} />
    </div>
  )
}
