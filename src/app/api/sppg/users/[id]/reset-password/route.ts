/**
 * @fileoverview SPPG User Password Reset API - Admin action
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * API Endpoint:
 * - POST /api/sppg/users/[id]/reset-password - Admin password reset
 * 
 * @rbac Protected by withSppgAuth
 * - Only SPPG_KEPALA, SPPG_ADMIN, SPPG_HRD_MANAGER can reset passwords
 * - Does not require current password (admin privilege)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/features/sppg/user/schemas'

/**
 * POST /api/sppg/users/[id]/reset-password
 * Admin password reset (does not require current password)
 * 
 * Request Body:
 * - newPassword: New password (required, min 8 chars)
 * - confirmPassword: New password confirmation (required, must match)
 * 
 * @rbac Only SPPG_KEPALA, SPPG_ADMIN, SPPG_HRD_MANAGER
 * @audit Logged in audit trail with admin details
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: userId } = await params

      // Permission check
      if (!hasPermission(session.user.userRole, 'user:update')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions to reset passwords'
        }, { status: 403 })
      }

      // Parse request body
      const body: ResetPasswordInput = await request.json()

      // Validate input
      const validated = resetPasswordSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      // Fetch user
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          sppgId: true,
          email: true,
          name: true,
        }
      })

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 })
      }

      // Multi-tenant safety: User must belong to same SPPG
      if (!session.user.sppgId || user.sppgId !== session.user.sppgId) {
        return NextResponse.json({
          success: false,
          error: 'Access denied'
        }, { status: 403 })
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(validated.data.newPassword, 12)

      // Update password
      await db.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          lastPasswordChange: new Date(),
          failedLoginAttempts: 0, // Reset failed attempts
          lockedUntil: null, // Unlock account if locked
        }
      })

      // Create audit log
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'RESET_PASSWORD',
          entityType: 'User',
          entityId: userId,
          description: `Password reset by admin ${session.user.name}`,
          metadata: {
            targetUser: {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully'
      })
    } catch (error) {
      console.error('POST /api/sppg/users/[id]/reset-password error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to reset password',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
