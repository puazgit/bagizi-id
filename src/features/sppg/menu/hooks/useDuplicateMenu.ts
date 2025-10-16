/**
 * @fileoverview TanStack Query Hook for Menu Duplication
 * @version Next.js 15.5.4 / TanStack Query v5
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DuplicateMenuInput {
  newMenuName: string
  newMenuCode: string
  programId?: string
  copyIngredients?: boolean
  copyRecipeSteps?: boolean
  copyNutritionData?: boolean
  copyCostData?: boolean
}

interface DuplicateMenuResponse {
  success: boolean
  message?: string
  data?: {
    id: string
    menuName: string
    menuCode: string
  }
  error?: string
}

export function useDuplicateMenu(menuId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (input: DuplicateMenuInput): Promise<DuplicateMenuResponse> => {
      const response = await fetch(`/api/sppg/menu/${menuId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal menduplikasi menu')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate menu list to show new duplicate
      queryClient.invalidateQueries({ queryKey: ['sppg', 'menus'] })

      toast.success(data.message || 'Menu berhasil diduplikasi', {
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
