/**
 * @fileoverview Program List Page - SPPG Program Management
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileBarChart, Users, Target } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Gizi</h1>
          <p className="text-muted-foreground mt-1">
            Kelola program pemenuhan gizi untuk berbagai kelompok sasaran
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Buat Program
        </Button>
      </div>

      <Separator />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Program</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalPrograms)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activePrograms} program aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Program Aktif</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.activePrograms)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.activePrograms / stats.totalPrograms) * 100 || 0).toFixed(0)}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penerima</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalRecipients)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Penerima manfaat aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Anggaran keseluruhan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Program List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Program</CardTitle>
          <CardDescription>
            Kelola dan pantau semua program gizi yang sedang berjalan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramList
            data={programs}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
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
