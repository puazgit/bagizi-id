# 📜 Scripts Directory

Collection of utility scripts for Bagizi-ID development and deployment.

## 🗄️ Database Management Scripts

### `reset-database.sh`
**Purpose**: Full database reset with interactive confirmation  
**Usage**: 
```bash
./scripts/reset-database.sh
```
**Features**:
- ✅ Interactive confirmation prompts
- ✅ Safety checks to prevent production accidents
- ✅ Step-by-step progress indicators
- ✅ Automatic demo data seeding
- ✅ Colored output for better readability

**When to use**:
- Development environment reset
- After major schema changes
- Testing with fresh data
- Before running comprehensive tests

---

### `coolify-reset-db.sh`
**Purpose**: Quick database reset for Coolify (no prompts)  
**Usage in Coolify Terminal**:
```bash
cd /app
bash scripts/coolify-reset-db.sh
```
**Features**:
- ✅ Non-interactive (runs automatically)
- ✅ Optimized for Coolify environment
- ✅ Fast execution (~30-60 seconds)
- ✅ Includes demo data seeding

**When to use**:
- Coolify staging environment
- Quick reset via Coolify terminal
- Automated deployment pipelines
- Testing in cloud environment

**⚠️ Warning**: This script has NO confirmation prompt. Use with caution!

---

## 🚀 Deployment Scripts

### `coolify-post-deploy.sh`
**Purpose**: Post-deployment tasks in Coolify  
**Automatic execution**: Runs after every deployment  
**Tasks**:
- Database migrations
- Prisma client generation
- Cache clearing
- Health checks

### `coolify-post-deploy-minimal.sh`
**Purpose**: Minimal post-deploy (migrations only)  
**Use case**: When you need fast deployments

---

## 🧪 Testing Scripts

### `test-production-access.sh`
**Purpose**: Test production access controls  
**Usage**:
```bash
./scripts/test-production-access.sh
```
**Tests**:
- RBAC middleware
- Authentication flows
- Authorization checks

### `test-approval.sh`
**Purpose**: Test approval workflows  
**Usage**:
```bash
./scripts/test-approval.sh
```

### `test-sppg-endpoint.sh`
**Purpose**: Test SPPG API endpoints  
**Usage**:
```bash
bash scripts/test-sppg-endpoint.sh
```

---

## 🔍 Debugging Scripts

### `debug-production-access.sh`
**Purpose**: Debug production access issues  
**Usage**:
```bash
./scripts/debug-production-access.sh
```
**Output**: Detailed access logs and permission checks

### `check-production-debug.sh`
**Purpose**: Check for debug code in production  
**Usage**:
```bash
./scripts/check-production-debug.sh
```
**Checks**:
- Console.log statements
- Debug comments
- Development-only code

---

## 🔧 Maintenance Scripts

### `audit-schema.sh`
**Purpose**: Audit Prisma schema for issues  
**Usage**:
```bash
./scripts/audit-schema.sh
```
**Checks**:
- Schema consistency
- Index optimization
- Relationship integrity

### `force-refresh.sh`
**Purpose**: Force refresh application state  
**Usage**:
```bash
bash scripts/force-refresh.sh
```

### `fix-failed-migration.sh`
**Purpose**: Fix failed Prisma migrations  
**Usage**:
```bash
./scripts/fix-failed-migration.sh
```

---

## 📊 Development Scripts

### `verify-implementation.sh`
**Purpose**: Verify feature implementation completeness  
**Usage**:
```bash
./scripts/verify-implementation.sh
```

### `show-refactoring-complete.sh`
**Purpose**: Show refactoring progress summary  
**Usage**:
```bash
./scripts/show-refactoring-complete.sh
```

---

## 🎯 Quick Reference

### Common Tasks

#### Reset Local Database
```bash
./scripts/reset-database.sh
```

#### Reset Coolify Database
```bash
# SSH into Coolify
ssh coolify@your-server.com

# Navigate to app
cd /app

# Run reset
bash scripts/coolify-reset-db.sh
```

#### Run Tests
```bash
# Production access tests
./scripts/test-production-access.sh

# Approval workflow tests
./scripts/test-approval.sh

# SPPG endpoint tests
bash scripts/test-sppg-endpoint.sh
```

#### Debug Issues
```bash
# Check production debug code
./scripts/check-production-debug.sh

# Debug access issues
./scripts/debug-production-access.sh

# Audit schema
./scripts/audit-schema.sh
```

---

## 🛡️ Safety Guidelines

### Before Running Scripts

1. **Read the script** - Understand what it does
2. **Check environment** - Ensure you're in correct environment
3. **Backup data** - Create backup if modifying database
4. **Test in staging** - Test scripts in staging first
5. **Monitor output** - Watch for errors or warnings

### Production Safety

❌ **NEVER run these in production**:
- `reset-database.sh`
- `coolify-reset-db.sh`
- Any script with "reset" or "force" in name

✅ **Safe for production**:
- `coolify-post-deploy.sh`
- Migration scripts
- Monitoring scripts

---

## 📝 Adding New Scripts

### Script Template

```bash
#!/bin/bash

###############################################################################
# Script Name
# 
# Description of what the script does
#
# Usage:
#   ./scripts/script-name.sh [options]
#
# Author: Bagizi-ID Development Team
# Version: 1.0.0
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Your script logic here
echo -e "${BLUE}Starting script...${NC}"

# Error handling
if [ $? -ne 0 ]; then
  echo -e "${RED}Error occurred!${NC}"
  exit 1
fi

echo -e "${GREEN}Success!${NC}"
```

### Checklist for New Scripts

- [ ] Clear purpose and description
- [ ] Usage instructions in header
- [ ] Proper error handling
- [ ] Colored output for readability
- [ ] Safety checks (especially for destructive operations)
- [ ] Documentation in this README
- [ ] Make executable: `chmod +x scripts/script-name.sh`

---

## 🔗 Related Documentation

- [Coolify Database Reset Guide](../docs/COOLIFY_DATABASE_RESET_GUIDE.md)
- [Coolify Deployment Checklist](../docs/COOLIFY_DEPLOYMENT_CHECKLIST.md)
- [Prisma Migration Guide](../docs/COOLIFY_PRISMA_MIGRATION_GUIDE.md)

---

**Last Updated**: October 25, 2025  
**Maintainer**: Bagizi-ID Development Team
