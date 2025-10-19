/**
 * @fileoverview API Route for Distribution Execution Issues
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import type { IssueType, IssueSeverity } from '@prisma/client'

/**
 * GET /api/sppg/distribution/execution/[id]/issues
 * 
 * Fetch all issues for a distribution execution with optional filtering
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing execution ID
 * @returns List of distribution issues with metadata
 * 
 * @security Requires authentication and SPPG access
 * @security Multi-tenant: Filtered by user's SPPG
 * 
 * Query Parameters:
 * - issueType: Filter by issue type (optional)
 * - severity: Filter by severity level (optional)
 * - resolved: Filter by resolution status (true/false, optional)
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
    const sppg = await checkSppgAccess(session.user.sppgId || null)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // 3. Get execution ID from params
    const params = await props.params
    const executionId = params.id

    // 4. Verify execution belongs to user's SPPG
    const execution = await db.foodDistribution.findFirst({
      where: {
        id: executionId,
        sppgId: session.user.sppgId || undefined,
      },
    })

    if (!execution) {
      return Response.json(
        { error: 'Execution not found or access denied' },
        { status: 404 }
      )
    }

    // 5. Parse query parameters
    const { searchParams } = new URL(request.url)
    const issueType = searchParams.get('issueType') as IssueType | null
    const severity = searchParams.get('severity') as IssueSeverity | null
    const resolvedParam = searchParams.get('resolved')
    
    // Build where clause with proper typing
    const whereClause = {
      distributionId: executionId,
      ...(issueType && { issueType }),
      ...(severity && { severity }),
      ...(resolvedParam !== null && {
        resolvedAt: resolvedParam === 'true' ? { not: null } : null,
      }),
    }

    // 6. Fetch issues from database
    const issues = await db.distributionIssue.findMany({
      where: whereClause,
      orderBy: [
        { severity: 'desc' }, // CRITICAL first
        { reportedAt: 'desc' }, // Most recent first
      ],
      select: {
        id: true,
        issueType: true,
        severity: true,
        description: true,
        location: true,
        affectedDeliveries: true,
        reportedAt: true,
        reportedBy: true,
        resolvedAt: true,
        resolvedBy: true,
        resolutionNotes: true,
      },
    })

    // 7. Calculate summary statistics
    const summary = {
      total: issues.length,
      resolved: issues.filter((i) => i.resolvedAt !== null).length,
      unresolved: issues.filter((i) => i.resolvedAt === null).length,
      bySeverity: {
        CRITICAL: issues.filter((i) => i.severity === 'CRITICAL').length,
        HIGH: issues.filter((i) => i.severity === 'HIGH').length,
        MEDIUM: issues.filter((i) => i.severity === 'MEDIUM').length,
        LOW: issues.filter((i) => i.severity === 'LOW').length,
      },
      byType: {
        VEHICLE_BREAKDOWN: issues.filter((i) => i.issueType === 'VEHICLE_BREAKDOWN').length,
        WEATHER_DELAY: issues.filter((i) => i.issueType === 'WEATHER_DELAY').length,
        TRAFFIC_JAM: issues.filter((i) => i.issueType === 'TRAFFIC_JAM').length,
        ACCESS_DENIED: issues.filter((i) => i.issueType === 'ACCESS_DENIED').length,
        RECIPIENT_UNAVAILABLE: issues.filter((i) => i.issueType === 'RECIPIENT_UNAVAILABLE').length,
        FOOD_QUALITY: issues.filter((i) => i.issueType === 'FOOD_QUALITY').length,
        SHORTAGE: issues.filter((i) => i.issueType === 'SHORTAGE').length,
        OTHER: issues.filter((i) => i.issueType === 'OTHER').length,
      },
    }

    return Response.json({
      success: true,
      data: {
        issues,
        summary,
      },
    })
  } catch (error) {
    console.error('Get execution issues error:', error)
    return Response.json(
      {
        error: 'Failed to fetch execution issues',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sppg/distribution/execution/[id]/issues
 * 
 * Create a new issue for a distribution execution
 * 
 * @param request - Next.js request object with issue data in body
 * @param params - Route parameters containing execution ID
 * @returns Created issue object
 * 
 * @security Requires authentication and SPPG access
 * @security Multi-tenant: Only for user's SPPG executions
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
    const sppg = await checkSppgAccess(session.user.sppgId || null)
    if (!sppg) {
      return Response.json({ error: 'SPPG access denied' }, { status: 403 })
    }

    // 3. Get execution ID from params
    const params = await props.params
    const executionId = params.id

    // 4. Verify execution belongs to user's SPPG
    const execution = await db.foodDistribution.findFirst({
      where: {
        id: executionId,
        sppgId: session.user.sppgId || undefined,
      },
    })

    if (!execution) {
      return Response.json(
        { error: 'Execution not found or access denied' },
        { status: 404 }
      )
    }

    // 5. Parse request body
    const body = await request.json()

    // 6. Validate required fields
    if (!body.issueType || !body.severity || !body.description) {
      return Response.json(
        { error: 'Missing required fields: issueType, severity, description' },
        { status: 400 }
      )
    }

    // 7. Create issue in database
    const issue = await db.distributionIssue.create({
      data: {
        distributionId: executionId,
        issueType: body.issueType,
        severity: body.severity,
        description: body.description,
        location: body.location || null,
        affectedDeliveries: body.affectedDeliveries || [],
        reportedBy: session.user.name || session.user.email,
      },
      select: {
        id: true,
        issueType: true,
        severity: true,
        description: true,
        location: true,
        affectedDeliveries: true,
        reportedAt: true,
        reportedBy: true,
        resolvedAt: true,
        resolvedBy: true,
        resolutionNotes: true,
      },
    })

    return Response.json(
      {
        success: true,
        data: issue,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create execution issue error:', error)
    return Response.json(
      {
        error: 'Failed to create execution issue',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
