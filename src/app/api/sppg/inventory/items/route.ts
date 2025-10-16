/**
 * @fileoverview Inventory Items API Endpoint
 * @version Next.js 15.5.4 / API Routes
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check (CRITICAL FOR MULTI-TENANCY!)
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Get query params
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    // 4. Fetch inventory items with proper filtering by sppgId
    const items = await db.inventoryItem.findMany({
      where: {
        sppgId: session.user.sppgId, // MANDATORY multi-tenant filter
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

    return Response.json({ success: true, data: items })
  } catch (error) {
    console.error('GET /api/sppg/inventory/items error:', error)
    return Response.json({ 
      error: 'Failed to fetch inventory items',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
