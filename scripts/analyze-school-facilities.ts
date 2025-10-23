/**
 * School Facilities Field Analysis Script
 * 
 * Purpose: Analyze how facilities fields are being used in the database
 * to determine if additional documentation or UI improvements are needed.
 * 
 * Fields analyzed:
 * - hasKitchen: Boolean
 * - hasStorage: Boolean
 * - storageCapacity: String (optional)
 * - hasCleanWater: Boolean
 * - hasElectricity: Boolean
 * - servingMethod: Enum (CAFETERIA, CLASSROOM, TAKEAWAY, OTHER)
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🔍 SCHOOL FACILITIES FIELD ANALYSIS\n')

  const schools = await db.schoolBeneficiary.findMany({
    where: { isActive: true },
    select: {
      id: true,
      schoolName: true,
      hasKitchen: true,
      hasStorage: true,
      storageCapacity: true,
      hasCleanWater: true,
      hasElectricity: true,
      servingMethod: true
    }
  })

  console.log(`📊 Total Schools: ${schools.length}\n`)

  schools.forEach((school, index) => {
    console.log(`${index + 1}. ${school.schoolName}`)
    console.log(`   - Has Kitchen: ${school.hasKitchen ? '✅' : '❌'}`)
    console.log(`   - Has Storage: ${school.hasStorage ? '✅' : '❌'}`)
    console.log(`   - Storage Capacity: ${school.storageCapacity || '(tidak diisi)'}`)
    console.log(`   - Has Clean Water: ${school.hasCleanWater ? '✅' : '❌'}`)
    console.log(`   - Has Electricity: ${school.hasElectricity ? '✅' : '❌'}`)
    console.log(`   - Serving Method: ${school.servingMethod}\n`)
  })

  // Statistics
  const stats = {
    hasKitchen: schools.filter(s => s.hasKitchen).length,
    hasStorage: schools.filter(s => s.hasStorage).length,
    hasStorageCapacity: schools.filter(s => s.storageCapacity).length,
    hasCleanWater: schools.filter(s => s.hasCleanWater).length,
    hasElectricity: schools.filter(s => s.hasElectricity).length,
    servingMethods: {
      CAFETERIA: schools.filter(s => s.servingMethod === 'CAFETERIA').length,
      CLASSROOM: schools.filter(s => s.servingMethod === 'CLASSROOM').length,
      TAKEAWAY: schools.filter(s => s.servingMethod === 'TAKEAWAY').length,
      OTHER: schools.filter(s => s.servingMethod === 'OTHER').length,
    }
  }

  console.log('📈 FACILITIES STATISTICS:')
  console.log(`   Kitchen: ${stats.hasKitchen}/${schools.length} (${((stats.hasKitchen/schools.length)*100).toFixed(0)}%)`)
  console.log(`   Storage: ${stats.hasStorage}/${schools.length} (${((stats.hasStorage/schools.length)*100).toFixed(0)}%)`)
  console.log(`   Storage Capacity Filled: ${stats.hasStorageCapacity}/${schools.length} (${((stats.hasStorageCapacity/schools.length)*100).toFixed(0)}%)`)
  console.log(`   Clean Water: ${stats.hasCleanWater}/${schools.length} (${((stats.hasCleanWater/schools.length)*100).toFixed(0)}%)`)
  console.log(`   Electricity: ${stats.hasElectricity}/${schools.length} (${((stats.hasElectricity/schools.length)*100).toFixed(0)}%)`)
  console.log(`\n   Serving Methods:`)
  console.log(`     - Cafeteria: ${stats.servingMethods.CAFETERIA}`)
  console.log(`     - Classroom: ${stats.servingMethods.CLASSROOM}`)
  console.log(`     - Takeaway: ${stats.servingMethods.TAKEAWAY}`)
  console.log(`     - Other: ${stats.servingMethods.OTHER}`)

  // Analysis & Recommendations
  console.log('\n🔎 ANALYSIS:')
  
  if (stats.hasStorageCapacity < schools.length * 0.5) {
    console.log(`   ⚠️  Storage Capacity is only filled in ${((stats.hasStorageCapacity/schools.length)*100).toFixed(0)}% of schools`)
    console.log(`       → Consider adding examples/tooltips to clarify what to enter`)
  }

  if (stats.hasKitchen < schools.length * 0.8) {
    console.log(`   ⚠️  Only ${((stats.hasKitchen/schools.length)*100).toFixed(0)}% schools have kitchen`)
    console.log(`       → This might impact food preparation capabilities`)
  }

  if (stats.hasStorage < schools.length * 0.8) {
    console.log(`   ⚠️  Only ${((stats.hasStorage/schools.length)*100).toFixed(0)}% schools have storage`)
    console.log(`       → This might impact food storage and distribution planning`)
  }

  if (stats.hasCleanWater < schools.length) {
    console.log(`   ⚠️  Not all schools have clean water access`)
    console.log(`       → Critical for food safety and hygiene`)
  }

  if (stats.hasElectricity < schools.length) {
    console.log(`   ⚠️  Not all schools have electricity`)
    console.log(`       → Might affect refrigeration and food storage`)
  }

  console.log('\n✅ SCRIPT COMPLETED')

  await db.$disconnect()
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
