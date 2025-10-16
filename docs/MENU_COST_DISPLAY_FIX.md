# Menu Cost Display - Planning vs Actual Cost Fix

**Date**: October 15, 2025, 04:20 WIB  
**Issue**: Different cost values shown in Info Dasar tab vs Calculate Cost result  
**Status**: ⚠️ **IDENTIFIED - SOLUTION PROPOSED**

---

## 🐛 Problem Description

### User Report
When clicking "Hitung Biaya" button on menu detail page:
- **Toast message shows**: "Total: Rp 12.880 | Per Porsi: Rp 12.880"
- **Info Dasar tab shows**: "Biaya per Porsi: Rp 8.500,00"

**Question**: Which one is correct? Is there hardcoded/mock data in Info Dasar tab?

---

## 🔍 Root Cause Analysis

### Problem 1: Two Different Cost Fields

**Field 1: `costPerServing`** (Static Planning Value)
- **Location**: `NutritionMenu` table
- **Type**: Static value for budget planning
- **Source**: Hardcoded in seed data
- **Value**: Rp 8.500 (from seed file)
- **Purpose**: Initial budget estimation

**Field 2: `costPerPortion`** (Calculated Real Value)
- **Location**: `MenuCostCalculation` table
- **Type**: Dynamic calculation result
- **Source**: Real-time calculation from ingredients + operational costs
- **Value**: Rp 12.880 (actual calculation)
- **Purpose**: Accurate cost tracking

### Problem 2: Hardcoded Seed Data

**File**: `prisma/seeds/menu-seed.ts`

**Line 244**:
```typescript
costPerServing: 8500,  // ❌ Hardcoded value
```

This value is used for **initial budget planning** but does NOT reflect actual ingredient costs.

### Problem 3: Default plannedPortions = 1

**File**: `src/app/api/sppg/menu/[id]/calculate-cost/route.ts`

**Line 129**:
```typescript
const plannedPortions = body.plannedPortions || 1  // Default to 1
```

This causes:
- `grandTotalCost = 12.880` (total for 1 portion)
- `costPerPortion = 12.880 / 1 = 12.880`

So the toast shows: "Total: Rp 12.880 | Per Porsi: Rp 12.880" (same values)

---

## 📊 Data Flow Comparison

### Info Dasar Tab (Current Display)

**Source**: `NutritionMenu.costPerServing`

```tsx
// src/app/(sppg)/menu/[id]/page.tsx (Line 288-293)
<div>
  <p className="text-sm font-medium text-muted-foreground">Biaya per Porsi</p>
  <p className="text-lg font-semibold">
    {new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(menu.costPerServing)}  // ❌ Shows hardcoded 8500
  </p>
</div>
```

**Value**: Rp 8.500 (static from seed)

### Calculate Cost Result (Accurate)

**Source**: API calculation from actual ingredients

**Calculation Flow**:
1. Sum all ingredient costs: `totalIngredientCost`
2. Add labor costs: `totalLaborCost` (if provided)
3. Add utility costs: `totalUtilityCost` (if provided)
4. Add operational costs: packaging, equipment, cleaning
5. Add overhead (15% default)
6. **Result**: `grandTotalCost = 12.880`

**Value**: Rp 12.880 (calculated from real data)

---

## 🎯 Which Value is Correct?

### Answer: **Both are correct, but serve different purposes**

| Field | Value | Purpose | Accuracy |
|-------|-------|---------|----------|
| **`costPerServing`** | Rp 8.500 | Initial budget planning | ⚠️ Estimate only |
| **`costPerPortion`** | Rp 12.880 | Actual cost tracking | ✅ Real calculation |

### Why the Difference?

**`costPerServing` (Rp 8.500)** includes:
- ✅ Rough ingredient estimate
- ❌ No labor costs
- ❌ No utility costs
- ❌ No operational costs
- ❌ No overhead
- **Result**: Underestimated

**`costPerPortion` (Rp 12.880)** includes:
- ✅ Actual ingredient costs from inventory
- ✅ Labor costs (if calculated)
- ✅ Utility costs (if calculated)
- ✅ Operational costs
- ✅ 15% overhead
- **Result**: Accurate total cost

---

## ✅ Recommended Solutions

### Solution 1: Show Calculated Cost in Info Dasar (Recommended)

**Change Info Dasar to show calculated cost if available, fallback to planning cost**

**Implementation**:
```tsx
// src/app/(sppg)/menu/[id]/page.tsx
<div>
  <p className="text-sm font-medium text-muted-foreground">Biaya per Porsi</p>
  <div className="space-y-1">
    {menu.costCalc?.costPerPortion ? (
      <>
        <p className="text-lg font-semibold text-foreground">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(menu.costCalc.costPerPortion)}
        </p>
        <Badge variant="outline" className="text-xs">
          Dihitung dari bahan aktual
        </Badge>
      </>
    ) : (
      <>
        <p className="text-lg font-semibold text-muted-foreground">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(menu.costPerServing)}
        </p>
        <Badge variant="secondary" className="text-xs">
          Estimasi perencanaan
        </Badge>
      </>
    )}
  </div>
</div>
```

**Benefits**:
- ✅ Shows accurate cost when available
- ✅ Falls back to planning cost if not calculated yet
- ✅ Clear label indicates which value is shown
- ✅ Encourages users to calculate actual cost

### Solution 2: Show Both Values Side-by-Side

**Display both planning and calculated costs for comparison**

**Implementation**:
```tsx
<div className="space-y-4">
  {/* Planning Cost */}
  <div>
    <p className="text-sm font-medium text-muted-foreground">
      Biaya Perencanaan
    </p>
    <p className="text-base">
      {new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(menu.costPerServing)}
    </p>
    <Badge variant="secondary" className="mt-1 text-xs">
      Estimasi awal
    </Badge>
  </div>

  {/* Calculated Cost (if available) */}
  {menu.costCalc?.costPerPortion && (
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        Biaya Aktual (Terhitung)
      </p>
      <p className="text-lg font-semibold">
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(menu.costCalc.costPerPortion)}
      </p>
      <Badge variant="default" className="mt-1 text-xs">
        Dari perhitungan real
      </Badge>
      
      {/* Show variance */}
      {(() => {
        const variance = menu.costCalc.costPerPortion - menu.costPerServing
        const percentageVariance = (variance / menu.costPerServing * 100).toFixed(1)
        const isOverBudget = variance > 0
        
        return (
          <p className={`text-xs mt-1 ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
            {isOverBudget ? '↑' : '↓'} {Math.abs(Number(percentageVariance))}% 
            {isOverBudget ? ' over budget' : ' under budget'}
          </p>
        )
      })()}
    </div>
  )}
</div>
```

**Benefits**:
- ✅ Shows full transparency
- ✅ Allows comparison between plan vs actual
- ✅ Shows budget variance
- ✅ Helps SPPG manager make informed decisions

---

## 🔧 Recommended Implementation: Solution 1 + Enhancement

### Enhanced Info Dasar Display

```tsx
// Info Dasar - Biaya per Porsi section
<div>
  <p className="text-sm font-medium text-muted-foreground">Biaya per Porsi</p>
  
  {menu.costCalc?.costPerPortion ? (
    // Show calculated cost (accurate)
    <div className="space-y-2">
      <p className="text-lg font-semibold text-foreground">
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(menu.costCalc.costPerPortion)}
      </p>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Terhitung dari bahan aktual
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(menu.costCalc.calculatedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      </div>
      
      {/* Show variance if significant */}
      {Math.abs(menu.costCalc.costPerPortion - menu.costPerServing) > 100 && (
        <p className="text-xs text-muted-foreground">
          Estimasi awal: {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(menu.costPerServing)}
          {' '}
          <span className={menu.costCalc.costPerPortion > menu.costPerServing ? 'text-destructive' : 'text-green-600'}>
            ({menu.costCalc.costPerPortion > menu.costPerServing ? '+' : ''}
            {((menu.costCalc.costPerPortion - menu.costPerServing) / menu.costPerServing * 100).toFixed(1)}%)
          </span>
        </p>
      )}
    </div>
  ) : (
    // Show planning cost (estimate)
    <div className="space-y-2">
      <p className="text-lg font-semibold text-muted-foreground">
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(menu.costPerServing)}
      </p>
      <Badge variant="secondary" className="text-xs">
        Estimasi perencanaan
      </Badge>
      <p className="text-xs text-muted-foreground mt-1">
        Klik "Hitung Biaya" untuk mendapatkan biaya aktual
      </p>
    </div>
  )}
</div>
```

---

## 📋 Implementation Checklist

### Phase 1: Display Fix (Priority 1) - READY TO IMPLEMENT
- [ ] Update Info Dasar to show calculated cost if available
- [ ] Add badge to indicate cost type (calculated vs estimated)
- [ ] Add timestamp for last calculation
- [ ] Show variance between plan vs actual
- [ ] Add helper text when calculation not done

### Phase 2: UX Enhancement (Priority 2)
- [ ] Update toast message format
- [ ] Add visual indicator for missing/outdated calculation
- [ ] Add "needs recalculation" warning if menu updated after calc

### Phase 3: Data Quality (Priority 3)
- [ ] Update seed data with realistic `costPerServing` values
- [ ] Add validation to warn if variance > 50%

---

## 📊 Cost Calculation Formula (Reference)

### Full Cost Breakdown

```typescript
// 1. Direct Costs
totalIngredientCost     // From actual inventory items
totalLaborCost          // Prep + cooking labor
totalUtilityCost        // Gas + electricity + water

totalDirectCost = totalIngredientCost + totalLaborCost + totalUtilityCost

// 2. Indirect Costs
packagingCost          // Packaging materials
equipmentCost          // Equipment depreciation
cleaningCost           // Cleaning supplies
overheadCost           // 15% of direct costs (default)

totalIndirectCost = packagingCost + equipmentCost + cleaningCost + overheadCost

// 3. Grand Total
grandTotalCost = totalDirectCost + totalIndirectCost

// 4. Per Portion
costPerPortion = grandTotalCost / plannedPortions
```

---

## 📝 Summary

### Issue
Two different cost values shown:
- Info Dasar: Rp 8.500 (hardcoded planning value)
- Calculate Cost: Rp 12.880 (calculated actual value)

### Root Cause
- `costPerServing` is static value from seed data (for planning)
- `costPerPortion` is dynamic calculation (actual cost)
- UI didn't distinguish between the two

### Solution
- Show calculated cost in Info Dasar when available
- Add clear badges to indicate cost type
- Show calculation timestamp
- Display variance between plan vs actual

### Impact
- ✅ Clear understanding of cost values
- ✅ Better budget planning
- ✅ Accurate cost tracking
- ✅ Improved user experience

---

**Documented by**: GitHub Copilot AI Assistant  
**Date**: October 15, 2025, 04:20 WIB  
**Status**: ⚠️ Solution proposed - Ready for implementation  
**Next Step**: Implement enhanced Info Dasar display
