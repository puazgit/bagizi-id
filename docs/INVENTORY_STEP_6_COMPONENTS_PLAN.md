# 📋 INVENTORY STEP 6: UI COMPONENTS - IMPLEMENTATION PLAN

**Status**: 🚧 **PLANNING PHASE**  
**Estimated Duration**: 120 minutes  
**Total Lines**: ~1,080 lines (6 components)  
**Date**: October 20, 2025

---

## 🎯 Objective

Create enterprise-grade shadcn/ui components for complete inventory management workflow with:
- ✅ Full TypeScript coverage
- ✅ React Hook Form + Zod validation
- ✅ Optimistic UI updates via TanStack Query hooks
- ✅ State management via Zustand store
- ✅ shadcn/ui design system compliance
- ✅ Dark mode support
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Mobile-responsive design

---

## 📦 Components to Create

### 1. LowStockAlert.tsx (~100 lines) ⚡ PRIORITY
**Purpose**: Critical alert banner for low stock items

**Features**:
- Real-time monitoring via `useLowStockItems()` hook
- Urgency-based color coding (CRITICAL/HIGH/MEDIUM)
- Quick actions: View details, Create order
- Auto-refresh every 5 minutes
- Dismissible with localStorage persistence

**Dependencies**:
- `useLowStockItems()` - Auto-refresh hook
- `useHasCriticalLowStock()` - Quick check
- shadcn/ui: Alert, AlertTitle, AlertDescription, Badge, Button

**Implementation Priority**: HIGH - Needed for dashboard immediately

**File**: `src/features/sppg/inventory/components/LowStockAlert.tsx`

**Example Structure**:
```typescript
'use client'

import { useLowStockItems, useHasCriticalLowStock } from '../hooks'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge, Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'

export function LowStockAlert() {
  const { data: items, isLoading } = useLowStockItems()
  const { data: hasCritical } = useHasCriticalLowStock()
  const [isDismissed, setIsDismissed] = useState(false)
  
  // Filter critical items
  const criticalItems = items?.filter(item => item.urgency === 'CRITICAL')
  
  if (isLoading || !hasCritical || isDismissed) return null
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        Peringatan Stok Kritis!
      </AlertTitle>
      <AlertDescription>
        {criticalItems?.length} item memerlukan perhatian segera
      </AlertDescription>
      {/* Quick actions */}
    </Alert>
  )
}
```

---

### 2. InventoryList.tsx (~200 lines)
**Purpose**: Main data table with advanced features

**Features**:
- Server-side pagination via `useInventoryList()` hook
- Multi-column sorting with store persistence
- Advanced filtering (category, status, location, search)
- Bulk selection with checkboxes
- Bulk actions toolbar (delete, export, activate)
- Stock level indicators with color coding
- Quick actions per row (edit, delete, stock movement)
- Empty state illustration
- Loading skeleton
- Error boundary

**Dependencies**:
- `useInventoryList()` - Fetch items
- `useInventoryStore()` - Filters, selection, pagination
- `useDeleteInventory()` - Delete mutation
- shadcn/ui: Table, Checkbox, Button, Badge, DropdownMenu, Skeleton

**State Integration**:
```typescript
const { 
  filters, 
  selectedIds, 
  currentPage, 
  pageSize,
  sortBy,
  sortOrder,
  toggleSelection,
  clearSelection,
} = useInventoryStore()

const { data, isLoading } = useInventoryList({
  ...filters,
  page: currentPage,
  pageSize,
  sortBy,
  sortOrder,
})
```

**File**: `src/features/sppg/inventory/components/InventoryList.tsx`

---

### 3. InventoryForm.tsx (~250 lines)
**Purpose**: Comprehensive create/edit form with validation

**Features**:
- React Hook Form integration
- Zod schema validation (`inventorySchema`)
- Multi-step form (Basic Info → Stock → Nutrition)
- Supplier selection with search
- Category selection (InventoryCategory enum)
- Storage location input
- Nutrition fields (optional)
- Image upload (optional)
- Real-time validation feedback
- Submit with optimistic update
- Cancel/Reset buttons
- Loading states
- Success/Error toast notifications

**Dependencies**:
- `useCreateInventory()` - Create mutation
- `useUpdateInventory()` - Update mutation
- React Hook Form + Zod
- shadcn/ui: Form, Input, Select, Textarea, Button, Card, Tabs

**Form Structure**:
```typescript
const form = useForm<CreateInventoryInput>({
  resolver: zodResolver(inventorySchema),
  defaultValues: {
    itemName: '',
    category: 'PROTEIN_HEWANI',
    unit: 'kg',
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    storageLocation: '',
    isActive: true,
  }
})

const { mutate: createInventory, isPending } = useCreateInventory()

const onSubmit = (data: CreateInventoryInput) => {
  createInventory(data, {
    onSuccess: () => {
      toast.success('Item berhasil dibuat')
      form.reset()
      onClose?.()
    }
  })
}
```

**File**: `src/features/sppg/inventory/components/InventoryForm.tsx`

---

### 4. InventoryCard.tsx (~150 lines)
**Purpose**: Detail view with comprehensive information

**Features**:
- Item overview (name, code, category, brand)
- Stock information with visual indicators
- Supplier details with contact
- Storage information
- Nutrition facts table (if available)
- Stock movement summary
- Recent activity timeline
- Quick action buttons
- Related items suggestions
- Print/Export options

**Dependencies**:
- `useInventoryItem(id)` - Fetch detail
- `useStockMovements({ inventoryId })` - Recent movements
- shadcn/ui: Card, Badge, Tabs, Table, Button, Separator

**Layout Structure**:
```typescript
<Card>
  <CardHeader>
    <div className="flex justify-between">
      <div>
        <CardTitle>{item.itemName}</CardTitle>
        <CardDescription>{item.itemCode}</CardDescription>
      </div>
      <Badge>{item.category}</Badge>
    </div>
  </CardHeader>
  
  <CardContent>
    <Tabs>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="stock">Stock</TabsTrigger>
        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      {/* Tab contents */}
    </Tabs>
  </CardContent>
</Card>
```

**File**: `src/features/sppg/inventory/components/InventoryCard.tsx`

---

### 5. StockMovementForm.tsx (~200 lines)
**Purpose**: Record stock IN/OUT/ADJUSTMENT with validation

**Features**:
- Movement type selection (IN/OUT/ADJUSTMENT)
- Quantity input with stock validation
- Reference number/type (PROCUREMENT/PRODUCTION/etc)
- Batch number (optional)
- Expiry date (if hasExpiry)
- Notes/Description
- Auto-calculate stock after movement
- Real-time inventory update preview
- Approval workflow (if required)
- Submit with optimistic inventory update
- Success toast with new stock level

**Dependencies**:
- `useCreateStockMovement()` - Create movement
- `useInventoryItem(id)` - Current stock info
- React Hook Form + Zod
- shadcn/ui: Form, Input, Select, Textarea, DatePicker, Button

**Smart Features**:
```typescript
// Auto-calculate new stock
const newStock = useMemo(() => {
  const quantity = form.watch('quantity')
  const movementType = form.watch('movementType')
  
  if (movementType === 'IN') return currentStock + quantity
  if (movementType === 'OUT') return currentStock - quantity
  return quantity // ADJUSTMENT sets absolute value
}, [currentStock, form.watch('quantity'), form.watch('movementType')])

// Validation
const maxOut = currentStock // Can't take out more than current
const minStock = 0 // Stock can't go negative
```

**File**: `src/features/sppg/inventory/components/StockMovementForm.tsx`

---

### 6. StockMovementHistory.tsx (~180 lines)
**Purpose**: Comprehensive movement history table

**Features**:
- Paginated movement list
- Date range filter
- Movement type filter (IN/OUT/ADJUSTMENT)
- Reference type filter
- Approval status badges
- User/Approved by information
- Stock before/after display
- Batch & expiry info (if applicable)
- Export to Excel/PDF
- Approval actions (if pending)
- Sort by date (newest first)

**Dependencies**:
- `useStockMovements({ inventoryId, filters })` - Fetch movements
- `useApproveStockMovement()` - Approve mutation
- shadcn/ui: Table, Badge, Button, DateRangePicker, Select

**Table Columns**:
```typescript
const columns: ColumnDef<StockMovement>[] = [
  { accessorKey: 'createdAt', header: 'Tanggal' },
  { accessorKey: 'movementType', header: 'Tipe', cell: MovementTypeBadge },
  { accessorKey: 'quantity', header: 'Jumlah' },
  { accessorKey: 'stockBefore', header: 'Stok Sebelum' },
  { accessorKey: 'stockAfter', header: 'Stok Sesudah' },
  { accessorKey: 'referenceType', header: 'Referensi' },
  { accessorKey: 'approvalStatus', header: 'Status', cell: StatusBadge },
  { id: 'actions', cell: ActionsMenu },
]
```

**File**: `src/features/sppg/inventory/components/StockMovementHistory.tsx`

---

## 🎨 Design System Compliance

### Color Coding Standards
```typescript
// Stock levels
GOOD (>80%):        text-green-600 dark:text-green-400
LOW (20-80%):       text-orange-600 dark:text-orange-400
CRITICAL (<20%):    text-red-600 dark:text-red-400
OUT (0):            text-gray-600 dark:text-gray-400

// Movement types
IN:                 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300
OUT:                bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300
ADJUSTMENT:         bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300

// Urgency levels
CRITICAL:           bg-destructive text-destructive-foreground
HIGH:               bg-orange-500 text-white
MEDIUM:             bg-yellow-500 text-yellow-900
```

### Responsive Breakpoints
```typescript
Mobile:     < 640px   - Stack vertically, hide secondary info
Tablet:     640-1024px - 2 columns, show essential info
Desktop:    > 1024px   - Full layout, all features visible
```

---

## 🔗 Component Dependencies

### Shared Utilities Needed
```typescript
// src/features/sppg/inventory/lib/inventoryUtils.ts
export function getStockStatus(item: InventoryItem): StockStatus {
  const percentage = (item.currentStock / item.maxStock) * 100
  if (percentage === 0) return 'OUT'
  if (percentage <= 20) return 'CRITICAL'
  if (percentage <= 80) return 'LOW'
  return 'GOOD'
}

export function getStockColor(status: StockStatus): string {
  const colors = {
    GOOD: 'text-green-600 dark:text-green-400',
    LOW: 'text-orange-600 dark:text-orange-400',
    CRITICAL: 'text-red-600 dark:text-red-400',
    OUT: 'text-gray-600 dark:text-gray-400',
  }
  return colors[status]
}

export function formatStockLevel(item: InventoryItem): string {
  return `${item.currentStock} / ${item.maxStock} ${item.unit}`
}

export function getUrgencyColor(urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'): string {
  // Badge variants
}
```

### Component Barrel Export
```typescript
// src/features/sppg/inventory/components/index.ts
export * from './LowStockAlert'
export * from './InventoryList'
export * from './InventoryForm'
export * from './InventoryCard'
export * from './StockMovementForm'
export * from './StockMovementHistory'
```

---

## 📊 Implementation Order & Timeline

### Phase 1: Critical Components (60 min)
1. **LowStockAlert.tsx** (20 min) - ⚡ HIGHEST PRIORITY
   - Needed for dashboard immediately
   - Simple implementation
   - High business value

2. **InventoryList.tsx** (40 min)
   - Core functionality
   - Most complex component
   - Foundation for other views

### Phase 2: Forms & Details (60 min)
3. **InventoryForm.tsx** (30 min)
   - Create/Edit operations
   - Complex validation
   - Multi-step form

4. **InventoryCard.tsx** (30 min)
   - Detail view
   - Information display
   - Quick actions

### Phase 3: Stock Management (40 min - can be async)
5. **StockMovementForm.tsx** (25 min)
   - Stock operations
   - Movement recording
   - Validation logic

6. **StockMovementHistory.tsx** (15 min)
   - History display
   - Simple table
   - Filtering

---

## ✅ Quality Checklist

Before marking Step 6 complete, verify:

### TypeScript
- [ ] Zero TypeScript compilation errors
- [ ] All props properly typed
- [ ] No `any` types used
- [ ] Proper return types

### Functionality
- [ ] All CRUD operations work
- [ ] Optimistic updates function correctly
- [ ] Error handling with toast notifications
- [ ] Loading states display properly
- [ ] Empty states show correctly

### UX/UI
- [ ] Dark mode works on all components
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Loading skeletons for async data
- [ ] Error boundaries prevent crashes

### Integration
- [ ] Hooks integrate correctly with API
- [ ] Store state syncs properly
- [ ] Cache invalidation works
- [ ] Filters persist in localStorage

---

## 🚀 Next Steps After Completion

Once all 6 components are created:

1. **Create component stories** (Storybook - optional)
2. **Write unit tests** (Jest + Testing Library)
3. **Test accessibility** (axe-core)
4. **Proceed to Step 7**: Create page routes
5. **Integrate components** into actual pages

---

## 📝 Notes

### shadcn/ui Components Required
Verify these are installed:
```bash
npx shadcn@latest add table
npx shadcn@latest add form  
npx shadcn@latest add card
npx shadcn@latest add alert
npx shadcn@latest add badge
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add dialog
npx shadcn@latest add date-picker
```

### Best Practices
1. Always use `'use client'` directive for interactive components
2. Use shadcn/ui components, never create custom UI primitives
3. Integrate React Hook Form for all forms
4. Use Zod schemas from `../schemas/`
5. Import hooks from `../hooks/`
6. Import store from `../stores/`
7. Use utility functions from `../lib/`
8. Follow Copilot Instructions patterns
9. Add comprehensive JSDoc documentation
10. Include usage examples in comments

---

**Status**: 📋 **PLAN COMPLETE - Ready for Implementation**

**Next Action**: Start implementing components in order:
1. LowStockAlert.tsx
2. InventoryList.tsx
3. InventoryForm.tsx
4. InventoryCard.tsx
5. StockMovementForm.tsx
6. StockMovementHistory.tsx

---

*Plan Created: October 20, 2025, 23:30 WIB*  
*Bagizi-ID Development Team - Enterprise-Grade SaaS Platform*
