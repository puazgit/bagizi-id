# Demo Requests Seed - Business Model Correction

**Date:** October 25, 2025  
**Issue:** Demo requests seed data tidak sesuai dengan fokus aplikasi  
**Status:** ✅ RESOLVED

---

## 🎯 Business Model Correction

### ❌ SEBELUMNYA (SALAH)
Demo requests dari sekolah-sekolah seperti:
- SD Negeri 1 Purwakarta
- SMP Negeri 2 Purwakarta  
- SMK Negeri 1 Purwakarta
- TK Negeri Pembina
- Pondok Pesantren Darussalam

**Masalah:** Sekolah bukan customer, sekolah adalah **beneficiary** (penerima)!

---

## ✅ SESUDAHNYA (BENAR)

### Fokus Aplikasi: **Makan Bergizi Gratis (MBG)**
Bagizi-ID adalah platform untuk **program Makan Bergizi Gratis** bagi anak sekolah:
- 🎯 **Pemenuhan gizi** anak sekolah (bukan katering komersial)
- 📊 **Penanggulangan stunting** & malnutrisi
- 🏛️ **Program pemerintah** & CSR untuk kesejahteraan anak
- 📈 **Monitoring status gizi** siswa secara real-time

### Business Model Hierarchy:
```
Platform (Bagizi-ID SaaS)
    ↓
SPPG Organizations (CUSTOMERS - yang subscribe & bayar)
    ↓
Schools (BENEFICIARIES - penerima distribusi makanan)
    ↓  
Students (END USERS - yang konsumsi makanan bergizi)
```

---

## 📋 Demo Requests dari SPPG Organizations

### 6 SPPG Demo Requests (Purwakarta/Jabar Area):

#### 1. **SPPG Dinas Pendidikan Kabupaten Purwakarta** - `SUBMITTED`
- **Type:** PEMERINTAH
- **Program:** MBG untuk 18 SD (4.500 siswa)
- **Focus:** Government compliance, stunting prevention, APBD budget tracking
- **Pain Points:** Manual reporting to Kemendikbud, no integrated nutrition data
- **Budget:** APBD 2025 approved, need immediate system

#### 2. **SPPG Yayasan Pendidikan Islam Al-Ma'soem** - `UNDER_REVIEW`
- **Type:** YAYASAN
- **Program:** Free meal program untuk siswa kurang mampu (8 schools, 800 students)
- **Focus:** Donor transparency, impact measurement, halal compliance
- **Pain Points:** No standardized menu, no impact data for donors

#### 3. **SPPG PT Indah Kiat Pulp & Paper (CSR)** - `APPROVED`
- **Type:** SWASTA (Corporate CSR)
- **Program:** CSR MBG untuk anak karyawan & masyarakat sekitar pabrik (6 SD, 600 students)
- **Focus:** Social impact reporting, sustainability, stakeholder transparency
- **Pain Points:** No nutrition status data, can't measure CSR program success

#### 4. **SPPG Komunitas Ibu PKK Desa Ciganea** - `REJECTED`
- **Type:** KOMUNITAS
- **Program:** Village-level nutrition program (2 PAUD, 50 children)
- **Focus:** Stunting prevention at village level
- **Rejected Reason:** Too small target, insufficient ADD budget
- **Future:** Consider freemium or CSR partnership

#### 5. **SPPG Dinas Kesehatan Kabupaten Subang** - `CONVERTED` 🎉
- **Type:** PEMERINTAH
- **Program:** PMT (Pemberian Makanan Tambahan) untuk balita stunting (12 Posyandu, 1.200 balita)
- **Focus:** Stunting prevention, health ministry reporting, growth monitoring
- **Success:** Signed 1-year contract, onboarding Nov 1
- **Special:** Integration with e-PPGBM Kemenkes & e-Posyandu

#### 6. **SPPG Yayasan Bina Insan Kamil** - `DEMO_ACTIVE` 🔥
- **Type:** YAYASAN
- **Program:** Free meal for orphans & underprivileged children (5 units: TK, SD, SMP, Ponpes, Panti, 450 children)
- **Focus:** Donor transparency, child health tracking, social impact
- **Status:** Demo running with excellent feedback, discussing NGO pricing

---

## 🎯 Key Features Yang Dibutuhkan SPPG

Berdasarkan demo requests, SPPG organizations butuh:

### 1. **Menu Planning & Nutrition**
- Standardized menu gizi seimbang
- Nutrition monitoring (kalori, protein, vitamin, mineral)
- Halal compliance tracking
- Recipe management

### 2. **Stunting Prevention & Health**
- Growth tracking (tinggi, berat badan)
- Nutrition status monitoring
- Stunting prevention program
- Health reporting

### 3. **Compliance & Reporting**
- Government reporting (Kemendikbud, Kemenkes)
- Donor reporting & transparency
- CSR impact measurement
- Sustainability reporting

### 4. **Operations**
- Distribution management
- Procurement planning
- Budget tracking
- Quality control

### 5. **Impact Measurement**
- Student health outcomes
- Program effectiveness analytics
- Photo documentation
- Community feedback

---

## 📊 Target Market Segments

### 1. **Government Agencies** (Primary)
- Dinas Pendidikan (education dept)
- Dinas Kesehatan (health dept)  
- Dinas Sosial (social welfare)
- Need: Compliance, reporting, budget tracking

### 2. **Foundations (Yayasan)** (Secondary)
- Islamic foundations (ponpes, madrasah)
- Social welfare foundations
- Orphanage programs
- Need: Donor transparency, impact measurement

### 3. **Corporate CSR** (Growth)
- Manufacturing companies
- Mining companies
- Banks & financial institutions
- Need: Social impact reporting, sustainability

### 4. **Community Organizations** (Future)
- PKK (village women's group)
- Posyandu (community health posts)
- NGOs focused on children welfare
- Need: Simple tools, affordable pricing

---

## ✅ Verification

Seed executed successfully:
```
✓ Created 6 demo requests from SPPG organizations
  - 1 SUBMITTED (Dinas Pendidikan Purwakarta - MBG Program)
  - 1 UNDER_REVIEW (Yayasan Al-Ma'soem - Free Meal Program)
  - 1 APPROVED (PT Indah Kiat CSR - MBG Program)
  - 1 REJECTED (PKK Desa Ciganea - too small)
  - 1 CONVERTED (Dinkes Subang - Stunting Prevention! 🎉)
  - 1 DEMO_ACTIVE (Yayasan Bina Insan Kamil - Free Meal Program)
```

All organizations:
✅ Focus on **Makan Bergizi Gratis** (MBG) programs  
✅ Serve **school children** & **toddlers** (not commercial catering)  
✅ Located in **Purwakarta/Jabar** area (consistent with regional seed)  
✅ Represent realistic **government, foundation, corporate, community** customers  

---

## 📝 Next Steps

1. ✅ **Seed completed** - Demo requests dengan fokus MBG
2. 🔄 **Test UI** - Verify demo requests list shows SPPG organizations
3. 🔄 **Complete dashboard** - Add MBG program metrics & stunting prevention stats
4. 🔄 **Build features** - Focus on nutrition monitoring, compliance reporting, impact measurement

---

**Key Takeaway:** Bagizi-ID adalah platform untuk **program gizi anak sekolah** (MBG, stunting prevention, free meal programs), bukan untuk **katering komersial**. SPPG organizations adalah **customers** yang subscribe untuk mengelola program gizi mereka, dan **sekolah adalah beneficiaries** yang menerima distribusi makanan bergizi.
