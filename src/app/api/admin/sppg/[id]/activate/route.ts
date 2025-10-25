/**
 * Admin SPPG Activate API Endpoint
 * Handles activation of suspended or inactive SPPG
 * 
 * @route POST /api/admin/sppg/[id]/activate
 * 
 * @version Next.js 15.5.4 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * POST /api/admin/sppg/[id]/activate
 * Activate SPPG (set status to ACTIVE)
 * 
 * @access Platform SUPERADMIN only - automatic via withAdminAuth
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      
      // Check if SPPG exists
    const existingSppg = await db.sPPG.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        isDemoAccount: true,
        demoExpiresAt: true,
      }
    })

    if (!existingSppg) {
      return NextResponse.json(
        { success: false, error: 'SPPG not found' },
        { status: 404 }
      )
    }

    // 4. Check if already active
    if (existingSppg.status === 'ACTIVE') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'SPPG is already active',
          data: existingSppg
        },
        { status: 400 }
      )
    }

    // 5. Check demo account expiry
    if (existingSppg.isDemoAccount && existingSppg.demoExpiresAt) {
      const now = new Date()
      if (existingSppg.demoExpiresAt < now) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cannot activate expired demo account. Please extend demo period first.',
            details: {
              demoExpiresAt: existingSppg.demoExpiresAt,
              currentDate: now,
            }
          },
          { status: 400 }
        )
      }
    }

    // 6. Activate SPPG
    const activatedSppg = await db.sPPG.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      include: {
        province: { select: { id: true, name: true } },
        regency: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        village: { select: { id: true, name: true } },
      }
    })

    // Return activated SPPG
    return NextResponse.json({
      success: true,
      message: 'SPPG activated successfully',
      data: activatedSppg
    })

    } catch (error) {
      console.error('[POST /api/admin/sppg/[id]/activate] Error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to activate SPPG',
          details: error instanceof Error ? error.message : undefined
        },
        { status: 500 }
      )
    }
  }, { requireSuperAdmin: true })
}
