/**
 * @fileoverview Edit Procurement Page - Edit existing procurement order
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
 * - Dark mode support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess, canManageProcurement } from '@/lib/permissions'
import { EditProcurementFormWrapper } from '.'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ChevronLeft, FileEdit, InfoIcon } from 'lucide-react'

/**
 * Generate dynamic metadata for edit page
 * 
 * @param {Object} params - Dynamic route parameters
 * @param {string} params.id - Procurement ID
 * @returns {Promise<Metadata>} SEO metadata
 */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return { title: 'Edit Pengadaan' }
    }

    const procurement = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId
      },
      select: {
        procurementCode: true,
        status: true
      }
    })

    if (!procurement) {
      return { title: 'Pengadaan Tidak Ditemukan' }
    }

    return {
      title: `Edit Pengadaan ${procurement.procurementCode} | Bagizi-ID`,
      description: `Edit pengadaan ${procurement.procurementCode} dengan status ${procurement.status}`
    }
  } catch {
    return { title: 'Edit Pengadaan' }
  }
}

/**
 * Fetch procurement data by ID with multi-tenant filtering
 * 
 * @param {string} id - Procurement ID
 * @param {string} sppgId - SPPG ID for multi-tenant security
 * @returns {Promise<Procurement | null>} Procurement data or null
 */
async function getProcurementById(id: string, sppgId: string) {
  try {
    return await db.procurement.findFirst({
      where: {
        id,
        sppgId // CRITICAL: Multi-tenant filter
      },
      include: {
        supplier: true,
        plan: true,
        items: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching procurement:', error)
    return null
  }
}

/**
 * Edit Procurement Page Component
 * 
 * Server Component that handles:
 * - Authentication & Authorization
 * - Data fetching with Prisma
 * - Multi-tenant security
 * - Renders edit form with existing data
 * 
 * @async
 * @returns {Promise<JSX.Element>} Edit page with form
 */
export default async function EditProcurementPage({
  params
}: {
  params: { id: string }
}) {
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  
  const session = await auth()
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect(`/login?callbackUrl=/procurement/${params.id}/edit`)
  }

  // Check if user has sppgId (multi-tenant requirement)
  const sppgId = session.user.sppgId
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  // Verify SPPG exists and is active
  const sppg = await checkSppgAccess(sppgId)
  if (!sppg) {
    redirect('/access-denied?reason=invalid-sppg')
  }

  // Check if user has permission to manage procurement
  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/access-denied?reason=insufficient-permissions')
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  const procurement = await getProcurementById(params.id, sppgId)

  // If procurement not found, show 404
  if (!procurement) {
    notFound()
  }

  // ============================================
  // RENDER EDIT PAGE
  // ============================================

  return (
    <div className="space-y-6">
      {/* ================================ HEADER ================================ */}
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/procurement/${params.id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Kembali ke Detail
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Pengadaan</h1>
          <p className="text-muted-foreground">
            Edit data pengadaan <span className="font-medium">{procurement.procurementCode}</span>
          </p>
        </div>
      </div>

      {/* ================================ BREADCRUMB ================================ */}
      
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
            <BreadcrumbLink href={`/procurement/${params.id}`}>
              {procurement.procurementCode}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Separator />

      {/* ================================ WARNING ALERT ================================ */}
      
      <Alert variant="default">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Perhatian</AlertTitle>
        <AlertDescription>
          Perubahan data akan mempengaruhi seluruh sistem. Pastikan semua data yang diubah sudah benar.
        </AlertDescription>
      </Alert>

      {/* ================================ MAIN CONTENT ================================ */}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-primary" />
            Form Edit Pengadaan
          </CardTitle>
          <CardDescription>
            Update informasi pengadaan. Semua field wajib diisi kecuali yang ditandai opsional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 
            Client Wrapper Component: EditProcurementFormWrapper
            - Handles form submission with TanStack Query mutation
            - Manages loading state
            - Success redirect back to detail page
            - Error handling with toast notifications
            
            Passes existing procurement data to ProcurementForm:
            - Form automatically enters EDIT mode when `procurement` prop exists
            - All fields pre-populated with existing values
            - Uses useUpdateProcurement mutation instead of create
          */}
          <EditProcurementFormWrapper 
            procurement={procurement}
            procurementId={params.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
