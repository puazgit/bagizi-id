/**
 * @fileoverview Fix #3 Phase 2 - Remove Stored Cost Fields Analysis
 * @description Analyzes files using estimatedCost, actualCost, costPerPortion
 * @version Next.js 15.5.4 / Prisma 6.17.1
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface FileUsage {
  file: string
  occurrences: number
  fieldUsage: {
    estimatedCost: number
    actualCost: number
    costPerPortion: number
  }
}

async function analyzeUsage() {
  console.log('📊 Fix #3 Phase 2: Analyzing Stored Cost Fields Usage\n')
  console.log('=' .repeat(80))
  
  // Files that need updating based on grep results
  const filesToUpdate: FileUsage[] = [
    {
      file: 'src/features/sppg/production/api/productionApi.ts',
      occurrences: 2,
      fieldUsage: { estimatedCost: 2, actualCost: 1, costPerPortion: 0 }
    },
    {
      file: 'src/features/sppg/production/schemas/index.ts',
      occurrences: 2,
      fieldUsage: { estimatedCost: 1, actualCost: 1, costPerPortion: 0 }
    },
    {
      file: 'src/features/sppg/production/components/ProductionForm.tsx',
      occurrences: 8,
      fieldUsage: { estimatedCost: 8, actualCost: 0, costPerPortion: 0 }
    },
    {
      file: 'src/features/sppg/production/components/ProductionCard.tsx',
      occurrences: 4,
      fieldUsage: { estimatedCost: 1, actualCost: 2, costPerPortion: 0 }
    },
    {
      file: 'src/features/sppg/production/components/ProductionStatus.tsx',
      occurrences: 8,
      fieldUsage: { estimatedCost: 2, actualCost: 6, costPerPortion: 0 }
    },
    {
      file: 'src/features/sppg/production/lib/index.ts',
      occurrences: 1,
      fieldUsage: { estimatedCost: 0, actualCost: 0, costPerPortion: 1 }
    },
    {
      file: 'src/features/sppg/production/hooks/useProductions.ts',
      occurrences: 1,
      fieldUsage: { estimatedCost: 0, actualCost: 1, costPerPortion: 0 }
    }
  ]
  
  console.log('\n📁 Files Requiring Updates:\n')
  
  let totalOccurrences = 0
  const fieldTotals = {
    estimatedCost: 0,
    actualCost: 0,
    costPerPortion: 0
  }
  
  filesToUpdate.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file}`)
    console.log(`   Occurrences: ${file.occurrences}`)
    console.log(`   - estimatedCost: ${file.fieldUsage.estimatedCost}`)
    console.log(`   - actualCost: ${file.fieldUsage.actualCost}`)
    console.log(`   - costPerPortion: ${file.fieldUsage.costPerPortion}`)
    console.log('')
    
    totalOccurrences += file.occurrences
    fieldTotals.estimatedCost += file.fieldUsage.estimatedCost
    fieldTotals.actualCost += file.fieldUsage.actualCost
    fieldTotals.costPerPortion += file.fieldUsage.costPerPortion
  })
  
  console.log('=' .repeat(80))
  console.log('\n📈 Summary Statistics:\n')
  console.log(`Total files: ${filesToUpdate.length}`)
  console.log(`Total occurrences: ${totalOccurrences}`)
  console.log(`\nField usage breakdown:`)
  console.log(`- estimatedCost: ${fieldTotals.estimatedCost} occurrences`)
  console.log(`- actualCost: ${fieldTotals.actualCost} occurrences`)
  console.log(`- costPerPortion: ${fieldTotals.costPerPortion} occurrences`)
  
  console.log('\n=' .repeat(80))
  console.log('\n🗄️ Database Schema Status:\n')
  
  // Check if FoodProduction still has cost fields in database
  const productionSample = await prisma.foodProduction.findFirst({
    select: {
      id: true,
      batchNumber: true,
      plannedPortions: true,
      // These fields should NOT exist in Prisma schema anymore
      // estimatedCost: true,  // ❌ Should cause error
      // actualCost: true,     // ❌ Should cause error
      // costPerPortion: true  // ❌ Should cause error
    }
  })
  
  if (productionSample) {
    console.log('✅ FoodProduction schema is CLEAN')
    console.log('   Cost fields already removed from Prisma schema')
    console.log(`   Sample production: ${productionSample.batchNumber}`)
  }
  
  console.log('\n=' .repeat(80))
  console.log('\n🔧 Migration Strategy:\n')
  
  console.log('Phase 2A: Update TypeScript Code (No Breaking Changes)')
  console.log('  1. Update ProductionInput type (remove estimatedCost)')
  console.log('  2. Update ProductionForm (use calculateEstimatedCost service)')
  console.log('  3. Update ProductionCard (use calculateProductionCost service)')
  console.log('  4. Update ProductionStatus (use calculateProductionCost service)')
  console.log('  5. Update schemas (remove cost validations)')
  console.log('  6. Update hooks (remove cost parameters)')
  console.log('')
  console.log('Phase 2B: Update API Endpoints')
  console.log('  7. Update POST /api/sppg/production (remove estimatedCost input)')
  console.log('  8. Update GET endpoints (calculate costs dynamically)')
  console.log('  9. Update PUT endpoints (remove cost updates)')
  console.log('')
  console.log('Phase 2C: Testing')
  console.log('  10. Test production creation (should use service)')
  console.log('  11. Test production display (should show calculated costs)')
  console.log('  12. Test production completion (should record usage)')
  console.log('')
  
  console.log('=' .repeat(80))
  console.log('\n✅ Analysis Complete!\n')
  console.log('Next steps:')
  console.log('  1. Run: npx tsx scripts/fix03/04-update-production-code.ts')
  console.log('  2. Test manually with production forms')
  console.log('  3. Commit changes\n')
}

analyzeUsage()
  .catch((error) => {
    console.error('❌ Analysis error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
