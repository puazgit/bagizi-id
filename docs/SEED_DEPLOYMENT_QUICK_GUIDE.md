# ⚡ Quick Guide: Deploy Seed Data ke Coolify

## 🎯 TL;DR - 3 Cara Deploy Seed Data

### 1️⃣ Automatic (Recommended) ✅
```bash
# Edit seed files di local
vim prisma/seeds/sppg-seed.ts

# Commit & push
git add prisma/seeds/
git commit -m "feat: update seed data"
git push origin main

# Coolify auto-run seed via post-deployment command
# Monitor: Coolify → Logs → Filter "seed"
```

### 2️⃣ Manual Trigger (Tanpa Rebuild)
```bash
# Via Coolify → Your App → Terminal
npx prisma db seed
```

### 3️⃣ Reset & Reseed (⚠️ Danger - Hapus Data!)
```bash
# Backup dulu!
pg_dump $DATABASE_URL > backup.sql

# Reset
npx prisma migrate reset --force --skip-seed

# Seed ulang
npx prisma db seed
```

---

## 📋 Current Post-Deployment Command

**Coolify → Settings → Post-Deployment Command:**
```bash
npx prisma migrate deploy && npx prisma db seed
```

**Apa yang terjadi otomatis:**
1. ✅ Apply migrations baru
2. ✅ Run seed script (`prisma/seed.ts`)
3. ✅ Upsert data (idempotent - safe untuk run berulang)

---

## 🚀 Normal Workflow

```
┌─────────────────────────────────────┐
│  1. EDIT SEED FILES (LOCAL)         │
├─────────────────────────────────────┤
│  vim prisma/seeds/sppg-seed.ts      │
│  npm run db:seed  # Test locally    │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│  2. COMMIT & PUSH                   │
├─────────────────────────────────────┤
│  git add prisma/seeds/              │
│  git commit -m "feat: update seed"  │
│  git push origin main               │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│  3. COOLIFY AUTO-DEPLOY             │
├─────────────────────────────────────┤
│  → Pull code                        │
│  → Build app                        │
│  → npx prisma migrate deploy        │
│  → npx prisma db seed  ✅           │
└─────────────────────────────────────┘
```

---

## 💡 Best Practice: Use Upsert

```typescript
// ✅ GOOD: Idempotent - Safe untuk run berkali-kali
await prisma.sppg.upsert({
  where: { sppgCode: 'SPPG-JKT-001' },
  update: {
    // Update jika sudah ada
    sppgName: 'SPPG Jakarta Pusat (Updated)',
  },
  create: {
    // Create jika belum ada
    sppgCode: 'SPPG-JKT-001',
    sppgName: 'SPPG Jakarta Pusat',
    // ...
  }
})

// ❌ BAD: Error jika data sudah ada
await prisma.sppg.create({
  data: {
    sppgCode: 'SPPG-JKT-001',
    sppgName: 'SPPG Jakarta Pusat',
  }
})
```

---

## 🔧 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Seed tidak jalan | Check Coolify logs: `Coolify → Logs → "seed"` |
| Seed timeout | Optimize seed script (use `createMany`) |
| Foreign key error | Seed dalam urutan yang benar (dependencies first) |
| Data tidak update | Set `update` field di upsert, bukan `update: {}` |
| Manual trigger | `Coolify → Terminal → npx prisma db seed` |

---

## 🎓 Conditional Seeding (Production vs Dev)

```typescript
// prisma/seed.ts
async function main() {
  const isProduction = process.env.NODE_ENV === 'production'
  const seedDemo = process.env.SEED_DEMO_DATA === 'true'

  // Core data (always seed)
  const sppgs = await seedSppg(prisma)
  const users = await seedUsers(prisma, sppgs)

  // Demo data (only if enabled & not production)
  if (seedDemo && !isProduction) {
    await seedDemoData(prisma, sppgs)
  }
}
```

**Set di Coolify Environment Variables:**
```bash
NODE_ENV=production
SEED_DEMO_DATA=false  # Jangan seed demo di production
```

---

## 📊 Verify Seed Success

### Check Logs (Coolify)
```log
✅ Expected Output:
🌱 Starting database seeding...
📊 Seeding SPPG entities...
  ✓ Created 2 SPPG entities
👥 Seeding users and roles...
  ✓ Created 3 users
✅ Database seeding completed successfully!
```

### Check Data Count (Terminal)
```bash
# Via Coolify → Your App → Terminal
psql $DATABASE_URL -c "SELECT COUNT(*) as total FROM \"Sppg\";"
psql $DATABASE_URL -c "SELECT COUNT(*) as total FROM \"User\";"
psql $DATABASE_URL -c "SELECT COUNT(*) as total FROM \"NutritionMenu\";"
```

### View Recent Data
```bash
psql $DATABASE_URL -c "SELECT \"sppgCode\", \"sppgName\", \"createdAt\" FROM \"Sppg\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

---

## 🆘 Emergency Commands

### Force Reseed (Tanpa Hapus Data Lain)
```bash
# Via Coolify Terminal

# 1. Delete seeded data (optional - jika ingin start fresh)
psql $DATABASE_URL -c "DELETE FROM \"Sppg\" WHERE \"sppgCode\" LIKE 'SPPG-%';"

# 2. Run seed
npx prisma db seed
```

### Backup Before Major Changes
```bash
# Via Coolify Terminal
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Coolify Backup feature:
# Coolify → PostgreSQL Database → Backups → Create Manual Backup
```

### Restore from Backup
```bash
# If something goes wrong
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

---

## 📚 Local Development Commands

```bash
# Test seed locally
npm run db:seed

# Test seed with demo data
npm run db:seed:demo

# Reset database & seed from scratch
npm run db:reset

# Open Prisma Studio to verify
npm run db:studio
```

---

## 🎯 Deployment Checklist

Before pushing seed changes to production:

- [ ] Test locally: `npm run db:seed` ✓
- [ ] Verify in Prisma Studio ✓
- [ ] Use `upsert` not `create` ✓
- [ ] Check dependencies order ✓
- [ ] Commit seed files ✓
- [ ] Push to git ✓
- [ ] Monitor Coolify logs ✓
- [ ] Verify data in production ✓

---

## 📖 Full Documentation

Lihat: `docs/SEED_DATA_DEPLOYMENT_GUIDE.md` untuk panduan lengkap.

---

## 🎉 Summary

**Current Setup:**
- ✅ Seed auto-run setiap deployment
- ✅ Post-deployment command configured
- ✅ Idempotent upsert pattern used

**To Deploy Seed Changes:**
1. Edit `prisma/seeds/*.ts`
2. Test with `npm run db:seed`
3. Git push → Coolify auto-deploy ✅

**That's it!** 🚀

---

**Last Updated:** October 20, 2025
**Status:** Working & Production Ready ✅
