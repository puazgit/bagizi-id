/**
 * @fileoverview Dashboard statistics API endpoint - Real-time SPPG statistics
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/dashboard/stats
 * Fetch real-time dashboard statistics for authenticated SPPG
 */
export async function GET() {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. SPPG Access Check (CRITICAL FOR MULTI-TENANCY!)
    const sppgId = session.user.sppgId
    if (!sppgId) {
      return NextResponse.json(
        { success: false, error: 'SPPG access required' },
        { status: 403 }
      )
    }

    // 3. Verify SPPG exists and is active
    const sppg = await db.sPPG.findUnique({
      where: {
        id: sppgId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    })

    if (!sppg) {
      return NextResponse.json(
        { success: false, error: 'SPPG not found or inactive' },
        { status: 403 }
      )
    }

    // 4. Fetch real dashboard statistics
    
    // Active Programs Count
    const activeProgramsCount = await db.nutritionProgram.count({
      where: {
        sppgId,
        status: 'ACTIVE'
      }
    })

    // New Programs This Week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const newProgramsThisWeek = await db.nutritionProgram.count({
      where: {
        sppgId,
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Active Menus Count
    const activeMenusCount = await db.nutritionMenu.count({
      where: {
        program: {
          sppgId
        }
      }
    })

    // New Menus This Week
    const newMenusThisWeek = await db.nutritionMenu.count({
      where: {
        program: {
          sppgId
        },
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Total Beneficiaries (Schools)
    const totalSchools = await db.schoolBeneficiary.count({
      where: {
        program: {
          sppgId
        }
      }
    })

    // New Schools This Week
    const newSchoolsThisWeek = await db.schoolBeneficiary.count({
      where: {
        program: {
          sppgId
        },
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Total Beneficiaries Recipients (Sum of targetRecipients from programs)
    const programsWithRecipients = await db.nutritionProgram.findMany({
      where: {
        sppgId,
        status: 'ACTIVE'
      },
      select: {
        targetRecipients: true
      }
    })

    const totalBeneficiaries = programsWithRecipients.reduce(
      (sum, program) => sum + (program.targetRecipients || 0),
      0
    )

    // Pending Distributions (Today's distributions not yet completed)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const pendingDistributions = await db.foodDistribution.count({
      where: {
        sppgId,
        distributionDate: {
          gte: today
        },
        status: {
          in: ['SCHEDULED', 'PREPARING', 'IN_TRANSIT', 'DISTRIBUTING']
        }
      }
    })

    // Completed Distributions This Week
    const completedDistributionsThisWeek = await db.foodDistribution.count({
      where: {
        sppgId,
        distributionDate: {
          gte: oneWeekAgo
        },
        status: 'COMPLETED'
      }
    })

    // Budget Utilization
    const totalBudget = await db.nutritionProgram.aggregate({
      where: {
        sppgId,
        status: 'ACTIVE'
      },
      _sum: {
        totalBudget: true
      }
    })

    // Total Procurement Costs This Month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const monthlyProcurementCost = await db.procurement.aggregate({
      where: {
        sppgId,
        procurementDate: {
          gte: firstDayOfMonth
        },
        status: {
          in: ['APPROVED', 'COMPLETED']
        }
      },
      _sum: {
        totalAmount: true
      }
    })

    const budget = totalBudget._sum.totalBudget || 0
    const spent = monthlyProcurementCost._sum.totalAmount || 0
    const budgetPercentage = budget > 0 ? Math.round((spent / budget) * 100) : 0

    // 5. Build response
    const stats = {
      activePrograms: {
        current: activeProgramsCount,
        newThisWeek: newProgramsThisWeek,
        percentage: newProgramsThisWeek > 0 
          ? Math.round((newProgramsThisWeek / Math.max(activeProgramsCount, 1)) * 100)
          : 0
      },
      activeMenus: {
        current: activeMenusCount,
        newThisWeek: newMenusThisWeek,
        percentage: newMenusThisWeek > 0
          ? Math.round((newMenusThisWeek / Math.max(activeMenusCount, 1)) * 100)
          : 0
      },
      totalBeneficiaries: {
        current: totalBeneficiaries,
        schools: totalSchools,
        newSchools: newSchoolsThisWeek,
        percentage: newSchoolsThisWeek > 0
          ? Math.round((newSchoolsThisWeek / Math.max(totalSchools, 1)) * 100)
          : 0
      },
      pendingDistributions: {
        current: pendingDistributions,
        completedThisWeek: completedDistributionsThisWeek,
        percentage: completedDistributionsThisWeek > 0
          ? Math.round((completedDistributionsThisWeek / (pendingDistributions + completedDistributionsThisWeek)) * 100)
          : 0
      },
      budgetUtilization: {
        percentage: budgetPercentage,
        spent,
        remaining: budget - spent,
        total: budget
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: stats
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
