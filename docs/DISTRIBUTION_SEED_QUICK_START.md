# 🚀 Distribution Comprehensive Seed - Quick Start

## ⚡ TL;DR

Database masih kosong? Run comprehensive seed untuk populate **SEMUA** distribution entities (8 tables, 27+ records) dengan GPS tracking yang realistic!

---

## 📦 What You Get

```
✅ PHASE 1 (DistributionSchedule):     4 records
✅ PHASE 2 (FoodDistribution):         5 records  
✅ PHASE 3 (DistributionDelivery):     3 records + GPS
✅ VehicleAssignment:                  2 records
✅ DeliveryPhoto:                      3 records
✅ DeliveryTracking (GPS trail):       8 points
✅ DeliveryIssue:                      1 record
✅ BeneficiaryReceipt:                 1 record
```

---

## 🔧 How to Run

### Step 1: Fix Enum Values (CRITICAL! ⚠️)

Open: `prisma/seeds/distribution-comprehensive-seed.ts`

**Find & Replace** (13 replacements needed):

```typescript
// Wave enum (4 replacements)
wave: 'WAVE_1'  →  wave: 'MORNING'
wave: 'WAVE_2'  →  wave: 'MIDDAY'
wave: 'WAVE_3'  →  wave: 'MORNING'

// Category enum (9 replacements)
'BALITA'                   →  'TODDLER'
'ANAK_USIA_DINI'          →  'EARLY_CHILDHOOD'
'ANAK_SEKOLAH_DASAR'      →  'ELEMENTARY_GRADE_1_3'
'ANAK_SEKOLAH_MENENGAH'   →  'JUNIOR_HIGH'
```

### Step 2: Add Missing Fields

Find DistributionDelivery creates with status 'EN_ROUTE' or 'ASSIGNED', add:
```typescript
portionsDelivered: 0,  // Add this line
```

### Step 3: Remove Invalid Fields

In VehicleAssignment creates, REMOVE these lines:
```typescript
driverName: drivers[X].name,     // ❌ Remove
helperNames: [...],              // ❌ Remove
```

### Step 4: Update Master Seed

Edit: `prisma/seed.ts`

```typescript
// Line ~20: Add import
import { seedDistributionComprehensive } from './seeds/distribution-comprehensive-seed'

// Line ~120: Replace function call
// OLD:
await seedDistribution(prisma, sppgs, programs)

// NEW:
await seedDistributionComprehensive(prisma, sppgs, programs)
```

### Step 5: Run Seed

```bash
npm run db:seed
```

---

## ✅ Verify Success

### Check Console Output:
```
✅ Found: 10 menus, 5 schools, 3 vehicles
✅ Created 4 DistributionSchedule entities
✅ Created 5 FoodDistribution entities
✅ Created 3 DistributionDelivery entities
✅ Created 2 VehicleAssignment entities
✅ Created 3 DeliveryPhoto entities
✅ Created 8 DeliveryTracking points
✅ Created 1 DeliveryIssue entities
✅ Created 1 BeneficiaryReceipt entities
📊 ALL DISTRIBUTION PHASES SEEDED!
```

### Check Prisma Studio:
```bash
npx prisma studio
```

Navigate to tables and verify record counts match above.

### Check Dashboard:
```
http://localhost:3000/distribution
```

Verify "Quick Access" cards show:
- Active Schedules: 2
- Today's Distributions: 3
- In-Transit Deliveries: 1
- Performance metrics populated

---

## 📍 GPS Coordinates

All coordinates are real Purwakarta locations:

```
SPPG Base:    -6.5456, 107.4323
School 1:     -6.5467, 107.4333 (SDN Purwakarta 1)
School 2:     -6.5478, 107.4345 (SDN Purwakarta 2)
School 3:     -6.5489, 107.4356 (TK Pembina)
GPS Trail:    8 tracking points showing vehicle movement
```

---

## 🧪 Test Scenarios

| Scenario | Schedule | Distribution | Delivery | Test Use Case |
|----------|----------|--------------|----------|---------------|
| **1** | COMPLETED | COMPLETED | DELIVERED | Historical data, reports |
| **2** | IN_PROGRESS | IN_TRANSIT | EN_ROUTE | Real-time GPS tracking |
| **3** | IN_PROGRESS | DISTRIBUTING | ASSIGNED | Assignment workflows |
| **4** | PLANNED | SCHEDULED | - | Scheduling features |
| **5** | IN_PROGRESS | PREPARING | - | Preparation phase |

---

## 🚨 Quick Troubleshooting

### Error: "SPPG Purwakarta not found"
**Fix**: Run full seed, not just distribution seed

### Error: "No programs found"
**Fix**: Ensure menu seed runs before distribution

### Error: "Type error on enum values"
**Fix**: You skipped Step 1! Replace enum values

### Error: "portionsDelivered missing"
**Fix**: You skipped Step 2! Add missing fields

---

## 📚 Full Documentation

Read comprehensive guides:
- `docs/DISTRIBUTION_COMPREHENSIVE_SEED_GUIDE.md` - Usage guide
- `docs/DISTRIBUTION_COMPREHENSIVE_SEED_COMPLETE.md` - Implementation docs

---

## 🎯 Success Checklist

- [ ] Fixed enum values (WAVE_X → MORNING/MIDDAY)
- [ ] Fixed category enums (Indonesian → English)
- [ ] Added portionsDelivered: 0 where needed
- [ ] Removed driverName from VehicleAssignment
- [ ] Updated master seed import
- [ ] Ran seed successfully
- [ ] Verified console output
- [ ] Checked Prisma Studio (8 tables populated)
- [ ] Opened dashboard (stats showing correctly)
- [ ] GPS map displays delivery locations

---

**🎉 Done! Database siap untuk test ALL distribution features!**
