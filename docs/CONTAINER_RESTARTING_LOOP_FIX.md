# Container Restarting Loop - Deployment Failed

## Error
```
Error response from daemon: Container [...] is restarting, 
wait until the container is running
```

## Root Cause
Container aplikasi restart continuously, membuat pre-deployment command tidak bisa dijalankan.

## Immediate Solutions

### Solution 1: Remove Pre-Deployment Command ⭐ (RECOMMENDED)

**Steps:**
1. Go to Coolify → Your Application → Settings
2. Find **"Pre-Deployment Command"** field
3. **Delete or comment out** the command:
   ```bash
   # Remove this:
   npx prisma generate
   ```
4. Leave field **empty** or use:
   ```bash
   echo "Skipping pre-deployment"
   ```
5. Click **Save**
6. Click **Redeploy**

**Why this works:**
- Prisma Client is already generated during build
- No need to generate again at runtime
- Removes dependency on running container

---

### Solution 2: Fix Post-Deployment Command Only

Keep only the essential migration command:

**In Coolify → Post-Deployment Command:**
```bash
npx prisma migrate deploy
```

Remove `npx prisma generate` from here too - it's redundant!

---

### Solution 3: Check Application Logs

If removing pre-deployment doesn't help, check why container is restarting:

1. Go to Coolify → Your Application → **Logs**
2. Look for error messages like:
   - `Error: Cannot connect to database`
   - `Error: Missing environment variable`
   - `EADDRINUSE: Port already in use`

Common fixes:
- **Database connection:** Check `DATABASE_URL` in environment variables
- **Missing env vars:** Ensure all required variables are set
- **Port conflict:** Change `PORT` environment variable

---

### Solution 4: Simplify Deployment Process

Update Coolify settings to minimal configuration:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start
```

**Pre-Deployment Command:**
```bash
# Leave empty or:
echo "No pre-deployment needed"
```

**Post-Deployment Command:**
```bash
npx prisma migrate deploy || echo "Migration failed but continuing"
```

---

## Verification Steps

After applying solution:

1. ✅ Click **Redeploy** in Coolify
2. ✅ Wait for build to complete
3. ✅ Check logs - should see:
   ```
   ✓ Compiled successfully
   Ready on http://0.0.0.0:3000
   ```
4. ✅ No restart loops
5. ✅ Application accessible

---

## Prevention

### Best Practices for Coolify + Next.js + Prisma:

1. **Build Stage:**
   - ✅ `npm install` - Install all dependencies
   - ✅ `npx prisma generate` - Generate client during build
   - ✅ `npm run build` - Build Next.js app

2. **Pre-Deployment:**
   - ❌ Don't run `npx prisma generate` (already done in build)
   - ❌ Don't run migrations (risky during traffic)

3. **Post-Deployment:**
   - ✅ Run `npx prisma migrate deploy` (safe, idempotent)
   - ✅ Handle errors gracefully with `|| true`

4. **Start Command:**
   - ✅ `npm run start` (production server)
   - ✅ or `node .next/standalone/server.js` (standalone mode)

---

## Environment Variables to Check

Ensure these are set in Coolify:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Next.js
NODE_ENV=production
PORT=3000

# Auth (if using)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
```

---

## Rollback if Needed

If deployment keeps failing:

1. Go to Coolify → Deployments tab
2. Find last **successful deployment**
3. Click **"Redeploy this version"**
4. Fix issues locally
5. Push new fix

---

## Related Files

- `package.json` - Check build/start scripts
- `next.config.ts` - Check Next.js configuration
- `prisma/schema.prisma` - Check database schema
- `scripts/coolify-post-deploy.sh` - Post-deployment script

---

## Quick Command Reference

```bash
# Local testing
npm run build && npm run start

# Check if Prisma Client exists
ls -la node_modules/.prisma/client

# Test database connection
npx prisma db pull

# Test migration
npx prisma migrate deploy --preview-feature
```

---

## Contact Support

If issue persists:
1. Share full deployment logs from Coolify
2. Share application logs (last 100 lines)
3. Share environment variables (redacted)
4. Share `package.json` build scripts
