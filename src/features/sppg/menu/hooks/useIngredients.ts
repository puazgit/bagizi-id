/**
 * @fileoverview Menu Ingredient Hooks - TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ingredientApi } from '../api/ingredientApi'
import type { CreateIngredientInput, UpdateIngredientInput } from '../types/ingredient.types'

/**
 * Query key factory for ingredients
 */
export const ingredientKeys = {
  all: ['ingredients'] as const,
  menu: (menuId: string) => ['ingredients', 'menu', menuId] as const,
}

/**
 * Hook to fetch all ingredients for a menu
 */
export function useMenuIngredients(menuId: string) {
  return useQuery({
    queryKey: ingredientKeys.menu(menuId),
    queryFn: () => ingredientApi.getAll(menuId),
    select: (data) => data.data || [],
    enabled: !!menuId,
  })
}

/**
 * Hook to add new ingredient
 */
export function useCreateIngredient(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateIngredientInput) => ingredientApi.create(menuId, data),
    onSuccess: () => {
      // Invalidate and refetch ingredients
      queryClient.invalidateQueries({ queryKey: ingredientKeys.menu(menuId) })
      toast.success('Bahan berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan bahan')
    }
  })
}

/**
 * Hook to update ingredient
 */
export function useUpdateIngredient(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ingredientId, data }: { ingredientId: string; data: UpdateIngredientInput }) => 
      ingredientApi.update(menuId, ingredientId, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ingredientKeys.menu(menuId) })
      toast.success('Bahan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui bahan')
    }
  })
}

/**
 * Hook to delete ingredient
 */
export function useDeleteIngredient(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ingredientId: string) => ingredientApi.delete(menuId, ingredientId),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ingredientKeys.menu(menuId) })
      toast.success('Bahan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus bahan')
    }
  })
}
