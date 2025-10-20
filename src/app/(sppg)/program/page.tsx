/**
 * @fileoverview Program List Page - SPPG Program Management
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProgramList, ProgramDialog } from '@/features/sppg/program/components'
import { usePrograms, useCreateProgram, useDeleteProgram } from '@/features/sppg/program/hooks'
import { toast } from 'sonner'
import type { CreateProgramInput } from '@/features/sppg/program/schemas'
import { formatNumber, formatCurrency } from '@/features/sppg/program/lib'

export default function ProgramPage() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // React Query hooks
  const { data: programs = [], isLoading } = usePrograms()
  const { mutateAsync: createProgram, isPending: isCreating } = useCreateProgram()
  const { mutate: deleteProgram } = useDeleteProgram()

  // Calculate statistics
  const stats = {
    totalPrograms: programs.length,
    activePrograms: programs.filter(p => p.status === 'ACTIVE').length,
    totalRecipients: programs.reduce((sum, p) => sum + p.currentRecipients, 0),
    totalBudget: programs.reduce((sum, p) => sum + (p.totalBudget || 0), 0),
  }

  // Handlers
  const handleCreate = async (data: CreateProgramInput) => {
    try {
      // Transform data to handle nullable fields - convert null to undefined
      const programData = {
        ...data,
        description: data.description ?? undefined,
        calorieTarget: data.calorieTarget ?? undefined,
        proteinTarget: data.proteinTarget ?? undefined,
        carbTarget: data.carbTarget ?? undefined,
        fatTarget: data.fatTarget ?? undefined,
        fiberTarget: data.fiberTarget ?? undefined,
        endDate: data.endDate ?? undefined,
        totalBudget: data.totalBudget ?? undefined,
        budgetPerMeal: data.budgetPerMeal ?? undefined,
      }
      await createProgram(programData)
      toast.success('Program berhasil dibuat')
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat program')
    }
  }

  const handleView = (id: string) => {
    router.push(`/program/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/program/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      deleteProgram(id, {
        onSuccess: () => {
          toast.success('Program berhasil dihapus')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Gagal menghapus program')
        }
      })
    }
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Program Gizi</h1>
            <p className="text-sm text-muted-foreground mt-1 md:mt-2">
              Kelola program pemenuhan gizi untuk berbagai kelompok sasaran
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(true)} size="default" className="md:size-lg">
              <Plus className="mr-2 h-4 w-4" />
              Buat Program
            </Button>
          </div>
        </div>

        {/* Statistics Cards - EXACT COPY FROM MENU PAGE */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Program
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatNumber(stats.totalPrograms)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activePrograms} program aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Program Aktif
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatNumber(stats.activePrograms)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.activePrograms / stats.totalPrograms) * 100 || 0).toFixed(0)}% dari total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Penerima
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatNumber(stats.totalRecipients)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Penerima manfaat aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Anggaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Anggaran keseluruhan
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Program List - EXACT COPY FROM MENU PAGE STRUCTURE */}
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg">Daftar Program</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Kelola dan pantau semua program gizi yang sedang berjalan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <ProgramList
              data={programs}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <ProgramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="create"
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />
    </div>
  )
}
