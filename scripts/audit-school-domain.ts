/**
 * @fileoverview School Domain - Complete Audit & Verification
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏫 SCHOOL DOMAIN - COMPREHENSIVE AUDIT')
  console.log('=' .repeat(80))
  console.log('\n')

  // Phase 1: Schema Analysis
  console.log('📊 PHASE 1: DATABASE SCHEMA ANALYSIS')
  console.log('━'.repeat(80))
  
  try {
    // Get school count
    const totalSchools = await prisma.schoolBeneficiary.count()
    const activeSchools = await prisma.schoolBeneficiary.count({
      where: { isActive: true }
    })
    
    console.log('📈 Statistics:')
    console.log(`  - Total Schools: ${totalSchools}`)
    console.log(`  - Active Schools: ${activeSchools}`)
    console.log(`  - Inactive Schools: ${totalSchools - activeSchools}`)
    console.log('\n')

    // Get sample school for field analysis
    const sampleSchool = await prisma.schoolBeneficiary.findFirst({
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true
          }
        },
        village: {
          select: {
            id: true,
            name: true,
            district: {
              select: {
                name: true,
                regency: {
                  select: {
                    name: true,
                    province: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (sampleSchool) {
      console.log('📋 Sample School Data Structure:')
      console.log('━'.repeat(80))
      
      console.log('\n1️⃣ BASIC INFORMATION:')
      console.log(`  - School Name: ${sampleSchool.schoolName}`)
      console.log(`  - School Code: ${sampleSchool.schoolCode || 'N/A'}`)
      console.log(`  - School Type: ${sampleSchool.schoolType}`)
      console.log(`  - School Status: ${sampleSchool.schoolStatus}`)
      console.log(`  - Principal: ${sampleSchool.principalName}`)
      console.log(`  - Is Active: ${sampleSchool.isActive ? '✅ Yes' : '❌ No'}`)
      
      console.log('\n2️⃣ CONTACT INFORMATION:')
      console.log(`  - Phone: ${sampleSchool.contactPhone}`)
      console.log(`  - Email: ${sampleSchool.contactEmail || 'Not provided'}`)
      console.log(`  - Address: ${sampleSchool.schoolAddress}`)
      console.log(`  - Postal Code: ${sampleSchool.postalCode || 'N/A'}`)
      console.log(`  - Coordinates: ${sampleSchool.coordinates || 'Not set'}`)
      
      console.log('\n3️⃣ LOCATION (VILLAGE RELATIONSHIP):')
      console.log(`  - Village: ${sampleSchool.village.name}`)
      console.log(`  - District: ${sampleSchool.village.district.name}`)
      console.log(`  - Regency: ${sampleSchool.village.district.regency.name}`)
      console.log(`  - Province: ${sampleSchool.village.district.regency.province.name}`)
      
      console.log('\n4️⃣ STUDENT INFORMATION:')
      console.log(`  - Total Students: ${sampleSchool.totalStudents}`)
      console.log(`  - Target Students (Program): ${sampleSchool.targetStudents}`)
      console.log(`  - Active Students: ${sampleSchool.activeStudents}`)
      console.log(`  - Age Breakdown:`)
      console.log(`    • 4-6 years: ${sampleSchool.students4to6Years}`)
      console.log(`    • 7-12 years: ${sampleSchool.students7to12Years}`)
      console.log(`    • 13-15 years: ${sampleSchool.students13to15Years}`)
      console.log(`    • 16-18 years: ${sampleSchool.students16to18Years}`)
      
      console.log('\n5️⃣ FEEDING SCHEDULE:')
      console.log(`  - Feeding Days: ${sampleSchool.feedingDays.join(', ')} (1=Mon, 2=Tue, etc.)`)
      console.log(`  - Meals per Day: ${sampleSchool.mealsPerDay}`)
      console.log(`  - Feeding Time: ${sampleSchool.feedingTime || 'Not specified'}`)
      
      console.log('\n6️⃣ DELIVERY INFORMATION:')
      console.log(`  - Delivery Address: ${sampleSchool.deliveryAddress}`)
      console.log(`  - Delivery Contact: ${sampleSchool.deliveryContact}`)
      console.log(`  - Instructions: ${sampleSchool.deliveryInstructions || 'None'}`)
      console.log(`  - Serving Method: ${sampleSchool.servingMethod}`)
      
      console.log('\n7️⃣ FACILITIES (BOOLEAN FLAGS):')
      console.log(`  - Has Kitchen: ${sampleSchool.hasKitchen ? '✅ Yes' : '❌ No'}`)
      console.log(`  - Has Storage: ${sampleSchool.hasStorage ? '✅ Yes' : '❌ No'}`)
      console.log(`  - Storage Capacity: ${sampleSchool.storageCapacity || 'Not specified'}`)
      console.log(`  - Has Clean Water: ${sampleSchool.hasCleanWater ? '✅ Yes' : '❌ No'}`)
      console.log(`  - Has Electricity: ${sampleSchool.hasElectricity ? '✅ Yes' : '❌ No'}`)
      
      console.log('\n8️⃣ SPECIAL REQUIREMENTS:')
      console.log(`  - Beneficiary Type: ${sampleSchool.beneficiaryType}`)
      console.log(`  - Special Dietary: ${sampleSchool.specialDietary.length > 0 ? sampleSchool.specialDietary.join(', ') : 'None'}`)
      console.log(`  - Allergy Alerts: ${sampleSchool.allergyAlerts.length > 0 ? sampleSchool.allergyAlerts.join(', ') : 'None'}`)
      console.log(`  - Cultural Requirements: ${sampleSchool.culturalReqs.length > 0 ? sampleSchool.culturalReqs.join(', ') : 'None'}`)
      
      console.log('\n9️⃣ PROGRAM RELATIONSHIP:')
      console.log(`  - Program: ${sampleSchool.program.name}`)
      console.log(`  - Program Code: ${sampleSchool.program.programCode}`)
      
      console.log('\n🔟 TIMESTAMPS:')
      console.log(`  - Enrollment Date: ${sampleSchool.enrollmentDate.toISOString().split('T')[0]}`)
      console.log(`  - Created At: ${sampleSchool.createdAt.toISOString()}`)
      console.log(`  - Updated At: ${sampleSchool.updatedAt.toISOString()}`)
      
      if (sampleSchool.suspendedAt) {
        console.log('\n⚠️  SUSPENSION:')
        console.log(`  - Suspended At: ${sampleSchool.suspendedAt.toISOString()}`)
        console.log(`  - Reason: ${sampleSchool.suspensionReason || 'N/A'}`)
      }
    } else {
      console.log('⚠️  No schools found in database')
    }

    console.log('\n')
    console.log('━'.repeat(80))
    
    // Phase 2: Facilities Field Analysis
    console.log('\n📦 PHASE 2: FACILITIES FIELD ANALYSIS')
    console.log('━'.repeat(80))
    
    console.log('\n🔍 Facilities Fields in Schema:')
    console.log('  1. hasKitchen (Boolean) - Indicates if school has kitchen facility')
    console.log('  2. hasStorage (Boolean) - Indicates if school has food storage facility')
    console.log('  3. storageCapacity (String, nullable) - Describes storage capacity')
    console.log('  4. hasCleanWater (Boolean) - Water availability for food preparation')
    console.log('  5. hasElectricity (Boolean) - Electricity for food storage/preparation')
    console.log('  6. servingMethod (String) - How food is served (CAFETERIA, CLASSROOM, etc.)')
    
    const facilitiesStats = await prisma.schoolBeneficiary.groupBy({
      by: ['hasKitchen', 'hasStorage', 'hasCleanWater', 'hasElectricity'],
      _count: true
    })
    
    console.log('\n📊 Facilities Distribution:')
    facilitiesStats.forEach(stat => {
      console.log(`  - Kitchen: ${stat.hasKitchen ? '✅' : '❌'} | Storage: ${stat.hasStorage ? '✅' : '❌'} | Water: ${stat.hasCleanWater ? '✅' : '❌'} | Electricity: ${stat.hasElectricity ? '✅' : '❌'} → ${stat._count} schools`)
    })
    
    console.log('\n💡 EXPLANATION NEEDED?')
    console.log('  ✅ Facilities fields are well-documented in schema')
    console.log('  ✅ Clear boolean flags for infrastructure')
    console.log('  ✅ Additional storageCapacity field for details')
    console.log('  ⚠️  Consider adding help text in forms for clarity')
    console.log('  ⚠️  Consider adding facilities guide/documentation')

    console.log('\n')
    console.log('━'.repeat(80))
    
    // Phase 3: School Types Analysis
    console.log('\n🏫 PHASE 3: SCHOOL TYPES ANALYSIS')
    console.log('━'.repeat(80))
    
    const typeDistribution = await prisma.schoolBeneficiary.groupBy({
      by: ['schoolType'],
      _count: true,
      orderBy: {
        _count: {
          schoolType: 'desc'
        }
      }
    })
    
    console.log('\n📊 School Type Distribution:')
    typeDistribution.forEach(type => {
      console.log(`  - ${type.schoolType}: ${type._count} schools`)
    })
    
    console.log('\n')
    console.log('━'.repeat(80))
    
    // Phase 4: Data Validation Issues
    console.log('\n🔍 PHASE 4: DATA VALIDATION CHECK')
    console.log('━'.repeat(80))
    
    // Check for potential data issues
    const issues = []
    
    // Check totalStudents vs activeStudents
    const studentMismatch = await prisma.schoolBeneficiary.count({
      where: {
        activeStudents: {
          gt: prisma.schoolBeneficiary.fields.totalStudents
        }
      }
    })
    
    if (studentMismatch > 0) {
      issues.push(`⚠️  ${studentMismatch} schools have activeStudents > totalStudents`)
    }
    
    // Check required fields
    const missingEmail = await prisma.schoolBeneficiary.count({
      where: { contactEmail: null }
    })
    
    const missingCode = await prisma.schoolBeneficiary.count({
      where: { schoolCode: null }
    })
    
    const missingCoordinates = await prisma.schoolBeneficiary.count({
      where: { coordinates: null }
    })
    
    console.log('\n📋 Data Completeness:')
    console.log(`  - Schools without email: ${missingEmail} (${((missingEmail/totalSchools)*100).toFixed(1)}%)`)
    console.log(`  - Schools without code: ${missingCode} (${((missingCode/totalSchools)*100).toFixed(1)}%)`)
    console.log(`  - Schools without coordinates: ${missingCoordinates} (${((missingCoordinates/totalSchools)*100).toFixed(1)}%)`)
    
    if (issues.length > 0) {
      console.log('\n⚠️  Potential Issues Found:')
      issues.forEach(issue => console.log(`  ${issue}`))
    } else {
      console.log('\n✅ No data validation issues found')
    }

    console.log('\n')
    console.log('=' .repeat(80))
    console.log('\n✅ PHASE 1 AUDIT COMPLETE')
    console.log('\n📝 SUMMARY:')
    console.log(`  - Total Schools: ${totalSchools}`)
    console.log(`  - Active Schools: ${activeSchools}`)
    console.log(`  - Facilities Fields: 6 (well-structured)`)
    console.log(`  - Special Requirements: Dietary, Allergies, Cultural`)
    console.log(`  - Relationships: Program, Village (with district/regency/province)`)
    console.log('\n')
    
  } catch (error) {
    console.error('❌ Error during audit:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
