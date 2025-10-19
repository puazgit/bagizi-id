# Migration Error Fix - P3009

## Problem
```
Error: P3009
migrate found failed migrations in the target database
The `20251019150022_add_production_to_distribution_schedule` migration started but failed
```

## Root Cause
Migration started in production database but failed to complete, leaving it in a "failed" state. Prisma won't apply new migrations until the failed one is resolved.

## Solutions

### Solution 1: Automatic Fix (Deployed) ✅
The post-deployment script now automatically handles this:
- Detects failed migrations
- Marks them as rolled-back
- Retries the migration

**File:** `scripts/coolify-post-deploy.sh`

This will run automatically on next Coolify deployment.

### Solution 2: Manual Fix via Coolify Terminal

1. Go to Coolify → Your Application → Terminal
2. Run:
```bash
npx prisma migrate resolve --rolled-back 20251019150022_add_production_to_distribution_schedule
npx prisma migrate deploy
```

### Solution 3: Direct Database Fix

If you have direct database access:

```sql
-- Mark migration as rolled back
UPDATE "_prisma_migrations" 
SET finished_at = NOW(), 
    applied_steps_count = 0
WHERE migration_name = '20251019150022_add_production_to_distribution_schedule'
AND started_at IS NOT NULL 
AND finished_at IS NULL;
```

Then re-deploy in Coolify.

### Solution 4: Use Helper Script

Run locally (with production DATABASE_URL):
```bash
./scripts/fix-failed-migration.sh
```

## Verification

After fix, verify migration status:
```bash
npx prisma migrate status
```

Should show:
```
Database schema is up to date!
```

## Prevention

The new post-deployment script (`coolify-post-deploy.sh`) includes:
- ✅ Automatic failed migration detection
- ✅ Auto-resolve before retry
- ✅ Error handling
- ✅ Status checks

## Next Steps

1. ✅ Script updated and pushed (commit: fe0064f)
2. ⏳ Wait for Coolify to re-deploy
3. ✅ New deployment will auto-fix the failed migration
4. ✅ Verify deployment succeeds

## Related Files
- `scripts/coolify-post-deploy.sh` - Main deployment script
- `scripts/fix-failed-migration.sh` - Helper script for manual fix
- `scripts/fix-migration.sql` - SQL for direct database fix

## Coolify Configuration

Make sure your Coolify post-deployment command points to:
```bash
sh scripts/coolify-post-deploy.sh
```

Or update it to:
```bash
npx prisma migrate deploy && npx prisma generate
```

If you want to use the script, set permission first in Dockerfile or build step:
```bash
chmod +x scripts/coolify-post-deploy.sh
```
