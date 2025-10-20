# 🌱 Panduan Deploy Seed Data ke PostgreSQL Coolify

## 📋 Overview

Panduan ini menjelaskan cara mengirim perubahan **data seed** dari development lokal ke production database PostgreSQL di Coolify.

---

## 🎯 3 Skenario Deployment Seed Data

### Skenario 1: Seed Data Baru (Recommended - Automatic)
Perubahan seed otomatis terkirim saat deployment via post-deployment command.

### Skenario 2: Manual Trigger Seed (Production Database)
Menjalankan seed secara manual di production database tanpa rebuild.

### Skenario 3: Reset & Reseed (⚠️ Danger - Hapus Semua Data)
Reset database dan seed ulang dari awal (untuk testing/staging only).

---

## 🚀 Skenario 1: Automatic Seed Deployment (Recommended)

### Cara Kerja

Setiap kali Anda push code ke git, Coolify akan:
1. Pull code terbaru (termasuk perubahan di `prisma/seed.ts`)
2. Build aplikasi
3. Run **Post-Deployment Command**: `npx prisma migrate deploy && npx prisma db seed`

### Step-by-Step

#### 1. Edit Seed File di Local

```bash
# Edit seed files
vim prisma/seed.ts
vim prisma/seeds/sppg-seed.ts
vim prisma/seeds/menu-seed.ts
# ... dll
```

**Example: Tambah data SPPG baru**

```typescript
// prisma/seeds/sppg-seed.ts
export async function seedSppg(prisma: PrismaClient): Promise<Sppg[]> {
  console.log('  → Creating SPPG entities...')

  const sppgs = await Promise.all([
    // SPPG yang sudah ada
    prisma.sppg.upsert({
      where: { sppgCode: 'SPPG-JKT-001' },
      update: {},
      create: {
        sppgName: 'SPPG Jakarta Pusat',
        sppgCode: 'SPPG-JKT-001',
        // ... data lainnya
      }
    }),
    
    // 🆕 SPPG baru yang ditambahkan
    prisma.sppg.upsert({
      where: { sppgCode: 'SPPG-BDG-001' },
      update: {},
      create: {
        sppgName: 'SPPG Bandung',
        sppgCode: 'SPPG-BDG-001',
        address: 'Jl. Asia Afrika No. 1, Bandung',
        phone: '022-12345678',
        email: 'bandung@sppg.id',
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
        subscriptionStatus: 'ACTIVE',
        maxBeneficiaries: 5000,
      }
    })
  ])

  console.log(`  ✓ Created ${sppgs.length} SPPG entities`)
  return sppgs
}
```

#### 2. Test Seed di Local

```bash
# Reset database lokal dan test seed
npm run db:reset

# Atau test seed saja (tanpa reset)
npm run db:seed

# Verify data masuk
npm run db:studio
```

#### 3. Commit & Push ke Git

```bash
# Stage seed files
git add prisma/seed.ts
git add prisma/seeds/

# Commit dengan message yang jelas
git commit -m "feat: add Bandung SPPG seed data"

# Push ke main branch
git push origin main
```

#### 4. Monitor Deployment di Coolify

1. Buka **Coolify Dashboard → Your Application → Logs**
2. Filter log dengan "prisma" atau "seed"
3. Tunggu hingga muncul:

```log
[CMD]: docker exec ... sh -c 'npx prisma migrate deploy && npx prisma db seed'
...
🌱 Starting database seeding...
📊 Seeding SPPG entities...
  → Creating SPPG entities...
  ✓ Created 2 SPPG entities
...
✅ Database seeding completed successfully!
```

#### 5. Verify Data di Production

**Option A: Via Coolify Terminal**
```bash
# Open Coolify → Your App → Terminal
psql $DATABASE_URL -c "SELECT * FROM \"Sppg\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

**Option B: Via pgAdmin/Database Client**
- Connect ke database production
- Query: `SELECT * FROM "Sppg" WHERE "sppgCode" = 'SPPG-BDG-001';`

---

## 🔧 Skenario 2: Manual Trigger Seed (Tanpa Rebuild)

Jika Anda ingin **hanya run seed tanpa rebuild aplikasi**, gunakan cara ini:

### Via Coolify Terminal

1. Buka **Coolify → Your Application → Terminal**
2. Jalankan command:

```bash
# Run seed script
npx prisma db seed
```

**Output yang diharapkan:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "bagizidb"

Running seed command `tsx prisma/seed.ts` ...
🌱 Starting database seeding...
📊 Seeding SPPG entities...
  ✓ Created 2 SPPG entities
👥 Seeding users and roles...
  ✓ Created 3 users
...
✅ Database seeding completed successfully!
```

### Via Coolify One-Off Command

1. Buka **Coolify → Your Application → Commands**
2. Klik **"Run One-Off Command"**
3. Enter command:

```bash
npx prisma db seed
```

4. Klik **Execute**

### Alternatif: Update Post-Deployment Command Sementara

Jika Anda ingin **force reseed** pada deployment berikutnya:

1. **Coolify → Your App → Settings → Post-Deployment Command**
2. Ubah jadi:

```bash
npx prisma migrate deploy && npx prisma db seed --force
```

3. **Redeploy** aplikasi
4. Kembalikan ke command normal setelah selesai:

```bash
npx prisma migrate deploy && npx prisma db seed
```

---

## ⚠️ Skenario 3: Reset & Reseed Database (DANGER ZONE)

**WARNING:** Ini akan **MENGHAPUS SEMUA DATA** di production database!

### Kapan Menggunakan Ini?

- ✅ Database staging/development yang ingin di-reset
- ✅ Testing environment untuk demo data
- ❌ **JANGAN PERNAH** di production dengan user data real!

### Step 1: Backup Database Dulu!

```bash
# Via Coolify Terminal
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau gunakan Coolify Backup feature
# Coolify → PostgreSQL Database → Backups → Create Manual Backup
```

### Step 2: Reset Database

**Option A: Via Prisma Migrate Reset**

```bash
# Di Coolify Terminal
npx prisma migrate reset --force --skip-seed
```

**Apa yang terjadi:**
1. Drop semua tables
2. Re-apply semua migrations dari awal
3. Database jadi kosong (fresh state)

**Option B: Via SQL Direct (More Control)**

```bash
# Di Coolify → PostgreSQL → Terminal
psql $DATABASE_URL

-- Drop semua tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO bagiziuser;
GRANT ALL ON SCHEMA public TO public;

-- Exit
\q
```

### Step 3: Apply Migrations

```bash
# Via Coolify → Your App → Terminal
npx prisma migrate deploy
```

### Step 4: Run Seed

```bash
# Seed dengan demo data (jika ada)
SEED_DEMO_DATA=true npx prisma db seed

# Atau seed normal
npx prisma db seed
```

### Step 5: Verify

```bash
# Check tables created
psql $DATABASE_URL -c "\dt"

# Check data count
psql $DATABASE_URL -c "SELECT 
  'Sppg' as table_name, COUNT(*) as count FROM \"Sppg\"
  UNION ALL
  SELECT 'User', COUNT(*) FROM \"User\"
  UNION ALL
  SELECT 'NutritionMenu', COUNT(*) FROM \"NutritionMenu\";"
```

---

## 🎯 Best Practices untuk Seed Data

### 1. **Use Upsert Pattern (Idempotent)**

```typescript
// ✅ GOOD: Upsert - Safe untuk run berulang kali
await prisma.sppg.upsert({
  where: { sppgCode: 'SPPG-JKT-001' },
  update: {
    // Update data jika sudah ada
    sppgName: 'SPPG Jakarta Pusat (Updated)',
  },
  create: {
    // Create jika belum ada
    sppgCode: 'SPPG-JKT-001',
    sppgName: 'SPPG Jakarta Pusat',
    // ... fields lainnya
  }
})

// ❌ BAD: Create - Error jika data sudah ada
await prisma.sppg.create({
  data: {
    sppgCode: 'SPPG-JKT-001',
    sppgName: 'SPPG Jakarta Pusat',
  }
})
```

### 2. **Conditional Seeding untuk Production**

```typescript
// prisma/seed.ts
async function main() {
  const isProduction = process.env.NODE_ENV === 'production'
  const seedDemo = process.env.SEED_DEMO_DATA === 'true'

  console.log('🌱 Starting database seeding...')
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`)

  try {
    // Core data (always seed)
    console.log('📊 Seeding SPPG entities...')
    const sppgs = await seedSppg(prisma)

    console.log('👥 Seeding users and roles...')
    const users = await seedUsers(prisma, sppgs)

    // Master data (always seed)
    console.log('🥗 Seeding nutrition data...')
    await seedNutrition(prisma)

    // Demo data (only if flag enabled)
    if (seedDemo && !isProduction) {
      console.log('🎭 Seeding demo data...')
      await seedDemoData(prisma, sppgs)
    } else if (isProduction) {
      console.log('⏭️  Skipping demo data (production environment)')
    }

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}
```

### 3. **Handle Dependencies Correctly**

```typescript
// Seed dalam urutan yang benar (dependencies first)
async function main() {
  // 1. Core entities (no dependencies)
  const sppgs = await seedSppg(prisma)
  
  // 2. Users (depends on SPPG)
  const users = await seedUsers(prisma, sppgs)
  
  // 3. Programs (depends on SPPG)
  const programs = await seedPrograms(prisma, sppgs)
  
  // 4. Menus (depends on Programs)
  const menus = await seedMenu(prisma, programs)
  
  // 5. Ingredients (depends on Menus)
  await seedIngredients(prisma, menus)
}
```

### 4. **Add Validation & Error Handling**

```typescript
export async function seedSppg(prisma: PrismaClient): Promise<Sppg[]> {
  console.log('  → Creating SPPG entities...')
  
  try {
    // Check if already seeded
    const existingCount = await prisma.sppg.count()
    if (existingCount > 0) {
      console.log(`  ℹ️  Found ${existingCount} existing SPPG entities`)
    }

    const sppgs = await Promise.all([
      prisma.sppg.upsert({
        where: { sppgCode: 'SPPG-JKT-001' },
        update: {},
        create: {
          sppgName: 'SPPG Jakarta Pusat',
          sppgCode: 'SPPG-JKT-001',
          // ... data
        }
      })
    ])

    console.log(`  ✓ Created/Updated ${sppgs.length} SPPG entities`)
    return sppgs
  } catch (error) {
    console.error('  ❌ Error seeding SPPG:', error)
    throw error
  }
}
```

### 5. **Use Environment Variables untuk Config**

```typescript
// prisma/seed.ts
const seedConfig = {
  sppgCount: parseInt(process.env.SEED_SPPG_COUNT || '2'),
  userCount: parseInt(process.env.SEED_USER_COUNT || '10'),
  demoData: process.env.SEED_DEMO_DATA === 'true',
  resetFirst: process.env.SEED_RESET === 'true',
}

console.log('📋 Seed configuration:', seedConfig)
```

**Di Coolify, set environment variables:**
```bash
SEED_DEMO_DATA=false  # Jangan seed demo di production
SEED_SPPG_COUNT=5     # Jumlah SPPG untuk seed
```

---

## 🔍 Troubleshooting

### Issue 1: Seed Failed - Foreign Key Constraint

**Error:**
```
Error: Foreign key constraint failed on the field: `sppgId`
```

**Cause:** Seed mencoba create data dengan reference ke entity yang belum ada.

**Fix:**
```typescript
// Pastikan seed dalam urutan yang benar
async function main() {
  // 1. Seed SPPG dulu
  const sppgs = await seedSppg(prisma)
  
  // 2. Baru seed yang depend pada SPPG
  await seedUsers(prisma, sppgs)  // Pass sppgs sebagai parameter
}

// Dalam seedUsers, gunakan SPPG ID yang valid
export async function seedUsers(prisma: PrismaClient, sppgs: Sppg[]) {
  await prisma.user.upsert({
    where: { email: 'admin@sppg.id' },
    create: {
      email: 'admin@sppg.id',
      sppgId: sppgs[0].id,  // ✅ Gunakan ID dari SPPG yang sudah di-seed
      // ...
    }
  })
}
```

### Issue 2: Seed Runs But No New Data

**Cause:** Upsert `update: {}` tidak menambah data baru jika unique key sudah ada.

**Fix:**

```typescript
// Jika ingin update data yang sudah ada
await prisma.sppg.upsert({
  where: { sppgCode: 'SPPG-JKT-001' },
  update: {
    // ✅ Specify fields yang ingin di-update
    sppgName: 'SPPG Jakarta Pusat (Updated)',
    phone: '021-99999999',
    updatedAt: new Date(),
  },
  create: {
    // Create baru jika belum ada
    sppgCode: 'SPPG-JKT-001',
    sppgName: 'SPPG Jakarta Pusat',
    // ...
  }
})
```

### Issue 3: Seed Takes Too Long

**Cause:** Terlalu banyak data di-seed atau query tidak optimal.

**Fix:**

```typescript
// ✅ Use Promise.all untuk parallel operations (jika tidak ada dependencies)
const sppgs = await Promise.all([
  seedSppg1(prisma),
  seedSppg2(prisma),
  seedSppg3(prisma),
])

// ✅ Use createMany untuk batch insert
await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
    { email: 'user3@example.com', name: 'User 3' },
  ],
  skipDuplicates: true,  // Skip jika unique constraint violation
})

// ❌ Avoid ini untuk banyak data
for (const user of users) {
  await prisma.user.create({ data: user })  // Slow!
}
```

### Issue 4: Seed Killed by Timeout

**Error:**
```
Command timeout: seed script exceeded 5 minutes
```

**Fix di Coolify:**

1. **Increase command timeout** di Coolify settings
2. **Optimize seed script** untuk lebih cepat
3. **Seed in batches:**

```typescript
// Seed dalam batches
async function seedInBatches<T>(
  items: T[],
  batchSize: number,
  seedFn: (batch: T[]) => Promise<void>
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await seedFn(batch)
    console.log(`  → Seeded batch ${i / batchSize + 1}`)
  }
}

// Usage
await seedInBatches(users, 100, async (batch) => {
  await prisma.user.createMany({
    data: batch,
    skipDuplicates: true,
  })
})
```

---

## 📊 Monitoring Seed Execution

### Check Seed Logs di Coolify

```bash
# Via Coolify Terminal
docker logs CONTAINER_ID 2>&1 | grep -A 50 "database seeding"
```

### Check Data Count After Seed

```bash
# Via Coolify Terminal
psql $DATABASE_URL << 'EOF'
SELECT 
  schemaname,
  tablename,
  (xpath('/row/count/text()', 
    query_to_xml(format('select count(*) as count from %I.%I', 
      schemaname, tablename), false, true, '')))[1]::text::int AS row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY row_count DESC
LIMIT 20;
EOF
```

### Verify Specific Data

```bash
# Check SPPG seeded
psql $DATABASE_URL -c "SELECT \"sppgCode\", \"sppgName\", \"status\" FROM \"Sppg\";"

# Check Users seeded
psql $DATABASE_URL -c "SELECT email, name, \"userRole\" FROM \"User\" LIMIT 10;"

# Check Menus seeded
psql $DATABASE_URL -c "SELECT \"menuName\", \"mealType\" FROM \"NutritionMenu\" LIMIT 10;"
```

---

## 🎯 Quick Reference Commands

### Local Development:
```bash
# Reset & seed from scratch
npm run db:reset

# Seed only (without reset)
npm run db:seed

# Seed with demo data
npm run db:seed:demo

# Open Prisma Studio to verify
npm run db:studio
```

### Coolify Production:
```bash
# Via Coolify Terminal

# Seed database
npx prisma db seed

# Seed with demo data
SEED_DEMO_DATA=true npx prisma db seed

# Check seed status
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Sppg\";"

# View recent data
psql $DATABASE_URL -c "SELECT * FROM \"Sppg\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

### Git Workflow:
```bash
# After editing seed files
git add prisma/seed.ts prisma/seeds/
git commit -m "feat: update seed data with new entries"
git push origin main

# Coolify auto-runs seed via post-deployment command
```

---

## 📋 Deployment Checklist

Sebelum deploy perubahan seed ke production:

- [ ] Test seed di local: `npm run db:seed`
- [ ] Verify data di local Prisma Studio
- [ ] Check untuk dependencies yang missing
- [ ] Pastikan menggunakan `upsert` bukan `create`
- [ ] Review seed script untuk production safety
- [ ] Backup production database (jika perubahan besar)
- [ ] Commit seed files: `git add prisma/seeds/`
- [ ] Push to git: `git push origin main`
- [ ] Monitor Coolify logs saat deployment
- [ ] Verify data masuk di production database

---

## 🔗 Related Documentation

- **Prisma Migration Guide:** `docs/COOLIFY_PRISMA_MIGRATION_GUIDE.md`
- **Quick Reference:** `PRISMA_COOLIFY_QUICKSTART.md`
- **Status Dashboard:** `PRISMA_MIGRATION_STATUS.md`

---

## 🆘 Need Help?

**If seed fails in production:**

1. Check Coolify logs: `Coolify → Your App → Logs → Filter "seed"`
2. Run seed manually: `Coolify → Terminal → npx prisma db seed`
3. Check database connection: `psql $DATABASE_URL -c "SELECT NOW();"`
4. Verify seed script syntax: Review error message in logs

**Emergency rollback:**
```bash
# Restore from backup (if available)
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

---

**Last Updated:** October 20, 2025
**Status:** Production workflows tested and verified ✅
