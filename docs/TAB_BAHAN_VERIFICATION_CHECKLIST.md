# Tab Bahan - Verification Checklist
## Menu: Pisang Goreng Keju (cmh0d2v2n003nsv7fdurgpm5e)

**URL**: http://localhost:3000/menu/cmh0d2v2n003nsv7fdurgpm5e  
**Tab**: Bahan

---

## 📊 Expected Data from Database

### Menu Info
- **Nama Menu**: Pisang Goreng Keju
- **Serving Size**: 130g per porsi
- **Batch Size**: 160 porsi
- **Total Bahan**: 5 items

### Ringkasan Bahan (Summary Statistics)

**Total Biaya Bahan**: Rp 7,280
- Gula Pasir: 0.01 kg × Rp 14,000 = Rp 140
- Keju Cheddar Parut: 0.03 kg × Rp 120,000 = Rp 3,600
- Minyak Goreng: 0.1 liter × Rp 16,000 = Rp 1,600
- Pisang: 0.12 kg × Rp 12,000 = Rp 1,440
- Tepung Beras: 0.05 kg × Rp 10,000 = Rp 500

**Rata-rata per Bahan**: Rp 7,280 / 5 = Rp 1,456

**Bahan Termahal**: Keju Cheddar Parut (Rp 3,600)

---

## ✅ Verification Checklist

### 1. Ringkasan Bahan Card
- [ ] **Total Bahan**: Shows "5" ✅
- [ ] **Total Bahan Detail**: "5 wajib, 0 opsional" ✅
- [ ] **Total Biaya**: Shows "Rp 7.280" ✅
- [ ] **Rata-rata**: Shows "Rp 1.456" ✅
- [ ] **Termahal**: Shows "Keju Cheddar Parut" ✅
- [ ] **Termahal Biaya**: Shows "Rp 3.600" ✅

### 2. Individual Ingredient Cards (5 items)

#### Card 1: Gula Pasir
- [ ] **Nama**: "Gula Pasir" ✅
- [ ] **Jumlah**: "0.01 kg" ✅
- [ ] **Stok saat ini**: "25 kg" ✅
- [ ] **Status stok**: "OK" (tidak ada warning, stok 25 > min 10) ✅
- [ ] **Harga per satuan**: "Rp 14.000" ✅
- [ ] **Total biaya**: "Rp 140" ✅
- [ ] **Badge "Opsional"**: TIDAK ada (karena isOptional = false) ✅

#### Card 2: Keju Cheddar Parut
- [ ] **Nama**: "Keju Cheddar Parut" ✅
- [ ] **Jumlah**: "0.03 kg" ✅
- [ ] **Stok saat ini**: "10 kg" ✅
- [ ] **Status stok**: "OK" (tidak ada warning, stok 10 > min 5) ✅
- [ ] **Harga per satuan**: "Rp 120.000" ✅
- [ ] **Total biaya**: "Rp 3.600" ✅

#### Card 3: Minyak Goreng
- [ ] **Nama**: "Minyak Goreng" ✅
- [ ] **Jumlah**: "0.1 liter" ✅
- [ ] **Stok saat ini**: "40 liter" ✅
- [ ] **Status stok**: "OK" (tidak ada warning, stok 40 > min 20) ✅
- [ ] **Harga per satuan**: "Rp 16.000" ✅
- [ ] **Total biaya**: "Rp 1.600" ✅

#### Card 4: Pisang
- [ ] **Nama**: "Pisang" ✅
- [ ] **Jumlah**: "0.12 kg" ✅
- [ ] **Stok saat ini**: "30 kg" ✅
- [ ] **Status stok**: "OK" (tidak ada warning, stok 30 > min 15) ✅
- [ ] **Harga per satuan**: "Rp 12.000" ✅
- [ ] **Total biaya**: "Rp 1.440" ✅

#### Card 5: Tepung Beras
- [ ] **Nama**: "Tepung Beras" ✅
- [ ] **Jumlah**: "0.05 kg" ✅
- [ ] **Stok saat ini**: "40 kg" ✅
- [ ] **Status stok**: "OK" (tidak ada warning, stok 40 > min 15) ✅
- [ ] **Harga per satuan**: "Rp 10.000" ✅
- [ ] **Total biaya**: "Rp 500" ✅

---

## 🔍 Common Issues to Check

### Issue 1: Total Biaya Calculation
**Expected**: Rp 7,280 (sum of all ingredients)
**Calculation**: 
```
Rp 140 + Rp 3,600 + Rp 1,600 + Rp 1,440 + Rp 500 = Rp 7,280 ✅
```

**If showing different value**, possible causes:
- ❌ Using `costPerServing` from menu instead of calculating from ingredients
- ❌ Including labor/overhead costs (should be ingredients only)
- ❌ Wrong unit conversion

### Issue 2: Quantity Display
**Expected**: Shows exact quantity with proper unit
- 0.01 kg (not 10g or 0.01000 kg)
- 0.1 liter (not 100ml or 0.10000 liter)

**If showing wrong format**, check:
- ❌ Number formatting (too many decimals)
- ❌ Unit conversion (showing converted units instead of stored units)

### Issue 3: Stock Status
**Expected**: All items show "OK" (no low stock warnings)
**Calculation**: currentStock > minStock for all items

**If showing low stock warning**, verify:
- ❌ minStock threshold might be too high
- ❌ currentStock data might be outdated

### Issue 4: Currency Formatting
**Expected**: Indonesian Rupiah format
- Rp 7.280 (with dot separator)
- Rp 3.600 (not Rp 3600 or Rp 3,600)

**If showing wrong format**, check:
- ❌ Locale setting (should be 'id-ID')
- ❌ Intl.NumberFormat options

### Issue 5: Card Display Order
**Expected**: Alphabetical order by item name
1. Gula Pasir
2. Keju Cheddar Parut
3. Minyak Goreng
4. Pisang
5. Tepung Beras

**If showing different order**, check:
- ❌ ORDER BY clause in query
- ❌ Frontend sorting logic

---

## 🐛 Debug Steps

### Step 1: Check Browser Console
```javascript
// Open browser console (F12) and run:
console.log('Ingredients data:', ingredients)
console.log('Total cost:', totalCost)
console.log('Average cost:', averageCost)
```

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for request to `/api/sppg/menu/${menuId}/ingredients`
4. Check response data structure

### Step 3: Verify API Response
```bash
# Test API directly
curl http://localhost:3000/api/sppg/menu/cmh0d2v2n003nsv7fdurgpm5e/ingredients
```

### Step 4: Check Component Props
- Verify `menuId` prop is correct
- Check if `ingredients` data is properly loaded
- Verify `inventoryItem` relation is included

---

## 📋 Report Template

**Please fill in what you see vs what's expected:**

### What I See in Browser:
```
Ringkasan Bahan:
- Total Bahan: [FILL IN]
- Total Biaya: [FILL IN]
- Rata-rata: [FILL IN]
- Termahal: [FILL IN]

Card 1 (Gula Pasir):
- Jumlah: [FILL IN]
- Harga per satuan: [FILL IN]
- Total biaya: [FILL IN]
- Stock status: [FILL IN]

[Continue for other cards...]
```

### Specific Issues:
1. [Describe specific issue #1]
2. [Describe specific issue #2]
3. [etc...]

---

## 💡 Quick Fixes (If Needed)

### Fix 1: Total Biaya Calculation
If total shows wrong value, check `calculateTotalCost` function in `IngredientsList.tsx`:
```typescript
function calculateTotalCost(ingredients: MenuIngredient[]): number {
  return ingredients.reduce((total, ingredient) => {
    return total + (ingredient.quantity * (ingredient.inventoryItem.costPerUnit || 0))
  }, 0)
}
```

### Fix 2: Currency Formatting
If currency shows wrong format, check `formatCurrency` function:
```typescript
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
```

### Fix 3: Stock Warning Logic
If low stock warning shows incorrectly:
```typescript
const isLowStock = ingredient.inventoryItem && 
  ingredient.inventoryItem.currentStock <= ingredient.inventoryItem.minStock
```

---

**Next Steps**: 
1. Open http://localhost:3000/menu/cmh0d2v2n003nsv7fdurgpm5e
2. Go to "Bahan" tab
3. Fill in the "What I See" section above
4. Report specific issues found

Then I can provide targeted fixes! 🎯
