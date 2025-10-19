# 🔄 DemoRequest Enhanced Schema - Merge Analysis

## 📊 Field Mapping Analysis

### DemoRequest (Current - Better Design) ✅
**Strengths**:
- More comprehensive organization details
- Better demo configuration (requestedFeatures, specialRequirements)
- Complete lifecycle tracking (reviewedAt, approvedAt, rejectedAt)
- Proper relations (demoSppg, productionSppg)
- Better status enum (DemoRequestStatus)

**Fields**:
```
✅ organizationName, organizationType, targetBeneficiaries
✅ picName, picEmail, picPhone, picWhatsapp, picPosition
✅ operationalArea, currentSystem, currentChallenges, expectedGoals
✅ demoType (DemoType enum), requestedFeatures, specialRequirements
✅ preferredStartDate, estimatedDuration
✅ status (DemoRequestStatus enum), reviewedAt, reviewedBy, approvedAt, rejectedAt, rejectionReason
✅ demoSppgId, demoCreatedAt, demoExpiresAt
✅ isConverted, convertedAt, convertedSppgId
✅ lastContactAt, followUpRequired, notes
✅ Relations: demoSppg, productionSppg, leadCaptures
```

### PlatformDemoRequest (Secondary - Better Tracking) ⚠️
**Strengths**:
- Separated firstName/lastName (better for personalization)
- Assignment tracking (assignedTo, assignedAt)
- Scheduling details (preferredTime, timezone, demoDuration, demoMode)
- Attendance tracking (attendanceStatus, feedbackScore, feedback)
- Communication metrics (emailsSent, callsMade, lastContactDate)
- Conversion probability (conversionProbability)
- Next steps tracking (nextSteps)

**Fields**:
```
⚠️ firstName, lastName (vs picName)
⚠️ email, phone, company, position (similar fields)
⚠️ demoType (String vs Enum)
⚠️ requestMessage (vs notes)
⚠️ interestedFeatures (same as requestedFeatures)
➕ preferredTime, timezone, demoDuration, demoMode (NEW - GOOD!)
➕ status (UserDemoStatus enum), scheduledDate, actualDate
➕ assignedTo, assignedAt (NEW - GOOD!)
➕ followUpRequired, followUpDate, conversionProbability (NEW - GOOD!)
➕ attendanceStatus, feedbackScore, feedback, nextSteps (NEW - EXCELLENT!)
⚠️ isConverted, convertedAt, sppgId (similar fields)
➕ emailsSent, callsMade, lastContactDate (NEW - GOOD!)
```

---

## 🎯 Enhanced DemoRequest Schema (Merged)

**Strategy**: Keep DemoRequest as base, add best features from PlatformDemoRequest

```prisma
model DemoRequest {
  id String @id @default(cuid())

  // ===== REQUESTER INFORMATION ===== 
  // Enhanced: Split name for better personalization
  firstName       String   // ADD from PlatformDemoRequest
  lastName        String   // ADD from PlatformDemoRequest
  picName         String?  // KEEP for backward compatibility (can be computed from firstName + lastName)
  picEmail        String  @unique
  picPhone        String
  picWhatsapp     String?
  picPosition     String?

  // ===== ORGANIZATION DETAILS =====
  organizationName    String
  organizationType    OrganizationType @default(YAYASAN)
  targetBeneficiaries Int?
  operationalArea     String?
  currentSystem       String?
  currentChallenges   String[]
  expectedGoals       String[]

  // ===== DEMO CONFIGURATION =====
  demoType            DemoType @default(STANDARD)
  requestedFeatures   String[] // KEEP (same as interestedFeatures)
  specialRequirements String?
  requestMessage      String?  // ADD from PlatformDemoRequest (similar to notes but separate)

  // ===== SCHEDULING =====
  preferredStartDate DateTime?
  preferredTime      String?   // ADD: "MORNING", "AFTERNOON", "EVENING"
  timezone           String    @default("Asia/Jakarta") // ADD
  estimatedDuration  Int       @default(14) // Days (DemoRequest)
  demoDuration       Int       @default(60) // ADD: Minutes per session (PlatformDemoRequest)
  demoMode           String    @default("ONLINE") // ADD: "ONLINE", "ONSITE", "HYBRID"

  // ===== STATUS MANAGEMENT =====
  status             DemoRequestStatus @default(SUBMITTED) // KEEP: Better enum
  reviewedAt         DateTime?
  reviewedBy         String?
  approvedAt         DateTime?
  rejectedAt         DateTime?
  rejectionReason    String?
  
  // ===== SCHEDULING & ASSIGNMENT =====
  scheduledDate      DateTime? // ADD from PlatformDemoRequest
  actualDate         DateTime? // ADD: When demo actually happened
  assignedTo         String?   // ADD: Sales/Demo person
  assignedAt         DateTime? // ADD: Assignment timestamp

  // ===== DEMO ACCOUNT CREATION =====
  demoSppgId         String?
  demoCreatedAt      DateTime?
  demoExpiresAt      DateTime?

  // ===== DEMO EXECUTION & FEEDBACK =====
  attendanceStatus   String?   // ADD: "ATTENDED", "NO_SHOW", "RESCHEDULED"
  feedbackScore      Float?    // ADD: 1-10 rating after demo
  feedback           String?   // ADD: Detailed feedback
  nextSteps          String[]  // ADD: Action items after demo

  // ===== CONVERSION TRACKING =====
  isConverted        Boolean   @default(false)
  convertedAt        DateTime?
  convertedSppgId    String?   // Production SPPG ID
  conversionProbability Float? // ADD: 0-100% probability score

  // ===== FOLLOW-UP & COMMUNICATION =====
  followUpRequired   Boolean   @default(true)
  followUpDate       DateTime? // ADD from PlatformDemoRequest
  lastContactAt      DateTime?
  emailsSent         Int       @default(0) // ADD: Email tracking
  callsMade          Int       @default(0) // ADD: Call tracking
  notes              String?   // Internal notes

  // ===== RELATIONS =====
  demoSppg       SPPG?         @relation("DemoSppg", fields: [demoSppgId], references: [id])
  productionSppg SPPG?         @relation("ConvertedSppg", fields: [convertedSppgId], references: [id])
  leadCaptures   LeadCapture[]

  // ===== TIMESTAMPS =====
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ===== INDEXES =====
  @@index([picEmail, status])
  @@index([status, demoExpiresAt])
  @@index([organizationName])
  @@index([assignedTo, scheduledDate]) // ADD
  @@index([status, createdAt])         // ADD
  @@map("demo_requests")
}
```

---

## 📊 Field Migration Mapping

### PlatformDemoRequest → Enhanced DemoRequest

| PlatformDemoRequest Field | Enhanced DemoRequest Field | Action |
|---------------------------|----------------------------|--------|
| `firstName` | `firstName` | ✅ ADD new field |
| `lastName` | `lastName` | ✅ ADD new field |
| `email` | `picEmail` | ✅ Map to existing |
| `phone` | `picPhone` | ✅ Map to existing |
| `company` | `organizationName` | ✅ Map to existing |
| `position` | `picPosition` | ✅ Map to existing |
| `demoType` (String) | `demoType` (Enum) | ⚠️ Convert to enum |
| `requestMessage` | `requestMessage` | ✅ ADD new field |
| `interestedFeatures` | `requestedFeatures` | ✅ Map to existing |
| `preferredDate` | `preferredStartDate` | ✅ Map to existing |
| `preferredTime` | `preferredTime` | ✅ ADD new field |
| `timezone` | `timezone` | ✅ ADD new field |
| `demoDuration` | `demoDuration` | ✅ ADD new field |
| `demoMode` | `demoMode` | ✅ ADD new field |
| `status` (UserDemoStatus) | `status` (DemoRequestStatus) | ⚠️ Convert enum |
| `scheduledDate` | `scheduledDate` | ✅ ADD new field |
| `actualDate` | `actualDate` | ✅ ADD new field |
| `assignedTo` | `assignedTo` | ✅ ADD new field |
| `assignedAt` | `assignedAt` | ✅ ADD new field |
| `followUpRequired` | `followUpRequired` | ✅ Already exists |
| `followUpDate` | `followUpDate` | ✅ ADD new field |
| `conversionProbability` | `conversionProbability` | ✅ ADD new field |
| `attendanceStatus` | `attendanceStatus` | ✅ ADD new field |
| `feedbackScore` | `feedbackScore` | ✅ ADD new field |
| `feedback` | `feedback` | ✅ ADD new field |
| `nextSteps` | `nextSteps` | ✅ ADD new field |
| `isConverted` | `isConverted` | ✅ Already exists |
| `convertedAt` | `convertedAt` | ✅ Already exists |
| `sppgId` | `convertedSppgId` | ✅ Map to existing |
| `emailsSent` | `emailsSent` | ✅ ADD new field |
| `callsMade` | `callsMade` | ✅ ADD new field |
| `lastContactDate` | `lastContactAt` | ✅ Map to existing |

---

## 🔧 Enum Mapping

### DemoType Mapping
```typescript
// PlatformDemoRequest (String)
"STANDARD" → DemoType.STANDARD
"CUSTOM"   → DemoType.CUSTOM
"EXTENDED" → DemoType.EXTENDED (if exists, else STANDARD)
```

### Status Mapping
```typescript
// UserDemoStatus → DemoRequestStatus
UserDemoStatus.REQUESTED    → DemoRequestStatus.SUBMITTED
UserDemoStatus.SCHEDULED    → DemoRequestStatus.APPROVED
UserDemoStatus.COMPLETED    → DemoRequestStatus.COMPLETED (if exists)
UserDemoStatus.CANCELLED    → DemoRequestStatus.REJECTED
UserDemoStatus.CONVERTED    → DemoRequestStatus.SUBMITTED + isConverted=true
```

---

## ✅ Benefits of Enhanced Schema

1. **Best of Both Worlds**:
   - ✅ Organization details from DemoRequest
   - ✅ Assignment tracking from PlatformDemoRequest
   - ✅ Attendance tracking from PlatformDemoRequest
   - ✅ Communication metrics from PlatformDemoRequest

2. **No Data Loss**:
   - ✅ All fields preserved
   - ✅ Clear migration path for every field
   - ✅ Backward compatibility maintained

3. **Better Features**:
   - ✅ firstName/lastName for personalization
   - ✅ Assignment workflow (assignedTo)
   - ✅ Attendance tracking (attendanceStatus)
   - ✅ Feedback collection (feedbackScore, feedback)
   - ✅ Communication metrics (emailsSent, callsMade)
   - ✅ Next steps tracking (nextSteps)

4. **Type Safety**:
   - ✅ Enum for demoType (not string)
   - ✅ Enum for status (not string)
   - ✅ Proper relations maintained

---

## 🚀 Next Steps

1. ✅ Schema design complete
2. ⏭️ Update schema.prisma with enhanced DemoRequest
3. ⏭️ Generate migration
4. ⏭️ Create data migration script
5. ⏭️ Update API routes
6. ⏭️ Update components
7. ⏭️ Remove PlatformDemoRequest

---

**Ready to proceed with schema update!** 🎯
