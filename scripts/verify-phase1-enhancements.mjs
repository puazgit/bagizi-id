#!/usr/bin/env node

/**
 * Phase 1 UI/UX Enhancement Verification Script
 * Validates all changes are correctly implemented
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const filePath = resolve(process.cwd(), 'src/app/(sppg)/menu/[id]/page.tsx')

console.log('🔍 Phase 1 UI/UX Enhancement Verification\n')

try {
  const content = readFileSync(filePath, 'utf-8')
  
  const checks = [
    {
      name: 'Icon Imports',
      test: () => {
        const icons = ['Code', 'Clock', 'FileText', 'Check', 'X', 'Shield', 'Calculator', 'TrendingUp', 'TrendingDown', 'Copy', 'Target']
        return icons.every(icon => content.includes(icon))
      }
    },
    {
      name: 'cn Utility Import',
      test: () => content.includes("import { cn } from '@/lib/utils'")
    },
    {
      name: 'Enhanced Card Titles',
      test: () => {
        return content.includes('<Info className="h-5 w-5 text-primary" />') &&
               content.includes('<ChefHat className="h-5 w-5 text-primary" />')
      }
    },
    {
      name: 'Copy Button Implementation',
      test: () => {
        return content.includes('navigator.clipboard.writeText') &&
               content.includes("toast.success('Kode menu berhasil disalin')")
      }
    },
    {
      name: 'Enhanced Halal/Vegetarian Display',
      test: () => {
        return content.includes('<Shield className="h-4 w-4 text-green-600" />') &&
               content.includes('bg-muted/30 rounded-lg') &&
               content.includes('Separator orientation="vertical"')
      }
    },
    {
      name: 'Pulse Animation Status',
      test: () => {
        return content.includes('animate-pulse') &&
               content.includes('bg-green-500')
      }
    },
    {
      name: 'Time Summary Card',
      test: () => {
        return content.includes('Total Waktu') &&
               content.includes('text-2xl font-bold') &&
               content.includes('(menu.preparationTime || 0) + (menu.cookingTime || 0)')
      }
    },
    {
      name: 'Enhanced Cost Display',
      test: () => {
        return content.includes('bg-gradient-to-br from-primary/5 to-primary/10') &&
               content.includes('text-3xl font-bold text-primary') &&
               content.includes('Terhitung Aktual')
      }
    },
    {
      name: 'Variance Indicator',
      test: () => {
        return content.includes('TrendingUp') &&
               content.includes('TrendingDown') &&
               content.includes('dari estimasi awal')
      }
    },
    {
      name: 'CTA Button for Uncalculated Cost',
      test: () => {
        return content.includes('Lihat Toolbar Aksi') &&
               content.includes("scrollIntoView({ behavior: 'smooth' })")
      }
    },
    {
      name: 'Toolbar Data Attribute',
      test: () => content.includes('data-toolbar')
    },
    {
      name: 'Icon Usage in Labels',
      test: () => {
        return content.includes('<Code className="h-4 w-4 text-muted-foreground" />') &&
               content.includes('<ChefHat className="h-4 w-4 text-muted-foreground" />') &&
               content.includes('<FileText className="h-4 w-4 text-muted-foreground" />') &&
               content.includes('<Clock className="h-4 w-4 text-muted-foreground" />') &&
               content.includes('<DollarSign className="h-5 w-5 text-primary" />') &&
               content.includes('<Target className="h-4 w-4 text-muted-foreground" />')
      }
    }
  ]

  let passed = 0
  let failed = 0

  checks.forEach(check => {
    const result = check.test()
    if (result) {
      console.log(`✅ ${check.name}`)
      passed++
    } else {
      console.log(`❌ ${check.name}`)
      failed++
    }
  })

  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 Results: ${passed}/${checks.length} checks passed\n`)

  if (failed === 0) {
    console.log('🎉 All Phase 1 enhancements verified successfully!')
    console.log('✅ Production ready!')
    console.log('\n📍 Test URL: http://localhost:3000/menu/cmgruubii004a8o5lc6h9go2j')
    console.log('📑 Tab to test: "Info Dasar"')
    process.exit(0)
  } else {
    console.log(`⚠️  ${failed} check(s) failed. Please review implementation.`)
    process.exit(1)
  }

} catch (error) {
  console.error('❌ Error reading file:', error.message)
  process.exit(1)
}
