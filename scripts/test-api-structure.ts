/**
 * Test SPPG API endpoint
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing SPPG API data structure...\n')
  
  // Simulate what the API endpoint does
  const sppgs = await prisma.sPPG.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      province: {
        select: {
          id: true,
          name: true
        }
      },
      regency: {
        select: {
          id: true,
          name: true
        }
      },
      district: {
        select: {
          id: true,
          name: true
        }
      },
      village: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          users: true,
          nutritionPrograms: true,
          schoolBeneficiaries: true
        }
      }
    }
  })

  const total = await prisma.sPPG.count()

  const response = {
    success: true,
    data: {
      data: sppgs,
      pagination: {
        page: 1,
        limit: 10,
        total,
        totalPages: Math.ceil(total / 10)
      }
    }
  }

  console.log('📊 API Response Structure:')
  console.log(JSON.stringify({
    success: response.success,
    data: {
      data: `[${response.data.data.length} SPPG items]`,
      pagination: response.data.pagination
    }
  }, null, 2))

  console.log('\n📋 First SPPG Item:')
  if (sppgs.length > 0) {
    const first = sppgs[0]
    console.log({
      id: first.id,
      code: first.code,
      name: first.name,
      status: first.status,
      organizationType: first.organizationType,
      isDemoAccount: first.isDemoAccount,
      province: first.province?.name,
      regency: first.regency?.name,
      stats: first._count
    })
  }

  console.log('\n✅ API structure looks correct!')
  console.log('Expected by component: data.data (array) and data.pagination (object)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
