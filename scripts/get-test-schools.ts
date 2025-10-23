#!/usr/bin/env tsx
/**
 * @fileoverview Get Existing Schools for Testing
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Quick helper to get existing school IDs and edit URLs for testing
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function getTestSchools() {
  try {
    console.log('\n📚 EXISTING SCHOOLS FOR TESTING')
    console.log('='.repeat(80))
    
    const schools = await db.schoolBeneficiary.findMany({
      take: 5,
      orderBy: { schoolName: 'asc' },
      select: {
        id: true,
        schoolName: true,
        schoolCode: true,
        totalStudents: true,
        targetStudents: true,
        activeStudents: true,
        students4to6Years: true,
        students7to12Years: true,
        students13to15Years: true,
        students16to18Years: true,
        isActive: true,
        programId: true,
        villageId: true,
        program: {
          select: {
            name: true,
            programCode: true
          }
        }
      }
    })
    
    if (schools.length === 0) {
      console.log('\n❌ No schools found in database!')
      console.log('   Run seed script first: npm run db:seed\n')
      return
    }
    
    schools.forEach((school, idx) => {
      console.log(`\n${idx + 1}. ${school.schoolName}`)
      console.log(`   ID: ${school.id}`)
      console.log(`   Code: ${school.schoolCode || 'N/A'}`)
      console.log(`   Program: ${school.program?.name} (${school.program?.programCode})`)
      console.log(`   Students: ${school.totalStudents} total, ${school.activeStudents} active`)
      console.log(`   Age breakdown: ${school.students4to6Years} + ${school.students7to12Years} + ${school.students13to15Years} + ${school.students16to18Years} = ${
        school.students4to6Years + school.students7to12Years + 
        school.students13to15Years + school.students16to18Years
      }`)
      
      // Check if age breakdown matches totalStudents
      const sum = school.students4to6Years + school.students7to12Years + 
                  school.students13to15Years + school.students16to18Years
      const isValid = sum === school.totalStudents
      
      console.log(`   Validation: ${isValid ? '✅ Age breakdown = totalStudents' : '❌ Age breakdown ≠ totalStudents'}`)
      console.log(`   Status: ${school.isActive ? '✅ Active' : '❌ Inactive'}`)
      console.log(`   \n   🔗 Edit URL: http://localhost:3000/school/${school.id}/edit`)
    })
    
    console.log('\n' + '='.repeat(80))
    console.log('\n📋 TESTING INSTRUCTIONS:\n')
    console.log('1. Start dev server: npm run dev')
    console.log('2. Open any Edit URL above in browser')
    console.log('3. Test scenarios:')
    console.log('   ✅ Program dropdown shows selected program')
    console.log('   ✅ Village dropdown shows selected village')
    console.log('   ✅ Age breakdown validation works')
    console.log('   ✅ activeStudents auto-calculation works')
    console.log('   ✅ Form can be saved successfully')
    console.log('\n4. Try breaking validation:')
    console.log('   - Change totalStudents but not age breakdown')
    console.log('   - Should see error: "Jumlah siswa per kelompok usia tidak sesuai"')
    console.log('\n5. Try auto-calculation:')
    console.log('   - Change totalStudents')
    console.log('   - activeStudents should auto-update to match')
    console.log('\n')
    
  } catch (error) {
    console.error('❌ Error fetching schools:', error)
  } finally {
    await db.$disconnect()
  }
}

getTestSchools()
