/**
 * @fileoverview TanStack Query Hook for Menu Duplication
 * @version Next.js 15.5.4 / TanStack Query v5
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { menuApi } from '@/features/sppg/menu/api'

interface DuplicateMenuInput {
  newMenuName: string
  newMenuCode: string
  programId?: string
  copyIngredients?: boolean
  copyRecipeSteps?: boolean
  copyNutritionData?: boolean
  copyCostData?: boolean
}

export function useDuplicateMenu(menuId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (input: DuplicateMenuInput) => {
      const result = await menuApi.duplicateMenu(menuId, input)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal menduplikasi menu')
      }
      
      return result
    },
    onSuccess: (data) => {
      // Invalidate menu list to show new duplicate
      queryClient.invalidateQueries({ queryKey: ['sppg', 'menus'] })

      toast.success('Menu berhasil diduplikasi', {
        description: `Menu baru: ${data.data?.menuName}`,
        action: data.data?.id ? {
          label: 'Lihat Menu',
          onClick: () => router.push(`/menu/${data.data?.id}`)
        } : undefined
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menduplikasi menu', {
        description: error.message
      })
    }
  })
}
