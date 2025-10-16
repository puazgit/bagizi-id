# 🚀 Quick Guide: Sidebar Enhancement dengan shadcn/ui

**Tidak perlu migrasi!** Kita sudah menggunakan shadcn/ui sidebar official.  
Ini hanya panduan untuk menambahkan fitur-fitur optional jika diperlukan.

---

## 1️⃣ Add SidebarRail (Toggle Handle) - 5 minutes

**File**: `src/components/shared/navigation/app-sidebar.tsx`

```typescript
import { 
  Sidebar, 
  SidebarRail,  // ← Add this import
  // ... other imports
} from '@/components/ui/sidebar'

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>...</SidebarHeader>
      <SidebarContent>...</SidebarContent>
      <SidebarFooter>...</SidebarFooter>
      <SidebarRail /> {/* ← Add this line */}
    </Sidebar>
  )
}
```

**Result**: User can hover sidebar edge to toggle

---

## 2️⃣ Add Visual Separators - 2 minutes

```typescript
import { SidebarSeparator } from '@/components/ui/sidebar'

<SidebarContent>
  <SidebarGroup>
    {/* Dashboard, Menu, Procurement, Production */}
  </SidebarGroup>
  
  <SidebarSeparator /> {/* ← Separate sections */}
  
  <SidebarGroup>
    {/* Reports, Settings */}
  </SidebarGroup>
</SidebarContent>
```

**Result**: Clear visual hierarchy between sections

---

## 3️⃣ Enable Icon-Only Collapse - 1 minute

```typescript
<Sidebar collapsible="icon"> {/* ← Add this prop */}
  {/* Content stays the same */}
</Sidebar>
```

**Options**:
- `collapsible="offcanvas"` (default) - Slides in/out
- `collapsible="icon"` - Collapses to icons only
- `collapsible="none"` - Non-collapsible

**Result**: Sidebar collapses to icons, maximizing workspace

---

## 4️⃣ Add Badges for Counts - 10 minutes

```typescript
import { SidebarMenuBadge } from '@/components/ui/sidebar'

// Example: Show pending procurement orders
<SidebarMenuItem>
  <SidebarMenuButton asChild isActive={pathname === '/procurement'}>
    <Link href="/procurement">
      <ShoppingCart className="h-4 w-4" />
      <span>Procurement</span>
    </Link>
  </SidebarMenuButton>
  <SidebarMenuBadge>5</SidebarMenuBadge> {/* ← Add badge */}
</SidebarMenuItem>

// Example: Show new reports
<SidebarMenuItem>
  <SidebarMenuButton asChild isActive={pathname === '/reports'}>
    <Link href="/reports">
      <FileText className="h-4 w-4" />
      <span>Reports</span>
    </Link>
  </SidebarMenuButton>
  <SidebarMenuBadge className="bg-red-500">3</SidebarMenuBadge> {/* ← New items */}
</SidebarMenuItem>
```

**Result**: At-a-glance counts/notifications

---

## 5️⃣ Add Collapsible Menu Groups - 20 minutes

```typescript
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

// Example: Collapsible Menu Management section
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger className="flex w-full items-center">
        Menu Management
        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/menu">
                <span>All Menus</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/menu/programs">
                <span>Programs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

**Result**: Expandable/collapsible sections

---

## 6️⃣ Add Submenu Navigation - 15 minutes

```typescript
import { 
  SidebarMenuSub, 
  SidebarMenuSubItem, 
  SidebarMenuSubButton 
} from '@/components/ui/sidebar'

<SidebarMenuItem>
  <SidebarMenuButton>
    <ChefHat className="h-4 w-4" />
    <span>Menu Management</span>
  </SidebarMenuButton>
  
  <SidebarMenuSub>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <Link href="/menu/programs">
          <span>Programs</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
    
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <Link href="/menu/ingredients">
          <span>Ingredients</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  </SidebarMenuSub>
</SidebarMenuItem>
```

**Result**: Multi-level navigation hierarchy

---

## 7️⃣ Add Quick Actions - 15 minutes

```typescript
import { SidebarMenuAction } from '@/components/ui/sidebar'
import { Plus, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link href="/menu">
      <ChefHat className="h-4 w-4" />
      <span>Menu Management</span>
    </Link>
  </SidebarMenuButton>
  
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <SidebarMenuAction showOnHover>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More</span>
      </SidebarMenuAction>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start">
      <DropdownMenuItem>
        <Plus className="mr-2 h-4 w-4" />
        <span>Create New Menu</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <span>View All</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</SidebarMenuItem>
```

**Result**: Quick actions without navigation

---

## 8️⃣ Add Header Search - 10 minutes

```typescript
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

<SidebarHeader>
  <div className="px-4 py-2">
    <h2 className="text-lg font-semibold mb-2">Bagizi SPPG</h2>
    
    {/* Add search */}
    <form>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search menu..."
          className="pl-8 h-9"
        />
      </div>
    </form>
  </div>
</SidebarHeader>
```

**Result**: Quick search navigation

---

## 9️⃣ Add Workspace Selector - 20 minutes

```typescript
import { Building2 } from 'lucide-react'

<SidebarHeader>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">SPPG Purwakarta</span>
              <span className="truncate text-xs">Enterprise Plan</span>
            </div>
            <ChevronDown className="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <Building2 className="mr-2 h-4 w-4" />
            <span>SPPG Purwakarta</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Building2 className="mr-2 h-4 w-4" />
            <span>SPPG Jakarta</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarHeader>
```

**Result**: Multi-workspace switching

---

## 🔟 Add Loading Skeleton - 10 minutes

```typescript
import { SidebarMenuSkeleton } from '@/components/ui/sidebar'

function SidebarSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 8 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

// Usage in layout with Suspense
<React.Suspense fallback={<SidebarSkeleton />}>
  <AppSidebar user={user} />
</React.Suspense>
```

**Result**: Better perceived performance

---

## 🎯 Recommended Enhancement Order

### Week 1: Quick Wins (30 minutes total)
1. ✅ Add SidebarRail (5 min)
2. ✅ Add SidebarSeparator (2 min)
3. ✅ Enable icon collapse mode (1 min)
4. ✅ Add badges for counts (10 min)

### Week 2: Better Organization (50 minutes)
5. 🔄 Add collapsible groups (20 min)
6. 🔄 Add submenu navigation (15 min)
7. 🔄 Add quick actions (15 min)

### Week 3: Advanced Features (40 minutes)
8. 🔄 Add header search (10 min)
9. 🔄 Add workspace selector (20 min)
10. 🔄 Add loading skeleton (10 min)

**Total Time**: ~2 hours for all enhancements

---

## 📚 Testing Checklist

After each enhancement:

- [ ] Desktop: Feature works smoothly
- [ ] Mobile: Feature responsive
- [ ] Dark mode: Styling correct
- [ ] Keyboard: Accessible via keyboard
- [ ] Screen reader: Announces properly
- [ ] Performance: No lag or jank

---

## 🎨 Example: Complete Enhanced Sidebar

See `SIDEBAR_SHADCN_STATUS.md` for complete code example with all features.

---

**Remember**: Tidak perlu implement semua sekaligus!  
Pilih fitur yang paling bermanfaat untuk use case kita. 🚀
