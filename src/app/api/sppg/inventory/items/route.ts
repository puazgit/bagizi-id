/**
 * @fileoverview Inventory Items API Endpoint
 * @version Next.js 15.5.4 / API Routes
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth
 * - Automatic audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Get query params
      const { searchParams } = new URL(request.url)
      const activeOnly = searchParams.get('active') === 'true'

      // Fetch inventory items with proper filtering by sppgId
      const items = await db.inventoryItem.findMany({
        where: {
          sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
          ...(activeOnly && { isActive: true }),
        },
        select: {
          id: true,
          itemName: true,
          itemCode: true,
          unit: true,
          currentStock: true,
          minStock: true,
          costPerUnit: true,
          category: true,
          isActive: true,
        },
        orderBy: [
          { isActive: 'desc' },
          { itemName: 'asc' },
        ],
      })

      return NextResponse.json({ success: true, data: items })
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch inventory items',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
