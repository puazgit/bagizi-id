# Fix #3: Production Cost Calculation - Implementation Plan

## 🎯 Objective
Remove stored cost fields from FoodProduction and implement dynamic cost calculation based on actual stock usage.

## 📊 Current State Analysis

### Existing FoodProduction Cost Fields:
- `estimatedCost: Float` - Stored pre-calculated estimate
- `actualCost: Float?` - Stored actual cost (rarely filled: 33%)
- `costPerPortion: Float?` - Stored per-portion cost (never filled: 0%)

### Issues Identified:
1. **88% Cost Discrepancy**: Stored Rp 950K vs Calculated Rp 8.22M
2. **Stale Data**: Costs don't update when inventory prices change
3. **No Usage Tracking**: Can't verify which items were actually used
4. **ProductionStockUsage Missing**: Model doesn't exist yet

## 🏗️ Implementation Steps

### Step 1: Create ProductionStockUsage Model ✅ NEXT
```prisma
model ProductionStockUsage {
  id                String           @id @default(cuid())
  productionId      String
  inventoryItemId   String
  quantityUsed      Float
  unit              String
  unitCostAtUse     Float            // Cost per unit at time of use
  totalCost         Float            // quantityUsed * unitCostAtUse
  usedAt            DateTime         @default(now())
  recordedBy        String
  notes             String?
  
  production        FoodProduction   @relation(fields: [productionId], references: [id], onDelete: Cascade)
  inventoryItem     InventoryItem    @relation(fields: [inventoryItemId], references: [id])
  
  @@index([productionId])
  @@index([inventoryItemId])
  @@map("production_stock_usage")
}
```

### Step 2: Create ProductionCostCalculator Service
```typescript
export class ProductionCostCalculator {
  // Calculate total cost from stock usage records
  async calculateProductionCost(productionId: string): Promise<ProductionCostResult>
  
  // Calculate cost per portion
  async calculateCostPerPortion(productionId: string): Promise<number>
  
  // Get cost breakdown by ingredient
  async getCostBreakdown(productionId: string): Promise<CostBreakdownItem[]>
  
  // Record stock usage when production starts
  async recordStockUsage(productionId: string, usage: StockUsageInput[]): Promise<void>
}
```

### Step 3: Remove Stored Cost Fields (Migration)
- Remove `estimatedCost` from FoodProduction
- Remove `actualCost` from FoodProduction  
- Remove `costPerPortion` from FoodProduction
- Create Prisma migration
- Update all queries/APIs

### Step 4: Update Production Workflow
1. **When production starts**: Record actual stock usage in ProductionStockUsage
2. **When calculating costs**: Query ProductionStockUsage dynamically
3. **For reporting**: Aggregate from ProductionStockUsage table

## 📈 Expected Benefits

### Data Accuracy:
- ✅ Costs always reflect current inventory prices
- ✅ Track actual vs planned ingredient usage
- ✅ Historical cost accuracy (frozen at time of use)

### Financial Reporting:
- ✅ Real-time cost updates
- ✅ Cost variance analysis (planned vs actual)
- ✅ Ingredient-level cost breakdown

### Operational:
- ✅ Stock usage verification
- ✅ Waste tracking (planned - actual)
- ✅ Better procurement planning

## 🎯 Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Cost Accuracy | 88% discrepancy | <5% variance | Compare calculated vs actual |
| Data Freshness | Stale (never updates) | Real-time | Costs update with price changes |
| Usage Tracking | 0% tracked | 100% tracked | All productions have usage records |
| Cost Per Portion | 0% calculated | 100% calculated | All productions show cost/portion |

## 🚀 Implementation Priority

1. ✅ **HIGH**: Create ProductionStockUsage model (enables tracking)
2. ✅ **HIGH**: Implement ProductionCostCalculator service (enables calculation)
3. ⚠️ **MEDIUM**: Update production workflow (record usage on production start)
4. ⚠️ **MEDIUM**: Remove stored fields (clean up schema)
5. ⚠️ **LOW**: Migrate historical data (optional - can calculate retroactively)

## 📝 Notes

- **MenuIngredient quantities**: Currently per 100g portions, need to multiply by plannedPortions
- **Cost variance**: 88% suggests stored costs use different calculation logic
- **Historical data**: 3 existing productions can be used for testing
- **Production status**: Track usage when status changes to IN_PROGRESS or COMPLETED
