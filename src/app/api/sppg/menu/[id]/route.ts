/**
 * @fileoverview Menu Detail API Endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/menu/[id]
 * Get menu details by ID with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Multi-tenant check
    if (!session.user.sppgId) {
      return NextResponse.json(
        { success: false, error: 'SPPG access required' },
        { status: 403 }
      )
    }

    // 3. Get menu ID from params
    const { id } = await params

    // 4. Fetch menu with all details
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id,
        program: {
          sppgId: session.user.sppgId, // Multi-tenant security
        },
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            sppgId: true,
            programType: true,
            targetGroup: true,
          },
        },
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                itemCode: true,
                category: true,
                unit: true,
                costPerUnit: true,
                lastPrice: true,
              },
            },
          },
        },
        recipeSteps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
        nutritionCalc: true,
        costCalc: true,
      },
    })

    // 5. Check if menu exists
    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu tidak ditemukan atau tidak dapat diakses' },
        { status: 404 }
      )
    }

    // 6. Return menu data
    return NextResponse.json({
      success: true,
      data: menu,
    })
  } catch (error) {
    console.error('GET /api/sppg/menu/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data menu',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sppg/menu/[id]
 * Update menu details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Multi-tenant check
    if (!session.user.sppgId) {
      return NextResponse.json(
        { success: false, error: 'SPPG access required' },
        { status: 403 }
      )
    }

    // 3. Get menu ID from params
    const { id } = await params

    // 4. Verify menu exists and belongs to user's SPPG
    const existingMenu = await db.nutritionMenu.findFirst({
      where: {
        id,
        program: {
          sppgId: session.user.sppgId,
        },
      },
    })

    if (!existingMenu) {
      return NextResponse.json(
        { success: false, error: 'Menu tidak ditemukan atau tidak dapat diakses' },
        { status: 404 }
      )
    }

    // 5. Parse request body
    const body = await request.json()

    // 6. Update menu
    const updatedMenu = await db.nutritionMenu.update({
      where: { id },
      data: {
        menuName: body.menuName,
        menuCode: body.menuCode,
        description: body.description,
        mealType: body.mealType,
        servingSize: body.servingSize,
        preparationTime: body.preparationTime,
        cookingTime: body.cookingTime,
        difficulty: body.difficulty,
        cookingMethod: body.cookingMethod,
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            sppgId: true,
          },
        },
        ingredients: {
          include: {
            inventoryItem: true,
          },
        },
        recipeSteps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
        nutritionCalc: true,
        costCalc: true,
      },
    })

    // 7. Return updated menu
    return NextResponse.json({
      success: true,
      data: updatedMenu,
    })
  } catch (error) {
    console.error('PUT /api/sppg/menu/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memperbarui menu',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sppg/menu/[id]
 * Delete menu (soft delete recommended)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Multi-tenant check
    if (!session.user.sppgId) {
      return NextResponse.json(
        { success: false, error: 'SPPG access required' },
        { status: 403 }
      )
    }

    // 3. Get menu ID from params
    const { id } = await params

    // 4. Verify menu exists and belongs to user's SPPG
    const existingMenu = await db.nutritionMenu.findFirst({
      where: {
        id,
        program: {
          sppgId: session.user.sppgId,
        },
      },
    })

    if (!existingMenu) {
      return NextResponse.json(
        { success: false, error: 'Menu tidak ditemukan atau tidak dapat diakses' },
        { status: 404 }
      )
    }

    // 5. Delete menu and related data
    // Note: Prisma will cascade delete related records based on schema
    await db.nutritionMenu.delete({
      where: { id },
    })

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: 'Menu berhasil dihapus',
    })
  } catch (error) {
    console.error('DELETE /api/sppg/menu/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus menu',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
