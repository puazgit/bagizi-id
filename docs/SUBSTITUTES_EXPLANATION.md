# 📚 Penjelasan Lengkap: Bahan Pengganti (Substitutes) di Menu Ingredient

**Date**: October 21, 2025  
**Feature**: Substitutes (Bahan Pengganti) dalam Menu Ingredient  
**Status**: ✅ Informasi Saja (Tidak Dihitung Otomatis)

---

## 🎯 Pertanyaan User

> "Saya mendapatkan 'Bahan pengganti: Keju Edam (lebih lembut, +Rp 20/g), Keju Quick Melt (meleleh cepat, +Rp 10/g)'. Maksud dari bahan pengganti ini bagaimana? Apakah cuma informasi saja? Tidak dihitung? Dan bagaimana data ini kaitannya ke model yang lainnya?"

---

## ✅ Jawaban Ringkas

**Ya, bahan pengganti adalah CUMA INFORMASI SAJA!**

- ✅ **TIDAK dihitung** dalam kalkulasi biaya
- ✅ **TIDAK mempengaruhi** kalkulasi nutrisi
- ✅ **TIDAK terhubung** ke inventory item lain
- ✅ **Hanya sebagai panduan/referensi** untuk Staff Dapur atau Ahli Gizi

---

## 🗄️ Database Schema

### **Model MenuIngredient**

```prisma
model MenuIngredient {
  id               String        @id @default(cuid())
  menuId           String
  inventoryItemId  String        // ✅ BAHAN UTAMA (yang digunakan & dihitung)
  quantity         Float         // Jumlah bahan utama
  preparationNotes String?       // Catatan persiapan
  isOptional       Boolean       @default(false)
  substitutes      String[]      // ⚠️ ARRAY TEKS - Hanya informasi!
  
  // Relations
  inventoryItem    InventoryItem @relation(fields: [inventoryItemId], references: [id])
  menu             NutritionMenu @relation(fields: [menuId], references: [id])
}
```

### **Tipe Data: `String[]` (Array of Strings)**

**Bukan relasi database**, tapi **array teks** yang disimpan di PostgreSQL:

```sql
-- Database storage (PostgreSQL array)
substitutes TEXT[] 

-- Example value:
{"Keju Edam (lebih lembut, +Rp 20/g)", "Keju Quick Melt (meleleh cepat, +Rp 10/g)"}
```

---

## 📊 Contoh Data Nyata

### **Query Database**

```sql
SELECT 
  ii."itemName" AS bahan_utama,
  ii."costPerUnit" AS harga_utama,
  mi.quantity AS jumlah,
  mi.substitutes AS bahan_pengganti
FROM menu_ingredients mi
JOIN inventory_items ii ON mi."inventoryItemId" = ii.id
WHERE mi."menuId" = 'cmh0d2v2n003nsv7fdurgpm5e'
  AND ii."itemName" LIKE '%Keju%';
```

### **Hasil Query**

```
bahan_utama        | harga_utama | jumlah | bahan_pengganti
-------------------+-------------+--------+--------------------------------------------------
Keju Cheddar Parut | 120000      | 0.03   | {"Keju Edam (lebih lembut, +Rp 20/g)",
                   |             |        |  "Keju Quick Melt (meleleh cepat, +Rp 10/g)"}
```

### **Interpretasi Data**

**Bahan yang AKTIF digunakan di menu**:
- ✅ **Bahan**: Keju Cheddar Parut (dari `inventoryItemId`)
- ✅ **Harga**: Rp 120,000/kg (dari `InventoryItem.costPerUnit`)
- ✅ **Jumlah**: 0.03 kg (dari `MenuIngredient.quantity`)
- ✅ **Total Biaya**: 0.03 × Rp 120,000 = **Rp 3,600** ← DIHITUNG!

**Bahan pengganti (hanya informasi)**:
- ℹ️ Keju Edam (lebih lembut, +Rp 20/g) ← Hanya teks!
- ℹ️ Keju Quick Melt (meleleh cepat, +Rp 10/g) ← Hanya teks!
- ❌ **TIDAK DIHITUNG** dalam biaya
- ❌ **TIDAK TERHUBUNG** ke inventory item lain

---

## 🔄 Bagaimana Data Ini Bekerja?

### **1. Saat Membuat/Edit Menu**

**Frontend Component** (Formulir Input):
```typescript
// src/features/sppg/menu/components/IngredientForm.tsx

interface IngredientFormData {
  inventoryItemId: string      // ✅ WAJIB - Pilih dari dropdown inventory
  quantity: number             // ✅ WAJIB - Input jumlah
  substitutes: string[]        // ⚠️ OPSIONAL - Input teks bebas
}

// Example:
{
  inventoryItemId: "inv_keju_cheddar_123",  // ← Link ke InventoryItem
  quantity: 0.03,
  substitutes: [
    "Keju Edam (lebih lembut, +Rp 20/g)",     // ← Teks bebas
    "Keju Quick Melt (meleleh cepat, +Rp 10/g)" // ← Teks bebas
  ]
}
```

**Backend API** (Simpan ke Database):
```typescript
// src/app/api/sppg/menu/[id]/ingredients/route.ts

await db.menuIngredient.create({
  data: {
    menuId: "menu_123",
    inventoryItemId: "inv_keju_cheddar_123", // ← RELASI ke InventoryItem
    quantity: 0.03,
    substitutes: [                           // ← Array teks (bukan relasi!)
      "Keju Edam (lebih lembut, +Rp 20/g)",
      "Keju Quick Melt (meleleh cepat, +Rp 10/g)"
    ]
  }
})
```

### **2. Saat Menghitung Biaya**

**API Calculate Cost** hanya menghitung bahan UTAMA:

```typescript
// src/app/api/sppg/menu/[id]/calculate-cost/route.ts

for (const ingredient of menu.ingredients) {
  const costPerUnit = ingredient.inventoryItem.costPerUnit // ← Dari bahan UTAMA
  const totalCost = ingredient.quantity * costPerUnit      // ← Hitung bahan UTAMA
  
  totalIngredientCost += totalCost  // ✅ Hanya bahan utama
  
  // ❌ substitutes TIDAK dihitung sama sekali!
}
```

**Contoh Perhitungan**:
```javascript
// Bahan UTAMA (dihitung):
const kej uCheddar = {
  inventoryItemId: "inv_keju_cheddar_123",
  costPerUnit: 120000,  // Rp 120,000/kg
  quantity: 0.03        // 0.03 kg
}
const total = 0.03 × 120000 = Rp 3,600  // ✅ DIHITUNG

// Substitutes (TIDAK dihitung):
const substitutes = [
  "Keju Edam (lebih lembut, +Rp 20/g)",      // ❌ Hanya teks
  "Keju Quick Melt (meleleh cepat, +Rp 10/g)" // ❌ Hanya teks
]
// Total substitutes: Rp 0  (tidak dihitung!)
```

### **3. Saat Menampilkan di UI**

**Frontend Display**:
```typescript
// src/features/sppg/menu/components/IngredientCard.tsx

<div className="ingredient-card">
  {/* Bahan Utama */}
  <h3>{ingredient.inventoryItem.itemName}</h3>  {/* Keju Cheddar Parut */}
  <p>Jumlah: {ingredient.quantity} kg</p>       {/* 0.03 kg */}
  <p>Harga: {formatCurrency(ingredient.inventoryItem.costPerUnit)}</p>  {/* Rp 120,000 */}
  <p>Total: {formatCurrency(calculateTotal())}</p>  {/* Rp 3,600 */}
  
  {/* Bahan Pengganti (hanya info) */}
  {ingredient.substitutes?.length > 0 && (
    <div className="substitutes-info">
      <h4>Bahan Pengganti:</h4>
      <ul>
        {ingredient.substitutes.map(sub => (
          <li key={sub}>{sub}</li>  {/* Hanya tampilkan teks */}
        ))}
      </ul>
    </div>
  )}
</div>
```

**Output UI**:
```
┌─────────────────────────────────────────┐
│ Keju Cheddar Parut                      │
│ Jumlah: 0.03 kg                         │
│ Harga per satuan: Rp 120.000/kg         │
│ Total biaya: Rp 3.600       ← DIHITUNG  │
│                                         │
│ Bahan Pengganti:          ← HANYA INFO │
│ • Keju Edam (lebih lembut, +Rp 20/g)   │
│ • Keju Quick Melt (meleleh cepat, +10) │
└─────────────────────────────────────────┘
```

---

## 🎯 Fungsi dan Kegunaan Substitutes

### **Use Case 1: Panduan untuk Staff Dapur**

**Skenario**: Keju Cheddar habis di inventory

**Staff Dapur melihat bahan pengganti**:
```
Bahan Utama: Keju Cheddar Parut (HABIS!)
Bahan Pengganti:
✅ Keju Edam (lebih lembut, +Rp 20/g)
✅ Keju Quick Melt (meleleh cepat, +Rp 10/g)
```

**Staff bisa ambil keputusan**:
1. Beli Keju Edam sebagai pengganti
2. Atau cek apakah Keju Quick Melt sudah ada di inventory
3. Atau laporkan ke Ahli Gizi untuk approval pergantian bahan

### **Use Case 2: Fleksibilitas Menu**

**Ahli Gizi ingin memberikan opsi**:
```
Menu: Pisang Goreng Keju

Bahan Utama (default):
- Keju Cheddar Parut: Rp 120,000/kg

Alternatif (jika budget lebih rendah):
- Keju Quick Melt: ~Rp 130,000/kg (+Rp 10/g)
  
Alternatif (jika ingin lebih premium):
- Keju Edam: ~Rp 140,000/kg (+Rp 20/g)
```

### **Use Case 3: Dokumentasi Variasi Resep**

**Tim Produksi bisa eksperimen**:
```
Resep A (Default): Pakai Keju Cheddar
Resep B (Variant): Pakai Keju Edam (lebih lembut)
Resep C (Variant): Pakai Keju Quick Melt (meleleh cepat)
```

Semua tercatat di menu, tapi yang **dihitung** tetap bahan utama.

---

## 🔗 Hubungan dengan Model Lain

### **Diagram Relasi**

```
┌─────────────────────┐
│  NutritionMenu      │
│  - menuName         │
│  - batchSize        │
└──────────┬──────────┘
           │ 1
           │ has many
           │ n
┌──────────▼──────────┐
│  MenuIngredient     │
│  - quantity         │
│  - substitutes []   │  ← ⚠️ ARRAY TEKS (bukan relasi!)
└──────────┬──────────┘
           │ n
           │ belongs to
           │ 1
┌──────────▼──────────┐
│  InventoryItem      │  ← ✅ SATU-SATUNYA relasi database
│  - itemName         │
│  - costPerUnit      │
│  - calories         │
│  - protein          │
└─────────────────────┘

❌ TIDAK ADA relasi dari substitutes ke InventoryItem lain!
```

### **Penjelasan Relasi**

1. **MenuIngredient → InventoryItem** (RELASI DATABASE):
   ```typescript
   inventoryItemId: String  // Foreign key ke InventoryItem.id
   inventoryItem: InventoryItem @relation(...)  // ✅ Relasi Prisma
   ```
   - ✅ Ini bahan UTAMA yang digunakan
   - ✅ Ini yang DIHITUNG biayanya
   - ✅ Ini yang DIHITUNG nutrisinya

2. **substitutes** (TIDAK ADA RELASI):
   ```typescript
   substitutes: String[]  // ❌ Hanya array teks!
   ```
   - ❌ BUKAN foreign key
   - ❌ BUKAN relasi ke InventoryItem
   - ❌ BUKAN link ke model lain
   - ✅ Hanya informasi teks bebas

---

## 🔄 Jika User Ingin Mengganti Bahan

### **Scenario: Staff Dapur Mau Ganti Bahan**

**TIDAK OTOMATIS!** Harus update manual:

**Cara Manual (Current Implementation)**:
1. **Buka Menu Editor**
2. **Hapus ingredient lama**:
   ```javascript
   DELETE MenuIngredient WHERE id = "ing_keju_cheddar_123"
   ```

3. **Tambah ingredient baru**:
   ```javascript
   CREATE MenuIngredient {
     inventoryItemId: "inv_keju_edam_456",  // ← Ganti ke Keju Edam
     quantity: 0.03
   }
   ```

4. **Trigger recalculate cost**:
   ```bash
   POST /api/sppg/menu/{menuId}/calculate-cost
   ```

**Result**:
- ✅ Biaya otomatis recalculate dengan harga Keju Edam
- ✅ Nutrisi otomatis recalculate dengan nilai Keju Edam
- ✅ substitutes tetap ada sebagai informasi

### **Future Enhancement (Belum Diimplementasi)**

**Ide: Quick Substitute Button**

```typescript
// UI Component (future)
<Button onClick={() => quickSubstitute('Keju Edam')}>
  Ganti ke Keju Edam
</Button>

// Backend logic (future)
async function quickSubstitute(menuId, ingredientId, substituteText) {
  // 1. Parse substitute text
  const substituteName = parseSubstituteName(substituteText)  // "Keju Edam"
  
  // 2. Find inventory item by name
  const newInventoryItem = await db.inventoryItem.findFirst({
    where: { itemName: { contains: substituteName } }
  })
  
  // 3. Update ingredient
  await db.menuIngredient.update({
    where: { id: ingredientId },
    data: { inventoryItemId: newInventoryItem.id }
  })
  
  // 4. Recalculate cost & nutrition
  await recalculateCost(menuId)
  await recalculateNutrition(menuId)
}
```

**Benefit**:
- ✅ One-click substitution
- ✅ Auto-recalculate cost & nutrition
- ✅ Audit trail (log perubahan bahan)

**Complexity**:
- ⚠️ Nama bahan harus exact match atau fuzzy search
- ⚠️ Perlu approval workflow (Ahli Gizi approve dulu?)
- ⚠️ Perlu stock check (apakah bahan pengganti tersedia?)

---

## 📝 Format Substitute Text

### **Best Practices**

**Good Examples**:
```typescript
substitutes: [
  "Keju Edam (lebih lembut, +Rp 20/g)",
  "Keju Quick Melt (meleleh cepat, +Rp 10/g)",
  "Keju Mozzarella (lebih asin, +Rp 15/g)"
]
```

**Pattern**:
```
{Nama Bahan} ({karakteristik}, {selisih harga})
```

**Components**:
1. **Nama Bahan**: Nama jelas bahan pengganti
2. **Karakteristik**: Perbedaan rasa/tekstur/kualitas
3. **Selisih Harga**: Lebih mahal/murah berapa (opsional)

### **Bad Examples** (Kurang Informasi):
```typescript
// ❌ Terlalu singkat
substitutes: ["Keju Edam"]

// ❌ Tidak jelas selisih
substitutes: ["Keju lain yang lebih murah"]

// ❌ Tidak konsisten format
substitutes: ["Edam cheese", "Quick Melt Rp 10"]
```

---

## 💡 Kesimpulan

### **TL;DR**

| Aspek | Status | Penjelasan |
|-------|--------|------------|
| **Apakah dihitung?** | ❌ TIDAK | Hanya informasi, tidak masuk kalkulasi biaya |
| **Apakah mempengaruhi nutrisi?** | ❌ TIDAK | Nutrisi tetap dari bahan utama (`inventoryItemId`) |
| **Apakah ada relasi database?** | ❌ TIDAK | Hanya array teks, bukan foreign key |
| **Apakah bisa auto-substitute?** | ❌ TIDAK | Harus manual ganti `inventoryItemId` |
| **Fungsi utama?** | ℹ️ INFO | Panduan untuk staff, dokumentasi alternatif |

### **Key Points**

1. ✅ **Substitutes = Informasi Saja**
   - Tidak dihitung dalam biaya
   - Tidak mempengaruhi nutrisi
   - Tidak terhubung ke model lain

2. ✅ **Bahan Aktif = inventoryItemId**
   - Ini yang DIHITUNG
   - Ini yang punya relasi ke InventoryItem
   - Ini yang mempengaruhi cost & nutrition

3. ✅ **Fungsi Substitutes**:
   - Panduan staff dapur saat bahan utama habis
   - Dokumentasi variasi resep
   - Referensi alternatif bahan

4. ⚠️ **Untuk Mengganti Bahan**:
   - HARUS update `inventoryItemId` secara manual
   - TIDAK bisa one-click dari substitutes
   - Perlu recalculate cost & nutrition setelah ganti

---

## 🚀 Recommendations

### **Short-term (Current Implementation)**

Gunakan substitutes sebagai **dokumentasi** saja:
- ✅ Input alternatif bahan dengan format konsisten
- ✅ Gunakan sebagai referensi saat procurement
- ✅ Dokumentasi untuk approval ahli gizi

### **Long-term (Future Enhancement)**

Bisa dikembangkan menjadi **quick substitute feature**:
- 🔄 Button "Ganti ke [substitute]"
- 🔄 Auto-find inventory item berdasarkan nama
- 🔄 Auto-recalculate cost & nutrition
- 🔄 Approval workflow (ahli gizi approve dulu)
- 🔄 Audit trail (log siapa ganti apa kapan)

---

**Status**: ✅ **Sudah Dijelaskan Lengkap**  
**Next Step**: User bisa lanjutkan testing fix `costPerUnit` yang sudah diperbaiki! 🚀
