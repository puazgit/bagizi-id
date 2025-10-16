# 🔍 UI/UX Audit - Tab Bahan (Ingredients)

**Halaman**: `http://localhost:3000/menu/[id]` - Tab "Bahan"  
**Komponen**: `MenuIngredientForm.tsx`  
**Tanggal Audit**: 14 Oktober 2025

---

## 🚨 Critical Issues Found

### 1. **Missing Ingredients List Display** ❌ CRITICAL
**Issue**: Tab hanya menampilkan form input, tidak ada list bahan yang sudah ditambahkan

**Current Behavior**:
```
Tab "Bahan"
├── Form "Tambah Bahan Baru"
│   ├── Nama Bahan
│   ├── Jumlah & Satuan
│   ├── Harga per Satuan
│   └── [Tombol Tambah]
└── ❌ TIDAK ADA LIST BAHAN YANG SUDAH DITAMBAHKAN
```

**Expected Behavior**:
```
Tab "Bahan"
├── List Bahan Yang Sudah Ditambahkan (READ)
│   ├── Card/Table dengan semua bahan
│   ├── Info: nama, jumlah, satuan, total biaya
│   ├── Actions: Edit, Delete
│   └── Summary: Total bahan, Total biaya semua bahan
├── Separator
└── Form "Tambah Bahan Baru" (CREATE)
```

**Impact**: 
- 🔴 User tidak bisa melihat bahan yang sudah ditambahkan
- 🔴 Tidak bisa edit atau delete bahan existing
- 🔴 Tidak ada overview total biaya bahan
- 🔴 Poor user experience - no feedback after adding

---

### 2. **No Visual Feedback After Adding** ❌ HIGH
**Issue**: Setelah submit form, tidak clear apakah bahan berhasil ditambahkan

**Current Flow**:
```
1. User mengisi form bahan
2. Click "Tambah Bahan" 
3. Toast notification "Bahan berhasil ditambahkan" ✅
4. Form di-reset
5. ❌ User tidak bisa lihat bahan yang baru ditambahkan
```

**Expected Flow**:
```
1. User mengisi form bahan
2. Click "Tambah Bahan"
3. Toast notification ✅
4. Form di-reset ✅
5. ✅ List bahan ter-update dengan bahan baru
6. ✅ Total biaya ter-update
7. ✅ Visual confirmation (animation, highlight)
```

---

### 3. **No Edit/Delete Functionality** ❌ HIGH
**Issue**: Tidak ada cara untuk edit atau delete bahan yang sudah ditambahkan

**Missing Features**:
- ❌ Edit button per bahan
- ❌ Delete button per bahan
- ❌ Bulk delete selection
- ❌ Reorder bahan

---

### 4. **No Data Summary** ❌ MEDIUM
**Issue**: Tidak ada summary total bahan dan biaya

**Missing Info**:
- ❌ Total jumlah bahan
- ❌ Total biaya semua bahan
- ❌ Bahan yang paling mahal
- ❌ Percentage breakdown per bahan

---

### 5. **Form UX Issues** ⚠️ MEDIUM

#### 5a. Unit Input - Free Text (Not Standardized)
```typescript
// Current: Free text input
<Input placeholder="gram, kg, liter, pcs" {...field} />

// Better: Dropdown select dengan standard units
<Select>
  <SelectItem value="gram">gram (g)</SelectItem>
  <SelectItem value="kg">kilogram (kg)</SelectItem>
  <SelectItem value="liter">liter (L)</SelectItem>
  <SelectItem value="ml">mililiter (mL)</SelectItem>
  <SelectItem value="pcs">pieces (pcs)</SelectItem>
  <SelectItem value="sdm">sendok makan (sdm)</SelectItem>
  <SelectItem value="sdt">sendok teh (sdt)</SelectItem>
</Select>
```

**Impact**:
- ⚠️ Inconsistent unit naming (gram vs g vs Gram)
- ⚠️ Typos possible
- ⚠️ Hard to standardize calculations

#### 5b. No Inventory Item Selection
```typescript
// Missing: Link to existing inventory items
<Select>
  <SelectTrigger>Pilih dari Inventory</SelectTrigger>
  <SelectContent>
    <SelectItem>Beras Merah (Stock: 50 kg)</SelectItem>
    <SelectItem>Daging Ayam (Stock: 20 kg)</SelectItem>
  </SelectContent>
</Select>

// With auto-fill:
// - Name
// - Current price
// - Available stock
// - Supplier info
```

**Impact**:
- ⚠️ User harus input manual semua field
- ⚠️ Price might be outdated
- ⚠️ No stock warning
- ⚠️ Duplicate data entry

---

### 6. **Missing Validation Warnings** ⚠️ LOW

**Missing Checks**:
- ⚠️ No warning if quantity exceeds available stock
- ⚠️ No warning if price too high/low
- ⚠️ No duplicate ingredient check
- ⚠️ No minimum quantity validation

---

## 📊 Current Component Analysis

### MenuIngredientForm.tsx Structure
```
✅ Good:
- React Hook Form + Zod validation
- Real-time total cost calculation
- Cost display with proper formatting
- Substitute ingredients support
- Optional ingredient toggle
- Preparation notes textarea
- Loading states (isPending)
- Error handling with toast

❌ Missing:
- List of existing ingredients
- Edit mode UI
- Delete confirmation
- Data table/grid view
- Summary statistics
- Inventory integration
- Batch operations
```

---

## 🎯 Proposed Solution

### New Component Structure

```
MenuIngredientsTab.tsx (NEW PARENT COMPONENT)
├── IngredientSummaryCard (NEW)
│   ├── Total Items: 8 bahan
│   ├── Total Cost: Rp 125,000
│   ├── Most Expensive: Daging Ayam (Rp 45,000)
│   └── Actions: [Calculate All] [Refresh]
│
├── IngredientsDataTable (NEW)
│   ├── Columns: [Name, Qty, Unit, Price/Unit, Total, Actions]
│   ├── Features:
│   │   ├── Sortable columns
│   │   ├── Search/filter
│   │   ├── Pagination (if > 10 items)
│   │   ├── Row actions: Edit, Delete, Duplicate
│   │   └── Bulk selection
│   └── Empty State:
│       └── "Belum ada bahan. Tambahkan bahan pertama di bawah."
│
├── Separator
│
└── MenuIngredientForm (EXISTING)
    └── Modified: Add "Save & Add Another" button
```

---

## 🛠️ Implementation Plan

### Phase 1: Create Ingredients List View (PRIORITY)
1. Create `IngredientsList.tsx` component
2. Use `useMenuIngredients(menuId)` hook
3. Display ingredients in Card or Table format
4. Add Edit/Delete actions per item
5. Show empty state if no ingredients

### Phase 2: Enhance Form Integration
1. Wrap both List and Form in parent component
2. Add ingredient selection from list to edit
3. Clear form after successful add
4. Scroll to new item after add

### Phase 3: Add Summary Card
1. Calculate total items and cost
2. Show breakdown statistics
3. Add quick actions (Calculate, Export)

### Phase 4: Improve Form UX
1. Change unit to Select dropdown
2. Add inventory item selector
3. Add stock validation
4. Add duplicate check

---

## 📐 Detailed Component Design

### IngredientsList Component
```typescript
interface IngredientsListProps {
  menuId: string
  onEdit: (ingredient: MenuIngredient) => void
}

export function IngredientsList({ menuId, onEdit }: IngredientsListProps) {
  const { data: ingredients, isLoading } = useMenuIngredients(menuId)
  const { mutate: deleteIngredient } = useDeleteIngredient(menuId)

  if (isLoading) return <IngredientsSkeleton />
  if (!ingredients?.length) return <EmptyIngredientsState />

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Bahan</p>
              <p className="text-2xl font-bold">{ingredients.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Biaya</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(calculateTotalCost(ingredients))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rata-rata Biaya</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculateAverage(ingredients))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {ingredients.map((ingredient) => (
          <IngredientCard
            key={ingredient.id}
            ingredient={ingredient}
            onEdit={() => onEdit(ingredient)}
            onDelete={() => deleteIngredient(ingredient.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

### IngredientCard Component
```typescript
interface IngredientCardProps {
  ingredient: MenuIngredient
  onEdit: () => void
  onDelete: () => void
}

export function IngredientCard({ ingredient, onEdit, onDelete }: IngredientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{ingredient.ingredientName}</CardTitle>
            <CardDescription>
              {ingredient.quantity} {ingredient.unit}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Harga/satuan:</span>
            <span className="font-medium">{formatCurrency(ingredient.costPerUnit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total biaya:</span>
            <span className="font-bold text-primary">{formatCurrency(ingredient.totalCost)}</span>
          </div>
          {ingredient.isOptional && (
            <Badge variant="secondary" className="text-xs">Opsional</Badge>
          )}
          {ingredient.preparationNotes && (
            <p className="text-xs text-muted-foreground mt-2">
              📝 {ingredient.preparationNotes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🎨 UI/UX Improvements

### Visual Hierarchy
```
1. Summary Card (Top) - Overview at a glance
2. Existing Ingredients List - Primary content
3. Separator (Visual break)
4. Add New Form (Bottom) - Secondary action
```

### Interaction Flow
```
Add Flow:
User fills form → Click "Tambah" → Toast success → 
List auto-updates → New item highlighted → Form clears

Edit Flow:
Click Edit icon → Form populated with data → 
Title changes to "Edit Bahan" → Click "Simpan Perubahan" →
List updates → Item highlighted

Delete Flow:
Click Delete icon → Confirmation dialog →
Confirm → Item removed → Toast success → List updates
```

### Responsive Design
```
Desktop (lg):
- 2 column grid for ingredient cards
- Form beside list (if space allows)

Tablet (md):
- 2 column grid
- Form below list

Mobile (sm):
- 1 column
- Compact cards
- Sticky summary on scroll
```

---

## 📊 Metrics to Track

After implementation, measure:
- ✅ Time to add 5 ingredients (should be < 2 min)
- ✅ Number of edit operations (should increase)
- ✅ Number of delete operations (easier to fix mistakes)
- ✅ User satisfaction score
- ✅ Error rate in ingredient entry

---

## 🚀 Priority Ranking

### Must Have (P0) - Implement Immediately
1. ✅ Display list of existing ingredients
2. ✅ Edit functionality
3. ✅ Delete functionality
4. ✅ Summary card with totals

### Should Have (P1) - Next Sprint
1. ⭐ Inventory item selector
2. ⭐ Unit dropdown (standardized)
3. ⭐ Data table view option
4. ⭐ Search/filter ingredients

### Nice to Have (P2) - Future
1. 💡 Bulk operations
2. 💡 Drag & drop reorder
3. 💡 Import from CSV
4. 💡 Ingredient templates

---

## 📝 Conclusion

**Current State**: Tab "Bahan" hanya berfungsi untuk CREATE, tanpa READ/UPDATE/DELETE.

**Required Action**: **Implement full CRUD interface** dengan focus pada:
1. Display existing ingredients (READ)
2. Edit interface (UPDATE)  
3. Delete with confirmation (DELETE)
4. Summary statistics
5. Better form UX

**Estimated Work**: 4-6 hours for Phase 1 (Critical fixes)

**Business Impact**: HIGH - Users cannot manage ingredients effectively without seeing what they've added.

---

**Status**: 🔴 CRITICAL - Requires immediate attention  
**Next Step**: Implement `IngredientsList` component
