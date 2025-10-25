/**
 * @fileoverview User Management API Endpoints - Detail, Update, Delete
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateUserSchema } from '@/features/admin/user-management/schemas'

/**
 * GET /api/admin/users/[id]
 * Get user detail by ID
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      console.log('🔍 [GET /api/admin/users/:id] Request started for ID:', id)
      
      // Fetch User
      const user = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          userRole: true,
          userType: true,
          isActive: true,
          emailVerified: true,
          sppgId: true,
          sppg: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          phone: true,
          timezone: true,
          lastLogin: true,
          lastIpAddress: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          lastPasswordChange: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              userSessions: true,
              auditLogs: true
            }
          }
        }
      })

      if (!user) {
        console.error('❌ [GET /api/admin/users/:id] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      console.log('✅ [GET /api/admin/users/:id] User found:', user.id)

      // Transform Data
      const transformedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.profileImage,
        userRole: user.userRole,
        userType: user.userType,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        sppgId: user.sppgId,
        sppg: user.sppg ? {
          id: user.sppg.id,
          name: user.sppg.name,
          code: user.sppg.code
        } : null,
        phone: user.phone,
        timezone: user.timezone,
        lastLoginAt: user.lastLogin,
        lastLoginIp: user.lastIpAddress,
        loginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        passwordChangedAt: user.lastPasswordChange,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        _count: {
          sessions: user._count.userSessions,
          auditLogs: user._count.auditLogs
        }
      }

      return NextResponse.json({ 
        success: true, 
        data: transformedUser 
      })

    } catch (error) {
      console.error('❌ [GET /api/admin/users/:id] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

/**
 * PUT /api/admin/users/[id]
 * Update user
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params
      console.log('📝 [PUT /api/admin/users/:id] Request started for ID:', id)

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id }
      })

      if (!existingUser) {
        console.error('❌ [PUT /api/admin/users/:id] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Parse Request Body
      const body = await request.json()

      // Validation
      const validated = updateUserSchema.safeParse(body)
      if (!validated.success) {
        console.error('❌ [PUT /api/admin/users/:id] Validation failed:', validated.error.issues)
        return NextResponse.json({ 
          error: 'Validation failed',
          details: validated.error.issues
        }, { status: 400 })
      }

      const data = validated.data

      // Update User
      const user = await db.user.update({
        where: { id },
        data: {
          name: data.name,
          phone: data.phone,
          timezone: data.timezone,
          profileImage: data.avatar,
          isActive: data.isActive,
          userRole: data.userRole,
          userType: data.userType,
          sppgId: data.sppgId
        },
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          userRole: true,
          userType: true,
          isActive: true,
          emailVerified: true,
          sppgId: true,
          sppg: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          phone: true,
          timezone: true,
          lastLogin: true,
          lockedUntil: true,
          createdAt: true,
          updatedAt: true
        }
      })

      console.log('✅ [PUT /api/admin/users/:id] User updated:', user.id)

      // Create Audit Log
      await db.userAuditLog.create({
        data: {
          userId: user.id,
          sppgId: user.sppgId,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: user.id,
          resourcePath: `/api/admin/users/${id}`,
          oldValues: existingUser,
          newValues: data,
          metadata: {
            updatedBy: session.user.id,
            updatedByEmail: session.user.email,
            updatedByRole: session.user.userRole
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined
        }
      })

      // Transform Response
      const transformedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.profileImage,
        userRole: user.userRole,
        userType: user.userType,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        sppgId: user.sppgId,
        sppg: user.sppg ? {
          id: user.sppg.id,
          name: user.sppg.name,
          code: user.sppg.code
        } : null,
        phone: user.phone,
        timezone: user.timezone,
        lastLoginAt: user.lastLogin,
        lockedUntil: user.lockedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }

      return NextResponse.json({ 
        success: true, 
        data: transformedUser 
      })

    } catch (error) {
      console.error('❌ [PUT /api/admin/users/:id] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to update user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params
      console.log('🗑️ [DELETE /api/admin/users/:id] Request started for ID:', id)

      // Prevent self-deletion
      if (id === session.user.id) {
        console.error('❌ [DELETE /api/admin/users/:id] Cannot delete own account')
        return NextResponse.json({ 
          error: 'Cannot delete your own account' 
        }, { status: 400 })
      }

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          userRole: true,
          sppgId: true
        }
      })

      if (!existingUser) {
        console.error('❌ [DELETE /api/admin/users/:id] User not found:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Create Audit Log BEFORE deletion
      await db.userAuditLog.create({
        data: {
          userId: existingUser.id,
          sppgId: existingUser.sppgId,
          action: 'DELETE',
          entityType: 'USER',
          entityId: existingUser.id,
          resourcePath: `/api/admin/users/${id}`,
          oldValues: {
            email: existingUser.email,
            name: existingUser.name,
            userRole: existingUser.userRole
          },
          metadata: {
            deletedBy: session.user.id,
            deletedByEmail: session.user.email,
            deletedByRole: session.user.userRole,
            reason: 'Admin deletion'
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined
        }
      })

      // Delete User (cascade deletes related records)
      await db.user.delete({
        where: { id }
      })

      console.log('✅ [DELETE /api/admin/users/:id] User deleted:', id)

      return NextResponse.json({ 
        success: true,
        message: 'User deleted successfully'
      })

    } catch (error) {
      console.error('❌ [DELETE /api/admin/users/:id] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to delete user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
