/**
 * @fileoverview User Verify Email API Endpoint
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * POST /api/admin/users/[id]/verify-email
 * Manually verify user email
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params
      console.log('✉️ [POST /api/admin/users/:id/verify-email] Request started for ID:', id)

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          emailVerified: true
        }
      })

      if (!existingUser) {
        console.error('❌ [POST /api/admin/users/:id/verify-email] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Check if already verified
      if (existingUser.emailVerified) {
        console.log('⚠️ [POST /api/admin/users/:id/verify-email] Email already verified')
        return NextResponse.json({ 
          success: true,
          message: 'Email already verified',
          data: { emailVerified: existingUser.emailVerified }
        })
      }

      // Verify email
      const user = await db.user.update({
        where: { id },
        data: {
          emailVerified: new Date()
        },
        select: {
          id: true,
          email: true,
          emailVerified: true
        }
      })

      console.log('✅ [POST /api/admin/users/:id/verify-email] Email verified:', user.id)

      // Create Audit Log
      await db.userAuditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: user.id,
          changes: {
            action: 'EMAIL_VERIFIED',
            verifiedBy: session.user.email,
            verifiedAt: user.emailVerified,
            reason: 'Manual verification by admin'
          },
          metadata: {
            verifiedBy: session.user.id,
            verifiedByEmail: session.user.email
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          resourcePath: `/api/admin/users/${id}/verify-email`
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Email verified successfully',
        data: { emailVerified: user.emailVerified }
      })

    } catch (error) {
      console.error('❌ [POST /api/admin/users/:id/verify-email] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to verify email',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
