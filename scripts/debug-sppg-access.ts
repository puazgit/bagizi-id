/**
 * Debug Script: SPPG Access Issues
 * 
 * Run with: npx tsx scripts/debug-sppg-access.ts
 * 
 * Checks:
 * 1. SPPG records in database
 * 2. User records and their sppgId associations
 * 3. SPPG status (ACTIVE/INACTIVE)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Debugging SPPG Access Issues...\n')

  // 1. Check SPPG Records
  console.log('📊 SPPG Records:')
  console.log('='.repeat(60))
  
  const sppgs = await prisma.sPPG.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      isDemoAccount: true,
      _count: {
        select: {
          users: true,
          nutritionPrograms: true,
        }
      }
    }
  })

  if (sppgs.length === 0) {
    console.log('❌ No SPPG records found in database!')
    console.log('   Run: npm run db:seed')
    return
  }

  sppgs.forEach(sppg => {
    console.log(`\n✅ SPPG: ${sppg.name} (${sppg.code})`)
    console.log(`   ID: ${sppg.id}`)
    console.log(`   Status: ${sppg.status}`)
    console.log(`   Demo: ${sppg.isDemoAccount ? 'Yes' : 'No'}`)
    console.log(`   Users: ${sppg._count.users}`)
    console.log(`   Programs: ${sppg._count.nutritionPrograms}`)
  })

  // 2. Check Users and their SPPG associations
  console.log('\n\n👥 User Records:')
  console.log('='.repeat(60))
  
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
          status: true,
        }
      }
    },
    take: 10 // Limit to first 10 users
  })

  if (users.length === 0) {
    console.log('❌ No user records found in database!')
    console.log('   Run: npm run db:seed')
    return
  }

  users.forEach(user => {
    if (user.sppgId) {
      if (user.sppg) {
        console.log(`\n✅ User: ${user.name || 'N/A'} (${user.email})`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Role: ${user.userRole}`)
        console.log(`   SPPG: ${user.sppg.name} (${user.sppg.code})`)
        console.log(`   SPPG Status: ${user.sppg.status}`)
        console.log(`   SPPG ID: ${user.sppgId}`)
        
        if (user.sppg.status !== 'ACTIVE') {
          console.log(`   ⚠️  WARNING: SPPG is ${user.sppg.status}, not ACTIVE!`)
        }
      } else {
        console.log(`\n❌ User: ${user.name || 'N/A'} (${user.email})`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Role: ${user.userRole}`)
        console.log(`   SPPG ID: ${user.sppgId}`)
        console.log(`   ⚠️  ERROR: SPPG reference exists but SPPG not found!`)
      }
    } else {
      console.log(`\n⚠️  User: ${user.name || 'N/A'} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Role: ${user.userRole}`)
      console.log(`   SPPG ID: NULL (User has no SPPG association)`)
    }
  })

  // 3. Check Distribution Records
  console.log('\n\n📦 Distribution Records:')
  console.log('='.repeat(60))
  
  const distributionCount = await prisma.foodDistribution.count()
  console.log(`Total distributions: ${distributionCount}`)
  
  if (distributionCount > 0) {
    const distributions = await prisma.foodDistribution.findMany({
      select: {
        id: true,
        distributionCode: true,
        status: true,
        sppgId: true,
        program: {
          select: {
            name: true,
            sppg: {
              select: {
                name: true,
                code: true,
              }
            }
          }
        }
      },
      take: 5
    })

    distributions.forEach(dist => {
      console.log(`\n  Distribution: ${dist.distributionCode}`)
      console.log(`  ID: ${dist.id}`)
      console.log(`  Status: ${dist.status}`)
      console.log(`  SPPG ID: ${dist.sppgId}`)
      console.log(`  Program: ${dist.program.name}`)
      console.log(`  SPPG: ${dist.program.sppg.name} (${dist.program.sppg.code})`)
    })
  } else {
    console.log('❌ No distribution records found!')
    console.log('   Run: npm run db:seed')
  }

  // 4. Summary and Recommendations
  console.log('\n\n📋 Summary:')
  console.log('='.repeat(60))
  
  const usersWithSppg = users.filter(u => u.sppgId && u.sppg).length
  const usersWithoutSppg = users.filter(u => !u.sppgId).length
  const activeSppgs = sppgs.filter(s => s.status === 'ACTIVE').length

  console.log(`Total SPPG: ${sppgs.length}`)
  console.log(`Active SPPG: ${activeSppgs}`)
  console.log(`Users with SPPG: ${usersWithSppg}`)
  console.log(`Users without SPPG: ${usersWithoutSppg}`)
  console.log(`Total Distributions: ${distributionCount}`)

  console.log('\n\n💡 Recommendations:')
  console.log('='.repeat(60))
  
  if (sppgs.length === 0) {
    console.log('❌ No SPPG records found!')
    console.log('   Action: Run `npm run db:seed` to create SPPG data')
  }
  
  if (activeSppgs === 0 && sppgs.length > 0) {
    console.log('❌ No active SPPG found!')
    console.log('   Action: Update SPPG status to ACTIVE in database')
  }
  
  if (usersWithoutSppg > 0) {
    console.log(`⚠️  ${usersWithoutSppg} users have no SPPG association!`)
    console.log('   Action: Assign sppgId to users or run seed script')
  }
  
  if (distributionCount === 0) {
    console.log('⚠️  No distribution records found!')
    console.log('   Action: Run `npm run db:seed` to create sample data')
  }
  
  if (activeSppgs > 0 && usersWithSppg > 0 && distributionCount > 0) {
    console.log('✅ Database looks healthy!')
    console.log('   If you still see errors, check:')
    console.log('   1. User session - is the logged-in user in the database?')
    console.log('   2. Session sppgId - check browser DevTools > Application > Cookies')
    console.log('   3. Auth configuration - check @/auth config')
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
