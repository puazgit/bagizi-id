/**
 * @fileoverview User Management API Endpoints - List & Create
 * @version Next.js 15.5.4 / App Router API with RBAC Middleware
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createUserSchema } from '@/features/admin/user-management/schemas'
import { UserRole, UserType } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * GET /api/admin/users
 * Get paginated list of users with filters
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      console.log('🔍 [GET /api/admin/users] Request started')
      
      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search') || undefined
      const userRole = searchParams.get('userRole') as UserRole | undefined
      const userType = searchParams.get('userType') as UserType | undefined
      const isActive = searchParams.get('isActive') 
        ? searchParams.get('isActive') === 'true' 
        : undefined
      const sppgId = searchParams.get('sppgId') || undefined
      const hasEmailVerified = searchParams.get('hasEmailVerified')
        ? searchParams.get('hasEmailVerified') === 'true'
        : undefined
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'name' | 'email' | 'lastLogin'
      const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

      console.log('📋 [GET /api/admin/users] Filters:', { search, userRole, userType, isActive, sppgId, page, limit })

      // Build Where Clause
      const where: {
        OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>
        userRole?: UserRole
        userType?: UserType
        isActive?: boolean
        sppgId?: string
        emailVerified?: { not: null } | null
      } = {}

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (userRole) {
        where.userRole = userRole
      }

      if (userType) {
        where.userType = userType
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (sppgId) {
        where.sppgId = sppgId
      }

      if (hasEmailVerified !== undefined) {
        if (hasEmailVerified) {
          where.emailVerified = { not: null }
        } else {
          where.emailVerified = null
        }
      }

      // Count Total
      const total = await db.user.count({ where })
      console.log('📊 [GET /api/admin/users] Total users:', total)

      // Fetch Users
      const users = await db.user.findMany({
        where,
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
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      })

      console.log('✅ [GET /api/admin/users] Fetched users:', users.length)

      // Transform Data
      const transformedUsers = users.map(user => ({
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
      }))

      // Build Response
      const totalPages = Math.ceil(total / limit)
      
      return NextResponse.json({
        success: true,
        data: transformedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      })

    } catch (error) {
      console.error('❌ [GET /api/admin/users] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch users',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

/**
 * POST /api/admin/users
 * Create new user
 * Protected: Admin access required (automatic via withAdminAuth)
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (session) => {
    try {
      console.log('📝 [POST /api/admin/users] Request started')

      // Parse Request Body
      const body = await request.json()

      // Validation
      const validated = createUserSchema.safeParse(body)
      if (!validated.success) {
        console.error('❌ [POST /api/admin/users] Validation failed:', validated.error.issues)
        return NextResponse.json({ 
          error: 'Validation failed',
          details: validated.error.issues
        }, { status: 400 })
      }

      const data = validated.data

      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        console.error('❌ [POST /api/admin/users] Email already exists:', data.email)
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 409 })
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(data.password, 12)

      // Create User
      const user = await db.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          userRole: data.userRole,
          userType: data.userType,
          sppgId: data.sppgId,
          phone: data.phone,
          timezone: data.timezone || 'Asia/Jakarta',
          isActive: data.isActive ?? true,
          emailVerified: data.emailVerified ? new Date() : null,
          profileImage: data.avatar,
          saltRounds: 12
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
          createdAt: true,
          updatedAt: true
        }
      })

      console.log('✅ [POST /api/admin/users] User created:', user.id)

      // Create Audit Log
      await db.userAuditLog.create({
        data: {
          userId: user.id,
          sppgId: data.sppgId,
          action: 'CREATE',
          entityType: 'USER',
          entityId: user.id,
          resourcePath: '/api/admin/users',
          newValues: {
            email: data.email,
            name: data.name,
            userRole: data.userRole,
            userType: data.userType,
            sppgId: data.sppgId
          },
          metadata: {
            createdBy: session.user.id,
            createdByEmail: session.user.email,
            createdByRole: session.user.userRole
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }

      return NextResponse.json({ 
        success: true, 
        data: transformedUser 
      }, { status: 201 })

    } catch (error) {
      console.error('❌ [POST /api/admin/users] Error:', error)
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
