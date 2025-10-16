# 🐛 DEBUG MODE - Inventory Selector Troubleshooting

## ✅ Perubahan Terbaru

Saya sudah menambahkan **DEBUG ALERT BOX** biru yang akan muncul di form tambah bahan.

---

## 🔧 LANGKAH-LANGKAH (LAKUKAN SEMUA!)

### Step 1: Stop Dev Server
```bash
# Tekan Ctrl+C di terminal yang menjalankan npm run dev
```

### Step 2: Clear All Caches
```bash
chmod +x force-refresh.sh
./force-refresh.sh
```

Atau manual:
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Open Browser in INCOGNITO Mode
```
Cmd+Shift+N (Mac) atau Ctrl+Shift+N (Windows)
```

**PENTING:** Jangan gunakan browser window biasa! Cache-nya masih ada.

### Step 5: Buka URL Menu
```
http://localhost:3000/menu/cmgqcxwfl001gsv3jd4l4fmni
```

### Step 6: Klik Tab "Bahan"

### Step 7: Klik "Tambah Bahan Baru" atau scroll ke form

---

## 🎯 APA YANG HARUS ANDA LIHAT

### Scenario A: DEBUG BOX MUNCUL ✅

Anda akan melihat **BLUE DEBUG BOX** seperti ini:

```
┌────────────────────────────────────────┐
│ 🐛 DEBUG MODE                           │
│ isEditing: false                       │
│ inventoryItems: 34 items               │
│ isLoadingInventory: false              │
│ Condition met: true                    │
└────────────────────────────────────────┘
```

**Jika "Condition met: true":**
→ Inventory Selector HARUS muncul di bawahnya!

**Jika muncul tapi "Condition met: false":**
→ Ada masalah dengan kondisi. Screenshot dan kirim ke saya.

---

### Scenario B: DEBUG BOX TIDAK MUNCUL ❌

**Kemungkinan:**
1. **Anda dalam mode EDIT** (bukan tambah baru)
2. **Component tidak ter-render**
3. **File belum ter-save/compile**

**Solution:**
- Pastikan Anda klik button "Tambah Bahan Baru" (bukan edit existing)
- Check terminal untuk compilation errors
- Restart dev server lagi

---

## 📊 CONSOLE OUTPUT

Buka Browser Console (F12 → Console tab)

**Expected output:**

```javascript
🔍 MenuIngredientForm Debug: {
  isEditing: false,
  inventoryItems: [
    { id: "...", itemName: "Beras Merah", ... },
    // ... 33 more items
  ],
  inventoryItemsLength: 34,
  isLoadingInventory: false,
  showInventorySelector: true,
  conditions: {
    notEditing: true,
    hasInventoryItems: true,
    hasLength: true
  }
}

📦 INVENTORY SELECTOR CONDITION CHECK: {
  !isEditing: true,
  inventoryItems: [Array(34)],
  inventoryItems.length: 34,
  SHOULD_SHOW: true
}
```

**If you see this** → Inventory Selector MUST appear!

---

## 🔍 Network Tab Check

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh page
4. Look for: `GET /api/sppg/inventory/items?active=true`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "itemName": "Beras Merah",
      "currentStock": 150,
      "unit": "kg",
      "costPerUnit": 15000,
      ...
    },
    // ... 33 more items
  ]
}
```

**Status Code:** `200 OK`

---

## 📸 What to Screenshot if Still Not Working

Please provide:

1. **Screenshot of the form** (showing debug box or not)
2. **Browser console output** (all logs)
3. **Network tab** (inventory items API call)
4. **Terminal output** (dev server logs)

Attach these to next message.

---

## 🎨 Expected Visual After Fix

After successful fix, you should see:

```
┌────────────────────────────────────────┐
│ 🐛 DEBUG MODE                           │
│ isEditing: false                       │
│ inventoryItems: 34 items               │
│ isLoadingInventory: false              │
│ Condition met: true                    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 📦 Pilih dari Inventory                 │
│ ┌────────────────────────────────────┐ │
│ │ [▼ Cari bahan di inventory...    ] │ │
│ └────────────────────────────────────┘ │
│ ℹ️  Memilih dari inventory akan         │
│    otomatis mengisi nama, satuan, dan  │
│    harga                               │
└────────────────────────────────────────┘

─────────────────────────────────────────

Informasi Bahan

Nama Bahan:  [_______________________]
```

---

## 🚨 CRITICAL CHECKLIST

Before testing, confirm:

- [ ] Dev server stopped (Ctrl+C)
- [ ] `.next` directory deleted
- [ ] `node_modules/.cache` deleted
- [ ] Dev server restarted (`npm run dev`)
- [ ] Browser opened in **INCOGNITO MODE**
- [ ] Correct URL opened
- [ ] Clicked "Bahan" tab
- [ ] Looking at **CREATE FORM** (not edit)
- [ ] Browser console open (F12)

---

## 🆘 Emergency Test

If STILL not working after all steps above, run this test:

### Test 1: Check if component file changed
```bash
grep -n "DEBUG MODE" src/features/sppg/menu/components/MenuIngredientForm.tsx
```

**Expected:** Should show line number with "DEBUG MODE"

### Test 2: Check compilation
```bash
npm run type-check
```

**Expected:** No errors

### Test 3: Force recompile
```bash
rm -rf .next && npm run dev
```

---

## 📞 Report Back

After completing all steps, please tell me:

1. **Debug box muncul?** (Yes/No)
2. **Isi debug box** (copy text)
3. **Console output** (copy logs)
4. **Inventory selector muncul?** (Yes/No)

This will help me identify the exact issue!

---

**IMPORTANT:** Do ALL steps in order. Don't skip any!

---

**Last Updated**: October 14, 2025  
**Status**: 🐛 DEBUG MODE ACTIVE
