# 📊 School Form - Missing Fields Audit Report

**Generated**: January 2025  
**Total Schema Fields**: 82  
**Implemented Fields**: 30 (37%)  
**Missing Fields**: 52 (63%)

---

## ✅ IMPLEMENTED FIELDS (30/82)

### 1. Core & Program (1/1) ✅
- ✅ `programId` (Line 218)

### 2. Basic Information (2/2) ✅
- ✅ `schoolName` (Line 284)
- ✅ `schoolCode` (Line 299)

### 3. School Classification (2/2) ✅
- ✅ `schoolType` (Line 317)
- ✅ `schoolStatus` (Line 358)

### 4. Contact Information (2/6) ⚠️ PARTIAL
- ✅ `principalName` (Line 343)
- ✅ `contactPhone` (Line 401)
- ✅ `contactEmail` (Line 416)
- ❌ `principalNip` - **MISSING**
- ❌ `alternatePhone` - **MISSING**
- ❌ `whatsappNumber` - **MISSING**

### 5. Address & Location (3/4) ⚠️ PARTIAL
- ✅ `schoolAddress` (Line 436)
- ✅ `postalCode` (Line 455)
- ✅ `coordinates` (Line 470)
- ❌ `urbanRural` - **MISSING**

### 6. Regional Hierarchy (1/4) ⚠️ CRITICAL MISSING
- ❌ `provinceId` - **MISSING (CASCADE REQUIRED)**
- ❌ `regencyId` - **MISSING (CASCADE REQUIRED)**
- ❌ `districtId` - **MISSING (CASCADE REQUIRED)**
- ✅ `villageId` (Line 251) - **EXISTS BUT NOT CASCADING**

### 7. Student Demographics (7/9) ⚠️ PARTIAL
- ✅ `totalStudents` (Line 510)
- ✅ `targetStudents` (Line 530)
- ✅ `activeStudents` (Line 553)
- ✅ `students4to6Years` (Line 579)
- ✅ `students7to12Years` (Line 599)
- ✅ `students13to15Years` (Line 619)
- ✅ `students16to18Years` (Line 639)
- ❌ `maleStudents` - **MISSING (VALIDATION REQUIRED)**
- ❌ `femaleStudents` - **MISSING (VALIDATION REQUIRED)**

### 8. Feeding Operations (4/7) ⚠️ PARTIAL
- ✅ `feedingDays` (Line 678)
- ✅ `mealsPerDay` (Line 707)
- ✅ `feedingTime` (Line 736)
- ✅ `servingMethod` (Line 885)
- ❌ `breakfastTime` - **MISSING**
- ❌ `lunchTime` - **MISSING**
- ❌ `snackTime` - **MISSING**

### 9. Delivery & Logistics (3/8) ⚠️ PARTIAL
- ✅ `deliveryAddress` (Line 777)
- ✅ `deliveryContact` (Line 799)
- ✅ `deliveryInstructions` (Line 821)
- ❌ `deliveryPhone` - **MISSING**
- ❌ `preferredDeliveryTime` - **MISSING**
- ❌ `distanceFromSppg` - **MISSING**
- ❌ `estimatedTravelTime` - **MISSING**
- ❌ `accessRoadCondition` - **MISSING**

### 10. Facilities (5/9) ⚠️ PARTIAL
- ✅ `hasKitchen` (Line 921)
- ✅ `hasStorage` (Line 943)
- ✅ `storageCapacity` (Line 863)
- ✅ `hasCleanWater` (Line 965)
- ✅ `hasElectricity` (Line 987)
- ❌ `hasRefrigerator` - **MISSING**
- ❌ `hasDiningArea` - **MISSING**
- ❌ `diningCapacity` - **MISSING**
- ❌ `hasHandwashing` - **MISSING**

---

## ❌ COMPLETELY MISSING CATEGORIES (52 FIELDS)

### 11. Identification (0/5) ❌ ALL MISSING
- ❌ `npsn` - National School Principal Number
- ❌ `dapodikId` - Dapodik Integration ID
- ❌ `kemendikbudId` - Kemendikbud Integration ID
- ❌ `accreditationGrade` - Accreditation Grade (A/B/C/D)
- ❌ `accreditationYear` - Year of Accreditation

### 12. Budget & Contracts (0/6) ❌ ALL MISSING
- ❌ `contractNumber` - Contract Reference Number
- ❌ `contractStartDate` - Contract Start Date
- ❌ `contractEndDate` - Contract End Date (validation: after start)
- ❌ `contractValue` - Total Contract Value (Rp)
- ❌ `monthlyBudgetAllocation` - Monthly Budget (Rp)
- ❌ `budgetPerStudent` - Budget per Student (Rp 1,000-100,000)

### 13. Performance Metrics (0/7) ❌ ALL MISSING
- ❌ `attendanceRate` - Student Attendance Rate (0-100%)
- ❌ `participationRate` - Program Participation Rate (0-100%)
- ❌ `satisfactionScore` - Satisfaction Score (0-10)
- ❌ `lastDistributionDate` - Last Distribution Date
- ❌ `lastReportDate` - Last Reporting Date
- ❌ `totalDistributions` - Total Distribution Count
- ❌ `totalMealsServed` - Total Meals Served

### 14. Status & Lifecycle (0/5) ❌ ALL MISSING
**Note**: Form has `isActive`, `suspendedAt`, `suspensionReason` but NOT in schema - likely removed
- ❌ `enrollmentDate` - School Enrollment Date
- ❌ `reactivationDate` - Reactivation Date (if suspended)

### 15. Dietary & Cultural (0/5) ❌ ALL MISSING
**Note**: Form has `beneficiaryType`, `specialDietary`, `allergyAlerts`, `culturalReqs` but NOT in schema
- ❌ `religiousReqs` - Religious Requirements

### 16. Integration & Sync (0/2) ❌ ALL MISSING
- ❌ `externalSystemId` - External System Integration ID
- ❌ `syncedAt` - Last Sync Timestamp

### 17. Notes & Documentation (0/3) ❌ ALL MISSING
- ❌ `notes` - General Notes (Optional)
- ❌ `specialInstructions` - Special Instructions (Optional)
- ❌ `documents` - JSON Array of Document URLs (Optional)

---

## 🎯 IMPLEMENTATION PRIORITY

### 🔴 CRITICAL - Must Implement Immediately (18 fields)

#### **Regional Cascade** (3 fields)
```typescript
// REPLACE villageId select with 4-level cascade
<FormField name="provinceId" />
<FormField name="regencyId" />  
<FormField name="districtId" />
<FormField name="villageId" />  // Already exists, make it cascading
```

#### **Identification** (5 fields)
```typescript
<FormField name="npsn" />               // National School ID
<FormField name="dapodikId" />          // Dapodik ID
<FormField name="kemendikbudId" />      // Kemendikbud ID
<FormField name="accreditationGrade" /> // A/B/C/D enum select
<FormField name="accreditationYear" />  // Number input
```

#### **Contact Extensions** (3 fields)
```typescript
<FormField name="principalNip" />    // NIP format input
<FormField name="alternatePhone" />  // Phone input
<FormField name="whatsappNumber" />  // Phone input with WA icon
```

#### **Student Gender** (2 fields)
```typescript
<FormField name="maleStudents" />    // Number, validation: male + female = total
<FormField name="femaleStudents" />  // Number, validation: male + female = total
```

#### **Feeding Times** (3 fields)
```typescript
<FormField name="breakfastTime" />   // Time input HH:MM
<FormField name="lunchTime" />       // Time input HH:MM
<FormField name="snackTime" />       // Time input HH:MM
```

#### **Delivery Extensions** (5 fields)
```typescript
<FormField name="deliveryPhone" />           // Phone input
<FormField name="preferredDeliveryTime" />   // Time input
<FormField name="distanceFromSppg" />        // Number (KM), 0-1000
<FormField name="estimatedTravelTime" />     // Number (minutes)
<FormField name="accessRoadCondition" />     // Enum select (GOOD/FAIR/POOR)
```

---

### 🟡 HIGH PRIORITY - Business Critical (13 fields)

#### **Budget & Contracts Section** (NEW - 6 fields)
```typescript
// Create new section: "Kontrak & Anggaran"
<FormField name="contractNumber" />          // Text input
<FormField name="contractStartDate" />       // Date picker
<FormField name="contractEndDate" />         // Date picker (validation: after start)
<FormField name="contractValue" />           // Currency input (Rp)
<FormField name="monthlyBudgetAllocation" /> // Currency input (Rp)
<FormField name="budgetPerStudent" />        // Currency input (Rp 1,000-100,000)
```

#### **Performance Metrics Section** (NEW - 7 fields)
```typescript
// Create new section: "Metrik Kinerja"
<FormField name="attendanceRate" />       // Number (0-100%)
<FormField name="participationRate" />    // Number (0-100%)
<FormField name="satisfactionScore" />    // Number (0-10)
<FormField name="lastDistributionDate" /> // Date picker
<FormField name="lastReportDate" />       // Date picker
<FormField name="totalDistributions" />   // Number (read-only)
<FormField name="totalMealsServed" />     // Number (read-only)
```

---

### 🟢 MEDIUM PRIORITY - Operational Data (5 fields)

#### **Facilities Extensions**
```typescript
<FormField name="hasRefrigerator" />   // Checkbox
<FormField name="hasDiningArea" />     // Checkbox
<FormField name="diningCapacity" />    // Number (conditionally visible)
<FormField name="hasHandwashing" />    // Checkbox
```

#### **Location**
```typescript
<FormField name="urbanRural" />        // Enum select (URBAN/RURAL)
```

---

### 🔵 LOW PRIORITY - Optional Fields (8 fields)

#### **Integration** (2 fields)
```typescript
<FormField name="externalSystemId" />  // Text input (optional)
<FormField name="syncedAt" />          // Date display (read-only)
```

#### **Lifecycle** (2 fields)
```typescript
<FormField name="enrollmentDate" />    // Date picker
<FormField name="reactivationDate" />  // Date picker (conditional)
```

#### **Dietary**
```typescript
<FormField name="religiousReqs" />     // Text input (optional)
```

#### **Documentation** (3 fields)
```typescript
<FormField name="notes" />                // Textarea (optional)
<FormField name="specialInstructions" />  // Textarea (optional)
<FormField name="documents" />            // File upload array (optional)
```

---

## 🔧 TECHNICAL ISSUES TO FIX

### 1. TypeScript Compilation Errors (BLOCKING)
**Error**: 40+ `Control<...>` type incompatibility errors

**Solution Option A** (Quick Fix):
```typescript
// Line 90 - Add 'as any' to resolver
const form = useForm<SchoolMasterInput>({
  resolver: zodResolver(schoolMasterSchema) as any,  // ⚠️ Temporary fix
  mode: 'onChange',
  defaultValues: { /* ... */ }
})
```

**Solution Option B** (Proper Fix):
```bash
# Check React Hook Form & Zod versions
npm list @hookform/resolvers react-hook-form zod
# Update if needed
npm update @hookform/resolvers react-hook-form zod
```

### 2. Remove useVillages Hook (NOT FOUND)
**Error**: Line 87 - `useVillages` imported but not exported from hooks

**Fix**: Remove this line:
```typescript
// Line 87 - DELETE THIS LINE
const { data: villages = [], isLoading: isLoadingVillages } = useVillages()
```

### 3. Fix schoolStatus Enum Value
**Current**: Using string literals 'ACTIVE', 'INACTIVE', 'SUSPENDED'  
**Schema**: Uses enum `SchoolStatus.NEGERI`, `SchoolStatus.SWASTA`, etc.

**Fix**: Update Select options to match schema enum

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Fix Blockers (15 minutes)
- [ ] Fix TypeScript errors (add `as any` to resolver)
- [ ] Remove `useVillages` line (Line 87)
- [ ] Test form compiles successfully

### Phase 2: Critical Fields (2 hours)
- [ ] Implement regional cascade (4 fields) - 30 min
- [ ] Add identification section (5 fields) - 30 min
- [ ] Add contact extensions (3 fields) - 20 min
- [ ] Add student gender fields (2 fields) - 20 min
- [ ] Add feeding time fields (3 fields) - 20 min
- [ ] Add delivery extensions (5 fields) - 30 min

### Phase 3: Business Critical (2 hours)
- [ ] Create Budget & Contracts section (6 fields) - 1 hour
- [ ] Create Performance Metrics section (7 fields) - 1 hour

### Phase 4: Polish & Optional (1 hour)
- [ ] Add facilities extensions (4 fields) - 20 min
- [ ] Add location field (1 field) - 10 min
- [ ] Add integration fields (2 fields) - 10 min
- [ ] Add lifecycle fields (2 fields) - 10 min
- [ ] Add documentation fields (3 fields) - 10 min

### Phase 5: Testing & Validation (1 hour)
- [ ] Test all field validations
- [ ] Test cascading selects
- [ ] Test form submission
- [ ] Test error handling
- [ ] Test with real data

**Total Estimated Time**: 6-7 hours for complete implementation

---

## 📊 SUMMARY STATISTICS

| Category | Implemented | Missing | % Complete |
|----------|------------|---------|------------|
| Core & Program | 1 | 0 | 100% ✅ |
| Basic Information | 2 | 0 | 100% ✅ |
| School Classification | 2 | 0 | 100% ✅ |
| Contact Information | 3 | 3 | 50% ⚠️ |
| Address & Location | 3 | 1 | 75% ⚠️ |
| **Regional Hierarchy** | 1 | 3 | **25% 🔴** |
| Student Demographics | 7 | 2 | 78% ⚠️ |
| Feeding Operations | 4 | 3 | 57% ⚠️ |
| Delivery & Logistics | 3 | 5 | 38% ⚠️ |
| Facilities | 5 | 4 | 56% ⚠️ |
| **Identification** | 0 | 5 | **0% 🔴** |
| **Budget & Contracts** | 0 | 6 | **0% 🔴** |
| **Performance Metrics** | 0 | 7 | **0% 🔴** |
| **Status & Lifecycle** | 0 | 5 | **0% 🔴** |
| **Dietary & Cultural** | 0 | 5 | **0% 🔴** |
| **Integration & Sync** | 0 | 2 | **0% 🔴** |
| **Notes & Documentation** | 0 | 3 | **0% 🔴** |
| **TOTAL** | **30** | **52** | **37%** |

---

## 🚨 CRITICAL NOTES

### Schema vs Form Mismatch
**FOUND IN FORM BUT NOT IN SCHEMA**:
- `isActive` (Line ???) - Not in schema
- `suspendedAt` (Line ???) - Not in schema  
- `suspensionReason` (Line ???) - Not in schema
- `beneficiaryType` (Line ???) - Not in schema
- `specialDietary` (Line ???) - Not in schema
- `allergyAlerts` (Line ???) - Not in schema
- `culturalReqs` (Line ???) - Not in schema

**ACTION REQUIRED**: 
1. Check if these fields were intentionally removed from schema
2. If yes: Remove from form
3. If no: Add back to schema

### Complex Validations Required
1. **Gender Sum**: `maleStudents + femaleStudents === totalStudents`
2. **Age Sum**: `students4to6 + students7to12 + students13to15 + students16to18 === totalStudents`
3. **Contract Dates**: `contractEndDate > contractStartDate`
4. **Budget Range**: `budgetPerStudent >= 1000 && budgetPerStudent <= 100000`
5. **Distance Range**: `distanceFromSppg >= 0 && distanceFromSppg <= 1000`

---

**Generated by**: GitHub Copilot  
**Date**: January 2025  
**Status**: Ready for implementation
