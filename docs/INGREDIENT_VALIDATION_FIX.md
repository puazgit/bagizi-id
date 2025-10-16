# 🔧 FIX: Validation Failed - Missing totalCost

## ❌ Problem
Error "Validation failed" ketika submit form tambah bahan.

## 🔍 Root Cause
API endpoint membutuhkan field **`totalCost`** tapi form tidak mengirimnya.

**API Schema (`/api/sppg/menu/[id]/ingredients/route.ts`):**
```typescript
const ingredientCreateSchema = z.object({
  inventoryItemId: z.string().cuid().optional().nullable(),
  ingredientName: z.string().min(1, 'Nama bahan harus diisi'),
  quantity: z.number().positive('Jumlah harus lebih dari 0'),
  unit: z.string().min(1, 'Satuan harus diisi'),
  costPerUnit: z.number().min(0, 'Harga per satuan tidak boleh negatif'),
  totalCost: z.number().min(0, 'Total biaya tidak boleh negatif'), // ← REQUIRED!
  preparationNotes: z.string().optional().nullable(),
  isOptional: z.boolean().default(false),
  substitutes: z.array(z.string()).default([])
})
```

**Form sebelumnya TIDAK mengirim `totalCost`** → Validation error!

---

## ✅ Solution Applied

### 1. Added totalCost Calculation in Form
**File:** `src/features/sppg/menu/components/MenuIngredientForm.tsx`

```typescript
const submitForm = (data: IngredientFormData) => {
  // Calculate totalCost (required by API)
  const totalCost = data.quantity * data.costPerUnit  // ← ADDED!
  
  // Transform data for API
  const apiData = {
    ...data,
    totalCost,  // ← SEND TO API
    preparationNotes: data.preparationNotes || undefined,
    isOptional: data.isOptional ?? false,
    substitutes: data.substitutes || []
  }
  
  console.log('🚀 Sending to API:', apiData)
  
  // Create or update...
}
```

### 2. Enhanced Logging for Debugging
**Added console logs:**
- ✅ Form submission data
- ✅ API request payload
- ✅ Validation errors (server-side)

### 3. Improved API Error Response
**File:** `src/app/api/sppg/menu/[id]/ingredients/route.ts`

```typescript
// Before: .parse(body) - throws error with no details
const validated = ingredientCreateSchema.parse(body)

// After: .safeParse() - returns detailed error
const validationResult = ingredientCreateSchema.safeParse(body)

if (!validationResult.success) {
  console.error('❌ Validation failed:', validationResult.error.errors)
  return Response.json({ 
    success: false, 
    error: 'Validation failed',
    details: validationResult.error.errors  // ← Detailed errors
  }, { status: 400 })
}
```

---

## 🧪 Testing Steps

### Test 1: Manual Entry (Without Inventory Selector)
1. **Buka form tambah bahan**
2. **Isi manual:**
   ```
   Nama Bahan: Garam Himalaya
   Jumlah: 5
   Satuan: kg
   Biaya per Satuan: 50000
   ```
3. **Submit**
4. **Expected:** ✅ Success! Ingredient created
5. **Check console:** Should show `totalCost: 250000` (5 × 50000)

### Test 2: With Inventory Selector
1. **Pilih dari dropdown:** "Beras Merah"
2. **Auto-filled:**
   ```
   Nama: Beras Merah ✓
   Satuan: kg ✓
   Biaya: 15000 ✓
   ```
3. **Isi Jumlah:** `10`
4. **Submit**
5. **Expected:** ✅ Success! `totalCost: 150000` (10 × 15000)

### Test 3: Edit Ingredient
1. **Click edit** on existing ingredient
2. **Change quantity:** from 10 → 20
3. **Submit**
4. **Expected:** ✅ Success! `totalCost` recalculated to 300000

---

## 🔍 Debug Console Output

**After fix, you should see:**

```javascript
// When submit form
📝 Form Data Submitted: {
  ingredientName: "Beras Merah",
  quantity: 10,
  unit: "kg",
  costPerUnit: 15000,
  ...
}

// Before API call
🚀 Sending to API: {
  ingredientName: "Beras Merah",
  quantity: 10,
  unit: "kg",
  costPerUnit: 15000,
  totalCost: 150000,  // ← NOW INCLUDED!
  isOptional: false,
  substitutes: []
}

// Server-side (if validation fails)
❌ Validation failed: [
  {
    code: "invalid_type",
    expected: "number",
    received: "undefined",
    path: ["totalCost"],
    message: "Required"
  }
]
```

---

## 📊 Field Mapping

**Form Fields → API Schema:**

| Form Field | Type | API Field | Required | Calculated |
|------------|------|-----------|----------|------------|
| `ingredientName` | string | `ingredientName` | ✅ Yes | ❌ No |
| `quantity` | number | `quantity` | ✅ Yes | ❌ No |
| `unit` | string | `unit` | ✅ Yes | ❌ No |
| `costPerUnit` | number | `costPerUnit` | ✅ Yes | ❌ No |
| - | number | `totalCost` | ✅ Yes | ✅ **YES** (qty × cost) |
| `preparationNotes` | string? | `preparationNotes` | ❌ No | ❌ No |
| `isOptional` | boolean | `isOptional` | ❌ No | ❌ No |
| `substitutes` | string[] | `substitutes` | ❌ No | ❌ No |
| `inventoryItemId` | string? | `inventoryItemId` | ❌ No | ❌ No |

---

## 🚨 Common Errors & Solutions

### Error 1: "totalCost is required"
**Cause:** Form tidak mengirim `totalCost`  
**Solution:** ✅ FIXED - Now calculated in `submitForm()`

### Error 2: "Validation failed" with no details
**Cause:** API menggunakan `.parse()` yang throw error  
**Solution:** ✅ FIXED - Now using `.safeParse()` with detailed errors

### Error 3: totalCost = 0 atau NaN
**Cause:** `quantity` atau `costPerUnit` tidak valid  
**Solution:** Check form values in console:
```javascript
console.log('quantity:', data.quantity, typeof data.quantity)
console.log('costPerUnit:', data.costPerUnit, typeof data.costPerUnit)
console.log('totalCost:', data.quantity * data.costPerUnit)
```

---

## ✅ Verification Checklist

After refresh browser:

- [ ] Form loads without errors
- [ ] Can fill all fields
- [ ] Inventory selector shows 34 items
- [ ] Auto-fill works when select from inventory
- [ ] Console shows form data on submit
- [ ] Console shows API payload with `totalCost`
- [ ] No "Validation failed" error
- [ ] Ingredient successfully created
- [ ] Ingredient appears in list
- [ ] Total cost displayed correctly in list

---

## 📝 Files Modified

1. ✅ **`src/features/sppg/menu/components/MenuIngredientForm.tsx`**
   - Added `totalCost` calculation in `submitForm()`
   - Added debug logging in `onSubmit()`

2. ✅ **`src/app/api/sppg/menu/[id]/ingredients/route.ts`**
   - Changed from `.parse()` to `.safeParse()`
   - Added detailed error logging
   - Added better error response

---

## 🎯 Expected Behavior Now

**BEFORE FIX:**
```
Submit → ❌ "Validation failed"
No details in console
Form doesn't submit
```

**AFTER FIX:**
```
Submit → ✅ Success!
Console shows totalCost calculated
Ingredient created
Toast shows "Bahan berhasil ditambahkan"
Form resets (if create mode)
List refreshes with new ingredient
```

---

## 🔄 Next Steps

1. **Refresh browser** (Cmd+Shift+R)
2. **Clear console** (click 🚫 in DevTools)
3. **Try adding ingredient**
4. **Check console output**
5. **Verify success**

If still having issues, check:
- Browser console for errors
- Network tab for API response
- Server terminal for backend logs

---

**Status:** ✅ FIXED  
**Last Updated:** October 14, 2025
