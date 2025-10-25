/**
 * @fileoverview User Reset Password API Endpoint
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { resetPasswordSchema } from '@/features/admin/user-management/schemas'
import bcrypt from 'bcryptjs'

/**
 * POST /api/admin/users/[id]/reset-password
 * Reset user password
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params
      console.log('🔐 [POST /api/admin/users/:id/reset-password] Request started for ID:', id)

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true
        }
      })

      if (!existingUser) {
        console.error('❌ [POST /api/admin/users/:id/reset-password] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Parse Request Body
      const body = await request.json()

      // Validation
      const validated = resetPasswordSchema.safeParse(body)
      if (!validated.success) {
        console.error('❌ [POST /api/admin/users/:id/reset-password] Validation failed:', validated.error.issues)
        return NextResponse.json({ 
          error: 'Validation failed',
          details: validated.error.issues
        }, { status: 400 })
      }

      const data = validated.data

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 12)

      // Update user password
      await db.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          lastPasswordChange: new Date(),
          // Reset login attempts on password reset
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      })

      console.log('✅ [POST /api/admin/users/:id/reset-password] Password reset:', existingUser.id)

      // Create Audit Log
      await db.userAuditLog.create({
        data: {
          userId: existingUser.id,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: existingUser.id,
          changes: {
            action: 'PASSWORD_RESET',
            resetBy: session.user.email,
            sendEmail: data.sendEmail || false,
            reason: 'Admin password reset'
          },
          metadata: {
            resetBy: session.user.id,
            resetByEmail: session.user.email
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          resourcePath: `/api/admin/users/${id}/reset-password`
        }
      })

      // TODO: Send email notification if sendEmail is true
      // This would integrate with your email service

      return NextResponse.json({ 
        success: true, 
        message: 'Password reset successfully'
      })

    } catch (error) {
      console.error('❌ [POST /api/admin/users/:id/reset-password] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to reset password',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
