/**
 * @fileoverview Procurement Detail Page - Comprehensive view of procurement order
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - SEO optimization with dynamic metadata
 * - Breadcrumb navigation with procurement code
 * - Full procurement details display
 * - Related items and supplier information
 * - CRUD actions (Edit, Delete)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Comprehensive error handling
 * - Dark mode support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingCart,
  Edit,
  Trash2,
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Package,
  FileText,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// ================================ TYPES ================================

interface ProcurementDetailPageProps {
  params: Promise<{
    id: string
  }>
}

// ================================ HELPER FUNCTIONS ================================

/**
 * Get procurement by ID with all relations
 * CRITICAL: Includes sppgId check for multi-tenant security
 */
async function getProcurementById(id: string, sppgId: string) {
  try {
    const procurement = await db.procurement.findFirst({
      where: {
        id,
        sppgId, // CRITICAL: Multi-tenant filter
      },
      include: {
        supplier: true,
        plan: true,
        items: {
          include: {
            inventoryItem: true,
          },
        },
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return procurement
  } catch (error) {
    console.error('Error fetching procurement:', error)
    return null
  }
}

/**
 * Get badge variant for procurement status
 */
function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DRAFT: 'secondary',
    PENDING_APPROVAL: 'outline',
    APPROVED: 'default',
    REJECTED: 'destructive',
    ORDERED: 'default',
    PARTIAL_RECEIVED: 'outline',
    RECEIVED: 'default',
    CANCELLED: 'destructive',
    COMPLETED: 'default',
  }
  
  return statusMap[status] || 'secondary'
}

/**
 * Get badge variant for procurement method
 */
function getMethodBadgeVariant(method: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const methodMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DIRECT_PURCHASE: 'default',
    TENDER: 'outline',
    E_PROCUREMENT: 'default',
    FRAMEWORK_AGREEMENT: 'secondary',
    EMERGENCY: 'destructive',
  }
  
  return methodMap[method] || 'secondary'
}

/**
 * Format status label in Indonesian
 */
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Menunggu Persetujuan',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    ORDERED: 'Dipesan',
    PARTIAL_RECEIVED: 'Diterima Sebagian',
    RECEIVED: 'Diterima',
    CANCELLED: 'Dibatalkan',
    COMPLETED: 'Selesai',
  }
  
  return statusLabels[status] || status
}

/**
 * Format method label in Indonesian
 */
function getMethodLabel(method: string): string {
  const methodLabels: Record<string, string> = {
    DIRECT_PURCHASE: 'Pembelian Langsung',
    TENDER: 'Tender',
    E_PROCUREMENT: 'E-Procurement',
    FRAMEWORK_AGREEMENT: 'Perjanjian Kerangka',
    EMERGENCY: 'Darurat',
  }
  
  return methodLabels[method] || method
}

// ================================ METADATA ================================

export async function generateMetadata({ params }: ProcurementDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.sppgId) {
    return {
      title: 'Detail Procurement | Bagizi SPPG',
    }
  }

  const procurement = await getProcurementById(id, session.user.sppgId)

  if (!procurement) {
    return {
      title: 'Procurement Tidak Ditemukan | Bagizi SPPG',
    }
  }

  return {
    title: `${procurement.procurementCode} - Detail Procurement | Bagizi SPPG`,
    description: `Detail procurement order ${procurement.procurementCode} dari supplier ${procurement.supplier?.supplierName || 'Unknown'}`,
  }
}

// ================================ MAIN COMPONENT ================================

export default async function ProcurementDetailPage({ params }: ProcurementDetailPageProps) {
  const { id } = await params
  
  // ================================ AUTHENTICATION ================================
  
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/procurement/' + id)
  }

  // ================================ AUTHORIZATION ================================
  
  const sppgId = session.user.sppgId
  
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  const sppg = await checkSppgAccess(sppgId)
  
  if (!sppg) {
    redirect('/access-denied?reason=invalid-sppg')
  }

  // Check role permissions
  const userRole = session.user.userRole
  const canManage = userRole ? [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN',
    'SPPG_PRODUKSI_MANAGER',
  ].includes(userRole) : false

  // ================================ DATA FETCHING ================================
  
  const procurement = await getProcurementById(id, sppgId)

  if (!procurement) {
    notFound()
  }

  // Calculate totals
  const totalItems = procurement.items.length
  const totalQuantity = procurement.items.reduce((sum: number, item) => sum + item.orderedQuantity, 0)

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
              Kembali ke Daftar
            </Link>
          </Button>
        </div>

        {/* Title and Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                {procurement.procurementCode}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Detail informasi procurement order
            </p>
          </div>

          {/* Action Buttons */}
          {canManage && (
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/procurement/${procurement.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* ================================ BREADCRUMB ================================ */}
      
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/procurement" className="hover:text-foreground transition-colors">
          Procurement
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{procurement.procurementCode}</span>
      </nav>

      {/* ================================ STATUS & METHOD ================================ */}
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={getStatusBadgeVariant(procurement.status)}>
                {getStatusLabel(procurement.status)}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Metode:</span>
              <Badge variant={getMethodBadgeVariant(procurement.purchaseMethod)}>
                {getMethodLabel(procurement.purchaseMethod)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================ MAIN INFORMATION GRID ================================ */}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Umum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Kode Procurement</p>
                <p className="font-medium">{procurement.procurementCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Order</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(procurement.procurementDate), 'dd MMM yyyy', { locale: localeId })}
                </p>
              </div>
            </div>

            {procurement.expectedDelivery && (
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Pengiriman Diharapkan</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(procurement.expectedDelivery), 'dd MMM yyyy', { locale: localeId })}
                </p>
              </div>
            )}

            {procurement.actualDelivery && (
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Pengiriman Aktual</p>
                <p className="font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {format(new Date(procurement.actualDelivery), 'dd MMM yyyy', { locale: localeId })}
                </p>
              </div>
            )}

            {procurement.qualityNotes && (
              <div>
                <p className="text-sm text-muted-foreground">Catatan Kualitas</p>
                <p className="text-sm">{procurement.qualityNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Informasi Keuangan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Nilai Procurement</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(procurement.totalAmount)}
              </p>
            </div>

            {procurement.taxAmount && procurement.taxAmount > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pajak</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(procurement.taxAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diskon</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(procurement.discountAmount || 0)}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Status Pembayaran</p>
              <Badge variant={procurement.paymentStatus === 'PAID' ? 'default' : 'outline'}>
                {procurement.paymentStatus === 'PAID' ? 'Lunas' : 
                 procurement.paymentStatus === 'PARTIAL' ? 'Partial' : 
                 procurement.paymentStatus === 'PENDING' ? 'Pending' : 'Unpaid'}
              </Badge>
            </div>

            {procurement.paymentDue && (
              <div>
                <p className="text-sm text-muted-foreground">Jatuh Tempo Pembayaran</p>
                <p className="font-medium">
                  {format(new Date(procurement.paymentDue), 'dd MMM yyyy', { locale: localeId })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================ SUPPLIER INFORMATION ================================ */}
      
      {procurement.supplier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informasi Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama Supplier</p>
                  <p className="font-semibold text-lg">{procurement.supplier.supplierName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Kode Supplier</p>
                  <p className="font-medium">{procurement.supplier.supplierCode}</p>
                </div>

                {procurement.supplier.businessName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Bisnis</p>
                    <p className="font-medium">{procurement.supplier.businessName}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telepon</p>
                    <p className="font-medium">{procurement.supplier.phone}</p>
                  </div>
                </div>

                {procurement.supplier.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{procurement.supplier.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Alamat</p>
                    <p className="text-sm">{procurement.supplier.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {procurement.supplier.city}, {procurement.supplier.province}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================ ITEMS LIST ================================ */}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Procurement ({totalItems} items, {totalQuantity} total qty)
          </CardTitle>
          <CardDescription>
            Daftar item yang dipesan dalam procurement ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {procurement.items.length > 0 ? (
            <div className="space-y-4">
              {procurement.items.map((item, index) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Item #{index + 1}</p>
                        <p className="font-semibold">{item.itemName}</p>
                        {item.inventoryItem && (
                          <p className="text-sm text-muted-foreground">
                            Kode: {item.inventoryItem.itemCode}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Kuantitas</p>
                        <p className="font-medium">{item.orderedQuantity} {item.unit}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Harga</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(item.pricePerUnit)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(item.totalPrice)}
                        </p>
                      </div>
                    </div>

                    {item.qualityStandard && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Standar Kualitas</p>
                        <p className="text-sm">{item.qualityStandard}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada item procurement
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================ TIMELINE & APPROVAL INFO ================================ */}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline - Using createdAt from Procurement model */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Dibuat</p>
              <p className="font-medium">
                {format(new Date(procurement.createdAt), 'dd MMM yyyy HH:mm', { locale: localeId })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Terakhir Diupdate</p>
              <p className="font-medium">
                {format(new Date(procurement.updatedAt), 'dd MMM yyyy HH:mm', { locale: localeId })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status History Placeholder - Since we don't have approval fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Status Procurement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status Saat Ini</p>
              <Badge variant={getStatusBadgeVariant(procurement.status)} className="mt-1">
                {getStatusLabel(procurement.status)}
              </Badge>
            </div>
            {procurement.rejectionReason && (
              <div>
                <p className="text-sm text-muted-foreground">Alasan Penolakan</p>
                <p className="text-sm">{procurement.rejectionReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================ FOOTER STATS ================================ */}
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Status Workflow:</strong>
                <p className="mt-1">
                  Procurement ini saat ini berstatus <strong>{getStatusLabel(procurement.status)}</strong>.
                  {procurement.status === 'PENDING_APPROVAL' && ' Menunggu persetujuan dari kepala SPPG atau admin.'}
                  {procurement.status === 'APPROVED' && ' Siap untuk proses pemesanan.'}
                  {procurement.status === 'COMPLETED' && ' Procurement telah selesai dan item telah diterima.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
