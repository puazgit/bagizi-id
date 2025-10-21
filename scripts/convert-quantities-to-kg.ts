/**
 * Convert MenuIngredient quantities from gram to kg in seed file
 * This fixes the unit mismatch issue where:
 * - InventoryItem.unit = "kg"
 * - InventoryItem.costPerUnit = price per kg
 * - MenuIngredient.quantity was in grams, causing calculations to be 1000x too high
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const seedFilePath = join(process.cwd(), 'prisma/seeds/menu-seed.ts')

console.log('🔄 Converting MenuIngredient quantities from gram to kg...\n')

try {
  // Read file
  let content = readFileSync(seedFilePath, 'utf-8')
  
  // Pattern: quantity: NUMBER, (with optional comment)
  // We need to convert the number from grams to kg (divide by 1000)
  const quantityPattern = /quantity:\s*(\d+(?:\.\d+)?),(\s*\/\/.*)?/g
  
  let matchCount = 0
  let totalMatches = 0
  
  content = content.replace(quantityPattern, (match, quantity, comment) => {
    totalMatches++
    const gramValue = parseFloat(quantity)
    const kgValue = gramValue / 1000
    
    // Format to 3 decimal places, removing trailing zeros
    const formattedKg = parseFloat(kgValue.toFixed(3))
    
    matchCount++
    
    // Keep the comment if it exists, otherwise add " // was Xg"
    const newComment = comment ? comment : ` // was ${gramValue}g`
    
    return `quantity: ${formattedKg},${newComment}`
  })
  
  console.log(`✅ Converted ${matchCount} quantity values`)
  console.log(`📊 Total matches found: ${totalMatches}\n`)
  
  // Write back to file
  writeFileSync(seedFilePath, content, 'utf-8')
  
  console.log('✅ File updated successfully!')
  console.log(`📁 File: ${seedFilePath}`)
  console.log('\n📝 Example conversions:')
  console.log('   80g → 0.08 kg')
  console.log('   100g → 0.1 kg')
  console.log('   50g → 0.05 kg')
  console.log('   30g → 0.03 kg')
  console.log('   25g → 0.025 kg')
  console.log('   20g → 0.02 kg')
  console.log('   15g → 0.015 kg')
  console.log('   10g → 0.01 kg')
  console.log('   5g → 0.005 kg')
  console.log('   3g → 0.003 kg')
  console.log('   2g → 0.002 kg')
  console.log('   1g → 0.001 kg')
  
  console.log('\n⚠️  IMPORTANT: Run database migration to apply changes:')
  console.log('   1. npm run db:reset')
  console.log('   2. Check calculations again with debug script')
  
} catch (error) {
  console.error('❌ Error converting quantities:', error)
  process.exit(1)
}
