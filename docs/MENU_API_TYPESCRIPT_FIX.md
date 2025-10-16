# 🔧 Menu API Route TypeScript Fixes

## Issues Fixed

### Problem
TypeScript compilation errors in `/src/app/api/sppg/menu/[id]/route.ts`:

```
❌ Error 1: 'unitPrice' does not exist in type 'InventoryItemSelect'
❌ Error 2: 'createdAt' does not exist in type 'MenuIngredientOrderByWithRelationInput'
❌ Error 3: 'recipeNotes' does not exist in NutritionMenu (suggested: 'recipeSteps')
❌ Error 4: 'nutritionCalculation' does not exist in 'NutritionMenuInclude'
```

### Root Cause
Field names in API route didn't match Prisma schema model definitions.

---

## Solutions Applied

### Fix 1: InventoryItem Select Fields ✅
```typescript
// ❌ Before (Wrong Field Name)
inventoryItem: {
  select: {
    unitPrice: true,  // Does not exist
  }
}

// ✅ After (Correct Field Names)
inventoryItem: {
  select: {
    costPerUnit: true,  // ✅ Exists in schema
    lastPrice: true,    // ✅ Backup price field
  }
}
```

**Schema Reference**:
```prisma
model InventoryItem {
  costPerUnit  Float?  // Current cost per unit for menu calculations
  lastPrice    Float?  // Last purchase price
  averagePrice Float?  // Average price
}
```

---

### Fix 2: Remove Invalid OrderBy ✅
```typescript
// ❌ Before (Invalid OrderBy)
ingredients: {
  include: { ... },
  orderBy: {
    createdAt: 'asc',  // createdAt doesn't exist on MenuIngredient
  }
}

// ✅ After (OrderBy Removed)
ingredients: {
  include: { ... },
  // No orderBy - use default order or order in frontend
}
```

**Reason**: `MenuIngredient` model doesn't have `createdAt` field in schema.

---

### Fix 3: Update Menu Data Fields ✅
```typescript
// ❌ Before (Invalid Field)
data: {
  menuName: body.menuName,
  recipeNotes: body.recipeNotes,  // Does not exist
}

// ✅ After (Valid Fields from Schema)
data: {
  menuName: body.menuName,
  menuCode: body.menuCode,
  description: body.description,
  mealType: body.mealType,
  servingSize: body.servingSize,
  preparationTime: body.preparationTime,
  cookingTime: body.cookingTime,
  difficulty: body.difficulty,
  cookingMethod: body.cookingMethod,
}
```

**Schema Reference**:
```prisma
model NutritionMenu {
  menuName         String
  menuCode         String
  description      String?
  mealType         MealType
  servingSize      Int
  preparationTime  Int?
  cookingTime      Int?
  difficulty       String?
  cookingMethod    String?
  // Note: recipeNotes does NOT exist
}
```

---

### Fix 4: Relation Field Names ✅
```typescript
// ❌ Before (Wrong Relation Names)
include: {
  nutritionCalculation: true,  // Does not exist
  costCalculation: true,       // Does not exist
}

// ✅ After (Correct Relation Names)
include: {
  nutritionCalc: true,  // ✅ Correct relation name
  costCalc: true,       // ✅ Correct relation name
}
```

**Schema Reference**:
```prisma
model NutritionMenu {
  // Relations
  nutritionCalc  MenuNutritionCalculation?  // ✅ This is the correct name
  costCalc       MenuCostCalculation?       // ✅ This is the correct name
}
```

---

## Final Working Code

### GET Endpoint - Include Section
```typescript
const menu = await db.nutritionMenu.findFirst({
  where: {
    id,
    program: {
      sppgId: session.user.sppgId,
    },
  },
  include: {
    program: {
      select: {
        id: true,
        name: true,
        sppgId: true,
        programType: true,
        targetGroup: true,
      },
    },
    ingredients: {
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            itemCode: true,
            category: true,
            unit: true,
            costPerUnit: true,  // ✅ Fixed
            lastPrice: true,    // ✅ Fixed
          },
        },
      },
      // ✅ Removed invalid orderBy
    },
    recipeSteps: {
      orderBy: {
        stepNumber: 'asc',
      },
    },
    nutritionCalc: true,  // ✅ Fixed
    costCalc: true,       // ✅ Fixed
  },
})
```

### PUT Endpoint - Update Section
```typescript
const updatedMenu = await db.nutritionMenu.update({
  where: { id },
  data: {
    menuName: body.menuName,
    menuCode: body.menuCode,
    description: body.description,
    mealType: body.mealType,
    servingSize: body.servingSize,
    preparationTime: body.preparationTime,  // ✅ Valid field
    cookingTime: body.cookingTime,          // ✅ Valid field
    difficulty: body.difficulty,            // ✅ Valid field
    cookingMethod: body.cookingMethod,      // ✅ Valid field
    // ✅ Removed recipeNotes (doesn't exist)
  },
  include: {
    // ... same as GET
    nutritionCalc: true,  // ✅ Fixed
    costCalc: true,       // ✅ Fixed
  },
})
```

---

## Verification

### TypeScript Compilation ✅
```bash
✅ No errors found in route.ts
✅ All field names match Prisma schema
✅ All relations use correct names
✅ Type safety maintained
```

### Schema Alignment ✅
```
✅ InventoryItem.costPerUnit (not unitPrice)
✅ InventoryItem.lastPrice (backup price)
✅ NutritionMenu.nutritionCalc (not nutritionCalculation)
✅ NutritionMenu.costCalc (not costCalculation)
✅ No createdAt on MenuIngredient
✅ No recipeNotes on NutritionMenu
```

---

## Impact

### Before Fix
- ❌ TypeScript compilation fails
- ❌ API endpoint cannot be deployed
- ❌ Menu detail page cannot fetch data
- ❌ Type safety compromised

### After Fix
- ✅ TypeScript compilation successful
- ✅ API endpoint ready for use
- ✅ Menu detail page can fetch full data
- ✅ Type safety enforced
- ✅ Proper Prisma relations loaded

---

## Lessons Learned

### 1. Always Check Prisma Schema First
Before writing Prisma queries:
- ✅ Check exact field names in schema
- ✅ Check relation names (can be different from model name)
- ✅ Verify which fields exist for orderBy
- ✅ Check if field is optional or required

### 2. Use Prisma Studio for Reference
```bash
npm run db:studio
# Open http://localhost:5555
# Browse schema to see exact field names
```

### 3. TypeScript Errors Are Your Friend
- ❌ Don't ignore TypeScript errors
- ✅ They prevent runtime bugs
- ✅ They ensure schema alignment
- ✅ They catch typos early

### 4. Common Pitfalls
```typescript
// ❌ Common Mistakes
nutritionCalculation  // Wrong - actual name is nutritionCalc
costCalculation       // Wrong - actual name is costCalc
unitPrice            // Wrong - use costPerUnit or lastPrice
recipeNotes          // Wrong - this field doesn't exist

// ✅ Correct Names
nutritionCalc        // Relation name from schema
costCalc             // Relation name from schema
costPerUnit          // Field for current cost
lastPrice            // Field for last purchase price
```

---

## Files Modified

### `/src/app/api/sppg/menu/[id]/route.ts`
**Lines Changed**:
- Line 67: `unitPrice` → `costPerUnit, lastPrice`
- Line 72: Removed `orderBy: { createdAt: 'asc' }`
- Line 169: `recipeNotes` → valid menu fields
- Line 189: `nutritionCalculation` → `nutritionCalc`
- Line 190: `costCalculation` → `costCalc`

**Total Changes**: 5 fixes

---

## Testing

### Compilation Test ✅
```bash
npm run lint
# Result: No TypeScript errors
```

### API Test ✅
```bash
# Test GET endpoint
curl http://localhost:3000/api/sppg/menu/{id}

# Expected: JSON response with full menu data
# Actual: ✅ Returns proper JSON
```

### Frontend Test ✅
```bash
# Open menu detail page
http://localhost:3000/menu/{id}

# Expected: All 5 tabs load properly
# Actual: ✅ Page loads without JSON parse error
```

---

## Summary

**Issues**: 4 TypeScript compilation errors  
**Root Cause**: Field names didn't match Prisma schema  
**Solution**: Updated field names to match schema exactly  
**Result**: ✅ All errors fixed, API endpoint working  

**Status**: ✅ **READY FOR USE**

---

**Date**: October 14, 2025  
**File**: `src/app/api/sppg/menu/[id]/route.ts`  
**Status**: ✅ Fixed  
**TypeScript Errors**: 0 ❌
