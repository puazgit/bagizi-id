/**
 * @fileoverview API route - Report delivery issue
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * 
 * @endpoint POST /api/sppg/distribution/delivery/:id/issue
 * @access Protected - SPPG users only
 * @security Multi-tenant with ownership check
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { reportDeliveryIssueSchema } from '@/features/sppg/distribution/delivery/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/distribution/delivery/:id/issue
 * Report delivery issue (traffic, damage, etc.)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // 2. Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // 3. Verify ownership
    const existing = await db.distributionDelivery.findFirst({
      where: {
        id,
        schedule: {
          sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant security
        },
      },
      select: { 
        id: true,
        status: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pengiriman tidak ditemukan atau akses ditolak' },
        { status: 404 }
      )
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = reportDeliveryIssueSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Data masalah tidak valid',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const {
      issueType,
      severity,
      description,
    } = validated.data

    // 5. Create issue record
    const issue = await db.deliveryIssue.create({
      data: {
        deliveryId: id,
        issueType,
        severity,
        description,
      },
    })

    return NextResponse.json({
      success: true,
      data: issue,
      message: 'Masalah pengiriman berhasil dilaporkan',
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/delivery/[id]/issue error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal melaporkan masalah pengiriman',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
  })
}
