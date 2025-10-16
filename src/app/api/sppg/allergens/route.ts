/**
 * @fileoverview Allergen API Routes - GET & POST /api/sppg/allergens
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API-First Architecture
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  allergenCreateSchema,
  allergenQuerySchema,
} from '@/features/sppg/menu/schemas/allergenSchema'
import type { AllergenResponse } from '@/features/sppg/menu/types/allergen.types'

/**
 * GET /api/sppg/allergens
 * Fetch all allergens (platform + SPPG custom)
 * 
 * Query Parameters:
 * - category?: DAIRY | EGGS | NUTS | SEAFOOD | GRAINS | SEEDS | FRUITS | ADDITIVES | MEAT | OTHER
 * - isCommon?: true | false
 * - isActive?: true | false
 * - includeCustom?: true | false
 * - search?: string
 * 
 * Returns:
 * - Platform allergens (sppgId = null) - available to all SPPG
 * - SPPG custom allergens (sppgId = user's SPPG) - only for that SPPG
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      category: searchParams.get('category') || undefined,
      isCommon: searchParams.get('isCommon') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      includeCustom: searchParams.get('includeCustom') || 'true',
      search: searchParams.get('search') || undefined,
    }

    const validated = allergenQuerySchema.safeParse(queryParams)
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const query = validated.data

    // 3. Build Query Conditions
    const whereConditions: Prisma.AllergenWhereInput[] = []

    // Filter by SPPG: Platform (null) + User's SPPG custom allergens
    if (query.includeCustom && session.user.sppgId) {
      whereConditions.push({
        OR: [
          { sppgId: null }, // Platform allergens
          { sppgId: session.user.sppgId }, // SPPG custom allergens
        ],
      })
    } else {
      whereConditions.push({
        sppgId: null, // Only platform allergens
      })
    }

    // Filter by category
    if (query.category) {
      whereConditions.push({ category: query.category })
    }

    // Filter by isCommon
    if (query.isCommon !== undefined) {
      whereConditions.push({ isCommon: query.isCommon })
    }

    // Filter by isActive
    if (query.isActive !== undefined) {
      whereConditions.push({ isActive: query.isActive })
    } else {
      // Default: only active allergens
      whereConditions.push({ isActive: true })
    }

    // Search by name or localName
    if (query.search) {
      whereConditions.push({
        OR: [
          { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { localName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
        ],
      })
    }

    // 4. Fetch Allergens
    const allergens = await db.allergen.findMany({
      where: {
        AND: whereConditions,
      },
      orderBy: [
        { isCommon: 'desc' }, // Common allergens first
        { category: 'asc' },  // Then by category
        { name: 'asc' },      // Then alphabetically
      ],
    })

    // 5. Transform to API Response
    const response: AllergenResponse[] = allergens.map((allergen) => ({
      id: allergen.id,
      sppgId: allergen.sppgId,
      name: allergen.name,
      description: allergen.description,
      isCommon: allergen.isCommon,
      category: allergen.category,
      localName: allergen.localName,
      isActive: allergen.isActive,
      createdAt: allergen.createdAt.toISOString(),
      updatedAt: allergen.updatedAt.toISOString(),
    }))

    // 6. Group by platform vs custom
    const platformAllergens = response.filter((a) => a.sppgId === null)
    const customAllergens = response.filter((a) => a.sppgId !== null)

    return NextResponse.json({
      success: true,
      data: {
        allergens: response,
        total: response.length,
        platformAllergens,
        customAllergens,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/allergens error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch allergens',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sppg/allergens
 * Create custom allergen for SPPG
 * 
 * Body:
 * {
 *   name: string (required)
 *   description?: string
 *   category?: AllergenCategory
 *   localName?: string
 *   isCommon?: boolean
 *   isActive?: boolean
 * }
 * 
 * Note: Only SPPG users can create custom allergens for their SPPG
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. SPPG Access Check
    if (!session.user.sppgId) {
      return NextResponse.json(
        {
          success: false,
          error: 'SPPG access required to create custom allergens',
        },
        { status: 403 }
      )
    }

    // 3. Parse Request Body
    const body = await request.json()

    // 4. Validation
    const validated = allergenCreateSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validated.data

    // 5. Check if allergen name already exists for this SPPG
    const existingAllergen = await db.allergen.findFirst({
      where: {
        name: data.name,
        sppgId: session.user.sppgId,
      },
    })

    if (existingAllergen) {
      return NextResponse.json(
        {
          success: false,
          error: `Alergen "${data.name}" sudah terdaftar untuk SPPG Anda`,
        },
        { status: 409 }
      )
    }

    // 6. Create Custom Allergen
    const allergen = await db.allergen.create({
      data: {
        ...data,
        sppgId: session.user.sppgId, // Link to user's SPPG
        isCommon: false, // Custom allergens are not common by default
      },
    })

    // 7. Transform to API Response
    const response: AllergenResponse = {
      id: allergen.id,
      sppgId: allergen.sppgId,
      name: allergen.name,
      description: allergen.description,
      isCommon: allergen.isCommon,
      category: allergen.category,
      localName: allergen.localName,
      isActive: allergen.isActive,
      createdAt: allergen.createdAt.toISOString(),
      updatedAt: allergen.updatedAt.toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: `Alergen "${allergen.name}" berhasil ditambahkan`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/sppg/allergens error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create allergen',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
