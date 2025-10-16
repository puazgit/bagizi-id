/**
 * @fileoverview Recipe Step Hooks - TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recipeStepApi } from '../api/recipeStepApi'
import type { CreateRecipeStepInput, UpdateRecipeStepInput } from '../types/recipe.types'

/**
 * Query key factory for recipe steps
 */
export const recipeStepKeys = {
  all: ['recipeSteps'] as const,
  menu: (menuId: string) => ['recipeSteps', 'menu', menuId] as const,
}

/**
 * Hook to fetch all recipe steps for a menu
 */
export function useRecipeSteps(menuId: string) {
  return useQuery({
    queryKey: recipeStepKeys.menu(menuId),
    queryFn: () => recipeStepApi.getAll(menuId),
    select: (data) => data.data || [],
    enabled: !!menuId,
  })
}

/**
 * Hook to add new recipe step
 */
export function useCreateRecipeStep(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecipeStepInput) => recipeStepApi.create(menuId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeStepKeys.menu(menuId) })
      toast.success('Langkah resep berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan langkah resep')
    }
  })
}

/**
 * Hook to update recipe step
 */
export function useUpdateRecipeStep(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ stepId, data }: { stepId: string; data: UpdateRecipeStepInput }) => 
      recipeStepApi.update(menuId, stepId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeStepKeys.menu(menuId) })
      toast.success('Langkah resep berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui langkah resep')
    }
  })
}

/**
 * Hook to delete recipe step
 */
export function useDeleteRecipeStep(menuId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stepId: string) => recipeStepApi.delete(menuId, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeStepKeys.menu(menuId) })
      toast.success('Langkah resep berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus langkah resep')
    }
  })
}
