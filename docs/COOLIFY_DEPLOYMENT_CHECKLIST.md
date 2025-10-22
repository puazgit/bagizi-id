# Coolify Deployment Checklist - Quick Reference

**Use this checklist before and during Coolify deployment**

## 🔴 CRITICAL - Before Push to Git

- [x] `package.json` updated with `postinstall` script
- [x] Build script includes `prisma generate`
- [x] Turbopack removed from production build
- [x] Changes committed to main branch
- [x] Changes pushed to origin/main

## 🟡 IMPORTANT - Coolify Configuration

### Environment Variables (MUST SET!)

- [ ] `DATABASE_URL` configured with internal Docker hostname
- [ ] `NEXTAUTH_SECRET` set (generate with `openssl rand -base64 32`)
- [ ] `AUTH_SECRET` set (generate with `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NODE_ENV=production` set

### Database Setup

- [ ] PostgreSQL database created in Coolify
- [ ] Database container running
- [ ] Database accessible from app container
- [ ] Credentials match `DATABASE_URL`

### Build Configuration

- [ ] Build command: `npm run build` (default should work)
- [ ] Start command: `npm start` (default should work)
- [ ] Port: `3000` (default should work)
- [ ] Build timeout: At least 5 minutes

## 🟢 OPTIONAL - Additional Configuration

- [ ] Redis configured (if needed for sessions)
- [ ] `NODE_OPTIONS=--max_old_space_size=4096` (if memory issues)
- [ ] Custom domain configured
- [ ] SSL/HTTPS enabled
- [ ] Health check endpoint configured

## 📋 Deployment Process

1. **Trigger Deployment**
   - [ ] Coolify detected git push automatically
   - [ ] Or manually trigger deployment in Coolify

2. **Monitor Build**
   - [ ] Watch build logs in Coolify dashboard
   - [ ] Look for "Prisma generated successfully"
   - [ ] Look for "Next.js build completed"
   - [ ] No errors in build logs

3. **Check Build Success**
   - [ ] Build completed without errors
   - [ ] Container started successfully
   - [ ] Application is "Running" in Coolify

4. **Run Database Migrations**
   ```bash
   # In Coolify console/terminal
   npx prisma migrate deploy
   ```
   - [ ] Migrations applied successfully
   - [ ] All tables created

5. **Seed Database (Optional)**
   ```bash
   # In Coolify console/terminal
   npx prisma db seed
   ```
   - [ ] Demo data loaded (if desired)

## ✅ Post-Deployment Verification

### Application Health

- [ ] Homepage loads: `https://your-domain.com`
- [ ] No 500 errors
- [ ] No "Application Error" page
- [ ] Footer and header render correctly

### API Endpoints

- [ ] `/api/health` responds (create if doesn't exist)
- [ ] `/api/auth/signin` loads
- [ ] API calls work (check browser console)

### Database

- [ ] Database connection works
- [ ] Can query tables
- [ ] No Prisma errors in logs

### Authentication

- [ ] Login page loads
- [ ] Can register new user (if enabled)
- [ ] Can login with test account
- [ ] Sessions persist after login

### Dashboard (SPPG)

- [ ] `/dashboard` loads after login
- [ ] Menu management works
- [ ] Data displays correctly
- [ ] No API errors in console

## 🐛 Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| Build timeout | Increase build timeout to 10 minutes |
| Prisma Client not found | Check `postinstall` script exists |
| Database connection refused | Use internal Docker hostname (not localhost) |
| NEXTAUTH_SECRET missing | Add to Coolify environment variables |
| 500 Error on homepage | Check application logs in Coolify |
| API returns 404 | Verify Next.js API routes deployed |

## 📞 When to Ask for Help

- Build fails after 3+ attempts
- Database migrations fail
- Application won't start
- Persistent 500 errors
- Authentication doesn't work

## 🚀 Success Criteria

**You're ready for production when:**

- ✅ Build completes in <5 minutes
- ✅ Application starts without errors
- ✅ Homepage loads in <3 seconds
- ✅ Database migrations applied
- ✅ Authentication working
- ✅ Dashboard accessible after login
- ✅ No errors in application logs
- ✅ No errors in browser console

## 📝 Quick Commands

### Generate Secrets
```bash
openssl rand -base64 32
```

### Check Database Connection
```bash
npx prisma db pull
```

### Run Migrations
```bash
npx prisma migrate deploy
```

### Seed Database
```bash
npx prisma db seed
```

### Check Application Logs
```bash
# In Coolify console
docker logs -f <container-name>
```

### Restart Application
```bash
# In Coolify dashboard
Click "Restart" button
```

## 🔗 Documentation References

- [COOLIFY_DEPLOYMENT_FIX.md](./COOLIFY_DEPLOYMENT_FIX.md) - Detailed fix explanation
- [COOLIFY_ENV_VARS_SETUP.md](./COOLIFY_ENV_VARS_SETUP.md) - Environment variables guide
- [.env.example](../.env.example) - Environment variables template

---

**Print this checklist and check off items as you go!**

**Last Updated**: October 22, 2025
