#!/bin/bash

###############################################################################
# SPPG Phase 1 - Pre-Execution Setup Script
# 
# Purpose: Automate environment setup for Phase 1 implementation
# Usage: ./scripts/phase1-pre-execution-setup.sh
# 
# This script will:
# 1. Create staging database from production backup
# 2. Setup feature flags
# 3. Create Git branch structure
# 4. Generate GitHub issues
# 5. Configure monitoring placeholders
# 
# Author: Bagizi-ID Team
# Date: October 21, 2025
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

###############################################################################
# STEP 1: VERIFY PREREQUISITES
###############################################################################

print_header "STEP 1: Verifying Prerequisites"

# Check if running from project root
if [ ! -f "package.json" ]; then
    print_error "Must run from project root directory"
    exit 1
fi
print_success "Running from project root"

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js installed: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found"
    exit 1
fi
print_success "npm installed"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "psql not found in PATH. Database steps will be skipped."
    SKIP_DB=true
else
    print_success "PostgreSQL client installed"
    SKIP_DB=false
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git not found"
    exit 1
fi
print_success "Git installed"

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Not on main branch (currently on: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "On main branch"
fi

###############################################################################
# STEP 2: CREATE FEATURE BRANCH
###############################################################################

print_header "STEP 2: Creating Feature Branch"

FEATURE_BRANCH="feature/sppg-phase1-fixes"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
    print_warning "Branch '$FEATURE_BRANCH' already exists"
    read -p "Delete and recreate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D $FEATURE_BRANCH
        print_info "Deleted existing branch"
    else
        print_info "Using existing branch"
        git checkout $FEATURE_BRANCH
    fi
else
    # Pull latest changes
    print_info "Pulling latest changes from main..."
    git pull origin main
    
    # Create new branch
    git checkout -b $FEATURE_BRANCH
    print_success "Created branch: $FEATURE_BRANCH"
fi

###############################################################################
# STEP 3: SETUP FEATURE FLAGS
###############################################################################

print_header "STEP 3: Setting Up Feature Flags"

# Create feature flags file
mkdir -p src/lib

cat > src/lib/feature-flags.ts << 'EOF'
/**
 * Feature Flags for SPPG Phase 1 Implementation
 * 
 * Controls progressive rollout of Phase 1 fixes
 * Toggle via environment variables
 */

export const PHASE1_FEATURE_FLAGS = {
  // Fix #1: MenuIngredient-InventoryItem Link
  MENU_INGREDIENT_FIX: process.env.NEXT_PUBLIC_FF_MENU_INGREDIENT === 'true',
  
  // Fix #2: ProcurementItem-InventoryItem Link
  PROCUREMENT_ITEM_FIX: process.env.NEXT_PUBLIC_FF_PROCUREMENT_ITEM === 'true',
  
  // Fix #3: FoodProduction Cost Calculation
  PRODUCTION_COST_FIX: process.env.NEXT_PUBLIC_FF_PRODUCTION_COST === 'true',
  
  // Fix #4-5: Distribution Flow Complete
  DISTRIBUTION_FLOW_FIX: process.env.NEXT_PUBLIC_FF_DISTRIBUTION_FLOW === 'true',
  
  // Fix #6: Procurement Supplier Cleanup
  PROCUREMENT_SUPPLIER_FIX: process.env.NEXT_PUBLIC_FF_PROCUREMENT_SUPPLIER === 'true',
  
  // Fix #7: MenuPlan Approval Workflow
  MENU_PLAN_APPROVAL_FIX: process.env.NEXT_PUBLIC_FF_MENU_PLAN_APPROVAL === 'true',
  
  // Fix #8: SchoolBeneficiary Address Standardization
  SCHOOL_ADDRESS_FIX: process.env.NEXT_PUBLIC_FF_SCHOOL_ADDRESS === 'true',
} as const

/**
 * Check if a specific Phase 1 fix is enabled
 */
export function isPhase1FixEnabled(fixName: keyof typeof PHASE1_FEATURE_FLAGS): boolean {
  return PHASE1_FEATURE_FLAGS[fixName] ?? false
}

/**
 * Get all enabled Phase 1 fixes
 */
export function getEnabledPhase1Fixes(): string[] {
  return Object.entries(PHASE1_FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([name, _]) => name)
}

/**
 * Check if any Phase 1 fix is enabled
 */
export function hasAnyPhase1FixEnabled(): boolean {
  return Object.values(PHASE1_FEATURE_FLAGS).some(enabled => enabled)
}
EOF

print_success "Created src/lib/feature-flags.ts"

# Add feature flags to .env.example
if [ -f ".env.example" ]; then
    print_info "Adding feature flags to .env.example..."
    
    cat >> .env.example << 'EOF'

# ============================================================================
# SPPG PHASE 1 FEATURE FLAGS
# ============================================================================
# Progressive rollout controls for Phase 1 critical fixes
# Set to 'true' to enable each fix

# Fix #1: MenuIngredient-InventoryItem Link (Week 1)
NEXT_PUBLIC_FF_MENU_INGREDIENT=false

# Fix #2: ProcurementItem-InventoryItem Link (Week 1)
NEXT_PUBLIC_FF_PROCUREMENT_ITEM=false

# Fix #3: FoodProduction Cost Calculation (Week 2)
NEXT_PUBLIC_FF_PRODUCTION_COST=false

# Fix #4-5: Distribution Flow Complete (Week 2-3)
NEXT_PUBLIC_FF_DISTRIBUTION_FLOW=false

# Fix #6: Procurement Supplier Cleanup (Week 2)
NEXT_PUBLIC_FF_PROCUREMENT_SUPPLIER=false

# Fix #7: MenuPlan Approval Workflow (Week 4)
NEXT_PUBLIC_FF_MENU_PLAN_APPROVAL=false

# Fix #8: SchoolBeneficiary Address Standardization (Week 4)
NEXT_PUBLIC_FF_SCHOOL_ADDRESS=false
EOF
    
    print_success "Added feature flags to .env.example"
else
    print_warning ".env.example not found. Please add feature flags manually."
fi

# Add to .env.local if it exists
if [ -f ".env.local" ]; then
    print_info "Adding feature flags to .env.local..."
    
    # Check if flags already exist
    if grep -q "NEXT_PUBLIC_FF_MENU_INGREDIENT" .env.local; then
        print_warning "Feature flags already exist in .env.local"
    else
        cat >> .env.local << 'EOF'

# SPPG PHASE 1 FEATURE FLAGS (Development - All Disabled Initially)
NEXT_PUBLIC_FF_MENU_INGREDIENT=false
NEXT_PUBLIC_FF_PROCUREMENT_ITEM=false
NEXT_PUBLIC_FF_PRODUCTION_COST=false
NEXT_PUBLIC_FF_DISTRIBUTION_FLOW=false
NEXT_PUBLIC_FF_PROCUREMENT_SUPPLIER=false
NEXT_PUBLIC_FF_MENU_PLAN_APPROVAL=false
NEXT_PUBLIC_FF_SCHOOL_ADDRESS=false
EOF
        print_success "Added feature flags to .env.local"
    fi
fi

###############################################################################
# STEP 4: CREATE PR TEMPLATE
###############################################################################

print_header "STEP 4: Creating Pull Request Template"

mkdir -p .github

cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
# SPPG Phase 1 - Fix #[X]: [Fix Name]

## 📋 Fix Information

**Fix Number**: #[X]  
**Priority**: 🔥 [CRITICAL/HIGH/MEDIUM/LOW]  
**Effort**: [X] hours  
**Dependencies**: [List dependencies or "None"]

## 🎯 Changes

### Schema Changes
- [ ] Database migration implemented
- [ ] Migration tested on staging
- [ ] Rollback procedure tested

### Service Layer
- [ ] New services created
- [ ] Existing services updated
- [ ] Business logic tested

### API Routes
- [ ] New API endpoints created
- [ ] Existing endpoints updated
- [ ] API documentation updated

### UI Components
- [ ] New components created
- [ ] Existing components updated
- [ ] shadcn/ui components used

### Testing
- [ ] Unit tests added (target: >85% coverage)
- [ ] Integration tests added
- [ ] E2E tests added (if applicable)
- [ ] All tests passing locally

## ✅ Pre-Merge Checklist

### Code Quality
- [ ] TypeScript compilation successful (no errors)
- [ ] ESLint passing (no errors)
- [ ] Prettier formatting applied
- [ ] No console.log statements in production code
- [ ] All TypeScript strict mode compliant

### Testing
- [ ] All existing tests still passing
- [ ] New tests cover edge cases
- [ ] Test coverage meets target (>85%)
- [ ] Manual testing completed

### Database
- [ ] Migration runs successfully on staging
- [ ] Rollback procedure tested and documented
- [ ] No data loss confirmed
- [ ] Performance impact assessed

### Multi-Tenancy Safety
- [ ] All queries filter by `sppgId` where required
- [ ] No cross-tenant data leakage
- [ ] Ownership verification implemented
- [ ] Audit logging added for sensitive operations

### Performance
- [ ] No N+1 queries introduced
- [ ] Database indexes added where needed
- [ ] API response times within targets
- [ ] Bundle size impact checked

### Security
- [ ] Input validation implemented (Zod schemas)
- [ ] Authorization checks in place
- [ ] No sensitive data in logs
- [ ] CSRF protection maintained

### Documentation
- [ ] Code comments added
- [ ] JSDoc annotations complete
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)

## 🧪 Testing Evidence

### Verification Queries Run
```sql
-- Paste verification query results here
```

### Test Coverage
```bash
# Paste test coverage report here
```

### Performance Benchmarks
```
# Before:
[Baseline metrics]

# After:
[New metrics]
```

## 📸 Screenshots (if UI changes)

[Add screenshots here]

## 🔄 Rollback Plan

**If deployment fails:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Database rollback:**
```sql
-- Rollback SQL here
```

## 📝 Additional Notes

[Any additional context, warnings, or notes]

## 🔗 Related Issues

Closes #[issue_number]

---

**Reviewer Checklist**
- [ ] Code reviewed for correctness
- [ ] Tests reviewed for completeness
- [ ] Migration reviewed for safety
- [ ] Multi-tenant security verified
- [ ] Performance impact acceptable
- [ ] Documentation adequate

**Approved by**: [Tech Lead Name]  
**Date**: [Date]
EOF

print_success "Created .github/PULL_REQUEST_TEMPLATE.md"

###############################################################################
# STEP 5: CREATE GITHUB ISSUE TEMPLATES
###############################################################################

print_header "STEP 5: Creating GitHub Issue Templates"

mkdir -p .github/ISSUE_TEMPLATE

# Fix implementation template
cat > .github/ISSUE_TEMPLATE/fix-implementation.md << 'EOF'
---
name: Phase 1 Fix Implementation
about: Track implementation of SPPG Phase 1 fixes
title: 'Fix #[X]: [Fix Name]'
labels: ['phase1', 'sppg', 'enhancement']
assignees: ''
---

## Fix Information

**Fix Number**: #[X]  
**Priority**: [CRITICAL/HIGH/MEDIUM/LOW]  
**Effort**: [X] hours  
**Dependencies**: [List or "None"]  
**Assigned To**: [Developer Name]  
**Start Date**: [Date]  
**Target Date**: [Date]

## Problem Statement

[Describe the problem this fix addresses]

## Solution Overview

[Brief description of the solution]

## Implementation Checklist

### Week [X] - Days [X-X]

#### Database
- [ ] Create migration script
- [ ] Test migration on staging
- [ ] Test rollback procedure
- [ ] Run pre-migration analysis queries

#### Service Layer
- [ ] Create/update services
- [ ] Implement business logic
- [ ] Add error handling
- [ ] Add logging

#### API Layer
- [ ] Create/update API routes
- [ ] Add validation (Zod schemas)
- [ ] Add authorization checks
- [ ] Test API endpoints

#### UI Layer
- [ ] Create/update components (shadcn/ui)
- [ ] Add form validation
- [ ] Add error handling
- [ ] Test user flows

#### Testing
- [ ] Write unit tests (>85% coverage)
- [ ] Write integration tests
- [ ] Write E2E tests (if applicable)
- [ ] All tests passing

#### Documentation
- [ ] Add code comments
- [ ] Update API documentation
- [ ] Add migration notes
- [ ] Update user documentation (if needed)

## Success Criteria

- [ ] All verification queries pass
- [ ] Test coverage >85%
- [ ] Performance benchmarks met
- [ ] No breaking changes
- [ ] Multi-tenant security verified

## Verification Queries

```sql
-- Add verification queries here
```

## Related Documents

- Implementation Plan: `docs/fixes/FIX0[X]_*.md`
- Quick Reference: `docs/fixes/QUICK_REFERENCE_GUIDE.md`

## Notes

[Any additional notes or blockers]
EOF

print_success "Created .github/ISSUE_TEMPLATE/fix-implementation.md"

###############################################################################
# STEP 6: CREATE MONITORING CONFIG PLACEHOLDERS
###############################################################################

print_header "STEP 6: Creating Monitoring Configuration"

mkdir -p config/monitoring

cat > config/monitoring/sentry.config.ts << 'EOF'
/**
 * Sentry Configuration for SPPG Phase 1
 * 
 * Error tracking and performance monitoring
 * Configure in production environment
 */

export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',
  
  // Phase 1 specific tags
  tags: {
    phase: 'phase1',
    module: 'sppg',
  },
  
  // Ignore common errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Before send hook
  beforeSend(event: any) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      return null
    }
    return event
  },
}

/**
 * Custom Sentry contexts for Phase 1
 */
export function setPhase1Context(fixName: string, action: string) {
  // Add Sentry context here when Sentry is configured
  console.log(`[Phase 1] ${fixName} - ${action}`)
}
EOF

print_success "Created config/monitoring/sentry.config.ts"

cat > config/monitoring/metrics.ts << 'EOF'
/**
 * Custom Metrics for SPPG Phase 1
 * 
 * Track business metrics during implementation
 */

export interface Phase1Metrics {
  // Data Quality Metrics
  orphanedMenuIngredients: number
  orphanedProcurementItems: number
  productionsWithStoredCosts: number
  distributionsWithoutProof: number
  unapprovedMenuPlans: number
  schoolsWithoutGPS: number
  
  // Performance Metrics
  menuCostCalculationTime: number
  procurementReceiveTime: number
  productionCostCalculationTime: number
  
  // Business Metrics
  dataAccuracy: number
  workflowCoverage: number
}

/**
 * Collect Phase 1 metrics
 * Run this daily during implementation
 */
export async function collectPhase1Metrics(): Promise<Phase1Metrics> {
  // Placeholder - implement with actual database queries
  return {
    orphanedMenuIngredients: 0,
    orphanedProcurementItems: 0,
    productionsWithStoredCosts: 0,
    distributionsWithoutProof: 0,
    unapprovedMenuPlans: 0,
    schoolsWithoutGPS: 0,
    menuCostCalculationTime: 0,
    procurementReceiveTime: 0,
    productionCostCalculationTime: 0,
    dataAccuracy: 0,
    workflowCoverage: 0,
  }
}

/**
 * Log metrics to monitoring system
 */
export function logPhase1Metrics(metrics: Phase1Metrics) {
  console.log('[Phase 1 Metrics]', {
    timestamp: new Date().toISOString(),
    metrics,
  })
  
  // TODO: Send to monitoring system (DataDog, CloudWatch, etc.)
}
EOF

print_success "Created config/monitoring/metrics.ts"

###############################################################################
# STEP 7: CREATE BACKUP SCRIPT
###############################################################################

print_header "STEP 7: Creating Database Backup Script"

mkdir -p scripts/database

cat > scripts/database/backup-production.sh << 'EOF'
#!/bin/bash

###############################################################################
# Production Database Backup Script
# 
# Creates timestamped backup of production database
# Usage: ./scripts/database/backup-production.sh
###############################################################################

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-bagizi_db}"
DB_USER="${DB_USER:-bagizi_user}"
BACKUP_DIR="backups/phase1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/bagizi_production_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🗄️  Starting production database backup..."
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"

# Create backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -b -v -f "$BACKUP_FILE" "$DB_NAME"

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup successful!"
    echo "File: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"
    
    # Keep only last 30 days of backups
    find "$BACKUP_DIR" -name "bagizi_production_*.sql" -type f -mtime +30 -delete
    echo "📦 Cleaned up old backups (>30 days)"
else
    echo "❌ Backup failed!"
    exit 1
fi
EOF

chmod +x scripts/database/backup-production.sh
print_success "Created scripts/database/backup-production.sh (executable)"

###############################################################################
# STEP 8: CREATE STAGING SETUP SCRIPT
###############################################################################

cat > scripts/database/setup-staging.sh << 'EOF'
#!/bin/bash

###############################################################################
# Setup Staging Database from Production Backup
# 
# Usage: ./scripts/database/setup-staging.sh [backup_file]
###############################################################################

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
STAGING_DB="${STAGING_DB:-bagizi_staging}"
DB_USER="${DB_USER:-bagizi_user}"
BACKUP_FILE="${1:-backups/phase1/latest.sql}"

echo "🗄️  Setting up staging database from backup..."

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    echo "Usage: $0 [backup_file]"
    exit 1
fi

echo "Backup file: $BACKUP_FILE"
echo "Staging database: $STAGING_DB"

# Drop existing staging database if exists
echo "Dropping existing staging database (if exists)..."
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --if-exists "$STAGING_DB"

# Create new staging database
echo "Creating staging database..."
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$STAGING_DB"

# Restore backup
echo "Restoring backup to staging..."
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$STAGING_DB" -v "$BACKUP_FILE"

echo "✅ Staging database setup complete!"
echo ""
echo "Verify with:"
echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER $STAGING_DB -c '\\dt'"
EOF

chmod +x scripts/database/setup-staging.sh
print_success "Created scripts/database/setup-staging.sh (executable)"

###############################################################################
# STEP 9: CREATE VERIFICATION QUERIES SCRIPT
###############################################################################

cat > scripts/database/run-verification-queries.sql << 'EOF'
-- ============================================================================
-- SPPG Phase 1 - Pre-Implementation Verification Queries
-- 
-- Run these queries before starting implementation to establish baseline
-- Run against: bagizi_staging database
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SPPG PHASE 1 - PRE-IMPLEMENTATION VERIFICATION'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Fix #1: MenuIngredient orphaned records
\echo '📊 Fix #1: MenuIngredient-InventoryItem Link'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as orphaned_menu_ingredients,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "MenuIngredient"), 0) * 100, 2) as percentage
FROM "MenuIngredient"
WHERE "inventoryItemId" IS NULL;
\echo ''

-- Fix #2: ProcurementItem orphaned records
\echo '📊 Fix #2: ProcurementItem-InventoryItem Link'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as orphaned_procurement_items,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "ProcurementItem"), 0) * 100, 2) as percentage
FROM "ProcurementItem"
WHERE "inventoryItemId" IS NULL;
\echo ''

-- Fix #3: FoodProduction with stored costs
\echo '📊 Fix #3: FoodProduction Stored Costs'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as productions_with_stored_costs,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "FoodProduction"), 0) * 100, 2) as percentage
FROM "FoodProduction"
WHERE "estimatedCost" IS NOT NULL;
\echo ''

-- Fix #4-5: Distribution without proof
\echo '📊 Fix #4-5: Distributions Without Delivery Proof'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as distributions_without_proof,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "FoodDistribution"), 0) * 100, 2) as percentage
FROM "FoodDistribution"
WHERE "recipientSignature" IS NULL 
   OR "photoUrl" IS NULL
   OR "gpsLatitude" IS NULL;
\echo ''

-- Fix #7: MenuPlan without approval
\echo '📊 Fix #7: Active MenuPlans Without Approval'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as unapproved_active_plans,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "MenuPlan" WHERE "isActive" = true), 0) * 100, 2) as percentage
FROM "MenuPlan"
WHERE "isActive" = true 
  AND "approvedBy" IS NULL;
\echo ''

-- Fix #8: SchoolBeneficiary without GPS
\echo '📊 Fix #8: Schools Without GPS Coordinates'
\echo '─────────────────────────────────────────────'
SELECT 
    COUNT(*) as schools_without_gps,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM "SchoolBeneficiary"), 0) * 100, 2) as percentage
FROM "SchoolBeneficiary"
WHERE "latitude" IS NULL 
   OR "longitude" IS NULL;
\echo ''

-- Overall summary
\echo '📊 OVERALL SUMMARY'
\echo '─────────────────────────────────────────────'
SELECT 
    'Total Records' as metric,
    COUNT(*) as menu_ingredients
FROM "MenuIngredient"
UNION ALL
SELECT 'With InventoryItem', COUNT(*) FROM "MenuIngredient" WHERE "inventoryItemId" IS NOT NULL
UNION ALL
SELECT 'Orphaned', COUNT(*) FROM "MenuIngredient" WHERE "inventoryItemId" IS NULL;
\echo ''

\echo '✅ Verification queries complete!'
\echo 'Save these baseline numbers for comparison after implementation.'
EOF

print_success "Created scripts/database/run-verification-queries.sql"

###############################################################################
# STEP 10: COMMIT CHANGES
###############################################################################

print_header "STEP 10: Committing Setup Files"

# Stage all new files
git add .

# Show what will be committed
print_info "Files to be committed:"
git status --short

# Commit
git commit -m "chore(phase1): pre-execution setup

- Add feature flags system (src/lib/feature-flags.ts)
- Add PR template (.github/PULL_REQUEST_TEMPLATE.md)
- Add GitHub issue template
- Add monitoring config placeholders
- Add database backup scripts
- Add verification queries
- Add to .env.example

Part of SPPG Phase 1 Pre-Execution Setup
See: docs/fixes/IMPLEMENTATION_KICKOFF_CHECKLIST.md"

print_success "Changes committed to branch: $FEATURE_BRANCH"

###############################################################################
# SUMMARY
###############################################################################

print_header "🎉 PRE-EXECUTION SETUP COMPLETE!"

echo -e "${GREEN}✅ Branch created:${NC} $FEATURE_BRANCH"
echo -e "${GREEN}✅ Feature flags:${NC} src/lib/feature-flags.ts"
echo -e "${GREEN}✅ PR template:${NC} .github/PULL_REQUEST_TEMPLATE.md"
echo -e "${GREEN}✅ Issue template:${NC} .github/ISSUE_TEMPLATE/fix-implementation.md"
echo -e "${GREEN}✅ Monitoring config:${NC} config/monitoring/"
echo -e "${GREEN}✅ Database scripts:${NC} scripts/database/"
echo ""

print_info "Next Steps:"
echo "1. Push feature branch: git push -u origin $FEATURE_BRANCH"
echo "2. Create GitHub issues for all 8 fixes"
echo "3. Setup staging database: ./scripts/database/backup-production.sh && ./scripts/database/setup-staging.sh"
echo "4. Run verification queries: psql -d bagizi_staging -f scripts/database/run-verification-queries.sql"
echo "5. Schedule kickoff meeting"
echo ""
echo "See: docs/fixes/IMPLEMENTATION_KICKOFF_CHECKLIST.md for complete checklist"
echo ""

print_success "Ready to proceed with Phase 1 implementation!"
