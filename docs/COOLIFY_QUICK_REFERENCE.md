# 🚀 Coolify Quick Reference - Database Reset & Seed

## ⚡ Quick Reset (One Command)

```bash
cd /app && bash scripts/coolify-reset-db.sh
```

---

## 📋 Step-by-Step Manual Reset

### 1. Access Coolify Terminal
```
Coolify Dashboard → Your Service → Terminal
```

### 2. Navigate to App
```bash
cd /app
```

### 3. Run Commands
```bash
# Generate Prisma Client
npx prisma generate

# Reset Database
npx prisma migrate reset --force --skip-seed

# Apply Migrations
npx prisma migrate deploy

# Seed with Demo Data
SEED_DEMO_DATA=true npx tsx prisma/seed.ts
```

---

## 🔧 Common Commands

### Check Database Status
```bash
npx prisma migrate status
```

### View Database (Prisma Studio)
```bash
npx prisma studio
```
Access: `https://your-app.coolify.io:5555`

### Check Environment Variables
```bash
echo $DATABASE_URL
echo $NODE_ENV
```

### View Logs
```bash
tail -f /app/logs/*.log
```

---

## 🎭 Demo Credentials (After Seed)

### Platform Superadmin
- Email: `superadmin@bagizi.id`
- Password: `Admin123!@#`

### SPPG Admin (Demo)
- Email: `admin@demo.sppg.id`
- Password: `Demo123!@#`

### SPPG Ahli Gizi (Demo)
- Email: `gizi@demo.sppg.id`
- Password: `Demo123!@#`

---

## ⚠️ Safety Checks

### Before Reset
- [ ] Confirm environment (NOT production!)
- [ ] Check `NODE_ENV` value
- [ ] Create backup if needed

### Prevent Production Reset
Add to script:
```bash
if [ "$NODE_ENV" = "production" ]; then
  echo "❌ Cannot reset production!"
  exit 1
fi
```

---

## 🆘 Troubleshooting

### Script Permission Denied
```bash
chmod +x scripts/coolify-reset-db.sh
```

### DATABASE_URL Not Set
```bash
# Check Coolify → Environment Variables
# Add: DATABASE_URL=postgresql://...
```

### Prisma Client Not Found
```bash
npx prisma generate
```

### Migration Fails
```bash
# Check connection
npx prisma db pull

# Force resolve
npx prisma migrate resolve --rolled-back "migration_name"
```

---

## 📞 Support

- **Docs**: `docs/COOLIFY_DATABASE_RESET_GUIDE.md`
- **Scripts**: `scripts/README.md`
- **GitHub**: `yasunstudio/bagizi-id`

---

**Print this card** or save for quick reference during Coolify operations.
