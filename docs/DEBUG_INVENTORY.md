# 🐛 Debug: Inventory Selector Tidak Muncul

## Masalah
Pada halaman tambah bahan, Inventory Selector tidak muncul.

## Kondisi untuk Inventory Selector Muncul

```typescript
!isEditing && inventoryItems && inventoryItems.length > 0
```

**Artinya:**
1. ✅ Bukan mode edit (`!isEditing`)
2. ❓ `inventoryItems` ada dan punya data
3. ❓ `inventoryItems.length > 0`

## Langkah Debug

### 1. Buka Browser Console (F12)

### 2. Cek API Call
Buka tab **Network** → Refresh halaman → Cari:
```
GET /api/sppg/inventory/items?active=true
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "itemName": "Beras Merah",
      "unit": "kg",
      "currentStock": 150,
      "minStock": 50,
      "costPerUnit": 15000,
      ...
    }
  ]
}
```

**Jika Response Kosong:**
```json
{
  "success": true,
  "data": []
}
```
→ Berarti **tidak ada inventory items** di database untuk SPPG ini!

### 3. Cek Console Logs

Di Console, ketik:
```javascript
// Check if useInventoryItems hook is working
window.__DEBUG_INVENTORY__ = true
```

Then refresh page and check console for:
- TanStack Query cache logs
- API call logs
- Data loaded logs

### 4. Cek Database

**Option A: Via Prisma Studio**
```bash
npm run db:studio
```

Buka: http://localhost:5555
- Pilih model: `InventoryItem`
- Filter by: `sppgId` = ID SPPG Anda
- Check if there are ANY items with `isActive = true`

**Option B: Via SQL**
```sql
SELECT COUNT(*) 
FROM "InventoryItem" 
WHERE "sppgId" = 'YOUR_SPPG_ID' 
AND "isActive" = true;
```

### 5. Test API Endpoint Langsung

Buka di browser:
```
http://localhost:3000/api/sppg/inventory/items?active=true
```

Should return JSON with inventory items.

---

## Kemungkinan Penyebab & Solusi

### ❌ Penyebab 1: Tidak Ada Inventory Items di Database

**Solusi: Seed Inventory Data**

```bash
# Run inventory seed
npm run db:seed
```

Atau manual via Prisma Studio:
1. `npm run db:studio`
2. Create new InventoryItem
3. Set `sppgId` to your SPPG ID
4. Set `isActive = true`

### ❌ Penyebab 2: Browser Cache

**Solusi: Hard Refresh**

- **Mac**: `Cmd + Shift + R`
- **Windows**: `Ctrl + Shift + R`

Atau:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### ❌ Penyebab 3: Dev Server Not Updated

**Solusi: Restart Dev Server**

```bash
# Stop server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### ❌ Penyebab 4: TypeScript Compilation Error

**Check:**
```bash
npm run type-check
```

If errors found, fix them first.

### ❌ Penyebab 5: Wrong SPPG ID

API filters by `session.user.sppgId`. If your session has wrong `sppgId`:

**Solution:**
1. Logout
2. Login again
3. Check session in DevTools → Application → Cookies

---

## Quick Test Script

Create file `test-inventory.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Inventory Selector..."

# 1. Check if API endpoint exists
echo "\n1️⃣ Checking API endpoint..."
[ -f "src/app/api/sppg/inventory/items/route.ts" ] && echo "✅ API route exists" || echo "❌ API route missing"

# 2. Check if hook exists
echo "\n2️⃣ Checking hook..."
[ -f "src/features/sppg/menu/hooks/useInventory.ts" ] && echo "✅ Hook exists" || echo "❌ Hook missing"

# 3. Check if API client exists
echo "\n3️⃣ Checking API client..."
[ -f "src/features/sppg/menu/api/inventoryApi.ts" ] && echo "✅ API client exists" || echo "❌ API client missing"

# 4. Check if MenuIngredientForm has inventory code
echo "\n4️⃣ Checking MenuIngredientForm..."
INVENTORY_COUNT=$(grep -c "Pilih dari Inventory" "src/features/sppg/menu/components/MenuIngredientForm.tsx")
if [ "$INVENTORY_COUNT" -gt 0 ]; then
  echo "✅ Inventory selector code exists"
else
  echo "❌ Inventory selector code missing"
fi

# 5. Check if useInventoryItems is imported
echo "\n5️⃣ Checking imports..."
grep -q "useInventoryItems" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ useInventoryItems imported" || echo "❌ useInventoryItems not imported"

# 6. Test API endpoint (if server running)
echo "\n6️⃣ Testing API endpoint..."
echo "   Visit: http://localhost:3000/api/sppg/inventory/items?active=true"
echo "   Expected: JSON with inventory items array"

echo "\n✨ Test complete!"
echo "\n📋 Next Steps:"
echo "1. Check browser console for errors"
echo "2. Check Network tab for API call"
echo "3. Test API endpoint directly in browser"
echo "4. Check database for inventory items"
```

Run:
```bash
chmod +x test-inventory.sh
./test-inventory.sh
```

---

## Manual Verification

### Step-by-Step Check:

**✅ Step 1**: Open page
```
http://localhost:3000/menu/cmgqcxwfl001esv3jt4c2syps
```

**✅ Step 2**: Click "Bahan" tab

**✅ Step 3**: Look for Inventory Selector

**Should see:**
```
┌─────────────────────────────────┐
│ 📦 Pilih dari Inventory          │
│ ┌─────────────────────────────┐ │
│ │ [▼ Cari bahan di inventory] │ │
│ └─────────────────────────────┘ │
│ ℹ️ Memilih dari inventory akan   │
│   otomatis mengisi nama...      │
└─────────────────────────────────┘
───────────────────────────────────
Informasi Bahan
[Nama Bahan input field]
```

**If NOT seeing 📦 section:**
→ `inventoryItems` is empty or undefined

---

## Most Likely Cause

**🎯 Database has NO inventory items for this SPPG!**

### Quick Fix:

**Option 1: Seed Database**
```bash
npm run db:seed
```

**Option 2: Create Manually via Prisma Studio**
```bash
npm run db:studio
```
Then create `InventoryItem` with:
- `sppgId` = your SPPG ID
- `isActive` = true
- `itemName` = "Beras Merah"
- `unit` = "kg"
- `currentStock` = 100
- `minStock` = 20
- `costPerUnit` = 15000

**Option 3: Via API** (if you have admin endpoint)

---

## Debug Output to Share

If still not working, share:

1. **Network tab screenshot** showing API call
2. **Console errors** (if any)
3. **API response** from `/api/sppg/inventory/items?active=true`
4. **Database count** of InventoryItems
5. **Browser** (Chrome/Safari/Firefox) and version

---

**Last Updated**: October 14, 2025
