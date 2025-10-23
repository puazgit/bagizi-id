/**
 * @fileoverview School Detail Component - Comprehensive View
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  School, 
  User, 
  MapPin, 
  Users, 
  Utensils, 
  Truck, 
  Wrench, 
  TrendingUp,
  Edit,
  Trash2,
  RotateCcw,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react'

import { useSchool, useDeleteSchool, useReactivateSchool } from '../hooks'
import type { SchoolMaster } from '../types'
import { SCHOOL_TYPES, SCHOOL_STATUSES, SERVING_METHODS } from '../types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Convert day number/string to Indonesian day name
 */
const getDayName = (day: string | number): string => {
  const dayMap: Record<string, string> = {
    '1': 'Senin',
    '2': 'Selasa',
    '3': 'Rabu',
    '4': 'Kamis',
    '5': 'Jumat',
    '6': 'Sabtu',
    '7': 'Minggu',
    'MONDAY': 'Senin',
    'TUESDAY': 'Selasa',
    'WEDNESDAY': 'Rabu',
    'THURSDAY': 'Kamis',
    'FRIDAY': 'Jumat',
    'SATURDAY': 'Sabtu',
    'SUNDAY': 'Minggu',
  }
  
  const dayStr = String(day).toUpperCase()
  return dayMap[dayStr] || String(day)
}
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Props for SchoolDetail component
 */
interface SchoolDetailProps {
  schoolId: string
  onEdit?: (school: SchoolMaster) => void
  onDelete?: () => void
}

/**
 * SchoolDetail Component
 * 
 * Comprehensive detail view of a school with tabbed interface.
 * Features:
 * - 6 organized tabs (Overview, Contact, Students, Feeding, Facilities, History)
 * - Quick action buttons (Edit, Delete, Reactivate, Export, Print)
 * - Loading skeleton states
 * - Error handling
 * - Confirmation dialogs
 * - Print-friendly CSS
 * - Dark mode support
 * 
 * @example
 * ```tsx
 * <SchoolDetail 
 *   schoolId="school_123" 
 *   onEdit={(school) => router.push(`/schools/${school.id}/edit`)}
 * />
 * ```
 */
export function SchoolDetail({ schoolId, onEdit, onDelete }: SchoolDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch school data
  const { data: school, isLoading, error } = useSchool(schoolId)
  
  // Mutations
  const { mutate: deleteSchool, isPending: isDeleting } = useDeleteSchool()
  const { mutate: reactivateSchool, isPending: isReactivating } = useReactivateSchool()

  /**
   * Handle delete school
   */
  const handleDelete = () => {
    deleteSchool(
      { id: schoolId, permanent: false },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          if (onDelete) {
            onDelete()
          } else {
            router.push('/schools')
          }
        },
      }
    )
  }

  /**
   * Handle reactivate school
   */
  const handleReactivate = () => {
    reactivateSchool(schoolId)
  }

  /**
   * Handle print
   */
  const handlePrint = () => {
    window.print()
  }

  /**
   * Handle export (placeholder)
   */
  const handleExport = () => {
    // TODO: Implement export to PDF functionality
    console.log('Export to PDF:', schoolId)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !school) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Error Memuat Data Sekolah
          </CardTitle>
          <CardDescription>
            {error ? error.message : 'Sekolah tidak ditemukan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/schools')}>
            Kembali ke Daftar Sekolah
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Get type and status labels
  const schoolTypeLabel = SCHOOL_TYPES.find(t => t.value === school.schoolType)?.label || school.schoolType
  const schoolStatusLabel = SCHOOL_STATUSES.find(s => s.value === school.schoolStatus)?.label || school.schoolStatus
  const servingMethodLabel = school.servingMethod 
    ? SERVING_METHODS.find(m => m.value === school.servingMethod)?.label || school.servingMethod
    : 'Belum diatur'

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {/* Back Button */}
        <div className="print:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/schools')}
            className="gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Kembali ke Daftar Sekolah
          </Button>
        </div>

        {/* Header Card with Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <School className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl">{school.schoolName}</CardTitle>
                  <Badge variant={school.isActive ? 'default' : 'secondary'}>
                    {school.isActive ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Aktif</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Tidak Aktif</>
                    )}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <School className="h-4 w-4" />
                    {schoolTypeLabel}
                  </span>
                  {school.schoolCode && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Kode: {school.schoolCode}</span>
                    </>
                  )}
                  {school.npsn && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span>NPSN: {school.npsn}</span>
                    </>
                  )}
                </CardDescription>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 print:hidden">
                {school.isActive ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onEdit) {
                          onEdit(school)
                        } else {
                          router.push(`/schools/${school.id}/edit`)
                        }
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Ubah
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReactivate}
                    disabled={isReactivating}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isReactivating ? 'Mengaktifkan...' : 'Aktifkan Kembali'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ekspor
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="contact">Kontak</TabsTrigger>
            <TabsTrigger value="students">Siswa</TabsTrigger>
            <TabsTrigger value="feeding">Pemberian Makan</TabsTrigger>
            <TabsTrigger value="facilities">Fasilitas</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Siswa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school.totalStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Target Siswa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school.targetStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tingkat Kehadiran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {school.attendanceRate?.toFixed(1) || 'N/A'}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Skor Kepuasan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {school.satisfactionScore?.toFixed(1) || 'N/A'}/5.0
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Jenis Sekolah</div>
                    <div className="text-sm">{schoolTypeLabel}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="text-sm">{schoolStatusLabel}</div>
                  </div>
                  {school.accreditationGrade && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Akreditasi</div>
                      <div className="text-sm">{school.accreditationGrade} {school.accreditationYear && `(${school.accreditationYear})`}</div>
                    </div>
                  )}
                  {school.urbanRural && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Tipe Lokasi</div>
                      <div className="text-sm">{school.urbanRural === 'URBAN' ? 'Perkotaan' : 'Pedesaan'}</div>
                    </div>
                  )}
                  {school.enrollmentDate && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Tanggal Bergabung</div>
                      <div className="text-sm">{new Date(school.enrollmentDate).toLocaleDateString('id-ID')}</div>
                    </div>
                  )}
                  {school.program && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Program</div>
                      <div className="text-sm">{school.program.name}</div>
                    </div>
                  )}
                </div>


              </CardContent>
            </Card>

            {/* Location Quick View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Alamat</div>
                  <p className="text-sm">{school.schoolAddress}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {school.province && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Provinsi</div>
                      <div className="text-sm">{school.province.name}</div>
                    </div>
                  )}
                  {school.regency && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</div>
                      <div className="text-sm">{school.regency.name}</div>
                    </div>
                  )}
                  {school.district && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Kecamatan</div>
                      <div className="text-sm">{school.district.name}</div>
                    </div>
                  )}
                  {school.village && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Kelurahan/Desa</div>
                      <div className="text-sm">{school.village.name}</div>
                    </div>
                  )}
                  {school.postalCode && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Kode Pos</div>
                      <div className="text-sm">{school.postalCode}</div>
                    </div>
                  )}
                  {school.coordinates && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Koordinat</div>
                      <div className="text-xs font-mono">{school.coordinates}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Contact & Location */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Nama Kepala Sekolah</div>
                  <div className="text-sm">{school.principalName}</div>
                </div>

                {school.principalNip && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">NIP Kepala Sekolah</div>
                    <div className="text-sm">{school.principalNip}</div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Telepon</div>
                    <div className="text-sm text-muted-foreground">{school.contactPhone}</div>
                  </div>
                </div>

                {school.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{school.contactEmail}</div>
                    </div>
                  </div>
                )}

                {school.alternatePhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Telepon Alternatif</div>
                      <div className="text-sm text-muted-foreground">{school.alternatePhone}</div>
                    </div>
                  </div>
                )}

                {school.whatsappNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">WhatsApp</div>
                      <div className="text-sm text-muted-foreground">{school.whatsappNumber}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Detail Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Alamat</div>
                  <div className="text-sm">{school.schoolAddress}</div>
                </div>

                {school.postalCode && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Kode Pos</div>
                    <div className="text-sm">{school.postalCode}</div>
                  </div>
                )}

                {school.coordinates && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Koordinat</div>
                    <div className="text-sm text-muted-foreground">{school.coordinates}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Siswa & Demografi */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statistik Siswa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Siswa</div>
                    <div className="text-2xl font-bold">{school.totalStudents}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Target Siswa</div>
                    <div className="text-2xl font-bold">{school.targetStudents}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Siswa Aktif</div>
                    <div className="text-2xl font-bold">{school.activeStudents || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Tingkat Kehadiran</div>
                    <div className="text-2xl font-bold">{school.attendanceRate?.toFixed(1) || 'N/A'}%</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium">Distribusi Kelompok Usia</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">4-6 tahun (PAUD)</div>
                      <div className="text-sm font-medium">{school.students4to6Years} siswa</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">7-12 tahun (SD)</div>
                      <div className="text-sm font-medium">{school.students7to12Years} siswa</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">13-15 tahun (SMP)</div>
                      <div className="text-sm font-medium">{school.students13to15Years} siswa</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">16-18 tahun (SMA/SMK)</div>
                      <div className="text-sm font-medium">{school.students16to18Years} siswa</div>
                    </div>
                  </div>
                </div>

                {(school.maleStudents !== null || school.femaleStudents !== null) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Distribusi Gender</div>
                      <div className="grid grid-cols-2 gap-4">
                        {school.maleStudents !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground">Laki-laki</div>
                            <div className="text-sm font-medium">{school.maleStudents} siswa</div>
                          </div>
                        )}
                        {school.femaleStudents !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground">Perempuan</div>
                            <div className="text-sm font-medium">{school.femaleStudents} siswa</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Feeding & Distribution */}
          <TabsContent value="feeding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Jadwal Pemberian Makan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hari Pemberian Makan</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {school.feedingDays && school.feedingDays.length > 0 ? (
                      school.feedingDays.map((day) => (
                        <Badge key={day} variant="outline">{getDayName(day)}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Belum diatur</span>
                    )}
                  </div>
                </div>

                {school.mealsPerDay && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Jumlah Makan per Hari</div>
                    <div className="text-sm">{school.mealsPerDay}</div>
                  </div>
                )}

                {school.servingMethod && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Metode Penyajian</div>
                    <div className="text-sm">{servingMethodLabel}</div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  {school.feedingTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Waktu Pemberian Makan</div>
                      <div className="text-sm">{school.feedingTime}</div>
                    </div>
                  )}
                  {school.breakfastTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Waktu Sarapan</div>
                      <div className="text-sm">{school.breakfastTime}</div>
                    </div>
                  )}
                  {school.lunchTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Waktu Makan Siang</div>
                      <div className="text-sm">{school.lunchTime}</div>
                    </div>
                  )}
                  {school.snackTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Waktu Snack</div>
                      <div className="text-sm">{school.snackTime}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informasi Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Alamat Pengiriman</div>
                  <div className="text-sm">{school.deliveryAddress}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Kontak Pengiriman</div>
                  <div className="text-sm">{school.deliveryContact}</div>
                </div>

                {school.deliveryPhone && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Telepon Pengiriman</div>
                    <div className="text-sm">{school.deliveryPhone}</div>
                  </div>
                )}

                {school.deliveryInstructions && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Instruksi Pengiriman</div>
                    <div className="text-sm text-muted-foreground">{school.deliveryInstructions}</div>
                  </div>
                )}

                {school.preferredDeliveryTime && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Waktu Pengiriman Preferensi</div>
                    <div className="text-sm">{school.preferredDeliveryTime}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Facilities & Performance */}
          <TabsContent value="facilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Fasilitas Sekolah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    {school.hasKitchen ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Dapur</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasStorage ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Gudang</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasCleanWater ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Air Bersih</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasElectricity ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Listrik</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasRefrigerator ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Kulkas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasDiningArea ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Area Makan</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasHandwashing ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Tempat Cuci Tangan</span>
                  </div>
                </div>

                {(school.storageCapacity || school.diningCapacity) && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4">
                      {school.storageCapacity && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Kapasitas Gudang</div>
                          <div className="text-sm">{school.storageCapacity}</div>
                        </div>
                      )}
                      {school.diningCapacity && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Kapasitas Area Makan</div>
                          <div className="text-sm">{school.diningCapacity} siswa</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Metrik Kinerja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Tingkat Kehadiran</div>
                    <div className="text-2xl font-bold">
                      {school.attendanceRate ? `${school.attendanceRate.toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Skor Kepuasan</div>
                    <div className="text-2xl font-bold">
                      {school.satisfactionScore ? `${school.satisfactionScore.toFixed(1)}/5.0` : 'N/A'}
                    </div>
                  </div>
                </div>

                {(school.contractStartDate || school.contractEndDate) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {school.contractStartDate && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Mulai Kontrak</div>
                          <div className="text-sm">
                            {new Date(school.contractStartDate).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      )}
                      {school.contractEndDate && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Akhir Kontrak</div>
                          <div className="text-sm">
                            {new Date(school.contractEndDate).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {(school.notes || school.specialInstructions) && (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan & Instruksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {school.notes && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Catatan</div>
                      <div className="text-sm text-muted-foreground mt-1">{school.notes}</div>
                    </div>
                  )}
                  {school.specialInstructions && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Instruksi Khusus</div>
                      <div className="text-sm text-muted-foreground mt-1">{school.specialInstructions}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 6: History & Audit */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Riwayat Rekaman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Dibuat Pada</div>
                    <div className="text-sm">
                      {new Date(school.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Terakhir Diperbarui</div>
                    <div className="text-sm">
                      {new Date(school.updatedAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Removed deletedAt field - not in SchoolMaster type */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ID Rekaman</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm text-muted-foreground">{school.id}</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Ini akan menghapus <strong>{school.schoolName}</strong>. Sekolah akan ditandai sebagai dihapus tetapi dapat diaktifkan kembali nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Sekolah'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
