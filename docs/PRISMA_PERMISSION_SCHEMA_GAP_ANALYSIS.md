# Prisma Permission Schema Gap Analysis

**Date**: October 25, 2025  
**Issue**: Mismatch between Prisma PermissionType enum and actual permissions used in code  
**Status**: 🔴 **CRITICAL SCHEMA GAP IDENTIFIED**

---

## 🚨 Critical Finding

Ada **MAJOR DISCREPANCY** antara:
1. **Prisma Schema** (`PermissionType` enum) - 29 permissions
2. **Code Implementation** (`lib/permissions.ts`) - 26 **ADDITIONAL** platform-specific permissions

**Impact**: 
- ❌ Platform Admin permissions **TIDAK ADA** di database schema
- ❌ `UserPermission` model tidak bisa store PLATFORM_* permissions
- ⚠️ Current implementation works karena hanya pakai **role-based checks** (tidak store ke DB)
- 🔴 **Future problem**: Jika ingin custom per-user permissions, schema tidak support

---

## 📊 Permission Comparison

### In Prisma Schema (`enum PermissionType`)

```prisma
// prisma/schema.prisma - Lines 6773-6801

enum PermissionType {
  // General (5 permissions)
  READ
  WRITE
  DELETE
  APPROVE
  
  // User Management (2)
  USER_MANAGE
  ROLE_ASSIGN
  
  // Settings (1)
  SETTINGS_MANAGE
  
  // SPPG Operations (8)
  MENU_MANAGE
  PROCUREMENT_MANAGE
  PRODUCTION_MANAGE
  DISTRIBUTION_MANAGE
  QUALITY_MANAGE
  FINANCIAL_MANAGE
  HR_MANAGE
  
  // Reports & Analytics (4)
  REPORTS_VIEW
  REPORTS_GENERATE
  ANALYTICS_VIEW
  ANALYTICS_ADVANCED
  
  // System (3)
  SYSTEM_CONFIG
  DATA_EXPORT
  DATA_IMPORT
  
  // Audit (1)
  AUDIT_LOG_VIEW
  
  // Notifications (3)
  NOTIFICATION_SEND
  NOTIFICATION_TEMPLATE_MANAGE
  NOTIFICATION_BULK_PROCESS
  
  // Inventory (3)
  INVENTORY_VIEW
  INVENTORY_MANAGE
  INVENTORY_APPROVE
}

// TOTAL: 29 permissions
// ❌ NO PLATFORM_* permissions!
```

### In Code (`lib/permissions.ts`)

```typescript
// src/lib/permissions.ts - Lines 18-72

export type PermissionType =
  // General permissions (5)
  | 'ALL'
  | 'READ'
  | 'WRITE'
  | 'DELETE'
  | 'APPROVE'
  
  // SPPG Operations (14) ← More than Prisma!
  | 'MENU_MANAGE'
  | 'SCHOOL_MANAGE'           // ← Not in Prisma
  | 'PROCUREMENT_MANAGE'
  | 'SUPPLIER_MANAGE'         // ← Not in Prisma
  | 'PRODUCTION_MANAGE'
  | 'DISTRIBUTION_MANAGE'
  | 'FINANCIAL_MANAGE'
  | 'HR_MANAGE'
  | 'QUALITY_MANAGE'
  | 'USER_MANAGE'
  | 'ANALYTICS_VIEW'
  | 'REPORTS_VIEW'
  | 'INVENTORY_VIEW'
  | 'INVENTORY_MANAGE'
  | 'INVENTORY_APPROVE'
  
  // Platform Admin Permissions (26) ← COMPLETELY MISSING in Prisma!
  | 'PLATFORM_SPPG_VIEW'
  | 'PLATFORM_SPPG_CREATE'
  | 'PLATFORM_SPPG_EDIT'
  | 'PLATFORM_SPPG_DELETE'
  | 'PLATFORM_SPPG_ACTIVATE'
  | 'PLATFORM_USER_VIEW'
  | 'PLATFORM_USER_CREATE'
  | 'PLATFORM_USER_EDIT'
  | 'PLATFORM_USER_DELETE'
  | 'PLATFORM_DEMO_REQUEST_VIEW'
  | 'PLATFORM_DEMO_REQUEST_APPROVE'
  | 'PLATFORM_DEMO_REQUEST_REJECT'
  | 'PLATFORM_DEMO_REQUEST_CONVERT'
  | 'PLATFORM_SUBSCRIPTION_VIEW'
  | 'PLATFORM_SUBSCRIPTION_EDIT'
  | 'PLATFORM_BILLING_VIEW'
  | 'PLATFORM_BILLING_MANAGE'
  | 'PLATFORM_ANALYTICS_VIEW'
  | 'PLATFORM_ANALYTICS_EXPORT'
  | 'PLATFORM_SETTINGS_VIEW'
  | 'PLATFORM_SETTINGS_EDIT'
  | 'PLATFORM_DATABASE_ACCESS'
  | 'PLATFORM_SECURITY_MANAGE'
  | 'PLATFORM_AUDIT_LOG_VIEW'
  | 'PLATFORM_REGION_MANAGE'

// TOTAL: 45 permissions (29 base + 16 additional)
```

---

## 🔍 Gap Analysis

### Missing in Prisma Schema

#### Platform Admin Permissions (26 missing)
```typescript
// SPPG Management
'PLATFORM_SPPG_VIEW'           // ❌ Not in Prisma
'PLATFORM_SPPG_CREATE'         // ❌ Not in Prisma
'PLATFORM_SPPG_EDIT'           // ❌ Not in Prisma
'PLATFORM_SPPG_DELETE'         // ❌ Not in Prisma
'PLATFORM_SPPG_ACTIVATE'       // ❌ Not in Prisma

// User Management
'PLATFORM_USER_VIEW'           // ❌ Not in Prisma
'PLATFORM_USER_CREATE'         // ❌ Not in Prisma
'PLATFORM_USER_EDIT'           // ❌ Not in Prisma
'PLATFORM_USER_DELETE'         // ❌ Not in Prisma

// Demo Requests
'PLATFORM_DEMO_REQUEST_VIEW'   // ❌ Not in Prisma
'PLATFORM_DEMO_REQUEST_APPROVE'// ❌ Not in Prisma
'PLATFORM_DEMO_REQUEST_REJECT' // ❌ Not in Prisma
'PLATFORM_DEMO_REQUEST_CONVERT'// ❌ Not in Prisma

// Billing & Subscriptions
'PLATFORM_SUBSCRIPTION_VIEW'   // ❌ Not in Prisma
'PLATFORM_SUBSCRIPTION_EDIT'   // ❌ Not in Prisma
'PLATFORM_BILLING_VIEW'        // ❌ Not in Prisma
'PLATFORM_BILLING_MANAGE'      // ❌ Not in Prisma

// Analytics
'PLATFORM_ANALYTICS_VIEW'      // ❌ Not in Prisma
'PLATFORM_ANALYTICS_EXPORT'    // ❌ Not in Prisma

// Settings & System
'PLATFORM_SETTINGS_VIEW'       // ❌ Not in Prisma
'PLATFORM_SETTINGS_EDIT'       // ❌ Not in Prisma
'PLATFORM_DATABASE_ACCESS'     // ❌ Not in Prisma
'PLATFORM_SECURITY_MANAGE'     // ❌ Not in Prisma
'PLATFORM_AUDIT_LOG_VIEW'      // ❌ Not in Prisma
'PLATFORM_REGION_MANAGE'       // ❌ Not in Prisma
```

#### SPPG Permissions (2 missing)
```typescript
'SCHOOL_MANAGE'    // ❌ Not in Prisma (but used in code)
'SUPPLIER_MANAGE'  // ❌ Not in Prisma (but used in code)
```

#### Special Permission
```typescript
'ALL'  // ❌ Not in Prisma (used for SUPERADMIN catch-all)
```

---

## 💾 UserPermission Model Analysis

### Current Model
```prisma
// prisma/schema.prisma - Lines 3892-3915

model UserPermission {
  id           String         @id @default(cuid())
  userId       String
  permission   PermissionType  // ← This enum is INCOMPLETE!
  resourceType String
  resourceId   String?
  accessLevel  AccessLevel    @default(READ_ONLY)
  sppgId       String?
  moduleAccess String[]
  grantedBy    String
  grantedAt    DateTime       @default(now())
  expiresAt    DateTime?
  isActive     Boolean        @default(true)
  conditions   Json?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, permission, resourceType, resourceId])
  @@index([userId, isActive])
  @@index([permission, accessLevel])
  @@map("user_permissions")
}
```

### Problem
**Jika kita ingin create custom permission untuk user tertentu:**

```typescript
// ❌ THIS WILL FAIL AT RUNTIME!
await db.userPermission.create({
  data: {
    userId: 'user123',
    permission: 'PLATFORM_SPPG_VIEW',  // ← NOT IN ENUM!
    resourceType: 'SPPG',
    grantedBy: 'superadmin',
  }
})

// ERROR: Invalid value for enum PermissionType: 'PLATFORM_SPPG_VIEW'
```

**Current workaround:**
```typescript
// ✅ Works because we check role, not DB permissions
const permissions = rolePermissions[user.userRole]
if (permissions.includes('PLATFORM_SPPG_VIEW')) {
  // Allow access
}
```

---

## 🎯 Current System Status

### Why It Works Now ✅

**Current implementation is PURELY role-based**:
```typescript
// lib/permissions.ts

const rolePermissions: Record<UserRole, PermissionType[]> = {
  PLATFORM_SUPERADMIN: [
    'ALL',
    'PLATFORM_SPPG_VIEW',
    'PLATFORM_SPPG_CREATE',
    // ... etc (hardcoded in code)
  ],
  
  PLATFORM_ANALYST: [
    'READ',
    'PLATFORM_SPPG_VIEW',
    'PLATFORM_ANALYTICS_VIEW',
    // ... etc (hardcoded in code)
  ]
}

// Permission check
export function hasPermission(role: UserRole, permission: PermissionType): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes('ALL') || permissions.includes(permission)
}
```

**No database queries needed** - permissions determined by `userRole` only.

### When It Will Break 🔴

**Scenario 1: Custom per-user permissions**
```typescript
// User request: "Give analyst@bagizi.id special access to SPPG Management"
// ❌ Can't store in database!
await db.userPermission.create({
  data: {
    userId: 'analyst-id',
    permission: 'PLATFORM_SPPG_EDIT',  // ← NOT IN PRISMA ENUM!
    resourceType: 'SPPG',
  }
})
// Result: Database constraint violation
```

**Scenario 2: Temporary permission grants**
```typescript
// User request: "Give support@bagizi.id temporary Database access for 1 hour"
// ❌ Can't store in database!
await db.userPermission.create({
  data: {
    userId: 'support-id',
    permission: 'PLATFORM_DATABASE_ACCESS',  // ← NOT IN PRISMA ENUM!
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
  }
})
// Result: Database constraint violation
```

**Scenario 3: Resource-specific permissions**
```typescript
// User request: "Give analyst@bagizi.id view access to SPPG Purwakarta only"
// ❌ Can't store in database!
await db.userPermission.create({
  data: {
    userId: 'analyst-id',
    permission: 'PLATFORM_SPPG_VIEW',  // ← NOT IN PRISMA ENUM!
    resourceId: 'sppg-purwakarta-id',
  }
})
// Result: Database constraint violation
```

---

## 📋 Migration Plan

### Option 1: Extend Prisma Enum (Recommended) ✅

**Update Prisma schema to include ALL permissions:**

```prisma
// prisma/schema.prisma

enum PermissionType {
  // ================================
  // GENERAL PERMISSIONS
  // ================================
  ALL
  READ
  WRITE
  DELETE
  APPROVE
  
  // ================================
  // SPPG OPERATIONS
  // ================================
  MENU_MANAGE
  SCHOOL_MANAGE
  PROCUREMENT_MANAGE
  SUPPLIER_MANAGE
  PRODUCTION_MANAGE
  DISTRIBUTION_MANAGE
  QUALITY_MANAGE
  FINANCIAL_MANAGE
  HR_MANAGE
  USER_MANAGE
  ANALYTICS_VIEW
  REPORTS_VIEW
  REPORTS_GENERATE
  INVENTORY_VIEW
  INVENTORY_MANAGE
  INVENTORY_APPROVE
  
  // ================================
  // PLATFORM ADMIN - SPPG MANAGEMENT
  // ================================
  PLATFORM_SPPG_VIEW
  PLATFORM_SPPG_CREATE
  PLATFORM_SPPG_EDIT
  PLATFORM_SPPG_DELETE
  PLATFORM_SPPG_ACTIVATE
  
  // ================================
  // PLATFORM ADMIN - USER MANAGEMENT
  // ================================
  PLATFORM_USER_VIEW
  PLATFORM_USER_CREATE
  PLATFORM_USER_EDIT
  PLATFORM_USER_DELETE
  
  // ================================
  // PLATFORM ADMIN - DEMO REQUESTS
  // ================================
  PLATFORM_DEMO_REQUEST_VIEW
  PLATFORM_DEMO_REQUEST_APPROVE
  PLATFORM_DEMO_REQUEST_REJECT
  PLATFORM_DEMO_REQUEST_CONVERT
  
  // ================================
  // PLATFORM ADMIN - BILLING
  // ================================
  PLATFORM_SUBSCRIPTION_VIEW
  PLATFORM_SUBSCRIPTION_EDIT
  PLATFORM_BILLING_VIEW
  PLATFORM_BILLING_MANAGE
  
  // ================================
  // PLATFORM ADMIN - ANALYTICS
  // ================================
  PLATFORM_ANALYTICS_VIEW
  PLATFORM_ANALYTICS_EXPORT
  PLATFORM_AUDIT_LOG_VIEW
  
  // ================================
  // PLATFORM ADMIN - SETTINGS
  // ================================
  PLATFORM_SETTINGS_VIEW
  PLATFORM_SETTINGS_EDIT
  PLATFORM_DATABASE_ACCESS
  PLATFORM_SECURITY_MANAGE
  
  // ================================
  // PLATFORM ADMIN - REGIONAL
  // ================================
  PLATFORM_REGION_MANAGE
  
  // ================================
  // SYSTEM
  // ================================
  SYSTEM_CONFIG
  DATA_EXPORT
  DATA_IMPORT
  
  // ================================
  // NOTIFICATIONS
  // ================================
  NOTIFICATION_SEND
  NOTIFICATION_TEMPLATE_MANAGE
  NOTIFICATION_BULK_PROCESS
  
  // ================================
  // ANALYTICS (Legacy)
  // ================================
  ANALYTICS_ADVANCED
}
```

**Migration command:**
```bash
# Generate migration
npx prisma migrate dev --name add_platform_permissions

# Apply to database
npx prisma migrate deploy
```

**Benefits**:
- ✅ Full alignment between code and database
- ✅ Enables per-user custom permissions
- ✅ Supports temporary permission grants
- ✅ Enables resource-specific permissions
- ✅ Future-proof for custom RBAC

**Risks**:
- ⚠️ Migration adds ~26 new enum values
- ⚠️ Existing data unaffected (backward compatible)
- ⚠️ Need to regenerate Prisma client

---

### Option 2: Remove UserPermission Model ❌

**If we never plan to use per-user permissions:**

```prisma
// Remove UserPermission model entirely
// Keep only role-based permissions in code
```

**Benefits**:
- ✅ Simpler system
- ✅ No database overhead
- ✅ Faster permission checks

**Downsides**:
- ❌ No flexibility for custom permissions
- ❌ Can't grant temporary access
- ❌ Can't restrict to specific resources
- ❌ All users of same role have identical permissions

---

### Option 3: Hybrid Approach (Use JSON) ⚠️

**Keep enum minimal, use JSON for platform permissions:**

```prisma
model UserPermission {
  id           String         @id @default(cuid())
  userId       String
  permission   PermissionType?  // Optional - for SPPG permissions
  platformPermissions Json?     // For PLATFORM_* permissions
  resourceType String
  // ... rest
}
```

**Benefits**:
- ✅ No enum changes needed
- ✅ Flexible for future permissions

**Downsides**:
- ❌ Lose type safety
- ❌ Can't query by permission easily
- ❌ Inconsistent pattern
- ❌ Hard to maintain

---

## 🎯 Recommendation

### **Implement Option 1: Extend Prisma Enum** ✅

**Reasoning**:
1. **Alignment**: Code and database should match
2. **Future-proof**: Enables advanced RBAC features
3. **Type Safety**: Maintain TypeScript type safety
4. **Queryability**: Can query users by permission
5. **Audit**: Can track who has what permissions
6. **Temporary Access**: Can grant time-limited permissions
7. **Resource-specific**: Can restrict to specific SPPGs

**Implementation Steps**:

```bash
# 1. Update Prisma schema
# Add all PLATFORM_* permissions to PermissionType enum

# 2. Create migration
npx prisma migrate dev --name add_platform_admin_permissions

# 3. Regenerate Prisma client
npx prisma generate

# 4. Verify TypeScript types
npm run type-check

# 5. Test permission checks
# Current code will continue working (role-based)
# New code can use UserPermission model
```

---

## ⚠️ Current Impact Assessment

### Does This Break Current Implementation? 

**NO** ❌ - Current system works because:
1. Permissions checked via `rolePermissions` map (in-memory)
2. No database queries for permissions
3. `UserPermission` model not used in current code
4. Type safety maintained in TypeScript layer

### Will This Cause Problems?

**YES** 🔴 - In these scenarios:
1. Custom per-user permissions needed
2. Temporary access grants required
3. Resource-specific permissions needed
4. Audit trail of permission changes required
5. Dynamic permission management needed

### Should We Fix It Now?

**YES** ✅ - Recommended to fix **BEFORE**:
1. Implementing SPPG permission system
2. Adding custom permission features
3. Building permission management UI
4. Scaling to more complex RBAC

---

## 📊 Summary

| Aspect | Current State | With Migration |
|--------|--------------|----------------|
| **Code Permissions** | 45 permissions | 45 permissions |
| **DB Permissions** | 29 permissions | 45 permissions ✅ |
| **Type Safety** | ✅ Yes (TS only) | ✅ Yes (TS + DB) |
| **Per-user Permissions** | ❌ Not possible | ✅ Possible |
| **Temporary Access** | ❌ Not possible | ✅ Possible |
| **Resource-specific** | ❌ Not possible | ✅ Possible |
| **Current Code Works** | ✅ Yes | ✅ Yes |
| **Future-proof** | ❌ Limited | ✅ Full flexibility |

---

## ✅ Action Items

### Immediate (Required before SPPG permission implementation)
- [ ] Update `prisma/schema.prisma` - Add PLATFORM_* permissions to enum
- [ ] Run `prisma migrate dev` - Create and apply migration
- [ ] Run `prisma generate` - Regenerate Prisma client
- [ ] Run `npm run type-check` - Verify TypeScript types
- [ ] Document migration in CHANGELOG

### Follow-up (For future SPPG permissions)
- [ ] Define SPPG permission requirements
- [ ] Add SPPG-specific permissions to enum if needed
- [ ] Implement per-user permission management
- [ ] Build permission management UI
- [ ] Create permission audit trail

---

**Status**: 🔴 **SCHEMA GAP IDENTIFIED - MIGRATION RECOMMENDED**

**Priority**: HIGH (before implementing SPPG permission system)

**Impact**: Breaking change in future, but **safe to migrate now** (backward compatible)

**Estimated Time**: 
- Schema update: 30 minutes
- Migration creation: 15 minutes
- Testing: 30 minutes
- Documentation: 15 minutes
- **Total**: ~90 minutes

---

**Recommendation**: ✅ **Proceed with Option 1 migration immediately**

Current code will continue working after migration, but future features will be enabled.

---

**Analyst**: GitHub Copilot  
**Date**: October 25, 2025  
**Review Status**: Awaiting user approval for migration
