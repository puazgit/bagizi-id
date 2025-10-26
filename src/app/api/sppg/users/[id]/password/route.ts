/**
 * @fileoverview SPPG User Password Change API - Self-service
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * API Endpoint:
 * - PUT /api/sppg/users/[id]/password - Self-service password change
 * 
 * @rbac Protected by withSppgAuth
 * - Users can only change their own password (requires current password)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from '@/features/sppg/user/schemas'

/**
 * PUT /api/sppg/users/[id]/password
 * Self-service password change (requires current password)
 * 
 * Request Body:
 * - currentPassword: Current password (required for verification)
 * - newPassword: New password (required, min 8 chars)
 * - confirmPassword: New password confirmation (required, must match)
 * 
 * @rbac User can only change their own password
 * @audit Logged in audit trail
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: userId } = await params

      // Users can only change their own password
      if (userId !== session.user.id) {
        return NextResponse.json({
          success: false,
          error: 'You can only change your own password'
        }, { status: 403 })
      }

      // Parse request body
      const body: UpdatePasswordInput = await request.json()

      // Validate input
      const validated = updatePasswordSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      // Fetch user with password
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password: true,
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

      // Verify current password
      if (!user.password) {
        return NextResponse.json({
          success: false,
          error: 'User has no password set'
        }, { status: 400 })
      }

      const isValidPassword = await bcryptjs.compare(
        validated.data.currentPassword,
        user.password
      )

      if (!isValidPassword) {
        return NextResponse.json({
          success: false,
          error: 'Current password is incorrect'
        }, { status: 401 })
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(validated.data.newPassword, 12)

      // Update password
      await db.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          lastPasswordChange: new Date(),
        }
      })

      // Create audit log
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CHANGE_PASSWORD',
          entityType: 'User',
          entityId: userId,
          description: 'User changed their password',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      })
    } catch (error) {
      console.error('PUT /api/sppg/users/[id]/password error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update password',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
