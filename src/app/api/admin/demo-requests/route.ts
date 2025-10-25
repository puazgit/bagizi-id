/**
 * @fileoverview Admin Demo Requests Management API
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * RBAC Integration:
 * - GET: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 * - POST: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT (manual demo creation)
 * - Automatic audit logging
 * - Platform-level access only
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { DemoRequestStatus, AttendanceStatus, Prisma } from '@prisma/client'

// ================================ GET /api/admin/demo-requests ================================

/**
 * Get all demo requests with filtering
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      // 1. Parse query parameters
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') as DemoRequestStatus | null
      const attendanceStatus = searchParams.get('attendanceStatus') as AttendanceStatus | null
      const assignedTo = searchParams.get('assignedTo')
      const isConverted = searchParams.get('isConverted')
      const search = searchParams.get('search')
      const sortBy = searchParams.get('sortBy') || 'createdAt'
      const sortOrder = searchParams.get('sortOrder') || 'desc'
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')

      // 2. Build where clause with filters
      const where: Prisma.DemoRequestWhereInput = {}

      if (status) {
        where.status = status
      }

      if (attendanceStatus) {
        where.attendanceStatus = attendanceStatus
      }

      if (assignedTo) {
        where.assignedTo = assignedTo
      }

      if (isConverted !== null) {
        where.isConverted = isConverted === 'true'
      }

      if (search) {
        where.OR = [
          { picName: { contains: search, mode: 'insensitive' } },
          { picEmail: { contains: search, mode: 'insensitive' } },
          { organizationName: { contains: search, mode: 'insensitive' } },
          { picPhone: { contains: search } },
        ]
      }

      // 3. Execute queries with pagination
      const [demoRequests, total] = await Promise.all([
        db.demoRequest.findMany({
          where,
          include: {
            demoSppg: {
              select: {
                id: true,
                name: true,
                code: true,
                isDemoAccount: true,
              },
            },
            productionSppg: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        db.demoRequest.count({ where }),
      ])

      // 4. Calculate summary statistics
      const summary = {
        total,
        byStatus: await db.demoRequest.groupBy({
          by: ['status'],
          _count: true,
        }),
        byAttendance: await db.demoRequest.groupBy({
          by: ['attendanceStatus'],
          _count: true,
          where: {
            attendanceStatus: { not: null },
          },
        }),
        converted: await db.demoRequest.count({
          where: { isConverted: true },
        }),
        conversionRate: total > 0 
          ? ((await db.demoRequest.count({ where: { isConverted: true } }) / total) * 100).toFixed(2) + '%'
          : '0%',
      }

      return NextResponse.json({
        success: true,
        data: demoRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary,
      })
    } catch (error) {
      console.error('GET /api/admin/demo-requests error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch demo requests',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

// ================================ POST /api/admin/demo-requests ================================

/**
 * Create demo request manually (for testing or direct entry)
 * @rbac PLATFORM_SUPERADMIN, PLATFORM_SUPPORT
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      // 1. Parse and validate request body
      const body = await request.json()

      // 2. Required fields validation
      const requiredFields = ['picName', 'picEmail', 'picPhone', 'organizationName', 'organizationType']
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            {
              success: false,
              error: `Missing required field: ${field}`,
            },
            { status: 400 }
          )
        }
      }

      // 3. Check for duplicate by email
      const existingRequest = await db.demoRequest.findFirst({
        where: {
          picEmail: body.picEmail,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Within last 30 days
          },
        },
      })

      if (existingRequest) {
        return NextResponse.json(
          {
            success: false,
            error: 'Demo request with this email already exists within the last 30 days',
          },
          { status: 409 }
        )
      }

      // 4. Create demo request
      const demoRequest = await db.demoRequest.create({
        data: {
          // Requester information
          picName: body.picName,
          firstName: body.firstName,
          lastName: body.lastName,
          picEmail: body.picEmail,
          picPhone: body.picPhone,
          picPosition: body.position,

          // Organization
          organizationName: body.organizationName,
          organizationType: body.organizationType,
          operationalArea: body.operationalArea,
          currentSystem: body.currentSystem,
          currentChallenges: body.currentChallenges || [],
          expectedGoals: body.expectedGoals || [],

          // Demo configuration
          demoType: body.demoType || 'STANDARD',
          requestedFeatures: body.requestedFeatures || [],
          specialRequirements: body.specialRequirements,
          requestMessage: body.requestMessage,

          // Scheduling
          preferredStartDate: body.preferredStartDate ? new Date(body.preferredStartDate) : null,
          preferredTime: body.preferredTime || 'MORNING',
          timezone: body.timezone || 'Asia/Jakarta',
          estimatedDuration: body.estimatedDuration || 14,
          demoDuration: body.demoDuration || 60,
          demoMode: body.demoMode || 'ONLINE',

          // Status
          status: body.status || 'SUBMITTED',
          
          // Assignment (if provided)
          assignedTo: body.assignedTo,
          assignedAt: body.assignedTo ? new Date() : null,
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: demoRequest,
          message: 'Demo request created successfully',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/admin/demo-requests error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create demo request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
