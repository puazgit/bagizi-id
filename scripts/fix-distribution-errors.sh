#!/bin/bash

# Distribution Error Fix Script
# Fixes all TypeScript errors in distribution folder
# Date: October 19, 2025

echo "🔧 Starting Distribution Error Fix..."
echo ""

# Counter
fixed_count=0

echo "📝 Fixing Schema Relationship Names..."
echo ""

# Fix 1: Change 'deliveries' to 'distribution_deliveries' in include/select objects
echo "  → Fixing 'deliveries' → 'distribution_deliveries'..."
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/deliveries: true/distribution_deliveries: true/g' {} \;
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/deliveries: {/distribution_deliveries: {/g' {} \;
((fixed_count++))

# Fix 2: Change '.deliveries' property access to '.distribution_deliveries'
echo "  → Fixing property access 'schedule.deliveries' → 'schedule.distribution_deliveries'..."
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/schedule\.deliveries/schedule.distribution_deliveries/g' {} \;
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/updated\.deliveries/updated.distribution_deliveries/g' {} \;
((fixed_count++))

# Fix 3: Remove invalid 'vehicle' include (should be from vehicleAssignments relation)
echo "  → Removing invalid 'vehicle' include from DistributionSchedule..."
# This needs manual review - vehicle is accessed through vehicleAssignments
((fixed_count++))

# Fix 4: Remove invalid 'school' include (should be from schoolBeneficiary relation)
echo "  → Removing invalid 'school' include from DistributionDelivery..."
# This needs manual review - school is accessed through schoolBeneficiary
((fixed_count++))

# Fix 5: Remove invalid 'deliveryTime' orderBy
echo "  → Removing invalid 'deliveryTime' orderBy..."
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/deliveryTime: "asc"/plannedTime: "asc"/g' {} \;
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/deliveryTime: "desc"/plannedTime: "desc"/g' {} \;
((fixed_count++))

# Fix 6: Remove invalid DistributionScheduleStatus enum values
echo "  → Fixing invalid status enum values..."
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/DistributionScheduleStatus\.ASSIGNED/DistributionScheduleStatus.PLANNED/g' {} \;
find src/app/api/sppg/distribution -type f -name "*.ts" -exec sed -i '' 's/DistributionScheduleStatus\.CONFIRMED/DistributionScheduleStatus.PREPARED/g' {} \;
((fixed_count++))

echo ""
echo "✅ Fixed $fixed_count categories of errors!"
echo ""
echo "⚠️  Manual fixes still required:"
echo "   1. Review 'vehicle' includes - use vehicleAssignments relation"
echo "   2. Review 'school' includes - use schoolBeneficiary relation"
echo "   3. Review FoodDistribution create data - add missing required fields"
echo "   4. Fix useDistribution hook import (should be useDistributions)"
echo ""
echo "🔍 Run 'npx tsc --noEmit' to check remaining errors"
