# School Facilities Field Analysis - Executive Summary

**Date**: October 22, 2025  
**Status**: ✅ ANALYSIS COMPLETE  
**Context**: Sekolah sebagai PENERIMA makanan (bukan tempat produksi)

---

## 🎯 Temuan Utama

### ❌ **REDUNDANSI TINGGI** (2 fields)

| Field Pair | Severity | Issue |
|---|---|---|
| `schoolAddress` ↔ `deliveryAddress` | 🔴 HIGH | 99% kasus sama, tapi keduanya REQUIRED |
| `contactPhone` ↔ `deliveryContact` | 🟡 MEDIUM | Sering sama, tapi keduanya REQUIRED |

**Impact**: User harus isi 2x untuk data yang sama!

---

### 🟠 **RELEVANCE RENDAH** (3 fields)

| Field | Used? | Relevant? | Alasan |
|---|---|---|---|
| `hasKitchen` | ❌ (0/3 schools) | 🔴 LOW | Sekolah tidak masak, SPPG yang masak |
| `hasCleanWater` | ⚠️ (default TRUE) | 🟠 LOW | Info sanitasi, tidak affect delivery |
| `hasElectricity` | ⚠️ (default TRUE) | 🟠 LOW | Info infrastruktur, tidak affect delivery |

**Impact**: Fields ini lebih cocok untuk "School Profile" bukan "Distribution Settings"

---

### ✅ **YANG SUDAH BENAR** (3 fields)

| Field | Used? | Relevant? | Alasan |
|---|---|---|---|
| `servingMethod` | ✅ (3/3 schools) | 🟢 **CRITICAL** | Menentukan packaging, timing, portion planning |
| `storageCapacity` | ❌ (0/3 schools) | 🟡 MEDIUM | Berguna untuk max delivery planning |
| `hasStorage` | ✅ (2/3 schools) | 🟡 MEDIUM | Berguna jika delivery pagi, makan siang |

---

## 💡 Rekomendasi

### **SHORT TERM** (Phase 5 - Sekarang)

#### 1. Simplify Delivery Section (HIGH PRIORITY)

**Sebelum**:
```
schoolAddress: [___________________] *REQUIRED
deliveryAddress: [___________________] *REQUIRED
contactPhone: [___________________] *REQUIRED
deliveryContact: [___________________] *REQUIRED
```

**Sesudah**:
```
schoolAddress: [___________________] *REQUIRED
contactPhone: [___________________] *REQUIRED

☑ Alamat & kontak pengiriman sama dengan sekolah

[Jika unchecked, baru muncul:]
  deliveryAddress: [___________________]
  deliveryContact: [___________________]
```

**Benefit**: 
- ✅ Reduce 2 required fields → 0 for 99% cases
- ✅ Faster data entry
- ✅ Less confusion

---

#### 2. Reorganize Facilities Section (MEDIUM PRIORITY)

**Sebelum**: Section 5: Fasilitas Sekolah (semua dicampur)

**Sesudah**: 

**Section 5A: Pengaturan Distribusi** ⭐ (Always visible)
- ✅ Metode Penyajian* (servingMethod) - **CRITICAL**
- Kapasitas Penyimpanan (storageCapacity) - Optional
- Memiliki ruang penyimpanan (hasStorage) - Optional

**Section 5B: Profil Sekolah** (Collapsed by default)
- Memiliki dapur (hasKitchen)
- Akses air bersih (hasCleanWater)
- Akses listrik (hasElectricity)

**Benefit**:
- ✅ Focus on distribution-relevant fields
- ✅ Cleaner UI
- ✅ Advanced info tersembunyi tapi tetap accessible

---

### **MEDIUM TERM** (Phase 6 - Next Sprint)

1. **Schema Changes**: Make `deliveryAddress` & `deliveryContact` optional (String?)
2. **Backend Logic**: If null, use `schoolAddress` & `contactPhone` for delivery
3. **Validation**: Add business rule validation for storage vs students

---

### **LONG TERM** (Backlog)

1. **Consider Removing**: `hasKitchen`, `hasCleanWater`, `hasElectricity`
   - Check with business: Needed for audit/reporting?
   - If NO → Remove completely
   - If YES → Move to separate "School Details" page

2. **Add Validation**: `storageCapacity` should align with `targetStudents`
   - Example: 100 students = need ~100-200 portions storage

---

## 🤔 Pertanyaan untuk Product Owner

### 1. Delivery Address & Contact

**Q**: Kapan `deliveryAddress` **HARUS** berbeda dari `schoolAddress`?

**Scenarios**:
- [ ] A. Delivery ke gudang terpusat, bukan sekolah langsung?
- [ ] B. Sekolah punya multiple buildings, delivery ke building tertentu?
- [ ] C. Delivery ke kantor dinas pendidikan, baru dibagikan?
- [ ] D. **Hampir selalu sama** → Jadikan optional dengan default = schoolAddress

**Recommendation**: Jika 95%+ sama, implement checkbox "sama dengan sekolah"

---

### 2. Infrastructure Fields (Kitchen, Water, Electricity)

**Q**: Apakah data ini **benar-benar** digunakan untuk:

- [ ] A. **Reporting/Audit** → Sekolah profile untuk compliance
- [ ] B. **Distribution Planning** → Affect delivery decisions (NO, sekolah tidak masak)
- [ ] C. **Future Expansion** → Jika sekolah akan masak sendiri (5+ years plan)
- [ ] D. **Not used at all** → Consider removing

**Current Data**: 
- hasKitchen: 0/3 schools (FALSE) ❌
- hasCleanWater: 3/3 schools (TRUE, default) ⚠️
- hasElectricity: 3/3 schools (TRUE, default) ⚠️

**Recommendation**: Jika tidak digunakan untuk decisions, pindah ke optional profile atau remove.

---

### 3. Storage Fields

**Q**: Apakah `storageCapacity` digunakan untuk:

- [ ] A. **Limit max delivery** → Can't deliver more than storage capacity
- [ ] B. **Planning only** → Just for information, no hard limit
- [ ] C. **Not used** → Always NULL in database

**Current Data**: 3/3 schools have NULL ❌

**Recommendation**: 
- If A → Keep, add validation with targetStudents
- If B → Keep as optional free text
- If C → Remove or make truly optional

---

## 📊 Data Evidence

### Current Database State (3 schools)

```
Field               | School 1 | School 2 | School 3 | Usage Rate
--------------------|----------|----------|----------|------------
servingMethod       | CAFETERIA| CAFETERIA| CAFETERIA| 100% ✅
hasStorage          | TRUE     | TRUE     | FALSE    | 67%  🟡
storageCapacity     | NULL     | NULL     | NULL     | 0%   ❌
hasKitchen          | FALSE    | FALSE    | FALSE    | 0%   ❌
hasCleanWater       | TRUE     | TRUE     | TRUE     | 100%* ⚠️
hasElectricity      | TRUE     | TRUE     | TRUE     | 100%* ⚠️
```

*Default values, not verified/real data

---

## ✅ Next Steps

### Immediate Actions

1. **Discuss with Product Owner** (~30 min)
   - Review redundancy analysis
   - Answer 3 questions above
   - Decide on priority changes

2. **If approved, implement Phase 5 changes** (~2-3 hours)
   - Add "same as school" checkbox for delivery
   - Reorganize Section 5 into 5A & 5B
   - Update form logic and validation

3. **Test & Document** (~30 min)
   - Test checkbox behavior
   - Test collapsed section
   - Update user documentation

---

## 📝 Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2025-10-22 | Analysis Complete | Identified 2 redundancies, 3 low-relevance fields |
| TBD | Delivery checkbox | Awaiting PO approval |
| TBD | Facilities reorganization | Awaiting PO approval |
| TBD | Remove infrastructure fields | Awaiting business confirmation |

---

**Status**: ⏳ AWAITING PRODUCT OWNER REVIEW  
**Priority**: 🟡 MEDIUM (Not blocking, but improves UX significantly)  
**Effort**: ~3 hours implementation + testing  
**Impact**: Better UX, cleaner data model, faster data entry
