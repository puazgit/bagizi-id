/**
 * @fileoverview Program Detail Page - View program details dengan tabs
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgramCard } from '@/features/sppg/program/components'
import { useProgram, useDeleteProgram } from '@/features/sppg/program/hooks'
import { toast } from 'sonner'

interface ProgramDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { data: program, isLoading } = useProgram(id)
  const { mutate: deleteProgram, isPending: isDeleting } = useDeleteProgram()

  const handleEdit = () => {
    router.push(`/program/${id}/edit`)
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      deleteProgram(id, {
        onSuccess: () => {
          toast.success('Program berhasil dihapus')
          router.push('/program')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Gagal menghapus program')
        }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground">Program tidak ditemukan</p>
        <Button onClick={() => router.push('/program')}>
          Kembali ke Daftar Program
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/program')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
            <p className="text-muted-foreground mt-1">
              Kode: {program.programCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Program Overview Card */}
      <ProgramCard program={program} variant="default" />

      {/* Tabs for additional information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="menus">Menu</TabsTrigger>
          <TabsTrigger value="recipients">Penerima Manfaat</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Deskripsi Program</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {program.description || 'Tidak ada deskripsi'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Target Gizi Harian</h3>
              <div className="space-y-2">
                {program.calorieTarget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kalori:</span>
                    <span className="font-medium">{program.calorieTarget} kkal</span>
                  </div>
                )}
                {program.proteinTarget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protein:</span>
                    <span className="font-medium">{program.proteinTarget} g</span>
                  </div>
                )}
                {program.carbTarget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Karbohidrat:</span>
                    <span className="font-medium">{program.carbTarget} g</span>
                  </div>
                )}
                {program.fatTarget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lemak:</span>
                    <span className="font-medium">{program.fatTarget} g</span>
                  </div>
                )}
                {program.fiberTarget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serat:</span>
                    <span className="font-medium">{program.fiberTarget} g</span>
                  </div>
                )}
                {!program.calorieTarget && !program.proteinTarget && (
                  <p className="text-sm text-muted-foreground">
                    Target gizi belum ditetapkan
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Lokasi Implementasi</h3>
              <p className="text-muted-foreground">{program.implementationArea}</p>
              
              {program.partnerSchools.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Sekolah Mitra ({program.partnerSchools.length})</h4>
                  <ul className="space-y-1">
                    {program.partnerSchools.slice(0, 5).map((school, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {school}
                      </li>
                    ))}
                    {program.partnerSchools.length > 5 && (
                      <li className="text-sm text-muted-foreground font-medium">
                        + {program.partnerSchools.length - 5} sekolah lainnya
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="menus" className="mt-4">
          <div className="p-6 border rounded-lg text-center text-muted-foreground">
            <p>Daftar menu untuk program ini akan ditampilkan di sini</p>
            <p className="text-sm mt-2">(Integrasi dengan menu management akan datang)</p>
          </div>
        </TabsContent>

        <TabsContent value="recipients" className="mt-4">
          <div className="p-6 border rounded-lg text-center text-muted-foreground">
            <p>Daftar penerima manfaat akan ditampilkan di sini</p>
            <p className="text-sm mt-2">(Integrasi dengan beneficiary management akan datang)</p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="p-6 border rounded-lg text-center text-muted-foreground">
            <p>Laporan dan statistik program akan ditampilkan di sini</p>
            <p className="text-sm mt-2">(Integrasi dengan reporting akan datang)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
