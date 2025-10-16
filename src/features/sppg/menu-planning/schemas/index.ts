/**
 * @fileoverview Menu Planning Zod Validation Schemas
 * @version Next.js 15.5.4 / Zod Schema Validation
 * @see {@link /docs/copilot-instructions.md} Enterprise validation patterns
 */

import { z } from 'zod'
import { MealType, MenuPlanStatus } from '@prisma/client'

/**
 * Menu Plan Creation Schema
 */
export const createMenuPlanSchema = z.object({
  programId: z.string().cuid('Invalid program ID'),
  name: z.string()
    .min(3, 'Plan name must be at least 3 characters')
    .max(100, 'Plan name must not exceed 100 characters'),
  startDate: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  endDate: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  description: z.string().optional(),
  planningRules: z.record(z.string(), z.unknown()).optional()
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate']
})

/**
 * Menu Plan Update Schema (partial)
 */
export const updateMenuPlanSchema = createMenuPlanSchema.partial().omit({
  programId: true // Cannot change program after creation
})

/**
 * Menu Assignment Creation Schema
 */
export const createAssignmentSchema = z.object({
  planId: z.string().cuid('Invalid plan ID'),
  menuId: z.string().cuid('Invalid menu ID'),
  date: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  mealType: z.nativeEnum(MealType),
  plannedPortions: z.number()
    .int('Must be a whole number')
    .min(1, 'Must have at least 1 portion')
    .max(100000, 'Cannot exceed 100,000 portions')
    .optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
})

/**
 * Menu Assignment Update Schema (partial)
 */
export const updateAssignmentSchema = createAssignmentSchema.partial().omit({
  planId: true // Cannot change plan after creation
})

/**
 * Menu Plan Submit for Review Schema
 */
export const submitForReviewSchema = z.object({
  submitNotes: z.string()
    .max(500, 'Submit notes must not exceed 500 characters')
    .optional()
})

/**
 * Menu Plan Approval Schema
 */
export const approveActionSchema = z.object({
  approvalNotes: z.string()
    .max(500, 'Approval notes must not exceed 500 characters')
    .optional()
})

/**
 * Menu Plan Rejection Schema
 */
export const rejectActionSchema = z.object({
  rejectionReason: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must not exceed 500 characters')
})

/**
 * Menu Plan Publish Schema
 */
export const publishActionSchema = z.object({
  publishNotes: z.string()
    .max(500, 'Publish notes must not exceed 500 characters')
    .optional()
})

/**
 * Query Filter Schemas
 */
export const menuPlanFiltersSchema = z.object({
  status: z.nativeEnum(MenuPlanStatus).optional(),
  programId: z.string().cuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional()
})

export const assignmentFiltersSchema = z.object({
  planId: z.string().cuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mealType: z.nativeEnum(MealType).optional()
})

/**
 * Type exports for TypeScript
 */
export type CreateMenuPlanInput = z.infer<typeof createMenuPlanSchema>
export type UpdateMenuPlanInput = z.infer<typeof updateMenuPlanSchema>
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
export type SubmitForReviewInput = z.infer<typeof submitForReviewSchema>
export type ApproveActionInput = z.infer<typeof approveActionSchema>
export type RejectActionInput = z.infer<typeof rejectActionSchema>
export type PublishActionInput = z.infer<typeof publishActionSchema>
export type MenuPlanFilters = z.infer<typeof menuPlanFiltersSchema>
export type AssignmentFilters = z.infer<typeof assignmentFiltersSchema>
