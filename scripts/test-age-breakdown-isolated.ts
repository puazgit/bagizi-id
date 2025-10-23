/**
 * Isolated Test for Age Breakdown Validation
 * 
 * This tests ONLY the .refine() validation logic
 * To see if our Fix 1 is working independent of form UI
 */

import { schoolMasterSchema } from '../src/features/sppg/school/schemas/schoolSchema'

console.log('🧪 ISOLATED TEST: Age Breakdown Validation Only\n')

// Valid minimal data (all required fields filled)
const validBaseData = {
  programId: 'cm123456789012345678',
  schoolName: 'SD Test',
  schoolCode: '20230101',
  schoolType: 'SD' as const,
  schoolStatus: 'ACTIVE' as const,
  principalName: 'Principal Test',
  contactPhone: '08123456789',
  contactEmail: 'test@test.com',
  schoolAddress: 'Jl. Test No. 123, Kota Test',
  villageId: 'cm123456789012345678',
  postalCode: '12345',
  coordinates: null,
  totalStudents: 100,
  targetStudents: 105,
  activeStudents: 95,
  students4to6Years: 20,
  students7to12Years: 50,
  students13to15Years: 20,
  students16to18Years: 10,
  feedingDays: [1, 2, 3, 4, 5],
  mealsPerDay: 1,
  feedingTime: '12:00',
  deliveryAddress: 'Jl. Delivery No. 456',
  deliveryContact: '08987654321',
  deliveryInstructions: null,
  storageCapacity: null,
  servingMethod: 'CAFETERIA' as const,
  hasKitchen: true,
  hasStorage: true,
  hasCleanWater: true,
  hasElectricity: true,
  isActive: true,
  suspendedAt: null,
  suspensionReason: null,
  beneficiaryType: 'CHILD' as const,
  specialDietary: [],
  allergyAlerts: [],
  culturalReqs: [],
}

console.log('✅ TEST 1: Valid data (age sum = totalStudents)')
console.log('   totalStudents: 100')
console.log('   Age breakdown: 20 + 50 + 20 + 10 = 100')
try {
  const result = schoolMasterSchema.parse(validBaseData)
  console.log('   ✅ PASS - Validation accepted\n')
} catch (error: any) {
  console.log('   ❌ FAIL - Should have passed')
  console.log('   Errors:', error.errors)
  console.log()
}

console.log('❌ TEST 2: Invalid data (age sum ≠ totalStudents)')
console.log('   totalStudents: 100')
console.log('   Age breakdown: 0 + 0 + 0 + 0 = 0')
try {
  const result = schoolMasterSchema.parse({
    ...validBaseData,
    students4to6Years: 0,
    students7to12Years: 0,
    students13to15Years: 0,
    students16to18Years: 0,
  })
  console.log('   ❌ FAIL - Should have been rejected')
  console.log()
} catch (error: any) {
  console.log('   ✅ PASS - Validation rejected')
  console.log('   Error message:', error.errors?.[0]?.message)
  console.log('   Error path:', error.errors?.[0]?.path)
  console.log()
}

console.log('❌ TEST 3: Invalid data (age sum < totalStudents)')
console.log('   totalStudents: 100')
console.log('   Age breakdown: 10 + 20 + 15 + 5 = 50')
try {
  const result = schoolMasterSchema.parse({
    ...validBaseData,
    students4to6Years: 10,
    students7to12Years: 20,
    students13to15Years: 15,
    students16to18Years: 5,
  })
  console.log('   ❌ FAIL - Should have been rejected')
  console.log()
} catch (error: any) {
  console.log('   ✅ PASS - Validation rejected')
  console.log('   Error message:', error.errors?.[0]?.message)
  console.log('   Error path:', error.errors?.[0]?.path)
  console.log()
}

console.log('❌ TEST 4: Invalid data (activeStudents = 0)')
console.log('   totalStudents: 100')
console.log('   activeStudents: 0')
console.log('   Age breakdown: 20 + 50 + 20 + 10 = 100 (correct)')
try {
  const result = schoolMasterSchema.parse({
    ...validBaseData,
    activeStudents: 0,
  })
  console.log('   ❌ FAIL - Should have been rejected')
  console.log()
} catch (error: any) {
  console.log('   ✅ PASS - Validation rejected')
  console.log('   Error message:', error.errors?.[0]?.message)
  console.log('   Error path:', error.errors?.[0]?.path)
  console.log()
}

console.log('=' + '='.repeat(60))
console.log('📊 CONCLUSION:\n')
console.log('If all tests PASS, then .refine() validation is working correctly.')
console.log('The issue is with form UI not showing the error messages.')
console.log('=' + '='.repeat(60))
