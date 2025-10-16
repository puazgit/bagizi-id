# 🌱 Menu Domain Seed Documentation

## Overview

File seed lengkap untuk domain Menu dengan data regional **Purwakarta** yang realistis dan siap digunakan untuk testing fungsionalitas frontend.

---

## 📁 File Location

```
prisma/seeds/menu-seed.ts
```

---

## 🎯 Data yang Di-seed

### 1. **Nutrition Programs (2 programs)**

#### Program 1: Program Makan Siang Anak Sekolah
- **Code**: `PWK-PMAS-2024`
- **Type**: `SUPPLEMENTARY_FEEDING`
- **Target**: `SCHOOL_CHILDREN`
- **Target Recipients**: 5,000 siswa
- **Budget**: Rp 12 miliar/tahun
- **Budget per Meal**: Rp 10,000/porsi
- **Schedule**: Senin-Jumat
- **Partner Schools**: 10 SD/MI di Purwakarta

#### Program 2: Program Makanan Tambahan Anak (PMT)
- **Code**: `PWK-PMT-2024`
- **Type**: `SUPPLEMENTARY_FEEDING`
- **Target**: `TODDLER` (PAUD/TK)
- **Target Recipients**: 1,500 anak
- **Budget**: Rp 3.6 miliar/tahun
- **Budget per Meal**: Rp 6,000/porsi
- **Schedule**: Senin-Sabtu (2x/hari)
- **Partner Schools**: 5 PAUD/TK

---

### 2. **Nutrition Menus (10 diverse menus)**

#### Menu Makan Siang (5 menus)

| Code | Menu Name | Serving | Cost | Calories | Protein | Description |
|------|-----------|---------|------|----------|---------|-------------|
| `LUNCH-001` | Nasi Gudeg Ayam Purwakarta | 350g | Rp 9,500 | 720 kcal | 22.5g | Gudeg nangka muda + ayam suwir + tahu bacem + tempe |
| `LUNCH-002` | Nasi Ayam Goreng Lalapan | 330g | Rp 8,500 | 695 kcal | 28.5g | Ayam goreng bumbu kuning + lalapan + sambal terasi |
| `LUNCH-003` | Nasi Ikan Pepes Sunda | 340g | Rp 9,000 | 680 kcal | 25.0g | Pepes ikan mas + sayur asem + tempe mendoan |
| `LUNCH-004` | Nasi Sop Buntut Sapi | 380g | Rp 11,000 | 750 kcal | 26.5g | Sop buntut empuk + wortel + kentang + perkedel |
| `LUNCH-005` | Nasi Rendang Daging Sapi | 350g | Rp 10,500 | 780 kcal | 30.0g | Rendang sapi empuk + sayur bayam + kerupuk |

#### Menu Snack (5 menus)

| Code | Menu Name | Serving | Cost | Calories | Protein | Description |
|------|-----------|---------|------|----------|---------|-------------|
| `SNACK-001` | Roti Pisang Cokelat | 100g | Rp 5,000 | 365 kcal | 9.5g | Roti gandum isi pisang + cokelat leleh |
| `SNACK-002` | Bubur Kacang Hijau | 200g | Rp 4,500 | 340 kcal | 11.0g | Bubur kacang hijau + santan + gula merah |
| `SNACK-003` | Nagasari Pisang | 120g | Rp 5,500 | 320 kcal | 6.5g | Kue nagasari isi pisang dibungkus daun |
| `SNACK-004` | Pisang Goreng Keju | 130g | Rp 6,000 | 385 kcal | 8.0g | Pisang kepok goreng crispy + taburan keju |
| `SNACK-005` | Susu Kedelai Cokelat | 250ml | Rp 4,000 | 220 kcal | 12.0g | Susu kedelai rasa cokelat (lactose-free) |

---

### 3. **Menu Ingredients (50+ ingredients)**

Setiap menu memiliki ingredients detail dengan:
- ✅ Nama ingredient
- ✅ Quantity & unit (gram, ml, pcs)
- ✅ Cost per unit & total cost
- ✅ Preparation notes
- ✅ Optional/substitutes info

**Contoh Ingredients untuk Nasi Gudeg Ayam:**
- Beras Putih Premium: 80g @ Rp 12 = Rp 960
- Nangka Muda: 100g @ Rp 8 = Rp 800
- Ayam Kampung Fillet: 60g @ Rp 45 = Rp 2,700
- Tahu Putih: 50g @ Rp 6 = Rp 300
- Tempe Kedelai: 40g @ Rp 8 = Rp 320
- Santan Kelapa: 100ml @ Rp 10 = Rp 1,000
- Gula Merah: 30g @ Rp 8 = Rp 240
- Bumbu Gudeg: 20g @ Rp 15 = Rp 300

---

### 4. **Recipe Steps (60+ detailed steps)**

Setiap menu memiliki recipe steps lengkap dengan:
- ✅ Step number & title
- ✅ Detailed instruction
- ✅ Duration (menit)
- ✅ Temperature (°C)
- ✅ Required equipment
- ✅ Quality check points

**Contoh Recipe Steps untuk Nasi Gudeg Ayam:**
1. **Persiapan Bahan** (15 menit) - Cuci, potong, suwir
2. **Masak Gudeg** (180 menit, 100°C) - Rebus dengan bumbu
3. **Masak Ayam Suwir** (20 menit, 150°C) - Tumis dengan bumbu
4. **Goreng Tahu dan Tempe** (15 menit, 180°C) - Goreng crispy
5. **Plating dan Penyajian** (5 menit) - Tata dan sajikan

---

### 5. **Nutrition Calculations (10 calculations)**

Setiap menu memiliki perhitungan nutrisi lengkap:

#### Macronutrients:
- ✅ Total Calories, Protein, Carbs, Fat, Fiber

#### Micronutrients (26 nutrients):
- ✅ Vitamins: A, B1, B2, B3, B6, B12, C, D, E, K, Folat
- ✅ Minerals: Calcium, Phosphorus, Iron, Zinc, Iodine, Selenium, Magnesium, Potassium, Sodium

#### Daily Value Percentages:
- ✅ % DV untuk Calories, Protein, Carbs, Fat, Fiber

#### Adequacy Assessment:
- ✅ Meets Calorie AKG: Yes/No
- ✅ Meets Protein AKG: Yes/No
- ✅ Overall AKG Compliance: Yes/No
- ✅ Adequate Nutrients (array)
- ✅ Excess Nutrients (array)
- ✅ Deficient Nutrients (array)

**Contoh Nutrition Calculation untuk Nasi Gudeg Ayam:**
```typescript
{
  totalCalories: 720,
  totalProtein: 22.5,
  totalCarbs: 98.0,
  totalFat: 24.0,
  totalFiber: 9.5,
  
  caloriesDV: 103%, // Meets target 700 kcal
  proteinDV: 112%,  // Exceeds target 20g
  
  meetsAKG: true,
  adequateNutrients: ['CALORIES', 'PROTEIN', 'FIBER', 'VITAMIN_C', 'IRON']
}
```

---

### 6. **Cost Calculations (10 calculations)**

Setiap menu memiliki cost breakdown lengkap:

#### Cost Categories:
- ✅ **Ingredient Costs** - Breakdown per ingredient
- ✅ **Labor Costs** - Preparation + cooking hours
- ✅ **Utility Costs** - Gas, electricity, water
- ✅ **Other Costs** - Packaging, equipment, cleaning
- ✅ **Overhead Costs** - 15% overhead percentage

#### Per Portion Calculations:
- ✅ Planned Portions (batch size)
- ✅ Cost Per Portion
- ✅ Recommended Selling Price
- ✅ Profit Margin
- ✅ Market Price Comparison

#### Cost Ratios:
- ✅ Ingredient Cost Ratio (%)
- ✅ Labor Cost Ratio (%)
- ✅ Overhead Cost Ratio (%)

#### Optimization Suggestions:
- ✅ Cost optimization ideas (array)
- ✅ Alternative ingredients (array)

**Contoh Cost Calculation untuk Nasi Gudeg Ayam:**
```typescript
{
  // Ingredient Costs
  totalIngredientCost: 6620,
  
  // Labor Costs
  laborCostPerHour: 25000,
  preparationHours: 0.5,
  cookingHours: 1.5,
  totalLaborCost: 50000,
  
  // Utility Costs
  gasCost: 800,
  electricityCost: 200,
  waterCost: 150,
  totalUtilityCost: 1150,
  
  // Overhead
  overheadPercentage: 15,
  overheadCost: 8805,
  
  // Totals (for batch of 100 portions)
  grandTotalCost: 67575,
  costPerPortion: 676,
  
  // Pricing
  targetProfitMargin: 30%,
  recommendedPrice: 878,
  marketPrice: 900,
  priceCompetitiveness: 'COMPETITIVE'
}
```

---

## 🔐 Login Credentials

Untuk testing menu domain, gunakan user:

```
Email: admin@sppg-purwakarta.com
Password: password123
Role: SPPG_ADMIN
Name: Ahmad Fauzi, S.Gz.
```

---

## 🚀 Cara Menjalankan Seed

### 1. **Reset Database & Run Seed**
```bash
npm run db:reset
```

### 2. **Run Seed Only (without reset)**
```bash
npm run db:seed
```

### 3. **Generate Prisma Client + Seed**
```bash
npm run db:generate
npm run db:seed
```

---

## 📊 Statistik Data

### Total Data Created:
```
Nutrition Programs:      2 programs
Nutrition Menus:         10 menus (5 lunch + 5 snack)
Menu Ingredients:        50+ ingredients
Recipe Steps:            60+ steps
Nutrition Calculations:  10 calculations
Cost Calculations:       10 calculations
```

### Data Characteristics:
- ✅ **Realistic**: Data sesuai dengan realitas SPPG Purwakarta
- ✅ **Complete**: Semua field terisi dengan data yang masuk akal
- ✅ **Diverse**: Variasi menu Indonesia yang berbeda
- ✅ **Production-Ready**: Siap untuk testing & demo
- ✅ **Multi-tenant Safe**: Semua data terikat ke SPPG Purwakarta
- ✅ **Halal Certified**: Semua menu halal
- ✅ **Allergen Info**: Informasi alergen lengkap
- ✅ **AKG Compliant**: Memenuhi standar AKG Indonesia

---

## 🧪 Testing Scenarios

Dengan data seed ini, Anda dapat test semua fungsionalitas frontend:

### Menu Management:
- ✅ View menu list (10 menus)
- ✅ View menu detail dengan tabs
- ✅ Edit existing menu
- ✅ Create new menu
- ✅ Delete menu
- ✅ Filter by meal type
- ✅ Search by menu name

### Ingredient Management:
- ✅ View ingredients for menu
- ✅ Add new ingredient
- ✅ Edit ingredient quantity/cost
- ✅ Remove ingredient
- ✅ Calculate total cost from ingredients

### Recipe Steps:
- ✅ View recipe steps
- ✅ Add new step
- ✅ Edit step instruction
- ✅ Reorder steps
- ✅ Delete step
- ✅ View cooking time & temperature

### Nutrition Preview:
- ✅ View nutrition facts
- ✅ Calculate nutrition from ingredients
- ✅ View macronutrient progress bars
- ✅ View micronutrient cards
- ✅ Check AKG compliance
- ✅ View % Daily Value

### Cost Breakdown:
- ✅ View cost breakdown by category
- ✅ Calculate cost from ingredients + labor + utilities
- ✅ View cost ratios (pie chart)
- ✅ View recommended selling price
- ✅ View profit margin
- ✅ View cost optimization suggestions

### Menu Duplication:
- ✅ Duplicate existing menu
- ✅ Selective copy (ingredients, recipe, nutrition, cost)
- ✅ Rename duplicated menu
- ✅ Navigate to new menu

---

## 🎨 Data Highlights

### Indonesian Cuisine Variety:
- 🍛 **Jawa**: Gudeg Ayam, Pepes Ikan
- 🍗 **Sunda**: Ayam Goreng Lalapan, Sayur Asem
- 🍲 **Padang**: Rendang Daging Sapi
- 🥘 **Betawi**: Sop Buntut Sapi
- 🍞 **Snacks**: Roti Pisang, Bubur Kacang Hijau, Nagasari, Pisang Goreng

### Dietary Considerations:
- ✅ Halal certification
- ✅ Vegetarian options (snacks)
- ✅ Lactose-free options (susu kedelai)
- ✅ Allergen information
- ✅ Gluten-free options available

### Nutritional Balance:
- ✅ Meets school lunch AKG (700 kcal)
- ✅ Adequate protein (20-30g)
- ✅ Good fiber content (7-10g)
- ✅ Vitamin & mineral rich
- ✅ Balanced macronutrients

---

## 📈 Business Metrics

### Cost Efficiency:
- Average ingredient cost: **Rp 5,000 - 7,000/porsi**
- Average labor cost: **Rp 200 - 500/porsi**
- Average total cost: **Rp 8,000 - 11,000/porsi**
- Profit margin: **30-40%**
- Price competitiveness: **COMPETITIVE**

### Production Efficiency:
- Batch sizes: **80-200 portions**
- Preparation time: **15-35 minutes**
- Cooking time: **20-180 minutes**
- Quality checks: **Built-in for each step**

---

## 🔄 Update & Maintenance

### Menambah Menu Baru:
1. Tambahkan di `seedNutritionMenus()`
2. Tambahkan ingredients di `seedMenuIngredients()`
3. Tambahkan recipe steps di `seedRecipeSteps()`
4. Tambahkan nutrition calculation di `seedNutritionCalculations()`
5. Tambahkan cost calculation di `seedCostCalculations()`

### Best Practices:
- ✅ Gunakan data realistis Purwakarta
- ✅ Pastikan nutrition values masuk akal
- ✅ Cost harus sesuai harga pasar lokal
- ✅ Recipe steps harus detail dan actionable
- ✅ Quality checks di setiap langkah penting

---

## 📝 Notes

### Regional Context:
- Data disesuaikan dengan **Purwakarta, Jawa Barat**
- Harga ingredient sesuai **pasar lokal 2024**
- Menu menggunakan **bahan lokal** yang mudah didapat
- Partner schools adalah **SD/MI/PAUD aktual** di Purwakarta

### Multi-tenant Safety:
- Semua data terikat ke **SPPG Purwakarta** (`SPPG-PWK-001`)
- User admin dapat manage semua data
- Data tidak bocor ke SPPG lain
- Filter `sppgId` di semua query

---

## 🎯 Next Steps

Setelah seed berhasil:

1. ✅ **Login** ke aplikasi dengan kredensial admin
2. ✅ **Navigate** ke `/menu` untuk melihat daftar menu
3. ✅ **Click** menu untuk melihat detail dengan tabs
4. ✅ **Test** semua CRUD operations
5. ✅ **Try** menu duplication feature
6. ✅ **Explore** nutrition & cost calculations
7. ✅ **Verify** multi-tenant security

---

## 🐛 Troubleshooting

### Seed Error: "Foreign key constraint failed"
```bash
# Solution: Reset database terlebih dahulu
npm run db:reset
```

### Seed Error: "Unique constraint violation"
```bash
# Solution: Data sudah ada, hapus dulu atau skip duplicate
# Seed sudah menggunakan upsert() untuk handle ini
```

### Data Tidak Muncul di Frontend
```bash
# Check: Apakah login dengan user yang benar?
# Email: admin@sppg-purwakarta.com
# Check: Apakah sppgId sudah di-filter di query?
```

---

## 📚 References

- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Prisma Schema**: `prisma/schema.prisma`
- **Menu Domain Docs**: `docs/domain-menu-workflow.md`
- **Implementation Checklist**: `docs/menu-domain-implementation-checklist.md`

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**Author**: Bagizi-ID Development Team  
**Status**: ✅ Production Ready
