/**
 * Check User Session SPPG
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSession() {
  console.log('👤 Checking Users and their SPPG...\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      userRole: true,
      sppgId: true,
      sppg: {
        select: {
          name: true,
          code: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log('🔑 Recent Users:')
  for (const user of users) {
    console.log(`\n  User: ${user.name} (${user.email})`)
    console.log(`  Role: ${user.userRole}`)
    console.log(`  SPPG: ${user.sppg?.name || 'NO SPPG'} (${user.sppg?.code || 'N/A'})`)
    console.log(`  sppgId: ${user.sppgId || 'null'}`)
    
    // Check inventory for this sppg
    if (user.sppgId) {
      const inventoryCount = await prisma.inventoryItem.count({
        where: { 
          sppgId: user.sppgId,
          isActive: true 
        }
      })
      console.log(`  📦 Inventory Items: ${inventoryCount}`)
    }
  }

  await prisma.$disconnect()
}

checkSession()
  .catch(console.error)
  .finally(() => process.exit(0))
