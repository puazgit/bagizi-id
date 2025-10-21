#!/bin/bash

###############################################################################
# Create GitHub Issues for SPPG Phase 1 Fixes
# 
# This script creates 8 GitHub issues for each critical fix
# Requires: gh CLI (GitHub CLI tool)
# 
# Usage: ./scripts/create-phase1-issues.sh
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found"
    echo "Install from: https://cli.github.com/"
    echo ""
    echo "Or using Homebrew: brew install gh"
    echo "Then authenticate: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo "Run: gh auth login"
    exit 1
fi

print_header "Creating GitHub Issues for SPPG Phase 1"

###############################################################################
# Fix #1: MenuIngredient-InventoryItem Link
###############################################################################

print_info "Creating issue for Fix #1..."

gh issue create \
  --title "Fix #1: MenuIngredient-InventoryItem Link" \
  --label "phase1,critical,sppg,enhancement,week-1" \
  --milestone "SPPG Phase 1" \
  --assignee "@me" \
  --body "## Fix Information

**Fix Number**: #1  
**Priority**: 🔥🔥🔥 CRITICAL  
**Effort**: 16 hours  
**Dependencies**: None  
**Assigned To**: Developer A  
**Week**: Week 1 (Days 1-4)  
**Start Date**: October 22, 2025  
**Target Date**: October 25, 2025

## Problem Statement

MenuIngredient has optional \`inventoryItemId\`, causing:
- 500+ orphaned menu ingredients (no inventory link)
- Inaccurate cost calculations (60% accuracy)
- Menu costs outdated when inventory prices change
- Manual data entry errors

## Solution Overview

1. Make \`inventoryItemId\` required (schema change)
2. Auto-map existing records using fuzzy matching algorithm
3. Create MenuCostCalculator service for real-time cost calculation
4. Update MenuIngredientForm with InventoryItem dropdown
5. Preserve historical data in JSON before migration

## Implementation Checklist

### Week 1 - Days 1-4

#### Database
- [ ] Create pre-migration backup
- [ ] Run analysis queries (orphaned records count)
- [ ] Create fuzzy matching migration script (Levenshtein distance)
- [ ] Test migration on staging database
- [ ] Create rollback procedure
- [ ] Document historical data preservation

#### Service Layer
- [ ] Create MenuCostCalculator service
  - [ ] \`calculateMenuCost(menuId)\` method
  - [ ] Real-time ingredient cost aggregation
  - [ ] Cache mechanism for performance
- [ ] Add error handling for missing inventory items
- [ ] Add audit logging

#### API Layer
- [ ] Update GET /api/sppg/menu/[id] (include costs)
- [ ] Update POST /api/sppg/menu (validate inventoryItemId)
- [ ] Add GET /api/sppg/menu/[id]/cost endpoint
- [ ] Add Zod validation for required inventoryItemId

#### UI Layer
- [ ] Update MenuIngredientForm
  - [ ] Add InventoryItem dropdown (searchable)
  - [ ] Remove free-text ingredient name
  - [ ] Show current inventory stock
  - [ ] Show unit price
- [ ] Update MenuCard to show calculated costs
- [ ] Add loading states during cost calculation

#### Testing
- [ ] Unit tests for MenuCostCalculator (>85% coverage)
- [ ] Integration tests for menu cost calculation
- [ ] Test fuzzy matching algorithm accuracy
- [ ] Test rollback procedure
- [ ] Performance test (<500ms cost calculation)

#### Documentation
- [ ] Document migration process
- [ ] Add JSDoc comments to MenuCostCalculator
- [ ] Update API documentation
- [ ] Create user guide for new ingredient selection

## Success Criteria

- [ ] Zero orphaned MenuIngredients (from 500+)
- [ ] 95%+ cost accuracy (from 60%)
- [ ] <500ms menu cost calculation time
- [ ] >85% test coverage
- [ ] No breaking changes
- [ ] Rollback tested successfully

## Verification Queries

\`\`\`sql
-- Orphaned records (should be 0)
SELECT COUNT(*) FROM \"MenuIngredient\" WHERE \"inventoryItemId\" IS NULL;

-- Cost accuracy check
SELECT 
  m.id,
  m.\"menuName\",
  COUNT(mi.id) as ingredient_count,
  SUM(ii.\"unitPrice\" * mi.\"quantity\") as calculated_cost
FROM \"NutritionMenu\" m
JOIN \"MenuIngredient\" mi ON mi.\"menuId\" = m.id
JOIN \"InventoryItem\" ii ON ii.id = mi.\"inventoryItemId\"
GROUP BY m.id, m.\"menuName\";
\`\`\`

## Related Documents

- Implementation Plan: \`docs/fixes/FIX01_MENU_INGREDIENT_INVENTORY_LINK.md\`
- Quick Reference: \`docs/fixes/QUICK_REFERENCE_GUIDE.md\`
- Readiness Review: \`docs/fixes/IMPLEMENTATION_READINESS_REVIEW.md\`

## Dependencies

**Blocks**: 
- Fix #3 (FoodProduction Cost Calculation depends on accurate menu costs)

**Blocked By**: None

## Notes

- Use Levenshtein distance algorithm for fuzzy matching
- Review auto-mapping results manually before finalizing
- Consider progressive rollout with feature flag
- Monitor performance after deployment" || print_warning "Fix #1 issue may already exist"

print_success "Fix #1 issue created (or already exists)"

###############################################################################
# Fix #2: ProcurementItem-InventoryItem Link
###############################################################################

print_info "Creating issue for Fix #2..."

gh issue create \
  --title "Fix #2: ProcurementItem-InventoryItem Link" \
  --label "phase1,high,sppg,enhancement,week-1" \
  --assignee "@me" \
  --body "## Fix Information

**Fix Number**: #2  
**Priority**: 🔥🔥 HIGH  
**Effort**: 10 hours  
**Dependencies**: None  
**Assigned To**: Developer B  
**Week**: Week 1 (Days 1-2.5)  
**Start Date**: October 22, 2025  
**Target Date**: October 23, 2025

## Problem Statement

ProcurementItem has optional \`inventoryItemId\`, causing:
- Procurement doesn't auto-update inventory stock
- Manual stock entry required (error-prone)
- No FIFO tracking for batch management
- Procurement-inventory data disconnect

## Solution Overview

1. Make \`inventoryItemId\` required
2. Auto-map existing procurement items
3. Create ProcurementReceiveService with auto stock update
4. Implement FIFO batch tracking
5. Update ProcurementItemForm

## Implementation Checklist

### Week 1 - Days 1-2.5

#### Database
- [ ] Create pre-migration backup
- [ ] Run analysis queries
- [ ] Create auto-mapping migration script
- [ ] Test migration on staging
- [ ] Create rollback procedure

#### Service Layer
- [ ] Create ProcurementReceiveService
  - [ ] \`receiveProcurement(procurementId)\` method
  - [ ] Auto create StockMovement (IN)
  - [ ] Update InventoryItem current stock
  - [ ] FIFO batch tracking
- [ ] Add transaction wrapping
- [ ] Add audit logging

#### API Layer
- [ ] Update POST /api/sppg/procurement/receive
- [ ] Add validation for inventoryItemId
- [ ] Return updated stock levels

#### UI Layer
- [ ] Update ProcurementItemForm
  - [ ] Add InventoryItem dropdown
  - [ ] Show current stock level
  - [ ] Show expected stock after receive
- [ ] Add receive confirmation dialog
- [ ] Show auto stock update notification

#### Testing
- [ ] Unit tests for ProcurementReceiveService
- [ ] Integration tests for auto stock update
- [ ] Test FIFO batch creation
- [ ] Performance test (<1s receive processing)

## Success Criteria

- [ ] Zero orphaned ProcurementItems
- [ ] 100% auto stock update success rate
- [ ] <1s procurement receive time
- [ ] >85% test coverage
- [ ] FIFO batches created correctly

## Verification Queries

\`\`\`sql
-- Orphaned records
SELECT COUNT(*) FROM \"ProcurementItem\" WHERE \"inventoryItemId\" IS NULL;

-- Stock movement auto-creation
SELECT 
  p.id as procurement_id,
  pi.id as procurement_item_id,
  sm.id as stock_movement_id,
  sm.\"movementType\",
  sm.quantity
FROM \"Procurement\" p
JOIN \"ProcurementItem\" pi ON pi.\"procurementId\" = p.id
LEFT JOIN \"StockMovement\" sm ON sm.\"procurementItemId\" = pi.id
WHERE p.status = 'RECEIVED';
\`\`\`

## Related Documents

- Implementation Plan: \`docs/fixes/FIX02_PROCUREMENT_ITEM_INVENTORY_LINK.md\`

## Dependencies

**Blocks**: None  
**Blocked By**: None

## Notes

- Run in parallel with Fix #1
- Monitor stock update performance
- Consider batch processing for large procurements" || print_warning "Fix #2 issue may already exist"

print_success "Fix #2 issue created (or already exists)"

###############################################################################
# Fix #3: FoodProduction Cost Calculation
###############################################################################

print_info "Creating issue for Fix #3..."

gh issue create \
  --title "Fix #3: FoodProduction Cost Calculation" \
  --label "phase1,critical,sppg,enhancement,week-2" \
  --assignee "@me" \
  --body "## Fix Information

**Fix Number**: #3  
**Priority**: 🔥🔥🔥 CRITICAL  
**Effort**: 12 hours  
**Dependencies**: Fix #1 (needs accurate menu costs)  
**Assigned To**: Developer A  
**Week**: Week 2 (Days 5-6.5)  
**Start Date**: October 28, 2025  
**Target Date**: October 29, 2025

## Problem Statement

FoodProduction stores \`estimatedCost\` at creation time, causing:
- Outdated costs when ingredient prices change
- Inaccurate budget tracking
- Manual cost recalculation needed
- No FIFO accounting for stock usage

## Solution Overview

1. Remove stored \`estimatedCost\` field
2. Create ProductionStockUsage model for FIFO tracking
3. Create FoodProductionCostService for dynamic calculation
4. Preserve historical costs in JSON
5. Update production UI with real-time costs

## Implementation Checklist

### Week 2 - Days 5-6.5

#### Database
- [ ] Create ProductionStockUsage model
- [ ] Preserve historical costs to JSON
- [ ] Remove estimatedCost field (migration)
- [ ] Test migration on staging
- [ ] Create rollback procedure

#### Service Layer
- [ ] Create FoodProductionCostService
  - [ ] \`calculateProductionCost(productionId)\`
  - [ ] FIFO stock usage tracking
  - [ ] Ingredient cost aggregation
  - [ ] Labor cost calculation
- [ ] Create ProductionStockUsageService
- [ ] Add caching layer

#### API Layer  
- [ ] Update GET /api/sppg/production/[id]
- [ ] Add GET /api/sppg/production/[id]/cost
- [ ] Update production list with costs

#### UI Layer
- [ ] Update ProductionCard (show dynamic cost)
- [ ] Add cost breakdown modal
- [ ] Show FIFO batch usage
- [ ] Add loading states

#### Testing
- [ ] Unit tests for cost calculation
- [ ] Test FIFO algorithm accuracy
- [ ] Integration tests
- [ ] Performance test (<300ms)

## Success Criteria

- [ ] Always accurate production costs
- [ ] <300ms cost calculation time
- [ ] FIFO stock usage tracked
- [ ] Historical data preserved
- [ ] >85% test coverage

## Verification Queries

\`\`\`sql
-- Check ProductionStockUsage created
SELECT 
  fp.id,
  fp.\"foodProductionCode\",
  COUNT(psu.id) as batch_usages
FROM \"FoodProduction\" fp
LEFT JOIN \"ProductionStockUsage\" psu ON psu.\"productionId\" = fp.id
GROUP BY fp.id, fp.\"foodProductionCode\";
\`\`\`

## Related Documents

- Implementation Plan: \`docs/fixes/FIX03_FOOD_PRODUCTION_COST_CALCULATION.md\`

## Dependencies

**Blocks**: Fix #4-5 (Distribution needs production cost data)  
**Blocked By**: Fix #1 (needs accurate MenuIngredient costs)

## Notes

- MUST complete Fix #1 first
- Preserve all historical cost data
- Consider caching for performance" || print_warning "Fix #3 issue may already exist"

print_success "Fix #3 issue created (or already exists)"

###############################################################################
# Fix #4-5: Distribution Flow Complete
###############################################################################

print_info "Creating Fix #4-5: Distribution Flow Complete..."

gh issue create \
  --title "Fix #4-5: Distribution Flow Complete" \
  --label "phase1,critical,sppg,enhancement,week-2,week-3" \
  --milestone "SPPG Phase 1" \
  --assignee "@me" \
  --body "## Fix Information

**Fix Number**: #4-5 (Combined)  
**Priority**: 🔥🔥🔥 CRITICAL  
**Estimated Effort**: 26 hours  
**Assigned To**: Developer A + Developer B  
**Timeline**: Week 2-3, Days 7-10.25 (October 28 - November 6)  
**Dependencies**: Blocks None | Blocked By Fix #3

---

## Problem Statement

**Current Issues**:
- No delivery proof capture (GPS, photos, signatures)
- Manual distribution tracking (spreadsheets)
- No temperature monitoring
- Missing beneficiary feedback
- No mobile app for field workers

**Impact**:
- No accountability for food delivery
- Delivery disputes hard to resolve
- Food safety compliance risk
- Poor beneficiary satisfaction tracking
- Workflow coverage: 40%

**Baseline Metrics**:
- 🔴 Distributions without proof: 80%+ (500+ records)
- 🔴 GPS coordinates: 0%
- 🔴 Delivery photos: 0%
- 🔴 Digital signatures: 0%
- 🔴 Temperature records: 0%

---

## Solution Overview

**Database Changes**:
- Add GPS coordinates to FoodDistribution
- Add proof fields (photo, signature, temperature)
- Create DeliveryProof model
- Link beneficiary feedback

**Mobile App** (React Native - NEW):
- GPS auto-capture on delivery
- Photo upload (3 photos max)
- Digital signature capture
- Temperature monitoring
- Offline mode with sync

**Services**:
- DeliveryProofService
- GPSValidationService
- PhotoUploadService
- TemperatureMonitoringService

**APIs**:
- POST /api/sppg/distribution/[id]/complete
- POST /api/sppg/distribution/[id]/proof
- GET /api/sppg/distribution/[id]/proof

---

## Implementation Checklist

### Week 2 - Days 7-9 (Developer A: Database + Backend)

#### Database
- [ ] Add GPS fields to FoodDistribution
  - [ ] \`deliveryLatitude\` (Decimal)
  - [ ] \`deliveryLongitude\` (Decimal)
  - [ ] \`deliveryGpsAccuracy\` (Decimal)
  - [ ] \`deliveryTimestamp\` (DateTime)
- [ ] Add proof fields
  - [ ] \`deliveryProofPhoto\` (String - URL)
  - [ ] \`deliverySignature\` (String - base64)
  - [ ] \`deliveryTemperature\` (Decimal)
- [ ] Create DeliveryProof model (optional separate table)
- [ ] Test migration on staging
- [ ] Create indexes for GPS queries

#### Service Layer
- [ ] Create DeliveryProofService
  - [ ] \`captureDeliveryProof(distributionId, proof)\`
  - [ ] GPS validation (accuracy check)
  - [ ] Photo upload to cloud storage
  - [ ] Signature validation
  - [ ] Temperature range check
- [ ] Create GPSValidationService
  - [ ] Verify coordinates in valid range
  - [ ] Check accuracy threshold (<10m)
  - [ ] Validate timestamp freshness
- [ ] Create PhotoUploadService (S3/Cloudinary)
- [ ] Create TemperatureMonitoringService
  - [ ] Validate range (4°C - 60°C)
  - [ ] Alert if out of range

#### API Layer
- [ ] Create POST /api/sppg/distribution/[id]/complete
  - [ ] Validate delivery proof data
  - [ ] Update distribution status
  - [ ] Store GPS + photo + signature
  - [ ] Return success confirmation
- [ ] Create POST /api/sppg/distribution/[id]/proof
  - [ ] Upload delivery proof
  - [ ] Validate all required fields
- [ ] Update GET /api/sppg/distribution/[id]
  - [ ] Include delivery proof data
  - [ ] Return photo URLs

### Week 3 - Days 10-10.25 (Developer B: Mobile App)

#### Mobile App (React Native)
- [ ] Setup React Native project
  - [ ] Initialize Expo/React Native CLI
  - [ ] Configure navigation
  - [ ] Setup state management (Zustand)
  - [ ] Configure API client
- [ ] GPS Module
  - [ ] Request location permissions
  - [ ] Auto-capture GPS on delivery screen
  - [ ] Show accuracy indicator
  - [ ] Retry if accuracy > 10m
- [ ] Photo Capture Module
  - [ ] Camera permissions
  - [ ] Capture up to 3 photos
  - [ ] Photo preview
  - [ ] Compress images before upload
- [ ] Signature Module
  - [ ] React Native Signature Canvas
  - [ ] Save as base64
  - [ ] Preview signature
- [ ] Temperature Module
  - [ ] Manual temperature input
  - [ ] Bluetooth thermometer integration (optional)
  - [ ] Range validation (4°C - 60°C)
- [ ] Offline Mode
  - [ ] Local SQLite storage
  - [ ] Queue failed uploads
  - [ ] Auto-sync when online
- [ ] Delivery Flow Screen
  - [ ] Distribution list
  - [ ] Delivery details
  - [ ] Proof capture form
  - [ ] Submit delivery

#### Testing
- [ ] Unit tests for services
- [ ] API integration tests
- [ ] Mobile app E2E tests
- [ ] GPS accuracy tests
- [ ] Photo upload tests
- [ ] Offline sync tests

---

## Success Criteria

- [ ] 100% distributions have GPS coordinates
- [ ] 100% distributions have delivery proof
- [ ] GPS accuracy <10 meters
- [ ] Photo upload <5 seconds
- [ ] Temperature monitoring 100%
- [ ] Mobile app works offline
- [ ] Workflow coverage: 100%

---

## Verification Queries

\`\`\`sql
-- Check distributions with complete proof
SELECT 
  status,
  COUNT(*) as total,
  COUNT(\"deliveryLatitude\") as with_gps,
  COUNT(\"deliveryProofPhoto\") as with_photo,
  COUNT(\"deliverySignature\") as with_signature,
  COUNT(\"deliveryTemperature\") as with_temp,
  ROUND(100.0 * COUNT(\"deliveryLatitude\") / COUNT(*), 2) as gps_percentage
FROM \"FoodDistribution\"
WHERE status = 'COMPLETED'
GROUP BY status;

-- Check GPS accuracy
SELECT 
  AVG(\"deliveryGpsAccuracy\") as avg_accuracy,
  MAX(\"deliveryGpsAccuracy\") as max_accuracy,
  MIN(\"deliveryGpsAccuracy\") as min_accuracy
FROM \"FoodDistribution\"
WHERE \"deliveryLatitude\" IS NOT NULL;
\`\`\`

---

## Related Documents

- Implementation Plan: \`docs/fixes/FIX04_05_DISTRIBUTION_FLOW_COMPLETE.md\`
- Mobile App Design: \`docs/fixes/MOBILE_APP_DESIGN.md\` (create if needed)

---

## Dependencies

**Blocks**: None  
**Blocked By**: Fix #3 (needs production cost data for distribution)

---

## Notes

- Mobile app is NEW component - allocate extra time
- Consider using Expo for faster development
- Photo storage: Use cloud storage (S3/Cloudinary)
- GPS accuracy critical for compliance
- Offline mode essential for field workers
- Temperature monitoring for food safety compliance" || print_warning "Fix #4-5 issue may already exist"

print_success "Fix #4-5 issue created (or already exists)"

###############################################################################
# Fix #6: Procurement Supplier Cleanup
###############################################################################

print_info "Creating Fix #6: Procurement Supplier Cleanup..."

gh issue create \
  --title "Fix #6: Procurement Supplier Cleanup" \
  --label "phase1,medium,sppg,enhancement,week-2" \
  --milestone "SPPG Phase 1" \
  --assignee "@me" \
  --body "## Fix Information

**Fix Number**: #6  
**Priority**: 🔥 MEDIUM  
**Estimated Effort**: 6 hours  
**Assigned To**: Developer B  
**Timeline**: Week 2, Day 5-5.75 (October 28)  
**Dependencies**: None (runs parallel)

---

## Problem Statement

**Current Issues**:
- Supplier data in Procurement (not separate model)
- Duplicate supplier entries
- No supplier status tracking
- Manual supplier selection (dropdowns)
- No supplier performance tracking

**Impact**:
- Inconsistent supplier names
- Duplicate data entry
- No vendor management
- Hard to track supplier performance
- Cannot blacklist problematic suppliers

**Baseline Metrics**:
- 🔴 Unique supplier names: ~150
- 🔴 Duplicate suppliers: ~30% (45+ duplicates)
- 🔴 No supplier status tracking

---

## Solution Overview

**Database Changes**:
- Extract Supplier to separate model
- Add status field (ACTIVE, INACTIVE, BLACKLISTED)
- Add performance tracking fields
- Link Procurement to Supplier (FK)

**Data Migration**:
- Extract unique suppliers from Procurement
- Map existing procurements to suppliers
- Deduplicate supplier names

**Services**:
- SupplierService (CRUD operations)
- SupplierMappingService (deduplicate)

**APIs**:
- GET /api/sppg/supplier
- POST /api/sppg/supplier
- PUT /api/sppg/supplier/[id]
- DELETE /api/sppg/supplier/[id]

---

## Implementation Checklist

### Week 2 - Day 5-5.75

#### Database
- [ ] Create Supplier model
  - [ ] \`supplierName\` (String, unique per SPPG)
  - [ ] \`supplierCode\` (String, auto-generated)
  - [ ] \`supplierStatus\` (Enum: ACTIVE, INACTIVE, BLACKLISTED)
  - [ ] \`contactPerson\` (String, optional)
  - [ ] \`phone\` (String, optional)
  - [ ] \`address\` (String, optional)
  - [ ] \`sppgId\` (FK to SPPG)
- [ ] Add \`supplierId\` FK to Procurement
- [ ] Create migration script
  - [ ] Extract unique suppliers
  - [ ] Create Supplier records
  - [ ] Map Procurement.supplierId
  - [ ] Remove old supplier fields
- [ ] Test migration on staging

#### Service Layer
- [ ] Create SupplierService
  - [ ] \`getAllSuppliers(sppgId, status?)\`
  - [ ] \`createSupplier(data)\`
  - [ ] \`updateSupplier(id, data)\`
  - [ ] \`deactivateSupplier(id)\`
- [ ] Create SupplierMappingService
  - [ ] Fuzzy matching for deduplication
  - [ ] Suggest merges for similar names

#### API Layer
- [ ] Create GET /api/sppg/supplier
  - [ ] Filter by status
  - [ ] Search by name
- [ ] Create POST /api/sppg/supplier
- [ ] Create PUT /api/sppg/supplier/[id]
- [ ] Create DELETE /api/sppg/supplier/[id]
  - [ ] Check no active procurements
  - [ ] Soft delete (set INACTIVE)

#### UI Layer
- [ ] Create SupplierList page
- [ ] Create SupplierForm component
- [ ] Update ProcurementForm (supplier dropdown)
- [ ] Add supplier status badges

#### Testing
- [ ] Unit tests for SupplierService
- [ ] Migration deduplication tests
- [ ] API integration tests
- [ ] UI component tests

---

## Success Criteria

- [ ] All suppliers extracted to Supplier model
- [ ] Zero duplicate suppliers
- [ ] Supplier status tracking working
- [ ] Procurement linked to suppliers correctly
- [ ] >85% test coverage

---

## Verification Queries

\`\`\`sql
-- Check all suppliers created
SELECT COUNT(*) as total_suppliers,
       COUNT(CASE WHEN \"supplierStatus\" = 'ACTIVE' THEN 1 END) as active,
       COUNT(CASE WHEN \"supplierStatus\" = 'INACTIVE' THEN 1 END) as inactive
FROM \"Supplier\";

-- Check procurements linked
SELECT 
  COUNT(*) as total_procurements,
  COUNT(\"supplierId\") as with_supplier,
  ROUND(100.0 * COUNT(\"supplierId\") / COUNT(*), 2) as linked_percentage
FROM \"Procurement\";

-- Find potential duplicates
SELECT \"supplierName\", COUNT(*) as count
FROM \"Supplier\"
GROUP BY \"supplierName\"
HAVING COUNT(*) > 1;
\`\`\`

---

## Related Documents

- Implementation Plan: \`docs/fixes/FIX06_PROCUREMENT_SUPPLIER_CLEANUP.md\`

---

## Dependencies

**Blocks**: None  
**Blocked By**: None (runs parallel with other fixes)

---

## Notes

- Run parallel with Fix #3 (different developer)
- Use fuzzy matching for deduplication (similar to Fix #1)
- Preserve supplier history in old procurements
- Consider supplier performance metrics (future enhancement)" || print_warning "Fix #6 issue may already exist"

print_success "Fix #6 issue created (or already exists)"

###############################################################################
# Fix #7: MenuPlan Approval Workflow
###############################################################################

print_info "Creating Fix #7: MenuPlan Approval Workflow..."

gh issue create \
  --title "Fix #7: MenuPlan Approval Workflow" \
  --label "phase1,high,sppg,enhancement,week-4" \
  --milestone "SPPG Phase 1" \
  --assignee "@me" \
  --body "## Fix Information

**Fix Number**: #7  
**Priority**: 🔥🔥 HIGH  
**Estimated Effort**: 12 hours  
**Assigned To**: Developer A  
**Timeline**: Week 4, Days 11-12 (November 7-8)  
**Dependencies**: None (runs parallel)

---

## Problem Statement

**Current Issues**:
- No approval workflow for menu plans
- Anyone can activate menu plans
- No audit trail for approvals
- Active menu plans without review
- No role-based approval permissions

**Impact**:
- Quality control risk
- Compliance issues
- No accountability
- Potential nutrition guideline violations
- Unapproved menus in production

**Baseline Metrics**:
- 🔴 Active MenuPlans without approval: 60%+ (30+ plans)
- 🔴 No approval audit trail
- 🔴 No approval workflow

---

## Solution Overview

**Database Changes**:
- Add approval fields to MenuPlan
- Add approvalStatus enum (DRAFT, PENDING, APPROVED, REJECTED)
- Add approver tracking
- Create approval audit trail

**Workflow**:
1. MenuPlan created in DRAFT status
2. Submit for approval → PENDING
3. SPPG_AHLI_GIZI or SPPG_KEPALA approves → APPROVED
4. Only APPROVED plans can be activated

**Services**:
- MenuPlanApprovalService
- ApprovalNotificationService

**APIs**:
- POST /api/sppg/menu-plan/[id]/submit
- POST /api/sppg/menu-plan/[id]/approve
- POST /api/sppg/menu-plan/[id]/reject

---

## Implementation Checklist

### Week 4 - Days 11-12

#### Database
- [ ] Add approval fields to MenuPlan
  - [ ] \`approvalStatus\` (Enum: DRAFT, PENDING, APPROVED, REJECTED)
  - [ ] \`submittedBy\` (FK to User)
  - [ ] \`submittedAt\` (DateTime)
  - [ ] \`approvedBy\` (FK to User)
  - [ ] \`approvedAt\` (DateTime)
  - [ ] \`rejectionReason\` (String, optional)
- [ ] Create MenuPlanApproval audit table
  - [ ] \`menuPlanId\`, \`userId\`, \`action\`, \`timestamp\`, \`notes\`
- [ ] Update existing MenuPlans to DRAFT
- [ ] Test migration on staging

#### Service Layer
- [ ] Create MenuPlanApprovalService
  - [ ] \`submitForApproval(menuPlanId, userId)\`
    - [ ] Validate plan completeness
    - [ ] Check nutrition guidelines
    - [ ] Set status to PENDING
  - [ ] \`approveMenuPlan(menuPlanId, approverId)\`
    - [ ] Verify approver role (AHLI_GIZI or KEPALA)
    - [ ] Set status to APPROVED
    - [ ] Record approval audit
  - [ ] \`rejectMenuPlan(menuPlanId, approverId, reason)\`
    - [ ] Set status to REJECTED
    - [ ] Record rejection reason
- [ ] Create ApprovalNotificationService
  - [ ] Notify approvers when submitted
  - [ ] Notify submitter when approved/rejected

#### API Layer
- [ ] Create POST /api/sppg/menu-plan/[id]/submit
  - [ ] Validate plan ready for approval
  - [ ] Update status to PENDING
- [ ] Create POST /api/sppg/menu-plan/[id]/approve
  - [ ] Check approver permissions
  - [ ] Approve plan
- [ ] Create POST /api/sppg/menu-plan/[id]/reject
  - [ ] Check approver permissions
  - [ ] Reject with reason
- [ ] Update POST /api/sppg/menu-plan/[id]/activate
  - [ ] Only allow if APPROVED

#### UI Layer
- [ ] Add approval status badges
- [ ] Create approval workflow UI
  - [ ] Submit for Approval button
  - [ ] Approve/Reject buttons (role-based)
  - [ ] Rejection reason modal
- [ ] Add approval history view
- [ ] Add pending approvals dashboard

#### Testing
- [ ] Unit tests for approval service
- [ ] Role permission tests
- [ ] Workflow state transition tests
- [ ] API integration tests
- [ ] UI component tests

---

## Success Criteria

- [ ] All active MenuPlans approved
- [ ] Approval workflow enforced
- [ ] Only AHLI_GIZI/KEPALA can approve
- [ ] Complete audit trail
- [ ] Cannot activate unapproved plans
- [ ] >85% test coverage

---

## Verification Queries

\`\`\`sql
-- Check approval status distribution
SELECT 
  \"approvalStatus\",
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM \"MenuPlan\"
GROUP BY \"approvalStatus\";

-- Check active plans are approved
SELECT 
  COUNT(*) as active_plans,
  COUNT(CASE WHEN \"approvalStatus\" = 'APPROVED' THEN 1 END) as approved,
  COUNT(CASE WHEN \"approvalStatus\" != 'APPROVED' THEN 1 END) as unapproved
FROM \"MenuPlan\"
WHERE status = 'ACTIVE';

-- Check approval audit trail
SELECT COUNT(*) as approval_records
FROM \"MenuPlanApproval\";
\`\`\`

---

## Related Documents

- Implementation Plan: \`docs/fixes/FIX07_MENU_PLAN_APPROVAL_WORKFLOW.md\`

---

## Dependencies

**Blocks**: None  
**Blocked By**: None (runs parallel with Fix #8)

---

## Notes

- Run parallel with Fix #8 (different developer)
- Consider email notifications for approvals
- Preserve approval history (audit compliance)
- May need role permission updates in Auth.js" || print_warning "Fix #7 issue may already exist"

print_success "Fix #7 issue created (or already exists)"

###############################################################################
# Fix #8: SchoolBeneficiary Address & GPS
###############################################################################

print_info "Creating Fix #8: SchoolBeneficiary Address & GPS..."

gh issue create \
  --title "Fix #8: SchoolBeneficiary Address & GPS" \
  --label "phase1,medium,sppg,enhancement,week-4" \
  --milestone "SPPG Phase 1" \
  --assignee "@me" \
  --body "## Fix Information

**Fix Number**: #8  
**Priority**: 🔥 MEDIUM  
**Estimated Effort**: 8 hours  
**Assigned To**: Developer B  
**Timeline**: Week 4, Days 11-12 (November 7-8)  
**Dependencies**: None (runs parallel)

---

## Problem Statement

**Current Issues**:
- Schools without GPS coordinates
- Inconsistent address formats
- No geocoding validation
- Manual address entry errors
- Cannot plan delivery routes

**Impact**:
- Delivery route optimization impossible
- Address disputes
- Failed deliveries
- No distance-based planning
- Poor logistics efficiency

**Baseline Metrics**:
- 🔴 Schools without GPS: 70%+ (350+ schools)
- 🔴 Inconsistent address formats: 80%+
- 🔴 No geocoding validation

---

## Solution Overview

**Database Changes**:
- Add GPS coordinates to SchoolBeneficiary
- Add address validation fields
- Ensure proper address structure

**Features**:
- GPS coordinate requirement
- Address geocoding (Google Maps API)
- Address format standardization
- GPS validation (coordinates in Indonesia)

**Services**:
- GeocodingService (Google Maps API)
- AddressValidationService
- DistanceCalculationService

**APIs**:
- POST /api/sppg/school/[id]/geocode
- GET /api/sppg/school/nearby

---

## Implementation Checklist

### Week 4 - Days 11-12

#### Database
- [ ] Add GPS fields to SchoolBeneficiary
  - [ ] \`latitude\` (Decimal, required)
  - [ ] \`longitude\` (Decimal, required)
  - [ ] \`gpsAccuracy\` (Decimal, optional)
  - [ ] \`addressFormatted\` (String, geocoded address)
  - [ ] \`lastGeocodedAt\` (DateTime)
- [ ] Make GPS required for new schools
- [ ] Backfill GPS for existing schools
- [ ] Test migration on staging

#### Service Layer
- [ ] Create GeocodingService
  - [ ] \`geocodeAddress(address)\` → {lat, lng, formatted}
  - [ ] Google Maps Geocoding API integration
  - [ ] Rate limiting handling
  - [ ] Cache geocoding results
- [ ] Create AddressValidationService
  - [ ] Validate address format
  - [ ] Check coordinates in Indonesia bounds
  - [ ] Standardize address format
- [ ] Create DistanceCalculationService
  - [ ] \`calculateDistance(lat1, lng1, lat2, lng2)\`
  - [ ] Haversine formula
  - [ ] Used for route planning

#### API Layer
- [ ] Create POST /api/sppg/school/[id]/geocode
  - [ ] Take address, return GPS
  - [ ] Update school coordinates
- [ ] Create GET /api/sppg/school/nearby
  - [ ] Find schools within radius
  - [ ] Used for distribution planning
- [ ] Update POST /api/sppg/school
  - [ ] Require GPS coordinates
  - [ ] Auto-geocode if only address provided
- [ ] Update PUT /api/sppg/school/[id]
  - [ ] Re-geocode if address changed

#### UI Layer
- [ ] Update SchoolForm
  - [ ] GPS input fields
  - [ ] Geocode button (address → GPS)
  - [ ] Map preview (show pin)
  - [ ] GPS validation feedback
- [ ] Add map view for schools
  - [ ] Show all schools on map
  - [ ] Click to view details
- [ ] Add bulk geocoding tool
  - [ ] Geocode all schools missing GPS
  - [ ] Progress indicator

#### Testing
- [ ] Unit tests for geocoding service
- [ ] GPS validation tests
- [ ] Distance calculation tests
- [ ] API integration tests
- [ ] UI component tests

---

## Success Criteria

- [ ] 100% schools have GPS coordinates
- [ ] All GPS coordinates validated (Indonesia bounds)
- [ ] Address format standardized
- [ ] Geocoding working (<2s per address)
- [ ] Distance calculation accurate
- [ ] >85% test coverage

---

## Verification Queries

\`\`\`sql
-- Check schools with GPS
SELECT 
  COUNT(*) as total_schools,
  COUNT(latitude) as with_gps,
  ROUND(100.0 * COUNT(latitude) / COUNT(*), 2) as gps_percentage
FROM \"SchoolBeneficiary\";

-- Check GPS coordinates in valid range (Indonesia)
-- Indonesia bounds: Lat -11 to 6, Lng 95 to 141
SELECT COUNT(*) as invalid_coordinates
FROM \"SchoolBeneficiary\"
WHERE latitude IS NOT NULL 
  AND (latitude < -11 OR latitude > 6 OR longitude < 95 OR longitude > 141);

-- Check address formatting
SELECT COUNT(*) as with_formatted_address
FROM \"SchoolBeneficiary\"
WHERE \"addressFormatted\" IS NOT NULL;
\`\`\`

---

## Related Documents

- Implementation Plan: \`docs/fixes/FIX08_SCHOOL_BENEFICIARY_ADDRESS_GPS.md\`

---

## Dependencies

**Blocks**: None  
**Blocked By**: None (runs parallel with Fix #7)

---

## Notes

- Run parallel with Fix #7 (different developer)
- Requires Google Maps API key (or alternative geocoding service)
- Consider caching geocoding results (save API calls)
- GPS accuracy critical for route optimization
- Validate coordinates in Indonesia bounds
- Consider bulk geocoding for existing schools
- May need GOOGLE_MAPS_API_KEY in environment" || print_warning "Fix #8 issue may already exist"

print_success "Fix #8 issue created (or already exists)"

print_header "✅ All GitHub Issues Created!"

echo "View all issues:"
echo "https://github.com/yasunstudio/bagizi-id/issues"
echo ""
echo "Next steps:"
echo "1. Review and assign issues to team members"
echo "2. Add to GitHub Project board"
echo "3. Create milestone: 'SPPG Phase 1'"
echo "4. Schedule kickoff meeting"
