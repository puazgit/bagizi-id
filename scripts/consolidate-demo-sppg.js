#!/usr/bin/env node
/**
 * Consolidate all seeds to use DEMO SPPG instead of SPPG-PWK-001
 * 
 * This ensures all seed data is created for the Demo SPPG which has:
 * - Complete inventory items (64 items)
 * - All necessary master data
 * - Demo user accounts for testing
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Consolidating all seeds to DEMO SPPG...\n')

// Find all seed files
const seedsDir = path.join(__dirname, '../prisma/seeds')
const seedFiles = [
  'vehicle-seed.ts',
  'user-seed.ts',
  'distribution-seed.ts',
  'menu-planning-seed.ts',
  'production-seed.ts',
  'procurement-seed.ts'
]

let totalReplacements = 0

seedFiles.forEach(filename => {
  const filePath = path.join(seedsDir, filename)
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filename} (not found)`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let fileReplacements = 0

  // Replace SPPG-PWK-001 with DEMO-SPPG-001
  const regex = /SPPG-PWK-001/g
  const matches = content.match(regex)
  
  if (matches) {
    fileReplacements = matches.length
    totalReplacements += fileReplacements
    content = content.replace(regex, 'DEMO-SPPG-001')
    
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ ${filename}: ${fileReplacements} replacement(s)`)
  } else {
    console.log(`⏭️  ${filename}: No changes needed`)
  }
})

console.log(`\n✅ Consolidation complete!`)
console.log(`📊 Total replacements: ${totalReplacements}`)
console.log(`\n🎯 All seeds now use DEMO SPPG (DEMO-SPPG-001) with complete data!\n`)
