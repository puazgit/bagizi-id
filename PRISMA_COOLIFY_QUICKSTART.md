# ⚡ Quick Reference: Prisma PostgreSQL di Coolify

## 🎯 TL;DR - Setup Anda Sudah Benar!

Berdasarkan deployment log terakhir (Oct 20, 2025):
- ✅ PostgreSQL connected: `bagizidb@wswwgcgw8koo48c08k4wscc0:5432`
- ✅ Prisma migrations: Working correctly
- ✅ Post-deployment: `prisma migrate deploy` ✓

**Status:** Tidak perlu migrasi lagi, sudah production-ready! 🎉

---

## 🚀 3 Skenario Umum

### 1️⃣ Deploy Schema Changes (Normal Flow)

**Local:**
```bash
# 1. Buat migration baru
npx prisma migrate dev --name add_new_feature

# 2. Test locally
npm run dev

# 3. Commit & push
git add prisma/
git commit -m "feat: add new feature"
git push origin main
```

**Coolify:** Otomatis deploy ✅ (via post-deployment command)

---

### 2️⃣ Fix Failed Migration

**Jika deployment error:**

**Coolify → Post-Deployment Command:**
```bash
npx prisma migrate resolve --rolled-back MIGRATION_NAME || true && npx prisma migrate deploy
```

Ganti `MIGRATION_NAME` dengan nama migration yang error.

---

### 3️⃣ Fresh Database Setup (Database Baru)

**One-time setup di Coolify:**

1. **Add Environment Variable:**
   ```
   DATABASE_URL=postgres://user:pass@host:5432/dbname
   ```

2. **Pre-Deployment Command:**
   ```bash
   npx prisma generate
   ```

3. **Post-Deployment Command:**
   ```bash
   npx prisma migrate deploy && npx prisma db seed
   ```

4. **Deploy** → Done! ✅

---

## 🔧 Troubleshooting 1-Liner Fixes

| Problem | Quick Fix Command |
|---------|------------------|
| Migration failed | `npx prisma migrate resolve --rolled-back MIGRATION_NAME` |
| Connection error | Check `echo $DATABASE_URL` in Coolify terminal |
| Permission denied | Run as postgres: `GRANT ALL ON SCHEMA public TO bagiziuser;` |
| Seed failed | Change to: `npx prisma db seed \|\| true` |
| Schema drift | `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` |

---

## 📋 Current Coolify Configuration

**✅ Working Setup (Your Current Config):**

**Pre-Deployment:**
```bash
npx prisma generate
```

**Post-Deployment:**
```bash
npx prisma migrate deploy && npx prisma db seed
```

**Environment Variables:**
- `DATABASE_URL`: ✅ Configured
- `NEXTAUTH_SECRET`: ✅ Configured  
- `NEXTAUTH_URL`: ✅ Configured

---

## 🎓 Development Workflow

```bash
# 1. Schema changes di local
vim prisma/schema.prisma

# 2. Generate migration
npx prisma migrate dev --name describe_change

# 3. Test
npm run dev

# 4. Commit
git add prisma/
git commit -m "feat: describe change"

# 5. Push → Coolify auto-deploy
git push origin main
```

---

## 🆘 Emergency Commands (Coolify Terminal)

```bash
# Check migration status
npx prisma migrate status

# View last migrations
psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"

# Force resolve (CAREFUL!)
npx prisma migrate resolve --applied $(ls prisma/migrations | tail -1)

# Manual deploy
npx prisma migrate deploy

# Test connection
psql $DATABASE_URL -c "SELECT NOW();"
```

---

## 📊 Migration Checklist

Sebelum push ke production:

- [ ] Migration tested di local: `npx prisma migrate dev`
- [ ] No TypeScript errors: `npm run build`
- [ ] Seed script updated (jika perlu)
- [ ] Backup database di Coolify (jika major changes)
- [ ] Migration file reviewed: `prisma/migrations/*/migration.sql`
- [ ] Rollback plan ready (for critical changes)

---

## 🎯 Next Steps for You

**Anda tidak perlu melakukan apa-apa!** Setup Anda sudah sempurna. 

Untuk perubahan schema di masa depan:
1. Edit `prisma/schema.prisma` di local
2. Run `npx prisma migrate dev --name change_description`
3. Push ke git → Coolify otomatis deploy

---

## 📚 Full Documentation

Lihat: `docs/COOLIFY_PRISMA_MIGRATION_GUIDE.md` untuk panduan lengkap.

---

**Last Check:** Oct 20, 2025 05:06 AM
**Status:** ✅ All systems operational!
