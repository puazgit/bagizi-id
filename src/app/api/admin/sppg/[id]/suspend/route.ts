/**
 * Admin SPPG Suspend API Endpoint
 * Handles suspension of active SPPG with reason
 * 
 * @route POST /api/admin/sppg/[id]/suspend
 * 
 * @version Next.js 15.5.4 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'

/**
 * Suspend request schema
 */
const suspendSchema = z.object({
  reason: z.string()
    .min(10, 'Suspension reason must be at least 10 characters')
    .max(500, 'Suspension reason must not exceed 500 characters'),
  notes: z.string().max(1000).optional(),
})

/**
 * POST /api/admin/sppg/[id]/suspend
 * Suspend SPPG (set status to SUSPENDED) with reason
 * 
 * @access Platform SUPERADMIN only - automatic via withAdminAuth
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (session) => {
    try {
      const { id } = await params
      
      // Parse and validate request body
    const body = await request.json()
    const validated = suspendSchema.parse(body)

    // 4. Check if SPPG exists
    const existingSppg = await db.sPPG.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
      }
    })

    if (!existingSppg) {
      return NextResponse.json(
        { success: false, error: 'SPPG not found' },
        { status: 404 }
      )
    }

    // 5. Check if already suspended
    if (existingSppg.status === 'SUSPENDED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'SPPG is already suspended',
          data: existingSppg
        },
        { status: 400 }
      )
    }

    // 6. Check if inactive
    if (existingSppg.status === 'INACTIVE') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot suspend inactive SPPG. Use activate endpoint first.',
          data: existingSppg
        },
        { status: 400 }
      )
    }

    // 7. Suspend SPPG and create audit log in transaction
    const suspendedSppg = await db.$transaction(async (tx) => {
      // Update SPPG status
      const updated = await tx.sPPG.update({
        where: { id },
        data: {
          status: 'SUSPENDED',
          updatedAt: new Date(),
        },
        include: {
          province: { select: { id: true, name: true } },
          regency: { select: { id: true, name: true } },
          district: { select: { id: true, name: true } },
          village: { select: { id: true, name: true } },
        }
      })

      // Create audit log
      await tx.userAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          entityType: 'SPPG',
          entityId: id,
          resourcePath: `/admin/sppg/${id}/suspend`,
          oldValues: {
            status: existingSppg.status
          },
          newValues: {
            status: 'SUSPENDED'
          },
          changes: {
            status: {
              from: existingSppg.status,
              to: 'SUSPENDED'
            }
          },
          metadata: {
            action: 'SUSPEND',
            sppgCode: updated.code,
            sppgName: updated.name,
            userRole: session.user.userRole,
            reason: validated.reason,
            notes: validated.notes,
            description: `SPPG ${updated.code} (${updated.name}) suspended. Reason: ${validated.reason}`,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return updated
    })

    // Return suspended SPPG
    return NextResponse.json({
      success: true,
      message: 'SPPG suspended successfully',
      data: suspendedSppg
    })

    } catch (error) {
      console.error('[POST /api/admin/sppg/[id]/suspend] Error:', error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: 'errors' in error ? error.errors : undefined
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to suspend SPPG',
          details: error instanceof Error ? error.message : undefined
        },
        { status: 500 }
      )
    }
  }, { requireSuperAdmin: true })
}
