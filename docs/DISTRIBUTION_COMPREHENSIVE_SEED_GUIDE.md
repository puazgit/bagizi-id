# Distribution Domain Comprehensive Seed Documentation

## 📊 Overview

Comprehensive seeding script untuk **SEMUA** entitas terkait Distribution Domain di Bagizi-ID Platform.

## 🎯 What's Included

### PHASE 1 - DistributionSchedule
- **4 schedules** dengan status berbeda: COMPLETED, IN_PROGRESS, PLANNED
- Wave distribution: MORNING, MIDDAY  
- Target categories: TODDLER, EARLY_CHILDHOOD, ELEMENTARY_GRADE_1_3, ELEMENTARY_GRADE_4_6
- Packaging types, delivery methods, fuel costs, travel time estimations

### PHASE 2 - FoodDistribution
- **5 distributions** untuk test lifecycle komplet
- Status: COMPLETED, IN_TRANSIT, DISTRIBUTING, SCHEDULED, PREPARING
- Meal types: SARAPAN, MAKAN_SIANG, SNACK_PAGI, SNACK_SORE
- Temperature tracking (departure, arrival, serving)
- Weather conditions, quality grades, hygiene scores

### PHASE 3 - DistributionDelivery (GPS Tracking)
- **3+ deliveries** dengan GPS coordinates
- Real GPS coordinates untuk Purwakarta area (-6.54xx, 107.43xx)
- Status progression: ASSIGNED → DEPARTED → EN_ROUTE → ARRIVED → DELIVERED
- Route tracking points (GPS trail arrays)
- Recipient signatures, food quality checks
- Delivery photos, delivery completion timestamps

### Supporting Entities
- **VehicleAssignment**: 2+ assignments dengan mileage tracking
- **DeliveryPhoto**: 3+ photos per completed delivery (FOOD_PACKAGE, DELIVERY_PROOF, RECIPIENT)
- **DeliveryTracking**: 5+ GPS points per delivery (speed, heading, accuracy, timestamps)
- **DeliveryIssue**: Traffic issues, packaging problems
- **BeneficiaryReceipt**: Receipt records dengan signatures

## 🔧 How to Use

### 1. Update master seed file

**File**: `prisma/seed.ts`

```typescript
// Replace the import:
// import { seedDistribution } from './seeds/distribution-seed'

// With comprehensive version:
import { seedDistributionComprehensive } from './seeds/distribution-comprehensive-seed'

// Then in main() function, replace:
// await seedDistribution(prisma, sppgs, programs)

// With:
await seedDistributionComprehensive(prisma, sppgs, programs)
```

### 2. Run the seed

```bash
# Reset database and seed everything
npx prisma db seed

# Or use npm script
npm run db:seed

# Or use make command
make db-seed
```

### 3. Verify the data

```bash
# Open Prisma Studio
npx prisma studio

# Check tables:
# - DistributionSchedule (should have 4 records)
# - FoodDistribution (should have 5 records)
# - DistributionDelivery (should have 3+ records)
# - VehicleAssignment (should have 2+ records)
# - DeliveryPhoto (should have 3+ records)
# - DeliveryTracking (should have 8+ records)
# - DeliveryIssue (should have 1+ records)
# - BeneficiaryReceipt (should have 1+ records)
```

## 📍 GPS Coordinates Used

All GPS coordinates are realistic for Purwakarta, West Java:

- **SPPG Base**: `-6.5456, 107.4323`
- **School 1**: `-6.5467, 107.4333`
- **School 2**: `-6.5478, 107.4345`
- **School 3**: `-6.5489, 107.4356`
- **En-route positions**: Various points between base and schools

## 🎭 Test Scenarios

### Scenario 1: Completed Distribution (Last Week)
- Schedule Status: COMPLETED
- Distribution Status: COMPLETED
- Delivery Status: DELIVERED
- Has: Full GPS tracking, photos, receipt
- Perfect for testing completed workflows

### Scenario 2: In-Transit Distribution (Today)
- Schedule Status: IN_PROGRESS
- Distribution Status: IN_TRANSIT
- Delivery Status: EN_ROUTE
- Has: Active GPS tracking, live updates
- Perfect for testing real-time GPS features

### Scenario 3: Assigned Distribution (Today)
- Schedule Status: IN_PROGRESS
- Distribution Status: DISTRIBUTING
- Delivery Status: ASSIGNED
- Has: Not yet departed
- Perfect for testing assignment workflows

### Scenario 4: Future Distribution (Tomorrow)
- Schedule Status: PLANNED
- Distribution Status: SCHEDULED
- Perfect for testing scheduling features

### Scenario 5: Preparing Distribution (Today +2 hours)
- Schedule Status: IN_PROGRESS
- Distribution Status: PREPARING
- Perfect for testing preparation phase

## 🔍 What to Test

### Dashboard Stats
- Navigate to `/distribution`
- Verify "Quick Access" cards show correct counts
- Verify stats match seeded data

### Schedule Management (PHASE 1)
- Navigate to `/distribution/schedule`
- Should see 4 schedules with different statuses
- Test filtering by wave, status, date

### Execution Management (PHASE 2)
- Navigate to `/distribution/execution`
- Should see 5 distributions with lifecycle states
- Test status progression workflows

### GPS Tracking (PHASE 3)
- Navigate to `/distribution/delivery`
- Should see deliveries with GPS coordinates
- Test real-time GPS tracking map
- Verify route trail shows correct path

### Photos & Issues
- Open completed delivery details
- Should see 3 photos with captions
- Should see any reported issues
- Verify photo metadata (location, timestamp)

## 🚨 Troubleshooting

### Issue: "SPPG Purwakarta not found"
**Solution**: Make sure to run full seed, not just distribution seed. The master seed creates SPPG first.

### Issue: "No programs found"
**Solution**: Ensure menu seed runs before distribution seed. Check `prisma/seed.ts` execution order.

### Issue: "No schools found"
**Solution**: Ensure school-seed.ts creates SchoolBeneficiary records. Check if schools-seed runs before distribution-seed.

### Issue: "No vehicles found"
**Solution**: Check if vehicle-seed or hrd-seed creates Vehicle records for SPPG Purwakarta.

## 📊 Seed Summary Output

Expected console output:

```
→ Creating COMPREHENSIVE distribution data (ALL PHASES)...
✅ Found: 10 menus, 5 schools, 3 vehicles
→ Creating DistributionSchedule entities...
✅ Created 4 DistributionSchedule entities
→ Creating FoodDistribution executions...
✅ Created 5 FoodDistribution entities
→ Creating DistributionDelivery with GPS tracking...
✅ Created 3 DistributionDelivery entities
→ Creating VehicleAssignment...
✅ Created 2 VehicleAssignment entities
→ Creating DeliveryPhoto...
✅ Created 3 DeliveryPhoto entities
→ Creating DeliveryTracking (GPS trail)...
✅ Created 8 DeliveryTracking points
→ Creating DeliveryIssue...
✅ Created 1 DeliveryIssue entities
→ Creating BeneficiaryReceipt...
✅ Created 1 BeneficiaryReceipt entities

📊 COMPREHENSIVE Distribution Seed Summary:
   - DistributionSchedule (PHASE 1): 4
   - FoodDistribution (PHASE 2): 5
   - DistributionDelivery (PHASE 3): 3
   - VehicleAssignment: 2
   - DeliveryPhoto: 3
   - DeliveryTracking (GPS): 8
   - DeliveryIssue: 1
   - BeneficiaryReceipt: 1
✅ ALL DISTRIBUTION PHASES SEEDED!
```

## 📝 Next Steps

1. **Run the seed** as described above
2. **Open browser** to `http://localhost:3000/distribution`
3. **Test each feature**:
   - ✅ Quick access cards show correct counts
   - ✅ Distribution list displays all records
   - ✅ GPS map shows delivery locations
   - ✅ Timeline shows status progression
   - ✅ Photos display correctly
   - ✅ Issues are tracked properly
4. **Verify API endpoints**:
   - `GET /api/sppg/distribution` - List all distributions
   - `GET /api/sppg/distribution/schedule` - List schedules
   - `GET /api/sppg/distribution/delivery` - List deliveries with GPS
   - `GET /api/sppg/distribution/schedule/statistics` - Schedule stats
   - `GET /api/sppg/distribution/execution/statistics` - Execution stats

## ✅ Success Criteria

- [ ] All 8 entity types seeded successfully
- [ ] GPS coordinates are realistic and trackable
- [ ] Status progression makes logical sense
- [ ] Timestamps are in correct chronological order
- [ ] Foreign key relationships are valid
- [ ] Photos have proper metadata
- [ ] Tracking points show realistic movement
- [ ] Dashboard displays correct statistics

---

**🎉 You now have a fully seeded Distribution domain ready for comprehensive testing of all 3 PHASES!**
