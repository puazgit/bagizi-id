/**
 * @fileoverview Quality Check API Route
 * @route /api/sppg/production/[id]/quality-checks
 * @version Next.js 15.5.4 / Prisma 6.17.1
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/production/[id]/quality-checks
 * Get all quality checks for a production
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // Check if production exists and belongs to user's SPPG
    const production = await db.foodProduction.findUnique({
      where: {
        id: params.id,
        sppgId: session.user.sppgId,
      },
    })

    if (!production) {
      return Response.json({ error: 'Production not found' }, { status: 404 })
    }

    // Get quality checks
    const qualityChecks = await db.qualityControl.findMany({
      where: {
        productionId: params.id,
      },
      orderBy: {
        checkTime: 'desc',
      },
    })

    return Response.json({
      success: true,
      data: qualityChecks,
    })
  } catch (error) {
    console.error('GET /api/sppg/production/[id]/quality-checks error:', error)
    return Response.json(
      {
        error: 'Failed to fetch quality checks',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sppg/production/[id]/quality-checks
 * Add quality check to production
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // Check if production exists and belongs to user's SPPG
    const production = await db.foodProduction.findUnique({
      where: {
        id: params.id,
        sppgId: session.user.sppgId,
      },
    })

    if (!production) {
      return Response.json({ error: 'Production not found' }, { status: 404 })
    }

    const body = await request.json()

    // Create quality check (using actual schema fields)
    const qualityCheck = await db.qualityControl.create({
      data: {
        productionId: params.id,
        checkType: body.checkType || 'GENERAL',
        checkTime: body.checkTime ? new Date(body.checkTime) : new Date(),
        checkedBy: body.checkedBy || session.user.id,
        parameter: body.parameter || 'General Quality',
        expectedValue: body.expectedValue,
        actualValue: body.actualValue || 'Checked',
        passed: body.passed,
        score: body.score,
        severity: body.severity,
        notes: body.notes,
        recommendations: body.recommendations,
        actionRequired: body.actionRequired || false,
      },
    })

    // If quality check failed, update production status to CANCELLED
    if (!body.passed && production.status === 'QUALITY_CHECK') {
      await db.foodProduction.update({
        where: {
          id: params.id,
        },
        data: {
          status: 'CANCELLED',
          rejectionReason: 'Failed quality check',
          qualityPassed: false,
        },
      })
    }

    // If quality check passed and production is in QUALITY_CHECK, move to COMPLETED
    if (body.passed && production.status === 'QUALITY_CHECK') {
      await db.foodProduction.update({
        where: {
          id: params.id,
        },
        data: {
          status: 'COMPLETED',
          actualEndTime: new Date(),
          qualityPassed: true,
        },
      })
    }

    return Response.json(
      {
        success: true,
        data: qualityCheck,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/sppg/production/[id]/quality-checks error:', error)
    return Response.json(
      {
        error: 'Failed to create quality check',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
