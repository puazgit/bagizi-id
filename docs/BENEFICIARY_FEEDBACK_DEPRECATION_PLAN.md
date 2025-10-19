# 🟡 BeneficiaryFeedback Deprecation Plan

## 📋 Quick Reference

**Current State**: Legacy model (`@@map("beneficiary_feedback_legacy")`)  
**Target State**: Fully migrated to `Feedback` + `FeedbackStakeholder`  
**Priority**: MEDIUM (gradual deprecation)  
**Timeline**: 6-12 months  
**Redundancy Level**: 60% (partial overlap)  

---

## 🔍 Current Analysis

### BeneficiaryFeedback (Legacy)
**Lines**: 8317-8350  
**Purpose**: Simple beneficiary feedback collection  
**Complexity**: Basic (15 fields)  
**Table Name**: `beneficiary_feedback_legacy` ← Explicitly marked as legacy!

```prisma
model BeneficiaryFeedback {
  id        String  @id @default(cuid())
  sppgId    String
  programId String?

  // Basic fields for backward compatibility
  beneficiaryId   String?
  beneficiaryName String
  beneficiaryType BeneficiaryType
  feedbackType    FeedbackType
  subject         String
  message         String
  rating          Int?
  status          FeedbackStatus  @default(PENDING)

  // Additional legacy fields
  menuId         String?
  distributionId String?

  // Relations
  sppg         SPPG               @relation(fields: [sppgId], references: [id], onDelete: Cascade)
  program      NutritionProgram?  @relation(fields: [programId], references: [id])
  menu         NutritionMenu?     @relation(fields: [menuId], references: [id])
  distribution FoodDistribution?  @relation(fields: [distributionId], references: [id])
  beneficiary  SchoolBeneficiary? @relation(fields: [beneficiaryId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([sppgId, status])
  @@map("beneficiary_feedback_legacy")
}
```

### Feedback (Enterprise)
**Lines**: 7892-8000+  
**Purpose**: Comprehensive stakeholder feedback system  
**Complexity**: Enterprise-grade (120+ fields)  

**Key Features BeneficiaryFeedback is Missing**:
- ❌ AI analysis & sentiment scoring
- ❌ SLA management & escalation
- ❌ Multi-channel support (web, mobile, WhatsApp, email)
- ❌ Quality control & compliance tracking
- ❌ Advanced workflow management
- ❌ Response & resolution tracking
- ❌ Media attachments (photos, videos, audio)
- ❌ Department assignment & routing
- ❌ FeedbackStakeholder relation for proper stakeholder management

---

## 🎯 Why Keep Both (For Now)

### Technical Reasons:
1. **Production Data**: May contain historical feedback data
2. **Backward Compatibility**: Existing integrations may depend on it
3. **Migration Risk**: Immediate deletion could break existing features
4. **Different Use Cases**: Simple vs comprehensive feedback needs

### Business Reasons:
1. **Gradual Migration**: Allow time for data quality checks
2. **User Training**: Teams need time to adopt new system
3. **Testing Period**: Validate new system works for all scenarios
4. **Zero Downtime**: Ensure continuous service during migration

---

## 📅 Phased Deprecation Plan

### Phase 1: Mark as Deprecated (Week 1-2)
**Goal**: Clearly indicate this is legacy code

```prisma
/// @deprecated This model is LEGACY and will be removed in v2.0
/// Use Feedback model with FeedbackStakeholder relation instead
/// 
/// Migration Guide:
/// 1. Create FeedbackStakeholder for beneficiary
/// 2. Create Feedback with stakeholderId
/// 3. All features from BeneficiaryFeedback now in Feedback
/// 
/// DO NOT use this model for new features!
model BeneficiaryFeedback {
  // ... existing fields ...
  
  /// @deprecated
  @@map("beneficiary_feedback_legacy")
}
```

**Actions**:
- [ ] Add deprecation comments to schema
- [ ] Add deprecation warnings to API endpoints
- [ ] Update documentation with migration guide
- [ ] Notify development team

```typescript
// src/app/api/sppg/beneficiary-feedback/route.ts

export async function POST(request: NextRequest) {
  // Add deprecation warning
  console.warn('⚠️ DEPRECATED: BeneficiaryFeedback API is deprecated. Use /api/sppg/feedback instead.')
  
  // Continue with existing logic for backward compatibility
  // ...
}
```

### Phase 2: Stop New Writes (Month 1-3)
**Goal**: Redirect all new feedback to `Feedback` model

**2.1 Update UI Components** (Month 1):
```typescript
// src/features/sppg/feedback/components/BeneficiaryFeedbackForm.tsx

'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export function BeneficiaryFeedbackForm() {
  return (
    <div>
      {/* Show deprecation notice */}
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Notice:</strong> This form is being replaced. 
          New feedback will use the improved system automatically.
        </AlertDescription>
      </Alert>
      
      {/* Redirect to new Feedback system */}
      <FeedbackForm 
        defaultStakeholderType="BENEFICIARY"
        showSimpleMode={true}
      />
    </div>
  )
}
```

**2.2 Update API Routes** (Month 2):
```typescript
// src/app/api/sppg/beneficiary-feedback/route.ts

export async function POST(request: NextRequest) {
  console.warn('⚠️ REDIRECTING: Creating Feedback instead of BeneficiaryFeedback')
  
  const body = await request.json()
  
  // Create FeedbackStakeholder
  const stakeholder = await db.feedbackStakeholder.create({
    data: {
      sppgId: session.user.sppgId,
      stakeholderType: 'BENEFICIARY',
      name: body.beneficiaryName,
      contactInfo: {
        beneficiaryId: body.beneficiaryId,
        beneficiaryType: body.beneficiaryType
      }
    }
  })
  
  // Create Feedback (NOT BeneficiaryFeedback)
  const feedback = await db.feedback.create({
    data: {
      sppgId: session.user.sppgId,
      stakeholderId: stakeholder.id,
      subject: body.subject,
      content: body.message,
      feedbackType: body.feedbackType,
      overallRating: body.rating,
      status: 'PENDING',
      // Map other fields...
    }
  })
  
  return Response.json({ success: true, data: feedback })
}
```

**2.3 Database Trigger** (Month 3):
```sql
-- Optional: Prevent direct inserts to legacy table
CREATE OR REPLACE FUNCTION prevent_beneficiary_feedback_insert()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'BeneficiaryFeedback is deprecated. Use Feedback model instead.'
    USING HINT = 'See migration guide: /docs/BENEFICIARY_FEEDBACK_DEPRECATION_PLAN.md';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER block_legacy_feedback_insert
  BEFORE INSERT ON beneficiary_feedback_legacy
  FOR EACH ROW
  EXECUTE FUNCTION prevent_beneficiary_feedback_insert();
```

### Phase 3: Data Migration (Month 4-6)
**Goal**: Migrate all historical data to new system

**3.1 Create Migration Script**:
```typescript
// prisma/migrations/migrate-beneficiary-feedback.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateBeneficiaryFeedback() {
  console.log('🔄 Migrating BeneficiaryFeedback to Feedback...')
  
  // Get all legacy feedback
  const legacyFeedback = await prisma.beneficiaryFeedback.findMany({
    include: {
      beneficiary: true,
      program: true,
      menu: true,
      distribution: true
    },
    orderBy: { createdAt: 'asc' }
  })
  
  console.log(`📊 Found ${legacyFeedback.length} legacy feedback records`)
  
  let migratedCount = 0
  let errorCount = 0
  const stakeholderMap = new Map<string, string>()
  
  for (const legacy of legacyFeedback) {
    try {
      // Create or get stakeholder
      let stakeholderId = stakeholderMap.get(legacy.beneficiaryId || legacy.beneficiaryName)
      
      if (!stakeholderId) {
        const stakeholder = await prisma.feedbackStakeholder.create({
          data: {
            sppgId: legacy.sppgId,
            stakeholderType: 'BENEFICIARY',
            name: legacy.beneficiaryName,
            beneficiaryType: legacy.beneficiaryType,
            isActive: true,
            contactInfo: {
              beneficiaryId: legacy.beneficiaryId,
              legacyId: legacy.id
            }
          }
        })
        stakeholderId = stakeholder.id
        stakeholderMap.set(legacy.beneficiaryId || legacy.beneficiaryName, stakeholderId)
      }
      
      // Create new Feedback
      await prisma.feedback.create({
        data: {
          sppgId: legacy.sppgId,
          stakeholderId: stakeholderId,
          
          // Map fields
          subject: legacy.subject,
          content: legacy.message,
          feedbackType: legacy.feedbackType,
          category: mapLegacyCategory(legacy.feedbackType),
          overallRating: legacy.rating,
          status: legacy.status,
          
          // Contextual info
          programId: legacy.programId,
          menuId: legacy.menuId,
          distributionId: legacy.distributionId,
          
          // Default values for new fields
          priority: 'MEDIUM',
          urgencyScore: 5,
          complexityScore: 3,
          sourceChannel: 'legacy_migration',
          
          // Preserve timestamps
          createdAt: legacy.createdAt,
          updatedAt: legacy.updatedAt
        }
      })
      
      migratedCount++
      
      if (migratedCount % 100 === 0) {
        console.log(`✅ Progress: ${migratedCount}/${legacyFeedback.length}`)
      }
      
    } catch (error) {
      errorCount++
      console.error(`❌ Error migrating feedback ${legacy.id}:`, error)
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Migrated: ${migratedCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📝 Total: ${legacyFeedback.length}`)
  
  return { migratedCount, errorCount }
}

function mapLegacyCategory(feedbackType: string): string {
  const categoryMap: Record<string, string> = {
    'COMPLAINT': 'QUALITY',
    'SUGGESTION': 'IMPROVEMENT',
    'APPRECIATION': 'POSITIVE',
    'QUESTION': 'INQUIRY'
  }
  return categoryMap[feedbackType] || 'GENERAL'
}

migrateBeneficiaryFeedback()
  .then((result) => {
    console.log('✅ Migration completed!')
    console.log(`   Success rate: ${(result.migratedCount / (result.migratedCount + result.errorCount) * 100).toFixed(2)}%`)
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

**3.2 Run Migration**:
```bash
# Backup database first
npm run db:backup

# Run migration script
tsx prisma/migrations/migrate-beneficiary-feedback.ts

# Verify migration
npm run db:studio
# Check: feedback table has new records
# Check: beneficiary_feedback_legacy unchanged
```

**3.3 Verification**:
```typescript
// scripts/verify-feedback-migration.ts

async function verifyMigration() {
  const legacyCount = await prisma.beneficiaryFeedback.count()
  const newCount = await prisma.feedback.count({
    where: {
      sourceChannel: 'legacy_migration'
    }
  })
  
  console.log(`Legacy records: ${legacyCount}`)
  console.log(`Migrated records: ${newCount}`)
  console.log(`Match: ${legacyCount === newCount ? '✅ YES' : '❌ NO'}`)
  
  // Sample verification
  const legacySample = await prisma.beneficiaryFeedback.findFirst()
  const newSample = await prisma.feedback.findFirst({
    where: {
      subject: legacySample?.subject,
      createdAt: legacySample?.createdAt
    },
    include: {
      stakeholder: true
    }
  })
  
  console.log('\n📊 Sample Comparison:')
  console.log('Legacy:', legacySample)
  console.log('Migrated:', newSample)
}
```

### Phase 4: Remove Legacy Code (Month 7-9)
**Goal**: Remove all BeneficiaryFeedback references from codebase

**4.1 Delete API Routes**:
```bash
rm -rf src/app/api/sppg/beneficiary-feedback/
```

**4.2 Delete Feature Components**:
```bash
rm -rf src/features/sppg/beneficiary-feedback/
```

**4.3 Update References**:
```bash
# Find all references
grep -r "BeneficiaryFeedback" src/

# Replace with Feedback
# Manual review and update each file
```

**4.4 Remove from Navigation**:
```typescript
// src/components/shared/navigation/SppgSidebar.tsx

// Remove BeneficiaryFeedback menu item
- {
-   title: 'Beneficiary Feedback',
-   href: '/beneficiary-feedback',
-   icon: MessageSquare
- }

// Keep only unified Feedback
{
  title: 'Feedback',
  href: '/feedback',
  icon: MessageSquare
}
```

### Phase 5: Schema Cleanup (Month 10-12)
**Goal**: Remove model from schema and database

**5.1 Final Verification**:
```sql
-- Check for any remaining references
SELECT COUNT(*) FROM beneficiary_feedback_legacy;

-- Check if any foreign keys still exist
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.table_name = 'beneficiary_feedback_legacy';
```

**5.2 Archive Legacy Data** (Optional):
```sql
-- Create archive table
CREATE TABLE beneficiary_feedback_archive AS 
SELECT * FROM beneficiary_feedback_legacy;

-- Add archive timestamp
ALTER TABLE beneficiary_feedback_archive
ADD COLUMN archived_at TIMESTAMP DEFAULT NOW();
```

**5.3 Remove from Schema**:
```prisma
// prisma/schema.prisma

// DELETE entire model
- /// @deprecated This model is LEGACY and will be removed in v2.0
- model BeneficiaryFeedback {
-   // ... all fields ...
- }
```

```bash
# Create removal migration
npx prisma migrate dev --name remove_beneficiary_feedback_legacy

# Apply migration (this will DROP the table!)
npm run db:migrate
```

**5.4 Update Documentation**:
```markdown
# Update all docs to remove BeneficiaryFeedback references
- Remove from API documentation
- Remove from user guides
- Update migration guides
- Add to CHANGELOG as breaking change
```

---

## 📋 Implementation Checklist

### Phase 1: Deprecation (Week 1-2)
- [ ] Add deprecation comments to schema
- [ ] Add deprecation warnings to API endpoints
- [ ] Update documentation
- [ ] Notify development team

### Phase 2: Stop New Writes (Month 1-3)
- [ ] Update UI to use new Feedback system
- [ ] Redirect API endpoints to Feedback
- [ ] Add database trigger (optional)
- [ ] Monitor for any direct writes

### Phase 3: Data Migration (Month 4-6)
- [ ] Backup production database
- [ ] Create migration script
- [ ] Test migration on staging
- [ ] Run migration on production
- [ ] Verify data integrity
- [ ] Keep legacy table for reference

### Phase 4: Code Cleanup (Month 7-9)
- [ ] Delete API routes
- [ ] Delete feature components
- [ ] Update navigation
- [ ] Remove all code references
- [ ] Update tests

### Phase 5: Schema Cleanup (Month 10-12)
- [ ] Final verification check
- [ ] Archive legacy data (optional)
- [ ] Remove from schema
- [ ] Create removal migration
- [ ] Apply migration
- [ ] Update all documentation
- [ ] Add to CHANGELOG

---

## 🚨 Risk Mitigation

### Backup Strategy:
```bash
# Before each major step
npm run db:backup

# Create named backups
pg_dump -U bagizi_user bagizi_db > backup_before_phase_X.sql
```

### Rollback Procedures:
```bash
# If migration fails
psql -U bagizi_user bagizi_db < backup_before_phase_X.sql

# If code breaks
git revert <commit-hash>
npm run build
npm run deploy
```

### Monitoring:
```typescript
// Add monitoring for legacy usage
if (usedLegacyAPI) {
  // Log to monitoring service
  monitoring.track('legacy_beneficiary_feedback_used', {
    endpoint: request.url,
    user: session.user.id,
    timestamp: new Date()
  })
  
  // Alert if usage spikes
  if (legacyUsageCount > threshold) {
    alerting.send('High legacy API usage detected')
  }
}
```

---

## 📊 Success Metrics

- ✅ Zero new writes to BeneficiaryFeedback (after Phase 2)
- ✅ 100% data migrated with zero loss (Phase 3)
- ✅ Zero code references to BeneficiaryFeedback (after Phase 4)
- ✅ Table dropped successfully (Phase 5)
- ✅ All tests passing
- ✅ No production issues reported
- ✅ Documentation fully updated

---

## 🎯 Expected Benefits

1. **Data Consolidation**: Single source of truth for all feedback
2. **Feature Enhancement**: Beneficiaries get access to advanced feedback features
3. **Code Simplification**: -15-20 files, ~1,500 lines removed
4. **Maintenance**: Easier to maintain single comprehensive system
5. **Analytics**: Better unified analytics across all stakeholder types
6. **User Experience**: Consistent feedback experience for all users

---

## 📚 Related Documentation

- [SCHEMA_REDUNDANCY_COMPREHENSIVE_ANALYSIS.md](./SCHEMA_REDUNDANCY_COMPREHENSIVE_ANALYSIS.md)
- [FEEDBACK_SYSTEM_ARCHITECTURE.md](./FEEDBACK_SYSTEM_ARCHITECTURE.md) (to be created)
- [STAKEHOLDER_MANAGEMENT.md](./STAKEHOLDER_MANAGEMENT.md) (to be created)

---

**Created By**: GitHub Copilot  
**Date**: 2025-01-15  
**Timeline**: 6-12 months gradual deprecation  
**Status**: 📋 PLANNING - Ready for Phase 1  
**Priority**: MEDIUM (not urgent, but important for long-term health)
