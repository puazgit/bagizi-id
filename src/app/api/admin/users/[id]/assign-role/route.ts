/**
 * @fileoverview User Assign Role API Endpoint
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { assignRoleSchema } from '@/features/admin/user-management/schemas'

/**
 * POST /api/admin/users/[id]/assign-role
 * Assign role to user
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params
      console.log('👤 [POST /api/admin/users/:id/assign-role] Request started for ID:', id)

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          userRole: true,
          userType: true
        }
      })

      if (!existingUser) {
        console.error('❌ [POST /api/admin/users/:id/assign-role] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Parse Request Body
      const body = await request.json()

      // Validation
      const validated = assignRoleSchema.safeParse(body)
      if (!validated.success) {
        console.error('❌ [POST /api/admin/users/:id/assign-role] Validation failed:', validated.error.issues)
        return NextResponse.json({ 
          error: 'Validation failed',
          details: validated.error.issues
        }, { status: 400 })
      }

      const data = validated.data

      // Update user role
      const user = await db.user.update({
        where: { id },
        data: {
          userRole: data.userRole,
          userType: data.userType
        },
        select: {
          id: true,
          email: true,
          name: true,
          userRole: true,
          userType: true,
          sppgId: true
        }
      })

      console.log('✅ [POST /api/admin/users/:id/assign-role] Role assigned:', user.id)

      // Create Audit Log
      await db.userAuditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: user.id,
          oldValues: {
            userRole: existingUser.userRole,
            userType: existingUser.userType
          },
          newValues: {
            userRole: data.userRole,
            userType: data.userType
          },
          changes: {
            reason: data.reason || 'No reason provided',
            assignedBy: session.user.email
          },
          metadata: {
            assignedBy: session.user.id,
            assignedByEmail: session.user.email
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          resourcePath: `/api/admin/users/${id}/assign-role`
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: user,
        message: 'Role assigned successfully'
      })

    } catch (error) {
      console.error('❌ [POST /api/admin/users/:id/assign-role] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to assign role',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
