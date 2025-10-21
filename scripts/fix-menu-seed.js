#!/usr/bin/env node
/**
 * Fix menu-seed.ts for Fix #1 Schema Changes
 * 
 * Changes needed:
 * 1. Remove `.id` after `findInventoryItem()`
 * 2. Remove `ingredientName` field
 * 3. Remove `unit` field  
 * 4. Remove `costPerUnit` field
 * 5. Remove `totalCost` field
 */

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../prisma/seeds/menu-seed.ts')

console.log('🔧 Fixing menu-seed.ts for Fix #1 schema changes...')

let content = fs.readFileSync(filePath, 'utf8')

// Count replacements for reporting
let replacements = {
  inventoryItemId: 0,
  ingredientName: 0,
  unit: 0,
  costPerUnit: 0,
  totalCost: 0
}

// 1. Fix inventoryItemId: Remove `.id` (CRITICAL!)
// Pattern: findInventoryItem('XXX-001')?.id -> findInventoryItem('XXX-001')
const inventoryIdRegex = /findInventoryItem\('([A-Z]{3}-\d{3})'\)\?\.id/g
const inventoryIdMatches = content.match(inventoryIdRegex)
if (inventoryIdMatches) {
  replacements.inventoryItemId = inventoryIdMatches.length
  content = content.replace(inventoryIdRegex, "findInventoryItem('$1')")
}

// 2. Remove ingredientName lines (with proper indentation and comma handling)
// Pattern: ingredientName: '...',
const ingredientNameRegex = /\s+ingredientName:\s*['"](.*?)['"],?\n/g
const ingredientNameMatches = content.match(ingredientNameRegex)
if (ingredientNameMatches) {
  replacements.ingredientName = ingredientNameMatches.length
  content = content.replace(ingredientNameRegex, '')
}

// 3. Remove unit lines
// Pattern: unit: '...',
const unitRegex = /\s+unit:\s*['"](.*?)['"],?\n/g
const unitMatches = content.match(unitRegex)
if (unitMatches) {
  replacements.unit = unitMatches.length
  content = content.replace(unitRegex, '')
}

// 4. Remove costPerUnit lines
// Pattern: costPerUnit: 123,
const costPerUnitRegex = /\s+costPerUnit:\s*\d+(\.\d+)?,?\n/g
const costPerUnitMatches = content.match(costPerUnitRegex)
if (costPerUnitMatches) {
  replacements.costPerUnit = costPerUnitMatches.length
  content = content.replace(costPerUnitRegex, '')
}

// 5. Remove totalCost lines
// Pattern: totalCost: 123,
const totalCostRegex = /\s+totalCost:\s*\d+(\.\d+)?,?\n/g
const totalCostMatches = content.match(totalCostRegex)
if (totalCostMatches) {
  replacements.totalCost = totalCostMatches.length
  content = content.replace(totalCostRegex, '')
}

// Write back
fs.writeFileSync(filePath, content, 'utf8')

console.log('\n✅ Fixes applied successfully!\n')
console.log('📊 Replacement Summary:')
console.log(`   - inventoryItemId fixes: ${replacements.inventoryItemId}`)
console.log(`   - ingredientName removed: ${replacements.ingredientName}`)
console.log(`   - unit removed: ${replacements.unit}`)
console.log(`   - costPerUnit removed: ${replacements.costPerUnit}`)
console.log(`   - totalCost removed: ${replacements.totalCost}`)
console.log(`\n   TOTAL: ${Object.values(replacements).reduce((a,b) => a+b, 0)} fixes\n`)

console.log('✅ menu-seed.ts is now compatible with Fix #1 schema!')
