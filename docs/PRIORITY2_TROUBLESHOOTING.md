# 🔍 Priority 2 Features - Troubleshooting Guide

**Issue**: Fitur Priority 2 tidak terlihat di frontend form tambah/edit ingredient

---

## ✅ Verification Checklist

### 1. Check Implementation Status

**File Modified**: `/src/features/sppg/menu/components/MenuIngredientForm.tsx`

**Expected Features**:
- ✅ Unit Selector Dropdown (11 units)
- ✅ Inventory Item Selector (auto-fill)
- ✅ Real-time Stock Validation
- ✅ Duplicate Check Dialog

**Lines Added**: ~260 lines of code

---

## 🔧 Troubleshooting Steps

### Step 1: Verify File Saved
```bash
# Check if MenuIngredientForm.tsx is saved
ls -lh src/features/sppg/menu/components/MenuIngredientForm.tsx

# Expected: File should be ~20KB+ (with new features)
```

### Step 2: Check TypeScript Compilation
```bash
# Check for TypeScript errors
npm run type-check

# Expected: No errors
```

### Step 3: Restart Dev Server
```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev

# Or with Turbopack:
npm run dev:turbo
```

### Step 4: Clear Browser Cache
```
1. Open Developer Tools (F12)
2. Right-click on Refresh button
3. Select "Empty Cache and Hard Reload"

Or:
- Chrome: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Safari: Cmd+Option+R
```

### Step 5: Clear Next.js Cache
```bash
# Stop dev server
# Then:
rm -rf .next
npm run dev
```

---

## 📋 Visual Verification Guide

### What You Should See:

#### CREATE MODE (Adding New Ingredient)

**1. Inventory Selector (Top Section)**
```
┌────────────────────────────────────────┐
│ 📦 Pilih dari Inventory                │
│ ┌────────────────────────────────────┐ │
│ │ [▼ Cari bahan di inventory...    ] │ │
│ └────────────────────────────────────┘ │
│ ℹ️  Memilih dari inventory akan        │
│    otomatis mengisi nama, satuan, dan  │
│    harga                               │
└────────────────────────────────────────┘

─────────────────────────────────────────

Informasi Bahan
```

**2. Unit Selector (Dropdown)**
```
Satuan:  [▼ Pilih satuan           ]
         (Should be dropdown, NOT text input)
```

**3. Stock Validation (Below Quantity)**
```
Jumlah: [50_____]

⚠️ Warning box appears here if:
- Low stock (yellow)
- Exceeds stock (red)
- Out of stock (red)
```

**4. Duplicate Dialog (On Submit)**
```
If duplicate detected:
┌────────────────────────────────────────┐
│ ⚠️ Bahan Sudah Ada                      │
│ Bahan "..." sudah ada dalam menu ini.  │
│ [Batal] [Tetap Tambahkan]              │
└────────────────────────────────────────┘
```

#### EDIT MODE

**Should NOT see:**
- ❌ Inventory selector (hidden in edit mode)

**Should see:**
- ✅ "🖊️ Mode Edit" badge
- ✅ Unit dropdown (same as create)
- ✅ All other fields

---

## 🐛 Common Issues & Solutions

### Issue 1: Page Not Updating
**Symptoms**: Old form still showing
**Solution**:
```bash
# Hard refresh browser
Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

# Or clear .next cache
rm -rf .next && npm run dev
```

### Issue 2: TypeScript Errors
**Symptoms**: Red underlines, compile errors
**Solution**:
```bash
# Check errors
npm run type-check

# If errors found, check:
# 1. All imports correct?
# 2. All types defined?
# 3. File saved?
```

### Issue 3: Components Not Rendering
**Symptoms**: Blank sections, missing UI
**Solution**:
```bash
# Check browser console (F12)
# Look for:
# - JavaScript errors
# - Network errors (failed API calls)
# - Warning messages

# Common fixes:
# 1. Restart dev server
# 2. Clear browser cache
# 3. Check network tab for failed requests
```

### Issue 4: Inventory Dropdown Empty
**Symptoms**: Inventory selector shows but no items
**Solution**:
```bash
# Check if API endpoint works:
# Open: http://localhost:3000/api/sppg/inventory/items?active=true

# Expected response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "itemName": "Beras Merah",
      "unit": "kg",
      "currentStock": 150,
      ...
    }
  ]
}

# If empty array or error:
# 1. Check database has inventory items
# 2. Check sppgId in session
# 3. Check items are active (isActive = true)
```

### Issue 5: Duplicate Dialog Not Showing
**Symptoms**: Can add duplicates without warning
**Solution**:
```bash
# Check browser console for errors
# Verify:
# 1. useMenuIngredients hook is fetching data
# 2. existingIngredients has data
# 3. No JavaScript errors blocking dialog

# Test:
# 1. Add ingredient "Beras Merah"
# 2. Try to add "beras merah" again
# 3. Should show dialog
```

---

## 🔍 Debug Mode

### Check Feature Flags

Open browser console and run:
```javascript
// Check if inventory items loaded
console.log('Inventory Items:', window.__INVENTORY_ITEMS__)

// Check if form is in edit mode
console.log('Is Editing:', window.__IS_EDITING__)

// Check existing ingredients
console.log('Existing Ingredients:', window.__EXISTING_INGREDIENTS__)
```

### Manual Verification Steps

**Step 1**: Open Ingredient Form
- URL: `http://localhost:3000/menu/[menuId]`
- Click on "Bahan" tab
- Should see the form

**Step 2**: Check Inventory Selector
- Look for "📦 Pilih dari Inventory" badge
- Should be visible ONLY in CREATE mode
- Should be hidden in EDIT mode

**Step 3**: Check Unit Dropdown
- Click on "Satuan" field
- Should open dropdown with 11 options
- NOT a text input

**Step 4**: Test Stock Validation
1. Select inventory item
2. Enter quantity > available stock
3. Should see red error alert

**Step 5**: Test Duplicate Check
1. Add ingredient "Test Bahan"
2. Try to add "test bahan" again
3. Should see confirmation dialog

---

## 📊 Verification Commands

### Check File Content
```bash
# Count lines in MenuIngredientForm.tsx
wc -l src/features/sppg/menu/components/MenuIngredientForm.tsx

# Expected: ~669 lines (was ~400 before)

# Search for specific features
grep -n "Pilih dari Inventory" src/features/sppg/menu/components/MenuIngredientForm.tsx
grep -n "checkStockAvailability" src/features/sppg/menu/components/MenuIngredientForm.tsx
grep -n "checkDuplicate" src/features/sppg/menu/components/MenuIngredientForm.tsx
```

### Check API Endpoints
```bash
# Check if inventory API endpoint exists
ls -lh src/app/api/sppg/inventory/items/route.ts

# Expected: File should exist

# Check content
cat src/app/api/sppg/inventory/items/route.ts | head -20
```

### Check Hooks
```bash
# Check if inventory hook exists
ls -lh src/features/sppg/menu/hooks/useInventory.ts

# Expected: File should exist

# Check API client
ls -lh src/features/sppg/menu/api/inventoryApi.ts

# Expected: File should exist
```

---

## 🚨 Quick Fix Script

Create a file `verify-implementation.sh`:

```bash
#!/bin/bash

echo "🔍 Verifying Priority 2 Implementation..."

# Check files
echo "\n📁 Checking files..."
[ -f "src/features/sppg/menu/components/MenuIngredientForm.tsx" ] && echo "✅ MenuIngredientForm.tsx exists" || echo "❌ MenuIngredientForm.tsx missing"
[ -f "src/app/api/sppg/inventory/items/route.ts" ] && echo "✅ Inventory API exists" || echo "❌ Inventory API missing"
[ -f "src/features/sppg/menu/hooks/useInventory.ts" ] && echo "✅ Inventory hook exists" || echo "❌ Inventory hook missing"
[ -f "src/features/sppg/menu/api/inventoryApi.ts" ] && echo "✅ Inventory API client exists" || echo "❌ Inventory API client missing"

# Check line count
echo "\n📊 Checking MenuIngredientForm.tsx size..."
LINES=$(wc -l < "src/features/sppg/menu/components/MenuIngredientForm.tsx")
if [ "$LINES" -gt 600 ]; then
  echo "✅ MenuIngredientForm.tsx has $LINES lines (expected 600+)"
else
  echo "⚠️  MenuIngredientForm.tsx has only $LINES lines (expected 600+)"
fi

# Check for key features
echo "\n🔍 Checking for key features..."
grep -q "Pilih dari Inventory" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ Inventory selector found" || echo "❌ Inventory selector missing"
grep -q "checkStockAvailability" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ Stock validation found" || echo "❌ Stock validation missing"
grep -q "checkDuplicate" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ Duplicate check found" || echo "❌ Duplicate check missing"
grep -q "AlertDialog" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ Duplicate dialog found" || echo "❌ Duplicate dialog missing"

# TypeScript check
echo "\n📝 Checking TypeScript compilation..."
npm run type-check 2>&1 | grep -q "error" && echo "❌ TypeScript errors found" || echo "✅ No TypeScript errors"

echo "\n✨ Verification complete!"
```

Run:
```bash
chmod +x verify-implementation.sh
./verify-implementation.sh
```

---

## 📸 Screenshots to Verify

Take screenshots of:

1. **CREATE MODE**:
   - Full form showing inventory selector at top
   - Unit dropdown opened (showing 11 options)
   - Stock validation alert (if applicable)

2. **EDIT MODE**:
   - Form WITHOUT inventory selector
   - "Mode Edit" badge visible

3. **BROWSER CONSOLE**:
   - No JavaScript errors (red text)
   - Network tab showing successful API calls

4. **API RESPONSE**:
   - `/api/sppg/inventory/items?active=true` response

---

## 🆘 Still Not Working?

If features still not visible after all steps:

**Option 1: Manual Verification**
```bash
# Send me these outputs:
1. wc -l src/features/sppg/menu/components/MenuIngredientForm.tsx
2. grep -c "Pilih dari Inventory" src/features/sppg/menu/components/MenuIngredientForm.tsx
3. npm run type-check
4. Screenshot of the form
```

**Option 2: Fresh Start**
```bash
# Nuclear option (if needed)
1. Stop dev server
2. rm -rf .next node_modules/.cache
3. npm install
4. npm run dev
5. Hard refresh browser (Cmd+Shift+R)
```

**Option 3: Check Git Status**
```bash
git status
git diff src/features/sppg/menu/components/MenuIngredientForm.tsx

# If file not saved to git:
git add src/features/sppg/menu/components/MenuIngredientForm.tsx
git commit -m "feat: add Priority 2 features to ingredient form"
```

---

## 📞 Support

If still having issues, please provide:

1. **Screenshot** of current form
2. **Browser console** output (F12 → Console tab)
3. **Network tab** showing API calls
4. **Output** of verification script above
5. **Line count** of MenuIngredientForm.tsx

This will help diagnose the exact issue!

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0
