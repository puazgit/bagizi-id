/**
 * @fileoverview Create New Procurement Page - Form wrapper for creating procurement orders
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - SEO optimization with metadata
 * - Breadcrumb navigation
 * - Client component wrapper for form
 * - Multi-tenant data isolation (sppgId filtering)
 * - Form submission handling
 * - Success redirect
 * - Dark mode support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { checkSppgAccess, canManageProcurement } from '@/lib/permissions'
import { CreateProcurementFormWrapper } from '.'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ShoppingCart,
  ArrowLeft,
  AlertCircle,
  Info,
} from 'lucide-react'

// ================================ METADATA ================================

export const metadata: Metadata = {
  title: 'Buat Procurement Baru | Bagizi SPPG',
  description: 'Buat procurement order baru untuk pengadaan bahan baku dan supplier program gizi SPPG',
  keywords: [
    'create procurement',
    'new procurement order',
    'buat pengadaan',
    'purchase order',
    'supplier order',
  ],
}

// ================================ MAIN COMPONENT ================================

/**
 * Create New Procurement Page (Server Component)
 * 
 * Features:
 * - SSR for optimal performance and SEO
 * - Authentication guard with session check
 * - Authorization guard with permission check (canManageProcurement)
 * - Multi-tenant data isolation (sppgId auto-injected)
 * - Client component integration (ProcurementForm)
 * - Breadcrumb navigation
 * - Information cards with guidelines
 * - Success redirect to detail page
 * - Responsive layout
 */
export default async function CreateProcurementPage() {
  // ================================ AUTHENTICATION ================================
  
  const session = await auth()
  
  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login?callbackUrl=/procurement/new')
  }

  // ================================ AUTHORIZATION ================================
  
  // Check SPPG access (multi-tenant security)
  const sppgId = session.user.sppgId
  
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  // Verify SPPG exists and is active
  const sppg = await checkSppgAccess(sppgId)
  
  if (!sppg) {
    redirect('/access-denied?reason=invalid-sppg')
  }

  // Check role permissions for procurement management
  const userRole = session.user.userRole
  
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/access-denied?reason=insufficient-permissions')
  }

  // ================================ RENDER ================================

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ================================ HEADER ================================ */}
      
      <div className="flex flex-col gap-4">
        {/* Back Button */}
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/procurement">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Procurement
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Buat Procurement Baru
            </h1>
          </div>
          <p className="text-muted-foreground">
            Buat procurement order baru untuk pengadaan bahan baku dari supplier
          </p>
        </div>
      </div>

      <Separator />

      {/* ================================ BREADCRUMB ================================ */}
      
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link 
          href="/dashboard" 
          className="hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <span>/</span>
        <Link 
          href="/procurement" 
          className="hover:text-foreground transition-colors"
        >
          Procurement
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Buat Baru</span>
      </nav>

      {/* ================================ INFORMATION ALERT ================================ */}
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Informasi Penting</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Sebelum membuat procurement order, pastikan Anda telah:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Memiliki rencana procurement yang telah disetujui</li>
            <li>Memilih supplier yang sesuai dan terdaftar</li>
            <li>Menentukan item yang akan dipesan dengan spesifikasi lengkap</li>
            <li>Memastikan budget tersedia untuk procurement ini</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* ================================ MAIN CONTENT - PROCUREMENT FORM ================================ */}
      
      <Card>
        <CardHeader>
          <CardTitle>Form Procurement Order</CardTitle>
          <CardDescription>
            Lengkapi form di bawah untuk membuat procurement order baru.
            Semua field yang ditandai dengan * wajib diisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 
            Client Wrapper Component: CreateProcurementFormWrapper
            - Handles form submission with TanStack Query mutation
            - Manages loading state
            - Success redirect to detail page
            - Error handling with toast notifications
            
            Wraps ProcurementForm (735 lines):
            - 19 fields with validation
            - 2 enum selects (Method, Status)
            - Auto-calculation for totals
            - React Hook Form + Zod validation
          */}
          <CreateProcurementFormWrapper />
        </CardContent>
      </Card>

      {/* ================================ GUIDELINES CARD ================================ */}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Panduan Pengisian Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">1. Informasi Dasar</strong>
            <p className="mt-1">
              Kode procurement akan di-generate otomatis. Pilih metode pengadaan
              yang sesuai dengan kebijakan SPPG Anda.
            </p>
          </div>

          <div>
            <strong className="text-foreground">2. Supplier & Plan</strong>
            <p className="mt-1">
              Pilih supplier yang sudah terdaftar dan aktif. Jika ada rencana
              procurement terkait, hubungkan dengan memilih plan yang sesuai.
            </p>
          </div>

          <div>
            <strong className="text-foreground">3. Tanggal & Jadwal</strong>
            <p className="mt-1">
              Tanggal order adalah tanggal pembuatan PO. Tanggal pengiriman
              diharapkan adalah estimasi kapan barang akan diterima.
            </p>
          </div>

          <div>
            <strong className="text-foreground">4. Item Procurement</strong>
            <p className="mt-1">
              Tambahkan semua item yang akan dipesan. Setiap item harus memiliki
              spesifikasi, kuantitas, dan harga yang jelas. Total akan dihitung
              otomatis.
            </p>
          </div>

          <div>
            <strong className="text-foreground">5. Keuangan</strong>
            <p className="mt-1">
              Masukkan nilai pajak dan diskon jika ada. Total akhir akan
              dikalkulasi otomatis: (Subtotal + Pajak - Diskon).
            </p>
          </div>

          <div>
            <strong className="text-foreground">6. Status & Approval</strong>
            <p className="mt-1">
              Untuk procurement baru, biasanya status awal adalah DRAFT atau
              PENDING_APPROVAL tergantung kebijakan SPPG. Procurement dengan
              nilai besar mungkin memerlukan approval dari kepala SPPG.
            </p>
          </div>

          <div>
            <strong className="text-foreground">7. Catatan Tambahan</strong>
            <p className="mt-1">
              Gunakan field deskripsi dan notes untuk informasi tambahan yang
              penting untuk diketahui oleh semua pihak terkait.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ================================ TIPS CARD ================================ */}
      
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Tips Procurement:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Simpan sebagai DRAFT jika belum siap submit untuk approval</li>
                <li>• Pastikan semua item sesuai dengan menu planning yang telah dibuat</li>
                <li>• Periksa kembali harga dan kuantitas sebelum submit</li>
                <li>• Gunakan procurement method yang sesuai dengan nilai pengadaan</li>
                <li>• Tandai sebagai URGENT jika procurement harus diprioritaskan</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
