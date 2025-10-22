# 🚀 Quick Re-seed Guide

## Problem Solved
Seed file sekarang memiliki data vitamin dan mineral lengkap untuk 17 item prioritas tinggi.

## Re-seed Database

### Option 1: Full Reset (Recommended)
```bash
# Reset database completely and re-seed
npm run db:reset

# This will:
# 1. Drop all tables
# 2. Run all migrations
# 3. Re-seed with updated data
```

### Option 2: Just Re-seed
```bash
# Only re-run seed (if database schema is already up-to-date)
npx prisma db seed
```

## Verify Update

### Check Database
```bash
# Run debug script to check values
npx tsx scripts/debug-nutrition-values.ts
```

### Expected Output
```
✅ Kacang Panjang:
   - vitaminA: 865 mcg
   - vitaminC: 18 mg
   - calcium: 50 mg

✅ Tahu:
   - calcium: 350 mg (TINGGI!)
   - iron: 5.4 mg (TINGGI!)

✅ Wortel:
   - vitaminA: 835 mcg (SUPER TINGGI!)
```

## Test Menu

### Re-calculate Nutrition
1. Open: http://localhost:3000/menu/cmh06cjox004hsvynnplmt7hq
2. Click: "Hitung Nutrisi"
3. Wait for completion

### Verify Display
**Check these values are NOT 0.0:**
- ✅ Vitamin A, C, E, K
- ✅ Vitamin B1, B2, B3, B6, B12
- ✅ Folate
- ✅ Calcium, Iron, Zinc, Magnesium
- ✅ Compliance Score > 0%
- ✅ Status AKG = calculated correctly

## Items with Complete Data

**Karbohidrat (6)**: Beras Merah, Beras Putih, Tepung Terigu, Mie Telur, Tepung Beras, Roti Gandum

**Protein Hewani (1)**: Ayam Fillet

**Protein Nabati (4)**: Telur Ayam, Tempe, Tahu, Kedelai Kuning

**Sayuran (6)**: Wortel, Bayam, Sawi Hijau, Kentang, Buncis, Labu Siam, **Kacang Panjang** ✅

**Total**: 17 items dengan vitamin/mineral lengkap

## What Changed

**Before**:
```typescript
{
  itemName: 'Kacang Panjang',
  calories: 47,
  protein: 2.8,
  // NO vitamins/minerals ❌
}
```

**After**:
```typescript
{
  itemName: 'Kacang Panjang',
  calories: 47,
  protein: 2.8,
  // NEW: Complete TKPI data ✅
  vitaminA: 865,
  vitaminC: 18,
  calcium: 50,
  iron: 0.7,
  // ... 24+ more fields
}
```

## Troubleshooting

### If re-seed fails:
```bash
# Check Prisma is up to date
npx prisma generate

# Try full reset
npm run db:reset
```

### If values still 0:
1. Check seed ran successfully
2. Verify database has new values
3. Re-calculate menu nutrition
4. Clear browser cache

---

**Status**: ✅ Ready to re-seed
**Next**: Run `npm run db:reset` and test!
