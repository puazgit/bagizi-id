/**
 * @fileoverview Test Currency Formatting
 * @version Test formatCurrency utility
 */

import { formatCurrency } from '../src/lib/currency'

console.log('🧪 Testing Currency Formatting\n')
console.log('=' .repeat(80))

// Test cases for the bug
const testCases: Array<{
  value: number | null | undefined
  expected: string
  description: string
}> = [
  { value: 68.023, expected: 'Rp 68', description: 'Cost per portion (bug case)' },
  { value: 9464, expected: 'Rp 9.464', description: 'Ingredient cost' },
  { value: 10883.6, expected: 'Rp 10.884', description: 'Grand total (rounded up)' },
  { value: 1234567.89, expected: 'Rp 1.234.568', description: 'Large amount with decimals' },
  { value: 0.5, expected: 'Rp 1', description: 'Half rupiah (rounds up)' },
  { value: 0.4, expected: 'Rp 0', description: 'Less than half (rounds down)' },
  { value: 999.5, expected: 'Rp 1.000', description: 'Rounding edge case' },
  { value: 1000, expected: 'Rp 1.000', description: 'Exact thousand' },
  { value: null, expected: 'Rp 0', description: 'Null value' },
  { value: undefined, expected: 'Rp 0', description: 'Undefined value' },
]

console.log('Test Results:\n')

let passed = 0
let failed = 0

for (const test of testCases) {
  const result = formatCurrency(test.value)
  
  // Normalize both strings for comparison (remove special characters if any)
  const normalizedResult = result.replace(/\s/g, ' ')
  const normalizedExpected = test.expected.replace(/\s/g, ' ')
  
  const status = normalizedResult === normalizedExpected ? '✅ PASS' : '❌ FAIL'
  
  if (normalizedResult === normalizedExpected) {
    passed++
  } else {
    failed++
    console.log(`${status}: ${test.description}`)
    console.log(`  Input: ${test.value}`)
    console.log(`  Expected: "${normalizedExpected}" (${normalizedExpected.length} chars)`)
    console.log(`  Got: "${normalizedResult}" (${normalizedResult.length} chars)`)
    console.log(`  Bytes Expected:`, Buffer.from(normalizedExpected).toString('hex'))
    console.log(`  Bytes Got:`, Buffer.from(normalizedResult).toString('hex'))
    console.log()
  }
}

console.log('=' .repeat(80))
console.log(`\n📊 Summary: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`)

if (failed === 0) {
  console.log('✅ ALL TESTS PASSED!')
  console.log()
  console.log('💡 formatCurrency now correctly:')
  console.log('   - Rounds 68.023 to "Rp 68" (not "Rp 68.023")')
  console.log('   - Handles null/undefined gracefully')
  console.log('   - Uses Indonesian number format (dot as thousand separator)')
  console.log()
} else {
  console.log('❌ SOME TESTS FAILED - Please review the implementation')
  console.log()
  process.exit(1)
}
