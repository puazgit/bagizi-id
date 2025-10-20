# 🚀 Panduan Migrasi Prisma ke PostgreSQL di Coolify

## 📋 Status Saat Ini

Berdasarkan deployment log terakhir (Oct 20, 2025):
- ✅ PostgreSQL database sudah terkoneksi: `wswwgcgw8koo48c08k4wscc0:5432`
- ✅ Database name: `bagizidb`
- ✅ Prisma schema sudah menggunakan PostgreSQL provider
- ✅ Post-deployment command sudah running: `npx prisma migrate deploy`

## 🎯 Tujuan Migrasi

Ada beberapa skenario migrasi Prisma ke PostgreSQL di Coolify:

### Skenario 1: Fresh Database (Database Baru/Kosong)
Untuk database PostgreSQL baru yang belum ada schema sama sekali.

### Skenario 2: Migrasi dari Development ke Production
Untuk deploy perubahan schema dari development ke production database.

### Skenario 3: Reset Database (Danger Zone)
Untuk reset seluruh database dan mulai dari awal dengan data seed.

---

## 📝 Skenario 1: Fresh Database Setup

Jika ini adalah **database PostgreSQL baru** yang belum pernah di-setup:

### Step 1: Pastikan Environment Variables di Coolify

Di **Coolify Dashboard → Your Application → Environment Variables**, pastikan ada:

```bash
DATABASE_URL=postgres://bagiziuser:JW6gUyr6Sf12e6qqwyxceM6xmwXMQjDBq8BijUESBAFNodBwv82YyEAHtccA9i35@wswwgcgw8koo48c08k4wscc0:5432/bagizidb

# Optional: jika ingin shadow database untuk Prisma Migrate
SHADOW_DATABASE_URL=postgres://bagiziuser:password@host:5432/bagizidb_shadow
```

### Step 2: Update Pre-Deployment Command

Di **Coolify → Settings → Pre-Deployment Command**:

```bash
# Generate Prisma Client
npx prisma generate
```

### Step 3: Update Post-Deployment Command

Di **Coolify → Settings → Post-Deployment Command**:

```bash
# Deploy all pending migrations
npx prisma migrate deploy && npx prisma db seed
```

**Penjelasan:**
- `prisma migrate deploy` → Apply semua migrations ke database production
- `prisma db seed` → (Optional) Seed database dengan data initial

### Step 4: Push Migrations ke Git

Pastikan folder `prisma/migrations/` sudah di-commit:

```bash
git add prisma/migrations/
git commit -m "feat: add prisma migrations for postgresql"
git push origin main
```

### Step 5: Deploy di Coolify

Coolify akan otomatis detect push dan trigger deployment. Atau manual trigger via:
- **Coolify Dashboard → Your App → Deploy button**

---

## 📝 Skenario 2: Migrasi Schema Changes (Development → Production)

Jika Anda sudah punya production database dan ingin apply schema changes:

### Step 1: Buat Migration di Development

```bash
# Di local development
npx prisma migrate dev --name add_new_feature

# Contoh: menambah field baru
npx prisma migrate dev --name add_user_avatar_field
```

### Step 2: Review Migration Files

Periksa file migration yang dibuat di `prisma/migrations/[timestamp]_[name]/`:

```sql
-- Example migration file
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;
```

### Step 3: Test Migration di Local

```bash
# Reset database local (optional, untuk testing)
npx prisma migrate reset

# Test migration
npx prisma migrate deploy
```

### Step 4: Commit & Push Migration

```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: add user avatar field"
git push origin main
```

### Step 5: Deploy ke Coolify

Migration akan otomatis ter-apply via **post-deployment command**.

Monitor log di Coolify untuk memastikan migration berhasil:

```
[CMD]: docker exec aoc0woco04os0k44o0w4808g-050231288989 sh -c 'npx prisma migrate deploy'
...
1 migration found in prisma/migrations
Applying migration `20251020_add_user_avatar_field`
Migration applied successfully
```

---

## 📝 Skenario 3: Reset Database Production (⚠️ DANGER ZONE)

**WARNING:** Ini akan **menghapus semua data** di production database!

### Option A: Via Coolify Terminal

1. Buka **Coolify → Your App → Terminal**
2. Jalankan commands:

```bash
# Confirm database connection
npx prisma db execute --stdin <<< "SELECT NOW();"

# Drop all tables (CAREFUL!)
npx prisma migrate reset --force --skip-seed

# Apply all migrations fresh
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Option B: Via Direct PostgreSQL Connection

1. Buka **Coolify → Database → PostgreSQL → Terminal** atau gunakan pgAdmin
2. Jalankan SQL:

```sql
-- Drop all tables in public schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO bagiziuser;
GRANT ALL ON SCHEMA public TO public;
```

3. Kemudian redeploy aplikasi via Coolify untuk apply migrations.

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Migration Failed - "Migration already applied"

**Error:**
```
Migration `20251019150022_add_production` failed
Already applied migration found
```

**Fix:**
```bash
# Option 1: Mark as rolled back
npx prisma migrate resolve --rolled-back 20251019150022_add_production

# Option 2: Mark as applied (if you know it's already applied)
npx prisma migrate resolve --applied 20251019150022_add_production

# Then retry deployment
npx prisma migrate deploy
```

**Update Post-Deployment Command di Coolify:**
```bash
npx prisma migrate resolve --rolled-back 20251019150022_add_production || true && npx prisma migrate deploy
```

### Issue 2: Schema Drift Detected

**Error:**
```
Schema drift detected
Database schema is not in sync with migration history
```

**Fix:**

```bash
# Generate baseline migration
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > baseline.sql

# Create baseline migration folder
mkdir -p prisma/migrations/0_baseline
mv baseline.sql prisma/migrations/0_baseline/migration.sql

# Mark as applied
npx prisma migrate resolve --applied 0_baseline
```

### Issue 3: Cannot Connect to Database

**Error:**
```
Error: P1001
Can't reach database server at wswwgcgw8koo48c08k4wscc0:5432
```

**Fix:**

1. Pastikan database service running di Coolify:
   - **Coolify → Resources → PostgreSQL Database → Check Status**

2. Periksa network connectivity:
   - Database dan aplikasi harus di network yang sama: `coolify` network

3. Verify connection string:
   ```bash
   # Di Coolify terminal
   echo $DATABASE_URL
   
   # Test connection
   psql $DATABASE_URL -c "SELECT version();"
   ```

### Issue 4: Permission Denied

**Error:**
```
Error: P3014
Permission denied for table _prisma_migrations
```

**Fix:**

```sql
-- Via PostgreSQL terminal
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bagiziuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bagiziuser;
GRANT ALL PRIVILEGES ON SCHEMA public TO bagiziuser;
```

### Issue 5: Seed Command Failed

**Error:**
```
Error: Cannot find module 'prisma/seed'
```

**Fix:**

1. Pastikan ada `seed.ts` file di `prisma/seed.ts`
2. Update `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "devDependencies": {
    "tsx": "^4.19.2"
  }
}
```

3. Update post-deployment command untuk handle seed error:

```bash
npx prisma migrate deploy && (npx prisma db seed || echo "Seed skipped")
```

---

## 📊 Best Practices untuk Production

### 1. **Backup Database Sebelum Migration**

Di Coolify, enable automatic backup:
- **Coolify → PostgreSQL Database → Backups → Enable Automatic Backups**

Manual backup via terminal:
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Coolify backup feature
```

### 2. **Test Migration di Staging Environment**

Buat staging database terpisah di Coolify:
1. Create new PostgreSQL database: `bagizidb_staging`
2. Create staging application with `DATABASE_URL` pointing to staging DB
3. Test migration di staging sebelum apply ke production

### 3. **Use Migration Rollback Strategy**

Buat migration yang reversible:

```sql
-- migration.sql (UP)
ALTER TABLE "User" ADD COLUMN "newField" TEXT;

-- Create rollback script manually
-- rollback.sql (DOWN)
ALTER TABLE "User" DROP COLUMN "newField";
```

### 4. **Monitor Migration Execution**

Selalu monitor Coolify logs saat deployment:
- **Coolify → Your App → Logs → Filter "prisma"**

Look for:
```
✔ Generated Prisma Client
✔ Applied migration 20251020_xxx
✔ Migration completed successfully
```

### 5. **Environment-Specific Migrations**

Gunakan conditional seeding:

```typescript
// prisma/seed.ts
async function main() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    // Seed minimal production data only
    await seedProductionData()
  } else {
    // Seed full demo data for development
    await seedDemoData()
  }
}
```

---

## 🎯 Current Configuration Check

Berdasarkan deployment log terakhir Anda:

✅ **Pre-Deployment Command (Currently Working):**
```bash
npx prisma generate
```

✅ **Post-Deployment Command (Currently Working):**
```bash
npx prisma migrate deploy && npx prisma db seed
```

✅ **Database Connection:**
```
Host: wswwgcgw8koo48c08k4wscc0
Port: 5432
Database: bagizidb
User: bagiziuser
```

✅ **Migration Status:**
```
1 migration found in prisma/migrations
No pending migrations to apply
```

**Kesimpulan:** Setup Prisma PostgreSQL Anda di Coolify **sudah benar dan berfungsi**! 🎉

---

## 📚 Quick Reference Commands

### Local Development:
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### Production (Coolify Terminal):
```bash
# Check migration status
npx prisma migrate status

# Deploy pending migrations
npx prisma migrate deploy

# Resolve migration issues
npx prisma migrate resolve --applied migration_name
npx prisma migrate resolve --rolled-back migration_name

# Check database connection
psql $DATABASE_URL -c "SELECT NOW();"

# View applied migrations
psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10;"
```

### Emergency Commands:
```bash
# Force mark migration as applied (CAREFUL!)
npx prisma migrate resolve --applied $(ls prisma/migrations | tail -1)

# Skip seed on error
npx prisma migrate deploy && (npx prisma db seed || true)

# Verify schema sync
npx prisma migrate status
```

---

## 🔗 Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Coolify Documentation](https://coolify.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [Prisma Production Checklist](https://www.prisma.io/docs/guides/deployment/deployment-guides/caveats-when-deploying-to-production)

---

## 🆘 Need Help?

Jika masih ada masalah:

1. **Check Coolify Logs:**
   - Coolify → Your App → Logs
   - Filter by "prisma" or "migration"

2. **Check Database Logs:**
   - Coolify → PostgreSQL Database → Logs

3. **Verify Environment Variables:**
   - Coolify → Your App → Environment Variables
   - Ensure `DATABASE_URL` is correct

4. **Test Connection:**
   ```bash
   # In Coolify terminal
   echo $DATABASE_URL
   psql $DATABASE_URL -c "SELECT version();"
   ```

---

**Last Updated:** October 20, 2025
**Status:** ✅ Prisma PostgreSQL di Coolify sudah ter-configure dengan benar!
