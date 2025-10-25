# 🔄 Panduan Reset Database & Seed di Coolify

## 🎯 Overview

Panduan ini menjelaskan cara melakukan **database reset** dan **seed ulang** di Coolify production environment dengan aman.

> ⚠️ **PERINGATAN**: Reset database akan **MENGHAPUS SEMUA DATA**. Pastikan backup sudah dibuat sebelum melanjutkan!

---

## 📋 3 Metode Reset Database

### 1️⃣ Soft Reset (Recommended) - Seed Ulang Tanpa Reset

**Kapan digunakan:**
- Ingin update seed data tanpa hapus data existing
- Menggunakan `upsert` yang aman dan idempotent
- Data production masih penting

**Cara:**

```bash
# Via Coolify → Your App → Terminal/Console

# Method 1: Via npm script (recommended)
npm run db:seed

# Method 2: Via prisma (jika sudah config prisma.seed di package.json)
npx prisma db seed

# Method 3: Direct tsx execution
tsx prisma/seed.ts
```

**Keuntungan:**
- ✅ Tidak hapus data existing
- ✅ Update data yang sudah ada (via upsert)
- ✅ Tambah data baru
- ✅ Aman untuk production

---

### 2️⃣ Hard Reset (Danger Zone) - Reset Total + Seed

**Kapan digunakan:**
- Database korup atau bermasalah
- Ingin mulai fresh dari awal
- Testing/staging environment
- Sudah ada backup lengkap

**Cara Aman:**

#### Step 1: Backup Database (WAJIB!)

**Via Coolify Terminal:**
```bash
# Export semua data
pg_dump $DATABASE_URL > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# Download backup ke local
# Coolify → Database → Backup → Download
```

**Atau via Coolify UI:**
- Go to: **Database Resource → Backups → Create Backup**
- Download backup file

#### Step 2: Reset Database

**Via Coolify Terminal:**
```bash
# Drop semua tables dan reset schema
npx prisma migrate reset --force --skip-seed

# Hasil: Database kosong dengan schema terbaru
```

#### Step 3: Run Seed

```bash
# Seed semua data dari seed files
npx prisma db seed

# Atau jika ingin include demo data
SEED_DEMO_DATA=true npx prisma db seed
```

#### Step 4: Verify

```bash
# Check migration status
npx prisma migrate status

# Check data terisi
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"SPPG\";"
```

---

### 3️⃣ Selective Reset - Reset Specific Tables

**Kapan digunakan:**
- Hanya ingin reset data tertentu
- Pertahankan user accounts, tapi reset operational data
- Lebih surgical approach

**Cara:**

```bash
# Via Coolify Terminal
psql $DATABASE_URL

# SQL commands
-- Reset specific tables (contoh)
TRUNCATE TABLE "FoodDistribution" CASCADE;
TRUNCATE TABLE "FoodProduction" CASCADE;
TRUNCATE TABLE "Procurement" CASCADE;

-- Re-seed specific data
\q

# Seed ulang
npx prisma db seed
```

---

## 🚀 Step-by-Step: Full Reset di Coolify

### Persiapan

**1. Akses Coolify Dashboard**
```
https://your-coolify-instance.com
Login → Your Project → bagizi-id
```

**2. Identifikasi Database Connection**
```bash
# Via Coolify → bagizi-id → Environment Variables
# Copy DATABASE_URL value
```

**3. Buka Terminal**
```
Coolify → bagizi-id → Terminal
```

---

### Eksekusi Reset

#### **Option A: Via Prisma Reset Command (Otomatis)**

```bash
# 1. Backup dulu (WAJIB!)
pg_dump $DATABASE_URL > /tmp/backup_before_reset.sql

# 2. Reset + Migrate
npx prisma migrate reset --force

# Ini otomatis:
# - Drop database
# - Create database baru
# - Apply semua migrations
# - Run seed script
```

#### **Option B: Manual Step-by-Step (Lebih Kontrol)**

```bash
# 1. BACKUP
echo "📦 Creating backup..."
pg_dump $DATABASE_URL > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# 2. DROP ALL TABLES
echo "🗑️ Dropping all tables..."
psql $DATABASE_URL << EOF
DO \$\$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
    END LOOP;
END \$\$;
EOF

# 3. APPLY MIGRATIONS
echo "📊 Applying migrations..."
npx prisma migrate deploy

# 4. SEED DATABASE
echo "🌱 Seeding database..."
npx prisma db seed

# 5. VERIFY
echo "✅ Verifying..."
npx prisma migrate status
psql $DATABASE_URL -c "SELECT COUNT(*) as total_users FROM \"User\";"
psql $DATABASE_URL -c "SELECT COUNT(*) as total_sppg FROM \"SPPG\";"
```

---

## 📝 Seed Configuration di Coolify

### Check Current Seed Script

```bash
# Via Coolify Terminal
cat prisma/seed.ts
```

### Seed File Structure

```
prisma/
├── seed.ts              # Master seed file
└── seeds/               # Individual seed modules
    ├── sppg-seed.ts
    ├── user-seed.ts
    ├── nutrition-seed.ts
    ├── inventory-seed.ts
    ├── procurement-seed.ts
    ├── menu-seed.ts
    ├── production-seed.ts
    ├── distribution-seed.ts
    ├── regional-seed.ts
    └── demo-seed.ts
```

### Environment Variables untuk Seed

**Set di Coolify → Environment Variables:**

```bash
# Control demo data seeding
SEED_DEMO_DATA=false        # Set true jika ingin demo data

# Environment
NODE_ENV=production         # Affect seed behavior

# Database
DATABASE_URL=postgres://... # Auto-set by Coolify
```

---

## 🔧 Troubleshooting

### Problem 1: Seed Timeout

**Error:**
```
Error: Seeding failed due to timeout
```

**Solution:**
```bash
# Optimize seed dengan batch operations
# Edit prisma/seed.ts

// Before (slow)
for (const item of items) {
  await prisma.item.create({ data: item })
}

// After (fast)
await prisma.item.createMany({
  data: items,
  skipDuplicates: true
})
```

### Problem 2: Foreign Key Constraint Error

**Error:**
```
Foreign key constraint failed
```

**Solution:**
```bash
# Seed dalam urutan yang benar
# Pastikan dependencies di-seed dulu

// 1. Core entities first
const sppgs = await seedSppg(prisma)
const users = await seedUsers(prisma, sppgs)  // Pass sppgs

// 2. Master data
await seedNutrition(prisma)
await seedInventory(prisma, sppgs)  // Pass sppgs

// 3. Operational data
await seedProcurement(prisma, sppgs)
```

### Problem 3: Duplicate Key Error

**Error:**
```
Unique constraint failed on the fields: (sppgCode)
```

**Solution:**
```typescript
// Use upsert instead of create
await prisma.sppg.upsert({
  where: { sppgCode: 'SPPG-JKT-001' },
  update: {},  // Update nothing if exists
  create: {    // Create if not exists
    sppgCode: 'SPPG-JKT-001',
    sppgName: 'SPPG Jakarta Pusat',
    // ...
  }
})
```

### Problem 4: Connection Error

**Error:**
```
Can't reach database server
```

**Solution:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT NOW();"

# Jika error, check di Coolify:
# Database → Status → Should be "Running"
```

---

## 🎯 Post-Reset Checklist

Setelah reset, verify hal-hal berikut:

- [ ] **Migration Status**: `npx prisma migrate status` → "No pending migrations"
- [ ] **Core Data**: Users, SPPG, Programs tersedia
- [ ] **Master Data**: Nutrition, Regional, Inventory tersedia
- [ ] **Operational Data**: Menu, Production, Distribution tersedia (jika applicable)
- [ ] **Login Test**: Test login dengan demo credentials
- [ ] **API Test**: Test beberapa API endpoints critical
- [ ] **UI Test**: Buka app dan navigasi ke key pages

---

## 📊 Monitoring Seed Progress

### Via Coolify Logs

```
Coolify → bagizi-id → Deployments → Latest → Logs
Filter: "seed" atau "🌱"
```

**Expected Output:**
```
🌱 Starting database seeding...
📊 Seeding SPPG entities...
  ✓ Created 2 SPPG entities
👥 Seeding users and roles...
  ✓ Created 8 users
🥗 Seeding nutrition data...
  ✓ Created nutrition reference data
...
✅ Database seeding completed successfully!
```

---

## 🔄 Automatic Seed on Deploy

**Current Configuration:**

Coolify sudah set untuk **auto-seed pada setiap deployment**:

**Post-Deployment Command:**
```bash
npx prisma migrate deploy && npx prisma db seed
```

**Workflow Otomatis:**
```
git push origin main
    ↓
Coolify detects push
    ↓
Pull code → Build app
    ↓
Run migrations (migrate deploy)
    ↓
Run seed (db seed)
    ↓
App ready! ✅
```

**Benefit:** Seed files selalu sync dengan code terbaru!

---

## 💡 Best Practices

### 1. Always Backup Before Reset

```bash
# Create timestamped backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau download via Coolify UI
```

### 2. Use Idempotent Seeds (Upsert)

```typescript
// ✅ Safe to run multiple times
await prisma.item.upsert({
  where: { uniqueField: 'value' },
  update: { /* update existing */ },
  create: { /* create new */ }
})

// ❌ Error if run twice
await prisma.item.create({
  data: { uniqueField: 'value' }
})
```

### 3. Seed in Correct Order

```typescript
// Dependencies first
const sppgs = await seedSppg(prisma)
const users = await seedUsers(prisma, sppgs)

// Then related data
await seedPrograms(prisma, sppgs)
await seedInventory(prisma, sppgs)
```

### 4. Environment-Aware Seeding

```typescript
const isProduction = process.env.NODE_ENV === 'production'
const seedDemo = process.env.SEED_DEMO_DATA === 'true'

// Only seed demo data if explicitly enabled
if (seedDemo && !isProduction) {
  await seedDemoData(prisma)
}
```

### 5. Log Progress

```typescript
console.log('🌱 Starting database seeding...')
console.log('📊 Seeding SPPG entities...')
// ... seed code
console.log('  ✓ Created 2 SPPG entities')
```

---

## 🚨 Emergency Recovery

**Jika reset gagal total:**

### Plan A: Restore from Backup

```bash
# 1. Drop current database
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Restore from backup
psql $DATABASE_URL < backup_20251023_120000.sql

# 3. Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

### Plan B: Fresh Database

```bash
# 1. Via Coolify → Database → Delete
# 2. Create new database
# 3. Update DATABASE_URL in app
# 4. Deploy ulang → Auto migrate + seed
```

---

## 📚 Related Documentation

- **Migration Guide**: `docs/COOLIFY_PRISMA_MIGRATION_GUIDE.md`
- **Seed Deployment**: `SEED_DEPLOYMENT_QUICK_GUIDE.md`
- **Quick Reference**: `PRISMA_COOLIFY_QUICKSTART.md`
- **Troubleshooting**: `docs/COOLIFY_DEPLOYMENT_TROUBLESHOOTING.md`

---

## 🎓 Quick Reference Commands

```bash
# === BACKUP ===
pg_dump $DATABASE_URL > backup.sql

# === RESET ===
npx prisma migrate reset --force          # Full reset + auto seed
npx prisma migrate reset --force --skip-seed  # Reset tanpa seed

# === SEED ===
npx prisma db seed                        # Normal seed
SEED_DEMO_DATA=true npx prisma db seed    # With demo data

# === VERIFY ===
npx prisma migrate status                 # Check migration status
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"  # Check data

# === MANUAL MIGRATION ===
npx prisma migrate deploy                 # Apply pending migrations
npx prisma migrate resolve --applied NAME # Mark migration as applied
npx prisma migrate resolve --rolled-back NAME  # Mark as rolled back

# === CONNECTION TEST ===
psql $DATABASE_URL -c "SELECT NOW();"     # Test DB connection
echo $DATABASE_URL                        # Show connection string
```

---

## 📞 Support

**Jika ada masalah:**

1. Check Coolify logs: `Deployments → Latest → Logs`
2. Check migration status: `npx prisma migrate status`
3. Test connection: `psql $DATABASE_URL -c "SELECT NOW();"`
4. Lihat dokumentasi terkait di folder `docs/`
5. Review seed script: `cat prisma/seed.ts`

---

**Last Updated:** October 23, 2025  
**Status:** Production Ready ✅  
**Tested Environment:** Coolify Production Deployment
