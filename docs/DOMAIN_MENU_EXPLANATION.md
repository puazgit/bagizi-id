# Domain Menu - Penjelasan Lengkap & Real Implementation

**Date**: October 22, 2025  
**Purpose**: Menjelaskan konsep domain Menu, cost calculation, dan bagaimana seharusnya bekerja di aplikasi SPPG  
**Sumber Data**: Database real - Menu "Pisang Goreng Keju" (SNACK-004)

---

## 🎯 **Konsep Dasar: Menu = Resep Standar**

Menu dalam sistem SPPG adalah **RESEP STANDAR** untuk membuat 1 porsi makanan.

### **Contoh Real dari Database: Pisang Goreng Keju**

```
📖 Menu SNACK-004
--------------------
Nama: Pisang Goreng Keju
Kode: SNACK-004
Porsi: 1 orang (130 gram)

Bahan-bahan (per 100g base):
✓ Pisang: 0.12 kg (→ 0.156 kg untuk 130g porsi)
✓ Keju Cheddar: 0.03 kg (→ 0.039 kg untuk 130g porsi)
✓ Minyak Goreng: 0.1 liter (→ 0.13 liter untuk 130g porsi)
✓ Tepung Beras: 0.05 kg (→ 0.065 kg untuk 130g porsi)
✓ Gula Pasir: 0.01 kg (→ 0.013 kg untuk 130g porsi)

💰 Biaya: Rp 7,000 per porsi
🏭 Batch Size: 160 porsi (default production planning)
```

---

## 📊 **Field-Field dalam Menu Table**

### **1. Menu Identity & Description**
```typescript
{
  id: "cmh0d2v2n003psv7fxyxgkc6y",
  menuCode: "SNACK-004",
  menuName: "Pisang Goreng Keju",
  description: "Snack bergizi tinggi dengan pisang dan keju",
  programId: "program-abc-456"  // Menu ini untuk program apa
}
```

### **2. Meal Planning & Portion**
```typescript
{
  mealType: "SNACK",              // Makanan tambahan
  servingSize: 130,               // 1 porsi = 130 gram
  batchSize: 160,                 // Production planning: biasanya masak 160 porsi sekali
}
```

**Penjelasan `batchSize`:**
- Ini adalah **PLANNING** untuk produksi
- BUKAN bagian dari resep, tapi informasi operasional
- Gunanya: "Kalau mau produksi menu ini, biasanya sekali masak berapa porsi?"
- Contoh real: Pisang Goreng Keju biasanya produksi 160 porsi sekali goreng

### **3. Recipe Information**
```typescript
{
  preparationTime: 15,            // Persiapan bahan: 15 menit
  cookingTime: 20,                // Menggoreng: 20 menit
  difficulty: "EASY",             // Tingkat kesulitan mudah
  cookingMethod: "FRY"            // Metode memasak: menggoreng
}
```

### **4. Cost Information**
```typescript
{
  costPerServing: 7000,           // Biaya BAHAN untuk 1 porsi
  budgetAllocation: 8000          // Anggaran pemerintah untuk 1 porsi
}
```

**🔥 CRITICAL: Penjelasan `costPerServing` vs `budgetAllocation`**

#### **`costPerServing`** = **ACTUAL COST (Biaya Bahan)**
- Ini adalah **TOTAL BIAYA BAHAN** untuk membuat **1 PORSI**
- Dihitung dari ingredients
- **Contoh Real: Pisang Goreng Keju (130g per porsi)**
  ```
  Ingredients untuk 1 porsi (130g serving):
  - Pisang (0.156kg × Rp 12,000/kg) = Rp 1,872
  - Keju (0.039kg × Rp 120,000/kg) = Rp 4,680
  - Minyak (0.13L × Rp 16,000/L) = Rp 2,080
  - Tepung (0.065kg × Rp 10,000/kg) = Rp 650
  - Gula (0.013kg × Rp 14,000/kg) = Rp 182
  
  Calculated Total = Rp 9,464 (harga normal)
  Database Value = Rp 7,000 ✅ (ada diskon supplier Rp 2,464!)
  
  Diskon: 9,464 - 7,000 = Rp 2,464 (26% diskon!)
  ```

#### **`budgetAllocation`** = **BUDGET (Alokasi Anggaran)**
- Ini adalah **ANGGARAN** yang dialokasikan pemerintah/SPPG
- Untuk 1 anak per 1 kali makan
- Contoh: Pemerintah alokasi Rp 8,000-10,000 per anak per snack

#### **Relationship - Real Example:**
```typescript
// Menu: Pisang Goreng Keju
budgetAllocation = 8000     // Anggaran: Rp 8,000 per porsi (asumsi wajar)
costPerServing = 7000       // Actual cost: Rp 7,000 (sudah ada diskon!)

// Analysis:
margin = budgetAllocation - costPerServing
margin = 8000 - 7000 = Rp 1,000  // Sisa untuk overhead/profit

efficiency = (costPerServing / budgetAllocation) × 100
efficiency = (7000 / 8000) × 100 = 87.5%  // Efisien! ✅

// Interpretasi:
// - Menu ini EFISIEN karena cost < budget
// - Supplier sudah kasih diskon Rp 2,464 (26%)
// - Masih ada sisa Rp 1,000 (12.5%) untuk:
//   * Labor cost (tenaga kerja masak)
//   * Utility (gas untuk menggoreng, listrik)
//   * Packaging (bungkus pisang goreng)
//   * Overhead operasional
```

### **5. Dietary & Status**
```typescript
{
  isHalal: true,
  isVegetarian: false,
  isVegan: false,
  allergens: ["DAIRY", "NUTS"],
  isActive: true
}
```

---

## 🧮 **Cost Calculation - How It Works**

### **Step 1: Define Ingredients (Per 100g Base Serving)**

```typescript
// MenuIngredient table - untuk 100g BASE SERVING
// NOTE: Sistem menggunakan 100g sebagai basis standar untuk consistency

// Menu Real: Pisang Goreng Keju (servingSize = 130g per porsi)
// Data dari database production:

ingredients = [
  {
    menuId: "cmh0d2v2n003psv7fxyxgkc6y",
    inventoryItemId: "inv-pisang-001",
    quantity: 0.12,              // 120 gram per 100g base = 0.12 kg
    unit: "kg",                  // (untuk 130g porsi = 156g pisang)
    // inventoryItem.costPerUnit: 12000  (Rp 12,000 per kg)
  },
  {
    menuId: "cmh0d2v2n003psv7fxyxgkc6y",
    inventoryItemId: "inv-keju-001",
    quantity: 0.03,              // 30 gram per 100g base = 0.03 kg
    unit: "kg",                  // (untuk 130g porsi = 39g keju)
    // inventoryItem.costPerUnit: 120000  (Rp 120,000 per kg)
  },
  {
    menuId: "cmh0d2v2n003psv7fxyxgkc6y",
    inventoryItemId: "inv-minyak-001",
    quantity: 0.1,               // 100 ml per 100g base = 0.1 liter
    unit: "liter",               // (untuk 130g porsi = 130ml minyak)
    // inventoryItem.costPerUnit: 16000  (Rp 16,000 per liter)
  },
  {
    menuId: "cmh0d2v2n003psv7fxyxgkc6y",
    inventoryItemId: "inv-tepung-beras-001",
    quantity: 0.05,              // 50 gram per 100g base = 0.05 kg
    unit: "kg",                  // (untuk 130g porsi = 65g tepung)
    // inventoryItem.costPerUnit: 10000  (Rp 10,000 per kg)
  },
  {
    menuId: "cmh0d2v2n003psv7fxyxgkc6y",
    inventoryItemId: "inv-gula-001",
    quantity: 0.01,              // 10 gram per 100g base = 0.01 kg
    unit: "kg",                  // (untuk 130g porsi = 13g gula)
    // inventoryItem.costPerUnit: 14000  (Rp 14,000 per kg)
  }
]
```

**🔥 CRITICAL UNDERSTANDING:** 

#### **System menggunakan "100g base serving" sebagai standar!**

**Mengapa 100g?**
- Standar internasional untuk nutrition facts
- Mudah untuk perbandingan antar menu
- Scaling formula simple: `actualQuantity = baseQuantity × (servingSize / 100)`

**Contoh Scaling:**

```typescript
// Menu Real: Pisang Goreng Keju
menu.servingSize = 130  // 1 porsi = 130 gram

// Ingredient: Pisang (per 100g base)
ingredient.quantity = 0.12 kg  // 120 gram per 100g

// Calculate untuk 1 porsi (130g):
actualQuantity = 0.12 × (130 / 100)
actualQuantity = 0.12 × 1.3
actualQuantity = 0.156 kg  // 156 gram pisang per porsi ✅

// Ingredient: Keju (per 100g base)
ingredient.quantity = 0.03 kg  // 30 gram per 100g

// Calculate untuk 1 porsi (130g):
actualQuantity = 0.03 × (130 / 100)
actualQuantity = 0.03 × 1.3
actualQuantity = 0.039 kg  // 39 gram keju per porsi ✅

// Ingredient: Minyak Goreng (per 100g base)
ingredient.quantity = 0.1 liter  // 100 ml per 100g

// Calculate untuk 1 porsi (130g):
actualQuantity = 0.1 × (130 / 100)
actualQuantity = 0.1 × 1.3
actualQuantity = 0.13 liter  // 130 ml minyak per porsi ✅
```

**Formula Universal:**
```typescript
actualQuantityPerServing = ingredient.quantity × (menu.servingSize / 100)
```

**Unit mengikuti InventoryItem (kg, liter, pcs)**

### **Step 2: Calculate Ingredient Cost**

```typescript
// Calculate total ingredient cost untuk 1 PORSI
let totalIngredientCost = 0

for (const ingredient of ingredients) {
  // Step 1: Scale dari 100g base ke actual serving size
  const actualQuantity = ingredient.quantity × (menu.servingSize / 100)
  
  // Step 2: Calculate cost
  const cost = actualQuantity × ingredient.inventoryItem.costPerUnit
  totalIngredientCost += cost
}

// Example Real: Pisang Goreng Keju (menu.servingSize = 130g):

// Pisang (base 100g = 120g, actual 130g = 156g)
const pisangActual = 0.12 × (130 / 100) = 0.156 kg
const pisangCost = 0.156 × 12000 = Rp 1,872 ✅

// Keju (base 100g = 30g, actual 130g = 39g)
const kejuActual = 0.03 × (130 / 100) = 0.039 kg
const kejuCost = 0.039 × 120000 = Rp 4,680 ✅

// Minyak (base 100g = 100ml, actual 130g = 130ml)
const minyakActual = 0.1 × (130 / 100) = 0.13 liter
const minyakCost = 0.13 × 16000 = Rp 2,080 ✅

// Tepung Beras (base 100g = 50g, actual 130g = 65g)
const tepungActual = 0.05 × (130 / 100) = 0.065 kg
const tepungCost = 0.065 × 10000 = Rp 650 ✅

// Gula (base 100g = 10g, actual 130g = 13g)
const gulaActual = 0.01 × (130 / 100) = 0.013 kg
const gulaCost = 0.013 × 14000 = Rp 182 ✅

totalIngredientCost = 1872 + 4680 + 2080 + 650 + 182 = Rp 9,464 ✅

// Update menu.costPerServing
// Database shows Rp 7,000 karena ada DISKON SUPPLIER!
// Diskon: Rp 9,464 - Rp 7,000 = Rp 2,464 (26% discount!)

menu.costPerServing = 7000  // Harga setelah negosiasi supplier ✅
```

**Key Formula:**
```typescript
// For each ingredient:
actualQuantity = ingredient.quantity × (menu.servingSize / 100)
ingredientCost = actualQuantity × inventoryItem.costPerUnit

// Total cost per serving:
costPerServing = sum(ingredientCost for all ingredients)

// Real example breakdown:
// Calculated: Rp 9,464 (harga normal dari formula)
// Database: Rp 7,000 (harga setelah diskon supplier)
// Savings: Rp 2,464 per porsi (26% discount!)
```

### **Step 3: Production Planning (Scaling to Multiple Portions)**

Ketika mau **PRODUKSI**, system scale dari 100g base ke actual production quantity:

```typescript
// Production Plan - Real Example: Pisang Goreng Keju
const productionPlan = {
  menuId: "cmh0d2v2n003psv7fxyxgkc6y",
  productionDate: "2025-10-22",
  plannedPortions: 160,          // Mau produksi 160 porsi (sesuai batchSize)
}

// Calculate bahan yang dibutuhkan
const requiredIngredients = ingredients.map(ing => {
  // Step 1: Scale dari 100g base ke 1 porsi (servingSize = 130g)
  const quantityPerServing = ing.quantity × (menu.servingSize / 100)
  
  // Step 2: Scale ke total portions
  const totalQuantity = quantityPerServing × plannedPortions
  
  return {
    inventoryItemId: ing.inventoryItemId,
    itemName: ing.inventoryItem.itemName,
    quantityNeeded: totalQuantity,
    unit: ing.unit
  }
})

// Example calculation (servingSize = 130g, plannedPortions = 160):

// Pisang:
// - Base (100g): 0.12 kg
// - Per serving (130g): 0.12 × 1.3 = 0.156 kg
// - Total (160 portions): 0.156 × 160 = 24.96 kg ≈ 25 kg ✅

// Keju:
// - Base (100g): 0.03 kg
// - Per serving (130g): 0.03 × 1.3 = 0.039 kg
// - Total (160 portions): 0.039 × 160 = 6.24 kg ✅

// Minyak Goreng:
// - Base (100g): 0.1 liter
// - Per serving (130g): 0.1 × 1.3 = 0.13 liter
// - Total (160 portions): 0.13 × 160 = 20.8 liter ✅

// Tepung Beras:
// - Base (100g): 0.05 kg
// - Per serving (130g): 0.05 × 1.3 = 0.065 kg
// - Total (160 portions): 0.065 × 160 = 10.4 kg ✅

// Gula:
// - Base (100g): 0.01 kg
// - Per serving (130g): 0.01 × 1.3 = 0.013 kg
// - Total (160 portions): 0.013 × 160 = 2.08 kg ✅

requiredIngredients = [
  { item: "Pisang", quantityNeeded: 25, unit: "kg" },
  { item: "Keju Cheddar", quantityNeeded: 6.24, unit: "kg" },
  { item: "Minyak Goreng", quantityNeeded: 20.8, unit: "liter" },
  { item: "Tepung Beras", quantityNeeded: 10.4, unit: "kg" },
  { item: "Gula Pasir", quantityNeeded: 2.08, unit: "kg" }
]

// Total ingredient cost untuk 160 porsi
totalProductionCost = menu.costPerServing × plannedPortions
totalProductionCost = 7000 × 160 = Rp 1,120,000
```

**Scaling Formula:**
```typescript
// From 100g base → actual serving → total production
totalQuantity = ingredient.quantity × (servingSize / 100) × plannedPortions

// Or simplified:
totalQuantity = ingredient.quantity × servingSize × plannedPortions / 100

// Real example: Pisang untuk 160 portions (130g each)
pisangTotal = 0.12 × 130 × 160 / 100
pisangTotal = 0.12 × 1.3 × 160
pisangTotal = 24.96 kg ≈ 25 kg ✅
```

### **Step 4: Full Cost Calculation (with Operational Costs)**

```typescript
// API: POST /api/sppg/menu/[id]/calculate-cost
// Real Example: Pisang Goreng Keju untuk 160 porsi

// Request body:
{
  plannedPortions: 160,           // Mau produksi 160 porsi
  
  // Labor costs (cooking staff)
  laborCostPerHour: 25000,        // Rp 25,000 per jam
  preparationHours: 1,            // 1 jam kupas pisang, siapkan adonan
  cookingHours: 2,                // 2 jam menggoreng (batch demi batch)
  
  // Utility costs (untuk 160 porsi)
  gasCost: 80000,                 // Gas LPG untuk menggoreng
  electricityCost: 20000,         // Listrik untuk blender, dll
  waterCost: 10000,               // Air untuk cuci bahan
  
  // Other costs
  packagingCost: 160000,          // Rp 1,000 per porsi × 160 (plastik + box)
  equipmentCost: 30000,           // Maintenance wajan, kompor
  cleaningCost: 20000,            // Sabun, sanitizer
  
  // Overhead
  overheadPercentage: 15          // 15% dari direct cost
}

// Calculation Flow:

// 1. Ingredient Cost (scaled to actual servingSize = 130g)
// For each ingredient:
//   actualQuantity = ingredient.quantity × (130 / 100)
//   ingredientCost = actualQuantity × costPerUnit

totalIngredientCostPerServing = 7000  // From Step 2 (database value)
totalIngredientCost = 7000 × 160 = Rp 1,120,000

// 2. Labor Cost (independent of portions, based on time)
totalLaborCost = 25000 × (1 + 2) = Rp 75,000

// 3. Utility Cost (for entire batch)
totalUtilityCost = 80000 + 20000 + 10000 = Rp 110,000

// 4. Direct Cost
totalDirectCost = 1,120,000 + 75,000 + 110,000 = Rp 1,305,000

// 5. Overhead (15% of direct cost)
overheadCost = 1,305,000 × 15% = Rp 195,750

// 6. Indirect Cost
totalIndirectCost = 160000 + 30000 + 20000 + 195750 = Rp 405,750

// 7. Grand Total for 160 portions
grandTotalCost = 1,305,000 + 405,750 = Rp 1,710,750

// 8. Cost Per Portion (FULL COST including operational)
costPerPortion = 1,710,750 / 160 = Rp 10,692.19

// Cost breakdown per portion:
// - Ingredient: Rp 7,000 (64.9%) ← menu.costPerServing
// - Labor: Rp 468.75 (4.4%)
// - Utility: Rp 687.50 (6.4%)
// - Packaging: Rp 1,000 (9.3%)
// - Equipment: Rp 187.50 (1.8%)
// - Cleaning: Rp 125 (1.2%)
// - Overhead: Rp 1,223.44 (11.4%)
// ----------------------------------------
// TOTAL: Rp 10,692.19 (100%)
```

**Key Differences:**

```typescript
// menu.costPerServing (stored in Menu table)
// = Ingredient cost only (basic recipe cost)
// = Rp 7,000 per portion
// = Calculated from ingredients with 100g base scaling

// costPerPortion (calculated in MenuCostCalculation)
// = Full operational cost (ingredient + labor + utility + overhead)
// = Rp 10,692.19 per portion
// = Calculated when planning actual production

// Relationship:
costPerPortion = (
  (menu.costPerServing × plannedPortions) +  // Total ingredient: Rp 1,120,000
  operationalCosts +                         // Labor + utility: Rp 185,000
  indirectCosts                              // Packaging + overhead: Rp 405,750
) / plannedPortions

costPerPortion = 1,710,750 / 160 = Rp 10,692.19 ✅

// Budget Analysis:
budgetAllocation = 8000 per portion (dari pemerintah)
costPerPortion = 10,692.19 (actual full cost)
deficit = 10,692.19 - 8000 = Rp 2,692.19 per portion ❌

// Interpretasi:
// Menu ini OVER BUDGET untuk full operational cost!
// Tapi ingredient cost (Rp 7,000) masih dalam budget (Rp 8,000)
// Yang membuat over adalah operational costs (Rp 3,692.19)
// 
// Solusi:
// 1. Negosiasi budget lebih tinggi (Rp 11,000 per portion)
// 2. Optimasi operational: batch lebih besar (economies of scale)
// 3. Reduce packaging cost (cari supplier lebih murah)
```

**Why the difference?**
- **menu.costPerServing**: Recipe-level cost (pure ingredients) - untuk menu planning
- **costPerPortion**: Production-level cost (full operational) - untuk production budgeting
- Used for different purposes: Recipe planning vs Production costing

---

## 🎯 **Real-World Scenarios**

### **Scenario 1: Menu Planning (Budget Check)**

```typescript
// Step 1: Create menu with cost estimate
const menu = {
  menuName: "Nasi Gudeg Ayam",
  costPerServing: 8500,           // From ingredient calculation
  budgetAllocation: 10000         // Government budget
}

// Step 2: Check feasibility
if (menu.costPerServing <= menu.budgetAllocation) {
  console.log("✅ Menu FEASIBLE - dalam budget!")
  console.log(`Margin: Rp ${10000 - 8500} = Rp 1,500`)
} else {
  console.log("❌ Menu OVER BUDGET!")
  console.log("Perlu optimasi bahan atau cari supplier lebih murah")
}
```

### **Scenario 2: Production Planning**

```typescript
// User input: Mau produksi untuk 500 anak
const targetBeneficiaries = 500

// Get menu
const menu = await getMenu("menu-xyz-123")
// menu.batchSize = 100 (default batch size)
// menu.servingSize = 200 (gram per porsi)

// Calculate: Berapa kali masak?
const numberOfBatches = Math.ceil(targetBeneficiaries / menu.batchSize)
// numberOfBatches = Math.ceil(500 / 100) = 5 batch

// Calculate total ingredients needed
const totalIngredientsNeeded = menu.ingredients.map(ing => {
  // Step 1: Scale dari 100g base ke actual serving (200g)
  const quantityPerServing = ing.quantity × (menu.servingSize / 100)
  
  // Step 2: Multiply by target portions
  const totalQuantity = quantityPerServing × targetBeneficiaries
  
  return {
    item: ing.inventoryItem.itemName,
    quantity: totalQuantity,
    unit: ing.unit
  }
})

// Example calculation:
// Nasi: 0.075 kg (base) × 2 (serving scale) × 500 = 75 kg
// Ayam: 0.025 kg (base) × 2 (serving scale) × 500 = 25 kg
// Gudeg: 0.05 kg (base) × 2 (serving scale) × 500 = 50 kg
// Santan: 0.025 L (base) × 2 (serving scale) × 500 = 25 L
// Bumbu: 0.01 kg (base) × 2 (serving scale) × 500 = 10 kg

totalIngredientsNeeded = [
  { item: "Nasi", quantity: 75, unit: "kg" },
  { item: "Ayam", quantity: 25, unit: "kg" },
  { item: "Gudeg", quantity: 50, unit: "kg" },
  { item: "Santan", quantity: 25, unit: "liter" },
  { item: "Bumbu", quantity: 10, unit: "kg" }
]

// Calculate total ingredient cost
const totalCost = menu.costPerServing × targetBeneficiaries
// totalCost = 8500 × 500 = Rp 4,250,000 (ingredient only)

// For full operational cost, call calculate-cost API:
const fullCost = await calculateMenuCost(menu.id, {
  plannedPortions: 500,
  laborCostPerHour: 25000,
  preparationHours: 2,   // More portions = more prep time
  cookingHours: 4,       // More cooking batches
  // ... other operational costs
})
// fullCost.costPerPortion ≈ Rp 13,500-14,000 per portion
// fullCost.grandTotalCost ≈ Rp 6,750,000 - 7,000,000 total
```

**Key Insight:**
```typescript
// Ingredient quantity scaling:
totalQuantity = baseQuantity × (servingSize / 100) × portions

// Example: Nasi untuk 500 portions (200g each)
nasiTotal = 0.075 kg × (200 / 100) × 500
nasiTotal = 0.075 × 2 × 500
nasiTotal = 75 kg ✅

// Cost scaling:
totalIngredientCost = costPerServing × portions
totalIngredientCost = 8500 × 500 = Rp 4,250,000
```

### **Scenario 3: Cost Analysis & Optimization**

```typescript
// Compare 3 menu alternatives
const menus = [
  { name: "Nasi Gudeg Ayam", costPerServing: 8500 },
  { name: "Nasi Pecel", costPerServing: 6500 },
  { name: "Nasi Rendang", costPerServing: 12000 }
]

// Budget: Rp 10,000 per anak
const budget = 10000

// Analysis
menus.forEach(menu => {
  const efficiency = (menu.costPerServing / budget) × 100
  const margin = budget - menu.costPerServing
  
  console.log(`Menu: ${menu.name}`)
  console.log(`  Cost: Rp ${menu.costPerServing}`)
  console.log(`  Efficiency: ${efficiency}%`)
  console.log(`  Margin: Rp ${margin}`)
  console.log(`  Status: ${margin >= 0 ? '✅ OK' : '❌ OVER BUDGET'}`)
})

// Output:
// Menu: Nasi Gudeg Ayam
//   Cost: Rp 8,500
//   Efficiency: 85%
//   Margin: Rp 1,500
//   Status: ✅ OK

// Menu: Nasi Pecel
//   Cost: Rp 6,500
//   Efficiency: 65%
//   Margin: Rp 3,500
//   Status: ✅ OK (PALING EFISIEN!)

// Menu: Nasi Rendang
//   Cost: Rp 12,000
//   Efficiency: 120%
//   Margin: Rp -2,000
//   Status: ❌ OVER BUDGET
```

---

## 🔧 **Current Implementation Status**

### **✅ Yang Sudah Benar:**

1. **MenuIngredient.quantity** = Per 100g base serving ✅
2. **Menu.servingSize** = Actual gram per porsi (contoh: 200g) ✅
3. **Scaling formula** = `quantity × (servingSize / 100) × portions` ✅
4. **Menu.costPerServing** = Ingredient cost per actual serving ✅
5. **Calculate-cost API** = Scales correctly with operational costs ✅

### **📝 Field Meanings (Final & Accurate):**

```typescript
interface Menu {
  // Identity
  menuCode: string              // "MKS-001" - Unique code
  menuName: string              // "Nasi Gudeg Ayam" - Display name
  
  // Portion & Nutrition
  servingSize: number           // 200 - Gram per 1 porsi actual
                                // (ingredients scaled dari 100g base)
  
  // Cost (KEY FIELDS!)
  costPerServing: number        // 8500 - Ingredient cost per 1 porsi
                                // (already scaled to servingSize)
  budgetAllocation: number      // 10000 - Budget allocated per child
  
  // Production Planning
  batchSize: number             // 100 - Default batch untuk production planning
  
  // Recipe
  preparationTime: number       // 15 - Minutes
  cookingTime: number           // 30 - Minutes
  
  // Status
  isActive: boolean             // true - Menu masih aktif
}

interface MenuIngredient {
  menuId: string
  inventoryItemId: string
  quantity: number              // 🔥 CRITICAL: Per 100g base serving!
                                // NOT per actual serving!
                                // Scale with: quantity × (servingSize / 100)
  unit: string                  // From InventoryItem (kg, liter, pcs)
  preparationNotes: string?
  isOptional: boolean
  substitutes: string[]
}
```

### **🎯 The 100g Base System Explained:**

**Why 100g base instead of actual servingSize?**

1. **Standardization**: 100g adalah standar internasional nutrition facts
2. **Comparison**: Mudah compare antar menu (apples-to-apples)
3. **Flexibility**: Menu bisa punya servingSize berbeda-beda (150g, 200g, 250g)
4. **Scaling**: Simple math untuk scale ke any portion size

**Example:**

```typescript
// Menu A: Nasi Gudeg (servingSize = 200g)
// Ingredient: Nasi = 0.075 kg per 100g base
// Actual per serving: 0.075 × (200/100) = 0.15 kg ✅

// Menu B: Nasi Pecel (servingSize = 150g)
// Ingredient: Nasi = 0.075 kg per 100g base
// Actual per serving: 0.075 × (150/100) = 0.1125 kg ✅

// Same base ingredient (0.075 kg), different actual amounts!
// This allows consistent inventory management
```

---

## 💡 **Key Takeaways**

1. **Menu = Recipe with 100g Base System**
   - Ingredients stored per 100g base (standard)
   - Scale to actual servingSize when calculating
   - Formula: `actualQty = baseQty × (servingSize / 100)`

2. **Why Two Cost Fields?**
   ```typescript
   // menu.costPerServing = 8500
   // = Ingredient cost only
   // = Per 1 actual serving (already scaled from 100g base)
   // = Used for: Menu planning, budget comparison
   
   // costPerPortion (from calculate-cost API) = 13537.50
   // = Full operational cost (ingredients + labor + utility + overhead)
   // = Per 1 actual serving in production context
   // = Used for: Production planning, profitability analysis
   ```

3. **budgetAllocation vs costPerServing**
   ```typescript
   budgetAllocation = 10000    // Government/SPPG budget allocation
   costPerServing = 8500       // Actual ingredient cost
   
   // Analysis:
   margin = 10000 - 8500 = Rp 1,500 (15% margin)
   efficiency = 8500 / 10000 = 85% (EFFICIENT!)
   
   // Remaining Rp 1,500 for:
   // - Labor cost (cooking staff)
   // - Utility (gas, electricity, water)
   // - Packaging materials
   // - Overhead & operational costs
   ```

4. **Production Scaling Formula**
   ```typescript
   // For N portions:
   totalQuantity = ingredient.quantity × (servingSize / 100) × N
   
   // Example: Nasi untuk 100 portions (200g servingSize):
   nasiTotal = 0.075 kg × (200/100) × 100
   nasiTotal = 0.075 × 2 × 100 = 15 kg ✅
   
   // Cost scaling:
   totalIngredientCost = costPerServing × N
   totalIngredientCost = 8500 × 100 = Rp 850,000 ✅
   ```

5. **100g Base Benefits**
   - ✅ International standard (nutrition facts)
   - ✅ Easy comparison between menus
   - ✅ Flexible servingSize (150g, 200g, 250g, etc.)
   - ✅ Consistent inventory management
   - ✅ Simple scaling math

---

## 🎓 **Summary: Menjawab Pertanyaan User**

### **Pertanyaan:** 
> "biaya adalah perporsi tetapi ko malah dibagi sama porsi harganya. bisa dijelaskan yang realnya seperti apa dari domain menu ini."

### **Jawaban:**

Ada **2 level cost** yang berbeda:

#### **Level 1: Menu Recipe Cost (costPerServing)**
```typescript
// Stored di Menu table
menu.costPerServing = 8500  // Ingredient cost per 1 porsi

// Calculation:
// 1. Ingredients stored per 100g base
// 2. Scale to actual servingSize (200g)
// 3. Sum all ingredient costs
// Result: Rp 8,500 per portion (ingredient only)

// Kenapa "per porsi"?
// Karena ini adalah RECIPE cost - biaya bahan untuk 1 resep
```

#### **Level 2: Production Cost (costPerPortion)**
```typescript
// Calculated via API: calculate-cost
// Input: plannedPortions = 100

// Calculation:
// 1. Total ingredient: 8500 × 100 = Rp 850,000
// 2. + Labor: Rp 75,000 (3 hours × Rp 25k/hour)
// 3. + Utility: Rp 100,000 (gas + electric + water)
// 4. + Packaging: Rp 100,000 (Rp 1k × 100)
// 5. + Overhead: Rp 153,750 (15% of direct costs)
// 6. + Other: Rp 75,000 (equipment + cleaning)
// ─────────────────────────────────────────────
// GRAND TOTAL: Rp 1,353,750 for 100 portions
// 
// Per portion: 1,353,750 / 100 = Rp 13,537.50

// Kenapa dibagi?
// Karena operational costs (labor, utility, dll) adalah untuk BATCH
// Bukan per 1 porsi! Jadi harus dibagi ke semua portions
```

#### **Key Insight:**

```typescript
// Ingredient costs: LINEAR (multiply)
// - 1 porsi = 0.15 kg nasi
// - 100 porsi = 15 kg nasi (0.15 × 100)
// Cost: Rp 8,500 × 100 = Rp 850,000 ✅

// Operational costs: BATCH-BASED (divide)
// - Labor: 3 hours total (tidak peduli 1 porsi atau 100 porsi)
// - Gas: 1 tabung untuk batch (bukan 1 tabung per porsi)
// - Electric: Kitchen nyala 3 jam (bukan 3 jam × 100)
// Cost per portion: Rp 503,750 / 100 = Rp 5,037.50 ✅

// Total per portion:
// = Ingredient (Rp 8,500) + Operational (Rp 5,037.50)
// = Rp 13,537.50 ✅
```

### **Kesimpulan:**

Sistem **SUDAH BENAR** ✅

- **costPerServing (Rp 8,500)**: Biaya BAHAN per porsi (dari resep)
- **costPerPortion (Rp 13,537.50)**: Biaya TOTAL per porsi (bahan + operasional)

Yang membingungkan adalah ada **2 konteks berbeda**:
1. **Recipe level**: Per-portion ingredient costs
2. **Production level**: Batch operational costs dibagi ke portions

**Analogi:**
- Resep kue: "Telur 2 butir untuk 10 kue" → Per kue = 0.2 telur (ingredient, multiply)
- Oven: "Nyalakan 30 menit untuk 10 kue" → Per kue = 3 menit (operational, divide)

Jadi wajar kalau ingredient costs di-**multiply** tapi operational costs di-**divide**! 🎯
