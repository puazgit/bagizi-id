# Coolify Deployment Troubleshooting Guide

## Issue: Post-Deployment Command Failing

### Quick Fix Options

#### Option 1: Update Coolify Post-Deployment Command

In Coolify → Application Settings → Post-Deployment Command, use ONE of these:

**Minimal (Recommended):**
```bash
npx prisma migrate resolve --rolled-back 20251019150022_add_production_to_distribution_schedule || true && npx prisma migrate deploy && npx prisma generate
```

**Using Script:**
```bash
sh scripts/coolify-post-deploy-minimal.sh
```

**Full Script:**
```bash
bash scripts/coolify-post-deploy.sh
```

---

#### Option 2: Manual Fix via Coolify Terminal

1. Go to Coolify → Your Application → Terminal
2. Run these commands:

```bash
# Fix failed migration
npx prisma migrate resolve --rolled-back 20251019150022_add_production_to_distribution_schedule

# Deploy migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Restart application (if needed)
pm2 restart all
```

---

#### Option 3: Direct Database Access

If you have PostgreSQL access:

```sql
-- Connect to your production database
-- psql -h HOST -U USER -d DATABASE

-- Mark migration as rolled back
UPDATE "_prisma_migrations" 
SET finished_at = NOW(), 
    applied_steps_count = 0
WHERE migration_name = '20251019150022_add_production_to_distribution_schedule'
AND started_at IS NOT NULL 
AND finished_at IS NULL;

-- Verify
SELECT migration_name, started_at, finished_at 
FROM "_prisma_migrations" 
WHERE migration_name LIKE '%20251019%';
```

Then redeploy in Coolify.

---

#### Option 4: Reset Migration (Nuclear Option)

⚠️ **WARNING: Only use if other options fail!**

```bash
# In Coolify Terminal:

# 1. Drop the migration table (will lose migration history)
npx prisma migrate reset --force

# 2. Re-apply all migrations
npx prisma migrate deploy

# 3. Generate client
npx prisma generate
```

---

## Verification Steps

After applying any fix:

```bash
# Check migration status
npx prisma migrate status

# Should show:
# "Database schema is up to date!"

# Check if application starts
npm run start
# or
pm2 list
```

---

## Common Errors & Solutions

### Error: "P3009 - failed migrations found"
**Solution:** Use Option 1 or 2 above

### Error: "Can't reach database server"
**Solution:** Check DATABASE_URL in Coolify environment variables

### Error: "Migration file not found"
**Solution:** Ensure migrations are committed to git and deployed

### Error: "Permission denied: scripts/coolify-post-deploy.sh"
**Solution:** Use inline command (Option 1 - Minimal) instead of script

---

## Best Practices for Coolify

1. **Always use inline commands** when possible (more reliable than scripts)
2. **Use `|| true`** to prevent script failure from blocking deployment
3. **Keep post-deployment commands simple** - complex logic should be in application startup
4. **Test migrations locally** before deploying
5. **Use `prisma db push`** for development, `prisma migrate deploy` for production

---

## Emergency Rollback

If deployment is completely broken:

1. In Coolify, go to Deployments tab
2. Find the last working deployment
3. Click "Redeploy" on that version
4. Fix the issue locally
5. Commit and push the fix
6. Redeploy latest version

---

## Contact & Support

- Check Coolify logs: Application → Logs
- Check database logs: Database → Logs  
- Prisma docs: https://www.prisma.io/docs/guides/migrate/production-troubleshooting

---

## Files Reference

- Main script: `scripts/coolify-post-deploy.sh`
- Minimal script: `scripts/coolify-post-deploy-minimal.sh`
- SQL fix: `scripts/fix-migration.sql`
- Helper script: `scripts/fix-failed-migration.sh`
