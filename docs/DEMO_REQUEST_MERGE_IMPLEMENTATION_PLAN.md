# 🎯 Demo Request Merge - Implementation Plan

## 📋 Quick Reference

**Redundancy**: `DemoRequest` vs `PlatformDemoRequest` (85% overlap)  
**Solution**: Merge into single enhanced `DemoRequest` model  
**Priority**: HIGH  
**Estimated Time**: 2-3 days  
**Files Impact**: ~20-25 files, ~2,000 lines  

---

## 🔍 Current State

### DemoRequest (Primary - Better Design)
- ✅ Better relation names (`demoSppg` vs generic `sppg`)
- ✅ Has `interestedFeatures` field
- ✅ More descriptive (`DemoRequest` vs `PlatformDemoRequest`)
- ⚠️ Missing: assignment tracking, marketing attribution

### PlatformDemoRequest (Secondary - Better Features)
- ✅ Has `assignedTo/assignedAt` for workflow
- ✅ Has `source/campaign` for marketing analytics
- ✅ Has `completedAt` for execution tracking
- ⚠️ Generic naming, less descriptive relations

---

## 🎯 Target Schema

```prisma
model DemoRequest {
  id              String   @id @default(cuid())
  
  // Requester Information
  picName         String   // Keep: Person in charge name
  picEmail        String   // Keep: Email address
  picPhone        String   // Keep: Phone number
  position        String?  // ADD: Job position
  
  // Organization Information
  organizationName String   // Keep: Organization/company name
  organizationType String   // Keep: Type of organization
  numberOfSPPG     Int?     // Keep: Number of SPPGs
  
  // Demo Details
  message          String?             // Keep: Additional message/notes
  demoType         DemoType @default(TRIAL)  // Keep: Trial/Full demo
  preferredDate    DateTime?           // Keep: Preferred demo date
  interestedFeatures String[]          // Keep: Features of interest
  
  // Status & Assignment Workflow
  status           DemoStatus @default(PENDING)  // Keep: Current status
  assignedTo       String?             // ADD: Assigned staff ID
  assignedAt       DateTime?           // ADD: Assignment timestamp
  
  // Demo Execution Timeline
  scheduledAt      DateTime?           // ADD: Scheduled demo datetime
  completedAt      DateTime?           // ADD: Demo completion datetime
  demoSppgId       String?             // Keep: Demo SPPG instance
  
  // Conversion Tracking
  isConverted      Boolean  @default(false)  // Keep: Conversion flag
  convertedToSppgId String?            // Keep: Final SPPG after conversion
  conversionDate   DateTime?           // Keep: Conversion timestamp
  
  // Marketing Attribution
  source           String?             // ADD: Traffic source (google, facebook, direct)
  campaign         String?             // ADD: Campaign identifier
  
  // Relations
  sppg         SPPG? @relation("DemoRequestSppg", fields: [demoSppgId], references: [id], onDelete: SetNull)
  convertedTo  SPPG? @relation("DemoConvertedSppg", fields: [convertedToSppgId], references: [id], onDelete: SetNull)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Indexes
  @@index([status, assignedTo])
  @@index([demoType, status])
  @@index([source, campaign])
  @@index([picEmail])
  @@index([isConverted, conversionDate])
  
  @@map("demo_requests")
}
```

---

## 📝 Step-by-Step Implementation

### Phase 1: Schema Enhancement (Non-Breaking)
```bash
# 1. Update schema with new fields (nullable)
# Edit: prisma/schema.prisma
```

```prisma
model DemoRequest {
  // ... existing fields ...
  
  // ADD new fields (all nullable for backward compatibility)
  position        String?
  assignedTo      String?
  assignedAt      DateTime?
  scheduledAt     DateTime?
  completedAt     DateTime?
  source          String?
  campaign        String?
}
```

```bash
# 2. Create migration
npx prisma migrate dev --name add_demo_request_enhanced_fields

# 3. Apply migration
npm run db:migrate
```

### Phase 2: Data Migration Script
```typescript
// prisma/migrations/merge-demo-requests.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function mergeDemoRequests() {
  console.log('🔄 Starting demo request data migration...')
  
  // Get all PlatformDemoRequest records
  const platformDemos = await prisma.platformDemoRequest.findMany()
  
  console.log(`📊 Found ${platformDemos.length} platform demo requests to migrate`)
  
  let migratedCount = 0
  let errorCount = 0
  
  for (const platformDemo of platformDemos) {
    try {
      // Check if already migrated (by email)
      const existing = await prisma.demoRequest.findFirst({
        where: {
          picEmail: platformDemo.email,
          createdAt: platformDemo.createdAt
        }
      })
      
      if (existing) {
        console.log(`⏭️  Skipping duplicate: ${platformDemo.email}`)
        continue
      }
      
      // Create enhanced DemoRequest
      await prisma.demoRequest.create({
        data: {
          // Map PlatformDemoRequest fields
          picName: `${platformDemo.firstName} ${platformDemo.lastName}`,
          picEmail: platformDemo.email,
          picPhone: platformDemo.phone,
          position: platformDemo.position,
          
          // Organization
          organizationName: platformDemo.company || 'Unknown',
          organizationType: 'UNKNOWN', // Default value
          numberOfSPPG: platformDemo.numberOfSPPG,
          
          // Demo details
          message: platformDemo.message,
          demoType: platformDemo.demoType,
          preferredDate: platformDemo.scheduledAt,
          interestedFeatures: [], // Default empty
          
          // Status & assignment
          status: platformDemo.status,
          assignedTo: platformDemo.assignedTo,
          assignedAt: platformDemo.assignedAt,
          
          // Execution
          scheduledAt: platformDemo.scheduledAt,
          completedAt: platformDemo.completedAt,
          demoSppgId: platformDemo.sppgId,
          
          // Conversion
          isConverted: platformDemo.isConverted,
          convertedToSppgId: platformDemo.sppgId,
          conversionDate: platformDemo.conversionDate,
          
          // Marketing
          source: platformDemo.source,
          campaign: platformDemo.campaign,
          
          // Timestamps
          createdAt: platformDemo.createdAt,
          updatedAt: platformDemo.updatedAt
        }
      })
      
      migratedCount++
      console.log(`✅ Migrated: ${platformDemo.email}`)
      
    } catch (error) {
      errorCount++
      console.error(`❌ Error migrating ${platformDemo.email}:`, error)
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Migrated: ${migratedCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📝 Total: ${platformDemos.length}`)
}

mergeDemoRequests()
  .then(() => {
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```bash
# Run migration
tsx prisma/migrations/merge-demo-requests.ts
```

### Phase 3: Code Updates

#### 3.1 Update API Routes
```typescript
// Before: src/app/api/admin/platform-demo-requests/route.ts
// After: Use src/app/api/admin/demo-requests/route.ts

// Update all queries:
- prisma.platformDemoRequest.findMany()
+ prisma.demoRequest.findMany()
```

#### 3.2 Update Feature Components
```bash
# Files to update:
src/features/admin/demo-management/
├── components/
│   ├── DemoRequestList.tsx       # Update model references
│   ├── DemoRequestForm.tsx       # Add new fields (position, source, campaign)
│   └── DemoRequestCard.tsx       # Update display fields
├── api/
│   └── demoRequestsApi.ts        # Update endpoint from platform-demo-requests to demo-requests
├── hooks/
│   └── useDemoRequests.ts        # Update type imports
└── types/
    └── demo-request.types.ts     # Merge types
```

#### 3.3 Update Schemas
```typescript
// src/features/admin/demo-management/schemas/demoRequestSchema.ts

import { z } from 'zod'
import { DemoType, DemoStatus } from '@prisma/client'

export const demoRequestSchema = z.object({
  // Requester
  picName: z.string().min(2, 'Nama minimal 2 karakter'),
  picEmail: z.string().email('Email tidak valid'),
  picPhone: z.string().min(10, 'Nomor telepon tidak valid'),
  position: z.string().optional(),
  
  // Organization
  organizationName: z.string().min(2, 'Nama organisasi minimal 2 karakter'),
  organizationType: z.string(),
  numberOfSPPG: z.number().int().positive().optional(),
  
  // Demo details
  message: z.string().optional(),
  demoType: z.nativeEnum(DemoType),
  preferredDate: z.date().optional(),
  interestedFeatures: z.array(z.string()).default([]),
  
  // Status
  status: z.nativeEnum(DemoStatus),
  assignedTo: z.string().optional(),
  
  // Marketing
  source: z.string().optional(),
  campaign: z.string().optional(),
})

export type DemoRequestInput = z.infer<typeof demoRequestSchema>
```

### Phase 4: Remove PlatformDemoRequest

#### 4.1 Delete API Routes
```bash
rm -rf src/app/api/admin/platform-demo-requests/
```

#### 4.2 Delete Feature Components
```bash
# If separate feature exists:
rm -rf src/features/admin/platform-demo-requests/
# Or merge into demo-management
```

#### 4.3 Update Schema
```prisma
// prisma/schema.prisma

// DELETE this entire model:
- model PlatformDemoRequest {
-   // ... all fields ...
- }
```

```bash
# Create deletion migration
npx prisma migrate dev --name remove_platform_demo_request_redundancy
```

### Phase 5: Update Seeds
```typescript
// prisma/seeds/demo-seed.ts

export async function seedDemo(prisma: PrismaClient) {
  console.log('  → Creating demo requests...')
  
  const demoRequests = await Promise.all([
    // Use DemoRequest model only
    prisma.demoRequest.upsert({
      where: { picEmail: 'john.doe@school.edu' },
      update: {},
      create: {
        picName: 'John Doe',
        picEmail: 'john.doe@school.edu',
        picPhone: '+62812345678',
        position: 'Kepala Sekolah',
        organizationName: 'SD Nusantara 01',
        organizationType: 'SCHOOL',
        numberOfSPPG: 1,
        message: 'Tertarik mencoba sistem SPPG',
        demoType: 'TRIAL',
        preferredDate: new Date('2025-01-20'),
        interestedFeatures: ['MENU_MANAGEMENT', 'PROCUREMENT'],
        status: 'PENDING',
        source: 'google',
        campaign: 'school-campaign-jan-2025'
      }
    }),
    
    // ... more demo requests
  ])
  
  console.log(`  ✓ Created ${demoRequests.length} demo requests`)
  return demoRequests
}
```

### Phase 6: Testing & Verification

```bash
# 1. Run type check
npm run type-check

# 2. Run linting
npm run lint

# 3. Build test
npm run build

# 4. Test API endpoints
curl http://localhost:3000/api/admin/demo-requests

# 5. Test UI
# Visit: http://localhost:3000/admin/demo-requests

# 6. Verify data migration
npm run db:studio
# Check demo_requests table for migrated data
```

---

## 📋 Checklist

### Schema Changes
- [ ] Add new fields to DemoRequest (nullable)
- [ ] Create migration: `add_demo_request_enhanced_fields`
- [ ] Apply migration
- [ ] Verify schema in Prisma Studio

### Data Migration
- [ ] Create migration script: `merge-demo-requests.ts`
- [ ] Test migration script on dev database
- [ ] Run migration on production (backup first!)
- [ ] Verify all data migrated correctly

### Code Updates
- [ ] Update API routes: `/api/admin/demo-requests/`
- [ ] Update feature components: `src/features/admin/demo-management/`
- [ ] Update schemas: `demoRequestSchema.ts`
- [ ] Update types: `demo-request.types.ts`
- [ ] Update hooks: `useDemoRequests.ts`
- [ ] Update API client: `demoRequestsApi.ts`

### Cleanup
- [ ] Delete PlatformDemoRequest API routes
- [ ] Delete PlatformDemoRequest feature components (if any)
- [ ] Remove PlatformDemoRequest from schema
- [ ] Create migration: `remove_platform_demo_request_redundancy`
- [ ] Apply migration

### Seed Data
- [ ] Update `prisma/seeds/demo-seed.ts`
- [ ] Test seed with: `npm run db:seed`

### Testing
- [ ] TypeScript compilation (zero errors)
- [ ] Linting (zero issues)
- [ ] Build test (successful)
- [ ] API endpoint testing (all CRUD operations)
- [ ] UI testing (create, read, update, delete)
- [ ] Data integrity verification

### Documentation
- [ ] Update API documentation
- [ ] Update feature documentation
- [ ] Add migration notes
- [ ] Update CHANGELOG.md

---

## 🚨 Rollback Plan

If issues occur during migration:

```bash
# 1. Rollback database migration
npx prisma migrate resolve --rolled-back merge-demo-requests

# 2. Restore code from git
git checkout main -- src/features/admin/demo-management/
git checkout main -- src/app/api/admin/demo-requests/

# 3. Keep PlatformDemoRequest temporarily
# (Don't delete until migration is 100% verified)

# 4. Investigate issues
# 5. Fix and retry
```

---

## 📊 Success Metrics

- ✅ Zero TypeScript errors
- ✅ All API endpoints return 200 OK
- ✅ All demo requests migrated (compare counts)
- ✅ No data loss (verify with Prisma Studio)
- ✅ UI displays all fields correctly
- ✅ CRUD operations work as expected
- ✅ Seeds run successfully
- ✅ Documentation updated

---

## 🎯 Expected Benefits

1. **Code Reduction**: -20-25 files, ~2,000 lines
2. **Maintenance**: Single source of truth for demo requests
3. **Developer Experience**: No confusion about which model to use
4. **Testing**: 50% less test cases (single model)
5. **Performance**: Simplified queries, better indexes
6. **Feature Enhancement**: Combined best features from both models

---

**Implementation By**: Bagizi-ID Development Team  
**Estimated Duration**: 2-3 days  
**Priority**: HIGH  
**Status**: 📋 READY FOR IMPLEMENTATION
