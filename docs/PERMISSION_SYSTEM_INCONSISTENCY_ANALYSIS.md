# Permission System Inconsistency Analysis

**Date**: October 25, 2025  
**Issue**: Inconsistent permission checking methods between SPPG and Platform Admin users  
**Status**: 🔴 **CRITICAL INCONSISTENCY IDENTIFIED**

---

## 🔍 Problem Overview

Anda benar! Ada **inkonsistensi fundamental** dalam cara Platform Admin dan SPPG users menggunakan permission system:

### Platform Admin (✅ Fine-grained RBAC)
- ✅ Menggunakan **client-side permission hooks** (`useSppgPermissions`, `useDemoRequestPermissions`, etc.)
- ✅ Menggunakan **server-side middleware checks** (whitelist-based per role)
- ✅ UI conditionally renders berdasarkan permissions
- ✅ Action buttons disabled untuk read-only users

### SPPG Users (❌ Static Menu - No Permission Checks)
- ❌ Menu **STATIC** - tidak ada conditional rendering
- ❌ Tidak menggunakan permission hooks
- ❌ Semua SPPG users melihat menu yang sama
- ❌ Hanya middleware yang block akses (redirect after click)

---

## 📊 Detailed Comparison

### 1. **Middleware Implementation**

#### Platform Admin (Fine-grained)
```typescript
// src/middleware.ts - Lines 180-205

if (isAnalyst) {
  // WHITELIST-based: Only allow specific routes
  const isReadOnlyRoute = 
    pathname === '/admin' ||
    pathname.startsWith('/admin/analytics') ||
    pathname.startsWith('/admin/activity-logs') ||
    pathname.startsWith('/admin/demo-requests') ||
    pathname.startsWith('/admin/subscriptions') ||
    pathname.startsWith('/admin/invoices') ||
    pathname.startsWith('/admin/notifications') ||
    (pathname.startsWith('/admin/settings') && req.method === 'GET') ||
    (pathname.startsWith('/admin/sppg') && req.method === 'GET') ||
    (pathname.startsWith('/admin/users') && req.method === 'GET')

  if (!isReadOnlyRoute) {
    // Redirect to unauthorized
    return NextResponse.redirect(new URL(`/unauthorized?error=read-only`, req.url))
  }
}

if (isSupport) {
  // BLACKLIST-based: Block specific restricted routes
  const restrictedRoutes = [
    '/admin/database',
    '/admin/security',
    '/admin/settings/platform'
  ]

  if (restrictedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(`/unauthorized?error=restricted`, req.url))
  }
}
```

**Method**: 
- ✅ ANALYST: **Whitelist** (explicitly allowed routes)
- ✅ SUPPORT: **Blacklist** (explicitly blocked routes)
- ✅ SUPERADMIN: Full access (no restrictions)

#### SPPG Users (Simple Check)
```typescript
// src/middleware.ts - Lines 90-135

if (isSppgRoute) {
  // Simple binary check: SPPG user or not?
  const isAdminUser = 
    userRole === 'PLATFORM_SUPERADMIN' ||
    userRole === 'PLATFORM_SUPPORT' ||
    userRole === 'PLATFORM_ANALYST'
  
  if (isAdminUser) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  if (!session?.user.sppgId) {
    return NextResponse.redirect(new URL('/access-denied', req.url))
  }

  const isSppgUser = session.user.userRole?.startsWith('SPPG_') ||
                    session.user.userType === 'SPPG_USER' ||
                    session.user.userType === 'SPPG_ADMIN'
  
  if (!isSppgUser) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
}
```

**Method**: 
- ❌ **Binary check only**: Has SPPG role → allow ALL routes
- ❌ No fine-grained permission checks
- ❌ No role-based restrictions (KEPALA vs STAFF)

---

### 2. **Client-side UI Implementation**

#### Platform Admin Sidebar (Dynamic)
```typescript
// src/components/shared/navigation/AdminSidebar.tsx

function getAdminNavigation(permissions: {
  sppg: ReturnType<typeof useSppgPermissions>
  user: ReturnType<typeof useUserPermissions>
  demoRequest: ReturnType<typeof useDemoRequestPermissions>
  // ... etc
}): NavigationGroup[] {
  const coreManagementItems: NavigationItem[] = []

  // Conditional rendering based on permissions
  if (permissions.sppg.canView) {
    coreManagementItems.push({
      title: 'SPPG Management',
      href: '/admin/sppg',
      icon: Building2,
      description: 'Manage all SPPG tenants'
    })
  }

  if (permissions.settings.canManageSecurity) {
    systemItems.push({
      title: 'Security',
      href: '/admin/security',
      icon: Shield,
      description: 'Security configuration'
    })
  }

  return navigation
}

export function AdminSidebar() {
  // Get permissions from hooks
  const sppgPermissions = useSppgPermissions()
  const userPermissions = useUserPermissions()
  const demoRequestPermissions = useDemoRequestPermissions()
  // ... etc

  // Generate dynamic navigation
  const adminNavigation = getAdminNavigation({
    sppg: sppgPermissions,
    user: userPermissions,
    demoRequest: demoRequestPermissions,
    // ... etc
  })

  return (
    <Sidebar>
      {adminNavigation.map(group => (
        // Render only allowed menu items
        <SidebarGroup key={group.title}>
          {group.items.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>{item.title}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      ))}
    </Sidebar>
  )
}
```

**Benefits**:
- ✅ Different users see different menus
- ✅ ANALYST doesn't see "Security", "Database" options
- ✅ SUPPORT doesn't see restricted items
- ✅ No confusing "Access Denied" after clicking menu

#### SPPG Sidebar (Static)
```typescript
// src/components/shared/navigation/SppgSidebar.tsx

// STATIC navigation - same for ALL SPPG users
const sppgNavigation: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Program Management',
    items: [
      { title: 'Program', href: '/program', icon: Briefcase },
      { title: 'Schools', href: '/schools', icon: School },
      { title: 'Beneficiaries', href: '/beneficiaries', icon: Users }
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Menu Planning', href: '/menu', icon: ChefHat },
      { title: 'Procurement', href: '/procurement', icon: ShoppingCart },
      { title: 'Production', href: '/production', icon: Factory },
      { title: 'Distribution', href: '/distribution', icon: Truck }
    ]
  },
  // ... ALL items shown to ALL users
]

export function SppgSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  return (
    <Sidebar>
      {sppgNavigation.map((group, index) => (
        // NO permission checks - render everything
        <SidebarGroup key={index}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </Sidebar>
  )
}
```

**Problems**:
- ❌ ALL SPPG users see ALL menu items
- ❌ SPPG_STAFF_DAPUR sees "Financial Reports" (shouldn't)
- ❌ SPPG_STAFF_QC sees "User Management" (shouldn't)
- ❌ SPPG_VIEWER sees "Create Production" button (shouldn't)
- ❌ User clicks menu → middleware blocks → shows error page

---

### 3. **Permission Hooks Usage**

#### Platform Admin Pages (With Permissions)
```typescript
// src/app/(admin)/admin/demo-requests/[id]/page.tsx

export default function DemoRequestDetailPage({ params }: PageProps) {
  // Get permissions
  const permissions = useDemoRequestPermissions()
  const isReadOnly = useIsReadOnly()

  return (
    <div>
      {/* Conditional action buttons */}
      {!isReadOnly && permissions.canTakeAction && (
        <Button onClick={handleApprove}>
          Approve Request
        </Button>
      )}

      {isReadOnly && (
        <Badge variant="outline">View Only Access</Badge>
      )}
    </div>
  )
}
```

**Benefits**:
- ✅ Buttons only shown if user has permission
- ✅ Read-only badge for ANALYST
- ✅ No confusing "Access Denied" errors

#### SPPG Pages (No Permissions)
```typescript
// Example: src/app/(sppg)/menu/page.tsx (hypothetical)

export default function MenuPage() {
  // NO permission checks!
  const { data: menus } = useMenus()

  return (
    <div>
      {/* ALL buttons shown to ALL users */}
      <Button onClick={handleCreate}>
        Create Menu
      </Button>

      <Button onClick={handleDelete}>
        Delete Menu
      </Button>

      <Button onClick={handleExport}>
        Export Financial Report
      </Button>

      {/* User clicks → API call → fails → shows error toast */}
    </div>
  )
}
```

**Problems**:
- ❌ All users see all buttons
- ❌ SPPG_VIEWER sees "Delete" button (shouldn't)
- ❌ SPPG_STAFF sees "Export Report" button (shouldn't)
- ❌ User clicks button → API fails → confusing error message

---

## 🎯 Recommended Solution

### Option 1: **Apply Platform Admin Pattern to SPPG** (Recommended)

Convert SPPG sidebar to use permission hooks like Platform Admin:

```typescript
// NEW: src/components/shared/navigation/SppgSidebar.tsx

import { 
  useSppgMenuPermissions,
  useSppgProcurementPermissions,
  useSppgProductionPermissions,
  // ... etc
} from '@/hooks/useSppgPermissions'

function getSppgNavigation(permissions: {
  menu: ReturnType<typeof useSppgMenuPermissions>
  procurement: ReturnType<typeof useSppgProcurementPermissions>
  // ... etc
}, userRole: string): NavigationGroup[] {
  const navigation: NavigationGroup[] = []

  // Overview - always shown
  navigation.push({
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
    ]
  })

  // Operations - conditional
  const operationItems: NavigationItem[] = []

  if (permissions.menu.canView) {
    operationItems.push({
      title: 'Menu Planning',
      href: '/menu',
      icon: ChefHat
    })
  }

  if (permissions.procurement.canView) {
    operationItems.push({
      title: 'Procurement',
      href: '/procurement',
      icon: ShoppingCart
    })
  }

  if (permissions.production.canView) {
    operationItems.push({
      title: 'Production',
      href: '/production',
      icon: Factory
    })
  }

  // Financial - only for KEPALA, ADMIN, AKUNTAN
  if (permissions.financial.canView) {
    navigation.push({
      title: 'Financial',
      items: [
        { title: 'Reports', href: '/reports', icon: FileText }
      ]
    })
  }

  return navigation
}

export function SppgSidebar() {
  // Get user info
  const { user } = useAuth()
  
  // Get permissions
  const menuPermissions = useSppgMenuPermissions()
  const procurementPermissions = useSppgProcurementPermissions()
  const productionPermissions = useSppgProductionPermissions()
  // ... etc

  // Generate dynamic navigation
  const sppgNavigation = getSppgNavigation({
    menu: menuPermissions,
    procurement: procurementPermissions,
    production: productionPermissions,
    // ... etc
  }, user?.userRole)

  return (
    <Sidebar>
      {sppgNavigation.map(group => (
        <SidebarGroup key={group.title}>
          {/* Render only allowed items */}
        </SidebarGroup>
      ))}
    </Sidebar>
  )
}
```

### Option 2: Keep Static but Add Middleware Whitelist

Add fine-grained middleware checks like Platform Admin:

```typescript
// src/middleware.ts

if (isSppgRoute) {
  const userRole = session?.user.userRole
  
  // SPPG_STAFF_DAPUR: Only access production & inventory
  if (userRole === 'SPPG_STAFF_DAPUR') {
    const allowedRoutes = [
      '/dashboard',
      '/production',
      '/inventory'
    ]
    
    if (!allowedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }
  }

  // SPPG_STAFF_QC: Only access quality control
  if (userRole === 'SPPG_STAFF_QC') {
    const allowedRoutes = [
      '/dashboard',
      '/production/quality-control'
    ]
    
    if (!allowedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }
  }

  // SPPG_VIEWER: Read-only access to most pages
  if (userRole === 'SPPG_VIEWER') {
    // Only GET requests allowed
    if (req.method !== 'GET') {
      return NextResponse.redirect(new URL('/unauthorized?error=read-only', req.url))
    }
  }
}
```

---

## 📋 Implementation Checklist

### Phase 1: Create SPPG Permission Hooks (Like Platform Admin)
- [ ] Create `src/hooks/useSppgPermissions.ts` with:
  - [ ] `useSppgMenuPermissions()`
  - [ ] `useSppgProcurementPermissions()`
  - [ ] `useSppgProductionPermissions()`
  - [ ] `useSppgDistributionPermissions()`
  - [ ] `useSppgInventoryPermissions()`
  - [ ] `useSppgFinancialPermissions()`
  - [ ] `useSppgHrdPermissions()`
  - [ ] `useSppgReportPermissions()`

### Phase 2: Update lib/permissions.ts with SPPG Permissions
- [ ] Define SPPG permission constants (like `PlatformSppgPermissions`)
- [ ] Create role permission matrix for SPPG roles
- [ ] Add helper functions:
  - [ ] `canManageMenu(role)`
  - [ ] `canManageProcurement(role)`
  - [ ] `canViewFinancial(role)`
  - [ ] etc.

### Phase 3: Convert SppgSidebar to Dynamic
- [ ] Create `getSppgNavigation()` function
- [ ] Add permission hook calls in component
- [ ] Remove static `sppgNavigation` array
- [ ] Add conditional rendering per menu group

### Phase 4: Update SPPG Pages with Permission Checks
- [ ] Add permission hooks to all SPPG pages
- [ ] Conditional action buttons (Create, Edit, Delete)
- [ ] Add "Read Only" badges for viewers
- [ ] Disable buttons for unauthorized users

### Phase 5: Add Middleware SPPG Permission Checks (Optional)
- [ ] Add whitelist for STAFF roles
- [ ] Add read-only enforcement for VIEWER
- [ ] Block write operations for restricted roles

---

## 🔥 Impact Analysis

### Without Fix (Current State)
**User Experience**:
- ❌ SPPG_STAFF_DAPUR sees "Financial Reports" → clicks → gets error
- ❌ SPPG_STAFF_QC sees "User Management" → clicks → gets error
- ❌ SPPG_VIEWER sees "Delete Production" button → clicks → gets error
- ❌ Confusing: "Why can I see it but not use it?"

**Security**:
- ⚠️ Relies ONLY on API-level checks (no UI guidance)
- ⚠️ Users might try unauthorized actions repeatedly
- ⚠️ Audit logs filled with failed attempts

### With Fix (Proposed)
**User Experience**:
- ✅ SPPG_STAFF_DAPUR only sees Production & Inventory menus
- ✅ SPPG_STAFF_QC only sees Quality Control section
- ✅ SPPG_VIEWER sees all pages but NO action buttons
- ✅ Clear: Users only see what they can access

**Security**:
- ✅ Defense in depth: UI + API + Middleware
- ✅ Less failed attempts in audit logs
- ✅ Consistent with Platform Admin pattern

---

## 🎯 Priority Recommendation

**CRITICAL**: Implement **Option 1** (Apply Platform Admin Pattern to SPPG)

**Why**:
1. ✅ **Consistency**: Same pattern across entire platform
2. ✅ **Better UX**: No confusing "Access Denied" errors
3. ✅ **Maintainability**: One pattern to maintain
4. ✅ **Scalability**: Easy to add new roles with specific permissions
5. ✅ **Security**: Defense in depth (UI + API + Middleware)

**Estimated Effort**: 
- Hook creation: 4 hours
- Sidebar refactor: 2 hours
- Page updates: 6 hours
- Testing: 4 hours
- **Total**: ~16 hours (2 days)

---

## 📝 Next Steps

1. **Document Current SPPG Roles & Expected Permissions**
   - List all SPPG roles (KEPALA, ADMIN, AHLI_GIZI, STAFF, etc.)
   - Define permission matrix (who can do what)

2. **Create SPPG Permission Hooks**
   - Mirror Platform Admin hook structure
   - Use same naming conventions

3. **Refactor SppgSidebar**
   - Convert to dynamic navigation
   - Test with different roles

4. **Update SPPG Pages**
   - Add permission checks to action buttons
   - Add read-only indicators

5. **Testing**
   - Test each SPPG role
   - Verify correct menu visibility
   - Verify correct button states

---

**Status**: 🔴 **INCONSISTENCY IDENTIFIED - ACTION REQUIRED**

**Recommendation**: Implement unified permission system across Platform Admin AND SPPG users.

**Priority**: HIGH (affects UX and maintainability)

---

**Analyst**: GitHub Copilot  
**Date**: October 25, 2025  
**Review Status**: Awaiting user decision on implementation approach
