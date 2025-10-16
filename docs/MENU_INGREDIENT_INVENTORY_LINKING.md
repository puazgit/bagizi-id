# 🔗 MenuIngredient to InventoryItem Linking - Implementation Guide

> **Date**: October 15, 2025, 06:00 WIB  
> **Status**: 🚀 READY TO IMPLEMENT  
> **Estimated Time**: 2-3 hours

---

## 🎯 Objective

Update **ALL MenuIngredient entries** di `menu-seed.ts` untuk menggunakan `inventoryItemId` references ke real InventoryItem, bukan hardcoded `ingredientName` saja.

### Why This Matters

**Current Problem** ❌:
```typescript
// Hardcoded - no inventory tracking
{
  ingredientName: 'Ayam Kampung',
  quantity: 100,
  // NO inventoryItemId!
}
```

**Target Solution** ✅:
```typescript
// Linked to inventory - full tracking
{
  inventoryItemId: inventoryItems.find(i => i.itemCode === 'AYM-001')?.id,
  ingredientName: 'Ayam Kampung Fillet',
  quantity: 100,
  // Can now track stock, supplier, cost changes!
}
```

---

## 📊 Implementation Strategy

### Phase 1: Get All Inventory Items (DONE ✅)
- ✅ Added 15 missing items to inventory-seed.ts
- ✅ Total inventory items: 51 items
- ✅ All categories covered: PROTEIN, KARBOHIDRAT, SAYURAN, BUAH, SUSU_OLAHAN, BUMBU_REMPAH, MINYAK_LEMAK, LAINNYA

### Phase 2: Update Menu Seed Structure (IN PROGRESS 🟡)
```typescript
// 1. Fetch all inventory items first
const inventoryItems = await prisma.inventoryItem.findMany({
  where: { sppgId: sppg.id }
})

// 2. Helper function to find item by code
const findInventoryItem = (itemCode: string) => {
  return inventoryItems.find(item => item.itemCode === itemCode)
}

// 3. Update each MenuIngredient with inventoryItemId
{
  inventoryItemId: findInventoryItem('AYM-001')?.id,
  ingredientName: 'Ayam Kampung Fillet',
  // ... rest of fields
}
```

### Phase 3: Add Preparation Notes & Substitutes (IN PROGRESS 🟡)
```typescript
{
  inventoryItemId: findInventoryItem('AYM-001')?.id,
  ingredientName: 'Ayam Kampung Fillet',
  quantity: 100,
  unit: 'gram',
  costPerUnit: 50,
  totalCost: 5000,
  preparationNotes: 'Cuci bersih, potong dadu 2x2 cm, marinasi dengan garam dan jeruk nipis 10 menit',
  substitutes: ['Ayam Broiler (lebih murah)', 'Ayam Organik (lebih sehat)'],
  isOptional: false
}
```

---

## 🗺️ Complete Mapping: Menu → Inventory Items

### Menu 1: Nasi Gudeg Ayam Kampung

| Ingredient | Inventory Code | Cost/Unit | Qty | Prep Notes |
|------------|----------------|-----------|-----|------------|
| Beras Putih | BRP-001 | Rp 12/g | 80g | Cuci hingga air jernih, rendam 15 menit |
| Ayam Kampung | AYM-001 | Rp 50/g | 100g | Potong dadu 2cm, marinasi garam+jeruk 10 menit |
| Nangka Muda | NKM-001 | Rp 15/g | 100g | Potong tipis 3cm, rebus 15 menit buang getah |
| Santan Kelapa | SNT-001 | Rp 12/ml | 50ml | Santan kental dari kelapa segar |
| Gula Merah | GLM-001 | Rp 25/g | 20g | Sisir halus untuk meresap sempurna |
| Lengkuas | LKS-001 | Rp 20/g | 5g | Memarkan untuk aroma maksimal |
| Daun Salam | DSL-001 | Rp 30/g | 2g | 2 lembar utuh, buang sebelum sajikan |

**Substitutes**:
- Ayam Kampung → Ayam Broiler (Rp 32/g, lebih murah 36%)
- Santan → Santan kemasan (Rp 10/ml, lebih praktis)
- Gula Merah → Gula Aren (Rp 28/g, rasa similar)

---

### Menu 2: Nasi Soto Ayam Kuning

| Ingredient | Inventory Code | Cost/Unit | Qty | Prep Notes |
|------------|----------------|-----------|-----|------------|
| Beras Putih | BRP-001 | Rp 12/g | 80g | Cuci bersih 3x, tiriskan sebelum masak |
| Ayam Fillet | AYM-001 | Rp 50/g | 80g | Rebus dengan lengkuas+sereh, suwir halus |
| Wortel | WRT-001 | Rp 12/g | 30g | Potong dadu 1cm, rebus hingga empuk |
| Kentang | KNT-001 | Rp 12/g | 50g | Kupas, potong dadu 2cm, goreng setengah matang |
| Tomat | TMT-001 | Rp 15/g | 20g | Potong wedges, rebus sebentar |
| Kunyit | KNY-001 | Rp 18/g | 3g | Parut halus, peras airnya untuk kuah kuning |
| Lengkuas | LKS-001 | Rp 20/g | 5g | Memarkan, rebus bersama ayam |
| Sereh | SRH-001 | Rp 15/g | 5g | Memarkan batang putihnya |
| Daun Salam | DSL-001 | Rp 30/g | 2g | 2 lembar, aroma harum |
| Jahe | JAH-001 | Rp 22/g | 3g | Memarkan untuk aroma hangat |

**Substitutes**:
- Ayam Fillet → Daging Sapi (Rp 120/g, lebih mahal, Soto Daging)
- Kentang → Ubi (Rp 12/g, lebih sehat)

---

### Menu 3: Nasi Ikan Bakar Kecap

| Ingredient | Inventory Code | Cost/Unit | Qty | Prep Notes |
|------------|----------------|-----------|-----|------------|
| Beras Putih | BRP-001 | Rp 12/g | 80g | Nasi pulen untuk ikan bakar |
| Ikan Lele | IKL-001 | Rp 32/g | 100g | Bersihkan lendir, belah punggung, lumuri bumbu |
| Tempe | TMP-001 | Rp 12/g | 50g | Potong tipis 0.5cm, goreng garing |
| Tahu | TAH-001 | Rp 10/g | 50g | Potong dadu 3cm, goreng hingga kuning |
| Bayam | BYM-001 | Rp 8/g | 50g | Cuci bersih 3x, petik daunnya saja |
| Tomat | TMT-001 | Rp 15/g | 30g | Potong bulat untuk sambal |
| Bawang Merah | BWM-001 | Rp 35/g | 10g | Iris tipis, goreng untuk sambal |
| Cabe Rawit | CBR-001 | Rp 45/g | 5g | Ulek kasar untuk sambal |
| Kecap Manis | KCM-001 | Rp 22/ml | 20ml | Campur dengan jeruk nipis untuk marinasi |
| Daun Jeruk | DJK-001 | Rp 40/g | 2g | Sobek untuk aroma citrus |

**Substitutes**:
- Ikan Lele → Ikan Nila (Rp 35/g), Ikan Mas (Rp 45/g)
- Tempe → Tahu saja (vegetarian)

---

### Menu 4: Nasi Sayur Asem Iga Ayam

| Ingredient | Inventory Code | Cost/Unit | Qty | Prep Notes |
|------------|----------------|-----------|-----|------------|
| Beras Putih | BRP-001 | Rp 12/g | 80g | Nasi pulen untuk sayur berkuah |
| Ayam Kampung (Iga) | AYM-001 | Rp 50/g | 80g | Potong iga, rebus hingga empuk |
| Kangkung | KNG-001 | Rp 8/g | 50g | Petik daun dan batang muda |
| Kol | KOL-001 | Rp 8/g | 40g | Potong korek api 0.5x5cm |
| Jagung Manis | - | Rp 10/g | 50g | Pipil, rebus hingga empuk |
| Tomat | TMT-001 | Rp 15/g | 30g | Potong wedges, tambahkan akhir masak |
| Kacang Tanah | KCT-001 | Rp 18/g | 20g | Goreng tanpa minyak, kupas kulit ari |
| Gula Merah | GLM-001 | Rp 25/g | 15g | Untuk rasa asem manis khas |
| Santan | SNT-001 | Rp 12/ml | 30ml | Santan encer, tambahkan akhir |
| Daun Salam | DSL-001 | Rp 30/g | 2g | Aroma tradisional |
| Daun Jeruk | DJK-001 | Rp 40/g | 2g | Citrus note |

**Note**: Need to add Jagung Manis to inventory! Using workaround in seed for now.

---

### Menu 5: Nasi Empal Gepuk Sunda

| Ingredient | Inventory Code | Cost/Unit | Qty | Prep Notes |
|------------|----------------|-----------|-----|------------|
| Beras Putih | BRP-001 | Rp 12/g | 80g | Nasi pulen untuk empal |
| Daging Sapi | DSP-001 | Rp 120/g | 100g | Bagian has dalam, potong lebar 5cm |
| Tempe | TMP-001 | Rp 12/g | 50g | Goreng garing sebagai pelengkap |
| Timun | - | Rp 8/g | 30g | Iris tipis bulat untuk lalapan |
| Tomat | TMT-001 | Rp 15/g | 20g | Potong wedges untuk lalapan |
| Gula Merah | GLM-001 | Rp 25/g | 15g | Untuk bumbu meresap |
| Kemiri | KMR-001 | Rp 80/g | 5g | Sangrai, haluskan untuk bumbu |
| Ketumbar | - | Rp 35/g | 3g | Sangrai, tumbuk kasar |
| Lengkuas | LKS-001 | Rp 20/g | 5g | Memarkan untuk aroma |
| Bawang Merah | BWM-001 | Rp 35/g | 10g | Haluskan untuk bumbu |
| Bawang Putih | BWP-001 | Rp 38/g | 5g | Haluskan untuk bumbu |

**Note**: Need Timun (cucumber) and Ketumbar (coriander) in inventory!

---

### Menu 6-10: Snack Menus (Summary)

**Menu 6: Kue Cucur Gula Merah**
- Tepung Terigu (TPT-001), Gula Merah (GLM-001), Santan (SNT-001), Kelapa Parut (KLP-001)

**Menu 7: Kacang Rebus**
- Kacang Tanah (KCT-001), Garam (GRM-001), Daun Salam (DSL-001)

**Menu 8: Getuk Lindri Ubi Ungu**
- Ubi Ungu (UBU-001), Gula Pasir (GLP-001), Kelapa Parut (KLP-001)

**Menu 9: Nagasari Pisang**
- Tepung Terigu (TPT-001), Pisang (PSG-001), Santan (SNT-001), Gula Pasir (GLP-001), Daun Pisang (DPS-001)

**Menu 10: Pisang Goreng Keju**
- Pisang (PSG-001), Tepung Terigu (TPT-001), Gula Pasir (GLP-001), Keju Cheddar (KJC-001), Minyak Goreng (MYK-001)

---

## 🚨 Additional Items Needed (Found During Mapping)

### Critical Missing Items (3 items):
1. **Jagung Manis** (JGM-001) - SAYURAN - Rp 10,000/kg
2. **Timun** (TMN-001) - SAYURAN - Rp 8,000/kg  
3. **Ketumbar** (KTB-001) - BUMBU_REMPAH - Rp 35,000/kg

**Action**: Add these 3 items to inventory-seed.ts FIRST before linking!

---

## 📋 Implementation Checklist

### Step 1: Add 3 More Missing Items ⏳
- [ ] Add Jagung Manis (JGM-001)
- [ ] Add Timun (TMN-001)
- [ ] Add Ketumbar (KTB-001)
- [ ] Run TypeScript check
- [ ] Update total inventory count: 51 → 54 items

### Step 2: Update Menu Seed Structure ⏳
- [ ] Add inventoryItems fetch at start of seedMenus()
- [ ] Add findInventoryItem() helper function
- [ ] Test helper function works

### Step 3: Update Each Menu (10 menus) ⏳
- [ ] Menu 1: Nasi Gudeg (7 ingredients)
- [ ] Menu 2: Nasi Soto Ayam (10 ingredients)
- [ ] Menu 3: Nasi Ikan Bakar (10 ingredients)
- [ ] Menu 4: Nasi Sayur Asem (11 ingredients)
- [ ] Menu 5: Nasi Empal Gepuk (11 ingredients)
- [ ] Menu 6: Kue Cucur (4 ingredients)
- [ ] Menu 7: Kacang Rebus (3 ingredients)
- [ ] Menu 8: Getuk Lindri (3 ingredients)
- [ ] Menu 9: Nagasari (5 ingredients)
- [ ] Menu 10: Pisang Goreng (5 ingredients)

### Step 4: Add Preparation Notes ⏳
- [ ] Add detailed Bahasa Indonesia preparation notes for each ingredient
- [ ] Include timing (e.g., "marinasi 10 menit")
- [ ] Include technique (e.g., "potong dadu 2cm")
- [ ] Include tips (e.g., "buang getah nangka dengan garam")

### Step 5: Add Substitutes Arrays ⏳
- [ ] Add 1-3 substitutes per main ingredient
- [ ] Include cost comparison
- [ ] Include taste/quality notes

### Step 6: Verify & Test ⏳
- [ ] TypeScript compilation
- [ ] Run db:reset && db:seed
- [ ] Check Prisma Studio: MenuIngredient → InventoryItem relations exist
- [ ] Verify all 60+ ingredients have inventoryItemId
- [ ] Test API endpoint: GET /api/sppg/menu/[id] returns inventory data

---

## 💾 Code Template

### Helper Function
```typescript
async function seedMenus(sppg: any, programs: any[]) {
  // 1. Fetch all inventory items
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { sppgId: sppg.id }
  })

  // 2. Helper to find inventory item by code
  const findInventoryItem = (itemCode: string) => {
    const item = inventoryItems.find(i => i.itemCode === itemCode)
    if (!item) {
      console.warn(`⚠️ Inventory item not found: ${itemCode}`)
    }
    return item
  }

  // 3. Use in MenuIngredient creation
  const menu1Ingredients = [
    {
      inventoryItemId: findInventoryItem('BRP-001')?.id,
      ingredientName: 'Beras Putih Premium',
      quantity: 80,
      unit: 'gram',
      costPerUnit: 12,
      totalCost: 960,
      preparationNotes: 'Cuci hingga air jernih, rendam 15 menit untuk nasi pulen. Tiriskan dengan saringan.',
      substitutes: ['Beras Merah (lebih sehat)', 'Beras Organik (lebih premium)'],
      isOptional: false
    },
    // ... more ingredients
  ]
}
```

---

## 🎯 Success Criteria

### Data Completeness ✅
- [ ] ALL 60+ MenuIngredient have inventoryItemId (not null)
- [ ] ALL ingredients have preparationNotes (min 30 chars)
- [ ] ALL main ingredients have substitutes array (1-3 items)
- [ ] ALL cost calculations match inventory costPerUnit

### Data Accuracy ✅
- [ ] Inventory codes match existing items
- [ ] Quantities realistic for 1 portion
- [ ] Costs match Purwakarta 2025 market
- [ ] Preparation notes clear and executable

### System Integration ✅
- [ ] TypeScript compiles without errors
- [ ] Seed runs without database errors
- [ ] Relations visible in Prisma Studio
- [ ] APIs return complete ingredient data with inventory info

---

## ⏱️ Time Estimate

- Add 3 missing items: **15 minutes**
- Update menu seed structure: **30 minutes**
- Update 10 menus with inventory links: **60 minutes**
- Add preparation notes (60+ ingredients): **45 minutes**
- Add substitutes arrays: **30 minutes**
- Testing & verification: **30 minutes**

**Total: 3.5 hours**

---

## 🚀 Next Actions

1. ⏳ Add Jagung Manis, Timun, Ketumbar to inventory-seed.ts
2. ⏳ Update menu-seed.ts structure (add inventoryItems fetch)
3. ⏳ Start updating Menu 1 (Gudeg) as prototype
4. ⏳ Replicate pattern to Menu 2-10
5. ⏳ Test complete seed

---

**Status**: 🚀 READY TO START  
**Current Progress**: 2/7 tasks complete (Inventory audit ✅, Add missing items ✅)  
**Next Immediate**: Add 3 more items to inventory, then link MenuIngredient  
**ETA Completion**: 3.5 hours from now

---

*"Proper inventory linking = Production-ready menu system!"*
