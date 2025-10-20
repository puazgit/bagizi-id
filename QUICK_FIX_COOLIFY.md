# ✅ Coolify Deployment - WORKING CONFIGURATION

## 🎉 Status: Production Ready!

**Last Successful Deployment:** Oct 20, 2025 05:06 AM
**Commit:** `66a955738e42ae6e956b1df414f3d86f43673c0d`
**Build Time:** ~4 minutes
**Status:** All systems operational ✅

---

## 📋 Current Working Configuration

### ✅ Pre-Deployment Command
```bash
npx prisma generate
```

### ✅ Post-Deployment Command
```bash
npx prisma migrate deploy && npx prisma db seed
```

### ✅ Environment Variables
- `DATABASE_URL`: postgres://bagiziuser:***@wswwgcgw8koo48c08k4wscc0:5432/bagizidb
- `NEXTAUTH_SECRET`: Configured ✓
- `NEXTAUTH_URL`: https://bagizi.id ✓
- `REDIS_URL`: Configured ✓
- `NODE_ENV`: production ✓

---

## 🚀 Normal Deployment Workflow

### Untuk Deploy Changes Baru:

1. **Local Development:**
   ```bash
   # Edit code
   git add .
   git commit -m "feat: describe your changes"
   git push origin main
   ```

2. **Coolify:** Otomatis detect push dan deploy ✅

3. **Monitor:** Check logs di Coolify dashboard

**That's it!** Tidak perlu manual intervention.

---

## 🔧 Troubleshooting Quick Fixes

### Issue: Migration Failed

**Coolify → Post-Deployment Command**, tambahkan error handling:
```bash
npx prisma migrate resolve --rolled-back MIGRATION_NAME || true && npx prisma migrate deploy && npx prisma db seed
```

Ganti `MIGRATION_NAME` dengan nama migration yang error.

---

### Issue: Build Failed

**Check:**
1. TypeScript errors: `npm run build` di local
2. Dependencies: `npm ci` success?
3. Environment variables: Semua sudah set?

**Quick Fix:**
```bash
# Di Coolify terminal
npx prisma generate
npm run build
```

---

### Issue: Database Connection Error

**Verify Connection:**
```bash
# Di Coolify terminal
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT version();"
```

**Check:**
- Database service running di Coolify?
- Network: Application dan Database di network `coolify`?
- Credentials: User/password correct?

---

## 🎯 Fresh Setup Guide

Jika setup Coolify dari awal untuk aplikasi baru:

### 1. Create PostgreSQL Database
- Coolify → Resources → Create PostgreSQL
- Note: Host, Port, Database name, User, Password

### 2. Set Environment Variables
```bash
DATABASE_URL=postgres://user:pass@host:5432/dbname
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://yourdomain.com
```

### 3. Configure Deployment Commands

**Pre-Deployment:**
```bash
npx prisma generate
```

**Post-Deployment:**
```bash
npx prisma migrate deploy && npx prisma db seed
```

### 4. Deploy!
Push ke git → Coolify auto-deploy ✅

---

## 📚 Documentation

Untuk panduan lengkap, lihat:

- **Prisma Migration Guide:** `docs/COOLIFY_PRISMA_MIGRATION_GUIDE.md`
- **Quick Reference:** `PRISMA_COOLIFY_QUICKSTART.md`
- **Deployment Logs:** Coolify Dashboard → Your App → Logs

---

## 🎓 Common Commands

### Local Development:
```bash
# Create migration
npx prisma migrate dev --name feature_name

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset
```

### Coolify Terminal:
```bash
# Check migration status
npx prisma migrate status

# Manual deploy
npx prisma migrate deploy

# Test connection
psql $DATABASE_URL -c "SELECT NOW();"

# View migrations
psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations;"
```

---

## ✅ Deployment Success Indicators

Look for these in Coolify logs:

```
✓ Generated Prisma Client (v6.17.1) in 4.12s
✓ Compiled successfully in 33.3s
✓ Generating static pages (47/47)
No pending migrations to apply
Container aoc0woco04os0k44o0w4808g-050231288989 Started
Rolling update completed
```

---

## 🆘 Need Help?

1. **Check Logs:** Coolify → Your App → Logs
2. **Database Logs:** Coolify → PostgreSQL → Logs  
3. **Build Logs:** Look for red error messages
4. **Test Locally:** `npm run build` should succeed

**If still stuck:** Paste full error log untuk diagnosis.

---

**Configuration Status:** ✅ PRODUCTION READY
**Last Updated:** October 20, 2025
**Next Steps:** Just push to git, Coolify handles the rest! 🚀
