/**
 * @fileoverview User Unlock Account API Endpoint
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * POST /api/admin/users/[id]/unlock
 * Unlock user account
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params
      console.log('🔓 [POST /api/admin/users/:id/unlock] Request started for ID:', id)

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          lockedUntil: true,
          failedLoginAttempts: true
        }
      })

      if (!existingUser) {
        console.error('❌ [POST /api/admin/users/:id/unlock] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Check if account is locked
      const now = new Date()
      const isLocked = existingUser.lockedUntil && existingUser.lockedUntil > now

      if (!isLocked) {
        console.log('⚠️ [POST /api/admin/users/:id/unlock] Account not locked')
        return NextResponse.json({ 
          success: true,
          message: 'Account is not locked'
        })
      }

      // Unlock account
      const user = await db.user.update({
        where: { id },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0
        },
        select: {
          id: true,
          email: true,
          lockedUntil: true
        }
      })

      console.log('✅ [POST /api/admin/users/:id/unlock] Account unlocked:', user.id)

      // Create Audit Log
      await db.userAuditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: user.id,
          oldValues: {
            lockedUntil: existingUser.lockedUntil,
            failedLoginAttempts: existingUser.failedLoginAttempts
          },
          newValues: {
            lockedUntil: null,
            failedLoginAttempts: 0
          },
          changes: {
            action: 'ACCOUNT_UNLOCKED',
            unlockedBy: session.user.email,
            reason: 'Manual unlock by admin'
          },
          metadata: {
            unlockedBy: session.user.id,
            unlockedByEmail: session.user.email
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          resourcePath: `/api/admin/users/${id}/unlock`
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Account unlocked successfully'
      })

    } catch (error) {
      console.error('❌ [POST /api/admin/users/:id/unlock] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to unlock account',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
