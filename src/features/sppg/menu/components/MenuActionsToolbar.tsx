/**
 * @fileoverview Menu Actions Toolbar - Comprehensive action buttons for menu operations
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @see {@link /docs/copilot-instructions.md} Enterprise UI patterns
 */

'use client'

import { useRouter } from 'next/navigation'
import { 
  Calculator, 
  Leaf, 
  Copy, 
  MoreHorizontal,
  Trash2,
  Edit,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface MenuActionsToolbarProps {
  menuId: string
  menuName?: string
  onCalculateCost?: () => void
  onCalculateNutrition?: () => void
  onDuplicate?: () => void
  onExportPDF?: () => void
  onDelete?: () => void
}

export function MenuActionsToolbar({
  menuId,
  onCalculateCost,
  onCalculateNutrition,
  onDuplicate,
  onExportPDF,
  onDelete,
}: MenuActionsToolbarProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Calculate Cost Mutation
  const calculateCostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sppg/menu/${menuId}/calculate-cost`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal menghitung biaya')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Safe access to response data with defensive checks
      // API returns: grandTotalCost and costPerPortion
      const grandTotalCost = data?.data?.grandTotalCost ?? 0
      const costPerPortion = data?.data?.costPerPortion ?? 0
      
      toast.success('Perhitungan biaya berhasil!', {
        description: `Total: Rp ${grandTotalCost.toLocaleString('id-ID')} | Per Porsi: Rp ${costPerPortion.toLocaleString('id-ID')}`
      })
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['menu', menuId] })
      queryClient.invalidateQueries({ queryKey: ['menu', menuId, 'cost'] })
      onCalculateCost?.()
    },
    onError: (error: Error) => {
      toast.error('Gagal menghitung biaya', {
        description: error.message
      })
    },
  })

  // Calculate Nutrition Mutation
  const calculateNutritionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sppg/menu/${menuId}/calculate-nutrition`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal menghitung nutrisi')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Safe access to response data with defensive checks
      // API returns: { success: true, data: { totalCalories, totalProtein, ... } }
      const totalCalories = data?.data?.totalCalories ?? 0
      const totalProtein = data?.data?.totalProtein ?? 0
      
      toast.success('Perhitungan nutrisi berhasil!', {
        description: `Kalori: ${totalCalories.toFixed(1)} kkal | Protein: ${totalProtein.toFixed(1)}g`
      })
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['menu', menuId] })
      queryClient.invalidateQueries({ queryKey: ['menu', menuId, 'nutrition'] })
      onCalculateNutrition?.()
    },
    onError: (error: Error) => {
      toast.error('Gagal menghitung nutrisi', {
        description: error.message
      })
    },
  })

  const handleCalculateCost = () => {
    calculateCostMutation.mutate()
  }

  const handleCalculateNutrition = () => {
    calculateNutritionMutation.mutate()
  }

  const handleExportPDF = () => {
    toast.info('Export PDF', {
      description: 'Fitur sedang dalam pengembangan'
    })
    onExportPDF?.()
  }

  const handleDuplicate = () => {
    onDuplicate?.()
  }

  const handleDelete = () => {
    onDelete?.()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Primary Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCalculateCost}
        disabled={calculateCostMutation.isPending}
      >
        <Calculator className="mr-2 h-4 w-4" />
        {calculateCostMutation.isPending ? 'Menghitung...' : 'Hitung Biaya'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCalculateNutrition}
        disabled={calculateNutritionMutation.isPending}
      >
        <Leaf className="mr-2 h-4 w-4" />
        {calculateNutritionMutation.isPending ? 'Menghitung...' : 'Hitung Nutrisi'}
      </Button>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Aksi Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => router.push(`/menu/${menuId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Menu
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplikasi Menu
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Menu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
