# RBAC Middleware Migration Guide

**How to Migrate Existing API Routes to Use RBAC Middleware**

---

## 📋 Before & After Examples

### Example 1: Admin SPPG List API

#### ❌ BEFORE (Manual Auth Checks - 346 lines)

```typescript
// src/app/api/admin/sppg/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * Check if user has admin platform access
 */
function hasAdminAccess(userRole: UserRole | null): boolean {
  const adminRoles: UserRole[] = [
    'PLATFORM_SUPERADMIN',
    'PLATFORM_SUPPORT',
    'PLATFORM_ANALYST'
  ]
  return userRole ? adminRoles.includes(userRole) : false
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Authorization check
    if (!hasAdminAccess(session.user.userRole ?? null)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // 3. Your business logic
    const sppgs = await db.sppg.findMany()
    
    return NextResponse.json({ success: true, data: sppgs })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Issues with this approach:**
- ❌ Repetitive auth/authz code in every endpoint
- ❌ No audit logging
- ❌ No IP tracking
- ❌ No fine-grained permissions (super admin vs support vs analyst)
- ❌ Inconsistent error messages
- ❌ Manual error handling
- ❌ Not DRY (Don't Repeat Yourself)

---

#### ✅ AFTER (Using RBAC Middleware - Cleaner!)

```typescript
// src/app/api/admin/sppg/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (session) => {
    // Your business logic only - auth/authz handled automatically!
    const sppgs = await db.sppg.findMany()
    
    return NextResponse.json({ success: true, data: sppgs })
  })
}
```

**Benefits:**
- ✅ Clean, focused code - only business logic
- ✅ Automatic auth/authz checks
- ✅ Automatic audit logging with IP and User-Agent
- ✅ Consistent error responses
- ✅ Type-safe session access
- ✅ Centralized security logic
- ✅ Easy to maintain and update
- ✅ DRY principle

**Lines of Code Reduction**: 346 lines → ~12 lines (97% reduction!)

---

### Example 2: Delete SPPG (Super Admin Only)

#### ❌ BEFORE

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check super admin only
    if (session.user.userRole !== 'PLATFORM_SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 }
      )
    }

    await db.sppg.delete({ where: { id: params.id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### ✅ AFTER

```typescript
import { withAdminAuth } from '@/lib/api-middleware'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(
    request,
    async (session) => {
      await db.sppg.delete({ where: { id: params.id } })
      return NextResponse.json({ success: true })
    },
    { requireSuperAdmin: true } // ← One line to enforce super admin!
  )
}
```

---

### Example 3: SPPG Menu API (Multi-Tenant)

#### ❌ BEFORE

```typescript
// src/app/api/sppg/menu/route.ts
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check SPPG access
    if (!session.user.sppgId) {
      return NextResponse.json(
        { success: false, error: 'SPPG access required' },
        { status: 403 }
      )
    }

    const isSppgUser = session.user.userRole?.startsWith('SPPG_')
    if (!isSppgUser) {
      return NextResponse.json(
        { success: false, error: 'SPPG user required' },
        { status: 403 }
      )
    }

    const sppgId = session.user.sppgId

    const menus = await db.nutritionMenu.findMany({
      where: {
        program: {
          sppgId // Multi-tenant filtering
        }
      }
    })
    
    return NextResponse.json({ success: true, data: menus })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### ✅ AFTER

```typescript
import { withSppgAuth } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    const sppgId = session.user.sppgId! // Type-safe, guaranteed to exist

    const menus = await db.nutritionMenu.findMany({
      where: {
        program: { sppgId }
      }
    })
    
    return NextResponse.json({ success: true, data: menus })
  })
}
```

---

### Example 4: Analyst Read-Only API

#### ❌ BEFORE

```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Manual analyst check
    if (session.user.userRole === 'PLATFORM_ANALYST') {
      return NextResponse.json(
        { success: false, error: 'Analysts have read-only access' },
        { status: 403 }
      )
    }

    // Create operation
    const data = await request.json()
    const result = await db.something.create({ data })
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### ✅ AFTER

```typescript
import { withAdminAuth } from '@/lib/api-middleware'

export async function POST(request: NextRequest) {
  return withAdminAuth(
    request,
    async (session) => {
      const data = await request.json()
      const result = await db.something.create({ data })
      
      return NextResponse.json({ success: true, data: result })
    },
    { allowAnalystReadOnly: false } // ← Analysts blocked automatically!
  )
}
```

**Note**: Default behavior already blocks analysts from non-GET requests!

---

## 🔄 Migration Checklist

For each API route file:

- [ ] Import `withAdminAuth` or `withSppgAuth` from `@/lib/api-middleware`
- [ ] Remove manual `auth()` calls
- [ ] Remove manual role checking logic
- [ ] Remove manual error handling for auth/authz
- [ ] Wrap handler logic in `withAdminAuth()` or `withSppgAuth()`
- [ ] Add options if needed (`requireSuperAdmin`, `allowAnalystReadOnly`)
- [ ] Test with different user roles
- [ ] Verify audit logging in database

---

## 📝 Migration Script Template

### Admin Route Migration:

```typescript
// 1. Add import
import { withAdminAuth } from '@/lib/api-middleware'

// 2. Remove these
// ❌ const session = await auth()
// ❌ if (!session?.user) { ... }
// ❌ if (!hasAdminAccess(...)) { ... }

// 3. Wrap handler
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (session) => {
    // Your business logic here
    // session.user is available and guaranteed to be admin
  })
}

// 4. For super admin only operations
export async function DELETE(request: NextRequest, { params }) {
  return withAdminAuth(
    request,
    async (session) => { /* logic */ },
    { requireSuperAdmin: true }
  )
}
```

### SPPG Route Migration:

```typescript
// 1. Add import
import { withSppgAuth } from '@/lib/api-middleware'

// 2. Remove manual checks
// ❌ const session = await auth()
// ❌ if (!session?.user.sppgId) { ... }
// ❌ if (!isSppgUser) { ... }

// 3. Wrap handler
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    const sppgId = session.user.sppgId! // Guaranteed to exist
    // Your business logic here
  })
}
```

---

## 🎯 Quick Reference

| Function | Use Case | Options |
|----------|----------|---------|
| `withAdminAuth` | Admin API routes | `requireSuperAdmin`, `allowAnalystReadOnly` |
| `withSppgAuth` | SPPG API routes | `requireSppgId` |
| `checkAdminAccess` | Manual check (custom logic) | Same as `withAdminAuth` |
| `checkSppgAccess` | Manual check (custom logic) | Same as `withSppgAuth` |
| `checkAuth` | Basic auth check only | None |

---

## ✅ Benefits Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines of Code | ~50-100 per route | ~10-20 per route | **80-90% reduction** |
| Auth Logic | Duplicated everywhere | Centralized | **100% DRY** |
| Audit Logging | Manual or missing | Automatic | **100% coverage** |
| Error Consistency | Varies per route | Standardized | **100% consistent** |
| Type Safety | Partial | Full | **100% type-safe** |
| Security Checks | May be forgotten | Always enforced | **100% coverage** |
| Maintenance | Update every route | Update once | **Instant propagation** |

---

## 🚀 Recommended Migration Order

1. **Critical Admin Routes First**:
   - `/api/admin/sppg/*` - SPPG management
   - `/api/admin/users/*` - User management
   - `/api/admin/settings/*` - Platform settings

2. **SPPG Operational Routes**:
   - `/api/sppg/menu/*` - Menu management
   - `/api/sppg/procurement/*` - Procurement
   - `/api/sppg/production/*` - Production

3. **Lower Priority**:
   - Read-only analytics endpoints
   - Reporting endpoints
   - Public data endpoints

---

## 📊 Example Migration PR Template

```markdown
## RBAC Middleware Migration - [Module Name]

### Changes
- Replaced manual auth/authz checks with `withAdminAuth()` wrapper
- Removed duplicate auth logic (~XX lines removed)
- Added automatic audit logging
- Added fine-grained permission support

### Files Changed
- `src/app/api/admin/[module]/route.ts` (-XX lines)
- `src/app/api/admin/[module]/[id]/route.ts` (-XX lines)

### Testing
- [x] PLATFORM_SUPERADMIN can access all routes
- [x] PLATFORM_SUPPORT has appropriate restrictions
- [x] PLATFORM_ANALYST limited to read-only
- [x] Non-admin users get 403 Forbidden
- [x] Audit logs created for all access attempts
- [x] Error responses are consistent

### Security Improvements
- Centralized security logic
- Automatic IP tracking
- Comprehensive audit trail
- Type-safe session access
```

---

**Ready to migrate? Start with one route, test thoroughly, then apply the pattern to all routes!** 🚀🔐
