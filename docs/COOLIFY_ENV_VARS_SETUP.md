# Coolify Environment Variables Setup

**CRITICAL**: Set these environment variables in Coolify before deployment!

## 📋 Required Environment Variables

### 1. Database Configuration

```env
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

**Example** (using Coolify internal database):
```env
DATABASE_URL=postgresql://bagizi_user:your_secure_password@postgres-container:5432/bagizi_db
```

**Important Notes:**
- Use internal Docker network hostname (e.g., `postgres-container`)
- Do NOT use `localhost` or `127.0.0.1`
- Replace with your actual database credentials

### 2. Authentication Secrets

Generate secure secrets using:
```bash
openssl rand -base64 32
```

Then set:
```env
NEXTAUTH_SECRET=your_generated_secret_here_32_chars_minimum
AUTH_SECRET=your_generated_secret_here_32_chars_minimum
```

**Example** (generate two different secrets):
```env
NEXTAUTH_SECRET=Xz9kP2mN7vQ4sT8wL6jR3yH5bF1cG0dA
AUTH_SECRET=Yh7jK4nM9vP2sW6tL3qR8zX5cF1bG0dA
```

### 3. Application URL

```env
NEXTAUTH_URL=https://your-domain.com
```

**Examples:**
```env
# Production domain
NEXTAUTH_URL=https://bagizi.id

# Coolify-provided domain
NEXTAUTH_URL=https://bagizi-id.coolify.app

# Custom subdomain
NEXTAUTH_URL=https://app.bagizi.id
```

### 4. Node Environment

```env
NODE_ENV=production
```

## 🔧 Optional Environment Variables

### Redis (for session management)
```env
REDIS_URL=redis://redis-container:6379
```

### Demo Data Seeding
```env
SEED_DEMO_DATA=false
```

### Build Optimization (if memory issues)
```env
NODE_OPTIONS=--max_old_space_size=4096
```

## 📝 Complete Coolify Environment Variables

Copy and paste this template to Coolify, replacing values:

```env
# Database
DATABASE_URL=postgresql://bagizi_user:CHANGE_THIS_PASSWORD@postgres-container:5432/bagizi_db

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=CHANGE_THIS_SECRET_32_CHARS_MINIMUM
AUTH_SECRET=CHANGE_THIS_SECRET_32_CHARS_MINIMUM
NEXTAUTH_URL=https://your-domain.com

# Application
NODE_ENV=production

# Optional: Redis
# REDIS_URL=redis://redis-container:6379

# Optional: Build optimization
# NODE_OPTIONS=--max_old_space_size=4096
```

## 🚀 How to Set in Coolify

1. **Navigate to Application Settings**
   - Go to your Bagizi-ID application in Coolify
   - Click on "Environment" or "Settings" tab

2. **Add Environment Variables**
   - Click "Add Variable" or "Edit Variables"
   - Paste the template above
   - Replace all `CHANGE_THIS_*` placeholders with actual values

3. **Generate Secrets**
   ```bash
   # On your local machine or Coolify terminal
   openssl rand -base64 32  # For NEXTAUTH_SECRET
   openssl rand -base64 32  # For AUTH_SECRET
   ```

4. **Get Database URL**
   - If using Coolify database: Check database service details for hostname
   - Format: `postgresql://username:password@hostname:5432/database`

5. **Set Application URL**
   - Use your Coolify-provided domain or custom domain
   - Must match actual deployment URL
   - Include `https://` prefix

6. **Save and Redeploy**
   - Click "Save" or "Update"
   - Trigger new deployment for changes to take effect

## ✅ Verification

After setting environment variables:

1. **Check Deployment Logs**
   - Look for "Environment variables loaded" message
   - No errors about missing variables

2. **Test Database Connection**
   ```bash
   # In Coolify terminal/console
   npx prisma db pull  # Should connect successfully
   ```

3. **Test Application**
   - Homepage loads: `https://your-domain.com`
   - API health check: `https://your-domain.com/api/health`
   - Authentication works: Try login/register

## 🐛 Troubleshooting

### Error: "NEXTAUTH_SECRET is not set"
- Check if variable is actually set in Coolify
- Restart application after adding variable

### Error: "Database connection refused"
- Verify DATABASE_URL hostname (use internal Docker network name)
- Check database container is running
- Verify credentials are correct

### Error: "Invalid environment variables"
- Check for typos in variable names
- Ensure no extra spaces around `=` sign
- Use quotes if value contains special characters

### Error: "Prisma Client not generated"
- This should be fixed by the new build script
- If persists, manually run: `npx prisma generate`

## 📚 Security Best Practices

1. **Never commit secrets to Git**
   - Use `.env.local` for local development
   - Set production secrets only in Coolify

2. **Use strong random secrets**
   - Minimum 32 characters
   - Use cryptographically secure generation (openssl)

3. **Different secrets for different environments**
   - Development secrets ≠ Production secrets
   - Change secrets if compromised

4. **Regular rotation**
   - Rotate NEXTAUTH_SECRET every 90 days
   - Update AUTH_SECRET on security incidents

## 🔗 References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Auth.js Configuration](https://authjs.dev/getting-started/deployment)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Coolify Documentation](https://coolify.io/docs)

---

**Status**: Ready for production deployment  
**Last Updated**: October 22, 2025
