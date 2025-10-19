/**
 * Quick Check: SPPG Status for specific ID
 * Run: npx tsx scripts/check-sppg-status.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sppgId = 'cmgxc3m7a00088orehfqi4cfo' // From middleware log

  console.log(`🔍 Checking SPPG: ${sppgId}\n`)
  
  // Check if SPPG exists (any status)
  const sppgAny = await prisma.sPPG.findUnique({
    where: { id: sppgId }
  })

  if (!sppgAny) {
    console.log('❌ SPPG NOT FOUND IN DATABASE!')
    console.log('   The SPPG ID does not exist.')
    console.log('   Action: Run `npm run db:seed` or check if database was reset')
    return
  }

  console.log('✅ SPPG Found:')
  console.log(`   Name: ${sppgAny.name}`)
  console.log(`   Code: ${sppgAny.code}`)
  console.log(`   Status: ${sppgAny.status}`)
  console.log(`   Created: ${sppgAny.createdAt}`)
  
  if (sppgAny.status !== 'ACTIVE') {
    console.log(`\n⚠️  PROBLEM FOUND:`)
    console.log(`   SPPG status is "${sppgAny.status}", not "ACTIVE"`)
    console.log(`   checkSppgAccess() requires status = "ACTIVE"`)
    console.log(`\n💡 SOLUTION:`)
    console.log(`   Update SPPG status to ACTIVE:`)
    console.log(`   npx prisma studio`)
    console.log(`   Or run SQL:`)
    console.log(`   UPDATE "sppg" SET "status" = 'ACTIVE' WHERE "id" = '${sppgId}';`)
    
    // Auto-fix
    console.log(`\n🔧 Auto-fixing...`)
    await prisma.sPPG.update({
      where: { id: sppgId },
      data: { status: 'ACTIVE' }
    })
    console.log(`✅ SPPG status updated to ACTIVE!`)
    console.log(`   Refresh your browser to see the fix.`)
  } else {
    console.log(`\n✅ SPPG status is ACTIVE - no issues found`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
