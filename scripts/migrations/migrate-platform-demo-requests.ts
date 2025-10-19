/**
 * Data Migration Script: PlatformDemoRequest → Enhanced DemoRequest
 * 
 * This script migrates all data from PlatformDemoRequest to the enhanced DemoRequest model.
 * It maps fields appropriately and handles enum conversions.
 * 
 * @usage tsx prisma/migrations/migrate-platform-demo-requests.ts
 * @author Bagizi-ID Development Team
 * @date 2025-10-18
 */

import { PrismaClient, DemoType, DemoRequestStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Enum mapping helpers
function mapDemoType(platformDemoType: string): DemoType {
  const mapping: Record<string, DemoType> = {
    'STANDARD': 'STANDARD',
    'CUSTOM': 'GUIDED', // Map CUSTOM to GUIDED
    'EXTENDED': 'EXTENDED',
  }
  return mapping[platformDemoType] || 'STANDARD'
}

function mapStatus(platformStatus: string): DemoRequestStatus {
  const mapping: Record<string, DemoRequestStatus> = {
    'REQUESTED': 'SUBMITTED',
    'SCHEDULED': 'APPROVED',
    'COMPLETED': 'APPROVED', // Mark as approved if completed
    'CANCELLED': 'REJECTED',
    'CONVERTED': 'SUBMITTED', // Will set isConverted flag
  }
  return mapping[platformStatus] || 'SUBMITTED'
}

async function migratePlatformDemoRequests() {
  console.log('🔄 Starting PlatformDemoRequest → DemoRequest migration...\n')
  
  try {
    // Get all PlatformDemoRequest records
    const platformDemos = await prisma.platformDemoRequest.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`📊 Found ${platformDemos.length} PlatformDemoRequest records to migrate\n`)
    
    if (platformDemos.length === 0) {
      console.log('✅ No records to migrate. Exiting...')
      return { migratedCount: 0, errorCount: 0, skippedCount: 0 }
    }
    
    let migratedCount = 0
    let errorCount = 0
    let skippedCount = 0
    const errors: Array<{ id: string; email: string; error: string }> = []
    
    for (const platformDemo of platformDemos) {
      try {
        // Check if already migrated (by email and createdAt)
        const existing = await prisma.demoRequest.findFirst({
          where: {
            picEmail: platformDemo.email,
            createdAt: platformDemo.createdAt
          }
        })
        
        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${platformDemo.email}`)
          skippedCount++
          continue
        }
        
        // Determine if converted
        const isConverted = platformDemo.status === 'CONVERTED' || platformDemo.isConverted
        
        // Create enhanced DemoRequest
        await prisma.demoRequest.create({
          data: {
            // ===== REQUESTER INFORMATION =====
            firstName: platformDemo.firstName,
            lastName: platformDemo.lastName,
            picName: `${platformDemo.firstName} ${platformDemo.lastName}`,
            picEmail: platformDemo.email,
            picPhone: platformDemo.phone,
            picPosition: platformDemo.position,
            
            // ===== ORGANIZATION DETAILS =====
            organizationName: platformDemo.company || 'Unknown Organization',
            organizationType: 'YAYASAN', // Default
            targetBeneficiaries: null,
            operationalArea: null,
            currentSystem: null,
            currentChallenges: [],
            expectedGoals: [],
            
            // ===== DEMO CONFIGURATION =====
            demoType: mapDemoType(platformDemo.demoType),
            requestedFeatures: platformDemo.interestedFeatures,
            specialRequirements: null,
            requestMessage: platformDemo.requestMessage,
            
            // ===== SCHEDULING =====
            preferredStartDate: platformDemo.preferredDate,
            preferredTime: platformDemo.preferredTime || 'MORNING',
            timezone: platformDemo.timezone,
            estimatedDuration: 14, // Default 14 days
            demoDuration: platformDemo.demoDuration,
            demoMode: platformDemo.demoMode,
            
            // ===== STATUS MANAGEMENT =====
            status: mapStatus(platformDemo.status),
            reviewedAt: null,
            reviewedBy: null,
            approvedAt: platformDemo.scheduledDate ? platformDemo.scheduledDate : null,
            rejectedAt: platformDemo.status === 'CANCELLED' ? platformDemo.updatedAt : null,
            rejectionReason: null,
            
            // ===== SCHEDULING & ASSIGNMENT =====
            scheduledDate: platformDemo.scheduledDate,
            actualDate: platformDemo.actualDate,
            assignedTo: platformDemo.assignedTo,
            assignedAt: platformDemo.assignedAt,
            
            // ===== DEMO ACCOUNT CREATION =====
            demoSppgId: platformDemo.sppgId,
            demoCreatedAt: null,
            demoExpiresAt: null,
            
            // ===== DEMO EXECUTION & FEEDBACK =====
            attendanceStatus: platformDemo.attendanceStatus,
            feedbackScore: platformDemo.feedbackScore,
            feedback: platformDemo.feedback,
            nextSteps: platformDemo.nextSteps,
            
            // ===== CONVERSION TRACKING =====
            isConverted: isConverted,
            convertedAt: platformDemo.convertedAt,
            convertedSppgId: isConverted ? platformDemo.sppgId : null,
            conversionProbability: platformDemo.conversionProbability,
            
            // ===== FOLLOW-UP & COMMUNICATION =====
            followUpRequired: platformDemo.followUpRequired,
            followUpDate: platformDemo.followUpDate,
            lastContactAt: platformDemo.lastContactDate,
            emailsSent: platformDemo.emailsSent,
            callsMade: platformDemo.callsMade,
            notes: `Migrated from PlatformDemoRequest. Original feedback: ${platformDemo.feedback || 'N/A'}`,
            
            // ===== TIMESTAMPS =====
            createdAt: platformDemo.createdAt,
            updatedAt: platformDemo.updatedAt
          }
        })
        
        migratedCount++
        
        if (migratedCount % 10 === 0) {
          console.log(`✅ Progress: ${migratedCount}/${platformDemos.length} migrated`)
        }
        
      } catch (error) {
        errorCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({
          id: platformDemo.id,
          email: platformDemo.email,
          error: errorMessage
        })
        console.error(`❌ Error migrating ${platformDemo.email}:`, errorMessage)
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully migrated: ${migratedCount}`)
    console.log(`⏭️  Skipped (duplicates):  ${skippedCount}`)
    console.log(`❌ Errors:               ${errorCount}`)
    console.log(`📝 Total records:        ${platformDemos.length}`)
    
    if (migratedCount + skippedCount > 0) {
      const successRate = ((migratedCount + skippedCount) / platformDemos.length * 100).toFixed(2)
      console.log(`📈 Success rate:         ${successRate}%`)
    }
    
    // Print errors if any
    if (errors.length > 0) {
      console.log('\n' + '='.repeat(60))
      console.log('❌ ERRORS DETAIL')
      console.log('='.repeat(60))
      errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.email} (ID: ${err.id})`)
        console.log(`   Error: ${err.error}\n`)
      })
    }
    
    console.log('\n' + '='.repeat(60))
    
    return { migratedCount, errorCount, skippedCount }
    
  } catch (error) {
    console.error('❌ FATAL ERROR during migration:', error)
    throw error
  }
}

// Verification function
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n')
  
  const platformCount = await prisma.platformDemoRequest.count()
  const demoRequestCount = await prisma.demoRequest.count({
    where: {
      notes: {
        contains: 'Migrated from PlatformDemoRequest'
      }
    }
  })
  
  console.log(`📊 PlatformDemoRequest records: ${platformCount}`)
  console.log(`📊 Migrated DemoRequest records: ${demoRequestCount}`)
  
  if (platformCount === demoRequestCount) {
    console.log('✅ Migration verified: All records migrated successfully!')
  } else {
    console.log(`⚠️  Warning: ${platformCount - demoRequestCount} records may not have been migrated`)
  }
  
  // Sample comparison
  console.log('\n📋 Sample comparison:')
  const platformSample = await prisma.platformDemoRequest.findFirst({
    orderBy: { createdAt: 'asc' }
  })
  
  if (platformSample) {
    const migratedSample = await prisma.demoRequest.findFirst({
      where: {
        picEmail: platformSample.email,
        createdAt: platformSample.createdAt
      }
    })
    
    console.log('\nPlatformDemoRequest sample:')
    console.log(`  Email: ${platformSample.email}`)
    console.log(`  Name: ${platformSample.firstName} ${platformSample.lastName}`)
    console.log(`  Status: ${platformSample.status}`)
    console.log(`  Created: ${platformSample.createdAt}`)
    
    if (migratedSample) {
      console.log('\nMigrated DemoRequest sample:')
      console.log(`  Email: ${migratedSample.picEmail}`)
      console.log(`  Name: ${migratedSample.firstName} ${migratedSample.lastName} (picName: ${migratedSample.picName})`)
      console.log(`  Status: ${migratedSample.status}`)
      console.log(`  Created: ${migratedSample.createdAt}`)
      console.log('  ✅ Match found!')
    } else {
      console.log('  ❌ No matching DemoRequest found!')
    }
  }
}

// Main execution
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║  PlatformDemoRequest → Enhanced DemoRequest Migration     ║')
  console.log('║  Bagizi-ID Schema Redundancy Cleanup                      ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log()
  
  try {
    // Run migration
    const result = await migratePlatformDemoRequests()
    
    // Verify migration
    await verifyMigration()
    
    if (result.errorCount === 0) {
      console.log('\n✅ Migration completed successfully!')
      console.log('📝 Next steps:')
      console.log('   1. Review migrated data in Prisma Studio')
      console.log('   2. Update API routes to use DemoRequest')
      console.log('   3. Update feature components')
      console.log('   4. Remove PlatformDemoRequest from schema')
      process.exit(0)
    } else {
      console.log('\n⚠️  Migration completed with errors!')
      console.log('📝 Please review errors above and retry if needed.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
main()
