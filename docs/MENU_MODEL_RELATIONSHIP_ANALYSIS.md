# 📊 Analisis Relasi Model Menu (NutritionMenu)

**Tanggal Analisis**: 20 Oktober 2025  
**Versi Schema**: Prisma v6.17.1  
**Analyst**: GitHub Copilot

---

## 🎯 Executive Summary

Model `NutritionMenu` adalah **core entity** dalam domain menu dan gizi SPPG dengan **15+ relasi langsung** dan **20+ relasi tidak langsung** yang membentuk ekosistem lengkap dari perencanaan hingga evaluasi menu.

### Kategori Relasi:
1. **Core Relations (Wajib)**: 7 model
2. **Operational Relations**: 5 model
3. **Planning Relations**: 3 model
4. **Quality & Feedback Relations**: 4 model
5. **Research & Development Relations**: 2 model
6. **Supporting Relations**: 3 model

---

## 📋 1. Core Relations (Wajib)

### 1.1 NutritionProgram (Parent - Mandatory)
```prisma
model NutritionMenu {
  programId  String
  program    NutritionProgram @relation(fields: [programId], references: [id], onDelete: Cascade)
}
```

**Relasi**: `Many-to-One` (Cascade Delete)  
**Deskripsi**: Setiap menu **HARUS** terhubung dengan satu program gizi  
**Business Logic**:
- Menu adalah bagian dari program gizi tertentu
- Ketika program dihapus, semua menu ikut terhapus
- Satu program bisa memiliki banyak menu dengan variasi meal type

**Query Pattern**:
```typescript
// Get all menus in a program
const menus = await db.nutritionMenu.findMany({
  where: { programId: 'program-id' },
  include: { program: true }
})
```

---

### 1.2 MenuIngredient (Children - Composition)
```prisma
model MenuIngredient {
  id               String         @id @default(cuid())
  menuId           String
  inventoryItemId  String?
  ingredientName   String
  quantity         Float
  unit             String
  costPerUnit      Float
  totalCost        Float
  // ... fields
  menu             NutritionMenu  @relation(fields: [menuId], references: [id], onDelete: Cascade)
  inventoryItem    InventoryItem? @relation(fields: [inventoryItemId], references: [id])
}
```

**Relasi**: `One-to-Many` (Cascade Delete)  
**Deskripsi**: Komposisi bahan-bahan yang membentuk menu  
**Business Logic**:
- Setiap menu memiliki multiple ingredients
- Ingredient bisa terhubung dengan InventoryItem (optional)
- Total cost menu dihitung dari sum of ingredient costs
- Cascade delete: hapus menu = hapus semua ingredients

**Query Pattern**:
```typescript
// Get menu with all ingredients and inventory details
const menu = await db.nutritionMenu.findUnique({
  where: { id: 'menu-id' },
  include: {
    ingredients: {
      include: {
        inventoryItem: true // Get stock info
      }
    }
  }
})

// Calculate total ingredient cost
const totalCost = menu.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)
```

---

### 1.3 RecipeStep (Children - Instructions)
```prisma
model RecipeStep {
  id           String        @id @default(cuid())
  menuId       String
  stepNumber   Int
  title        String?
  instruction  String
  duration     Int?
  temperature  Float?
  equipment    String[]
  qualityCheck String?
  imageUrl     String?
  videoUrl     String?
  menu         NutritionMenu @relation(fields: [menuId], references: [id], onDelete: Cascade)
  
  @@unique([menuId, stepNumber])
}
```

**Relasi**: `One-to-Many` (Cascade Delete)  
**Deskripsi**: Step-by-step cooking instructions untuk menu  
**Business Logic**:
- Urutan langkah masak (stepNumber harus unique per menu)
- Termasuk equipment, temperature, duration untuk setiap step
- Quality check points untuk memastikan kualitas
- Multimedia support (images, videos) untuk training

**Query Pattern**:
```typescript
// Get menu with ordered recipe steps
const menuWithRecipe = await db.nutritionMenu.findUnique({
  where: { id: 'menu-id' },
  include: {
    recipeSteps: {
      orderBy: { stepNumber: 'asc' }
    }
  }
})

// Calculate total cooking time
const totalTime = menuWithRecipe.recipeSteps.reduce(
  (sum, step) => sum + (step.duration || 0), 
  0
)
```

---

### 1.4 MenuNutritionCalculation (One-to-One - Computed)
```prisma
model MenuNutritionCalculation {
  id                      String                @id @default(cuid())
  menuId                  String                @unique
  requirementId           String?
  totalCalories           Float                 @default(0)
  totalProtein            Float                 @default(0)
  totalCarbs              Float                 @default(0)
  totalFat                Float                 @default(0)
  totalFiber              Float                 @default(0)
  // ... 20+ nutrition fields
  caloriesDV              Float                 @default(0) // Daily Value %
  proteinDV               Float                 @default(0)
  meetsCalorieAKG         Boolean               @default(false)
  meetsProteinAKG         Boolean               @default(false)
  meetsAKG                Boolean               @default(false)
  excessNutrients         String[]
  deficientNutrients      String[]
  adequateNutrients       String[]
  isStale                 Boolean               @default(false)
  staleReason             String?
  ingredientsLastModified DateTime?
  menu                    NutritionMenu         @relation(...)
  requirement             NutritionRequirement? @relation(...)
}
```

**Relasi**: `One-to-One` (Cascade Delete)  
**Deskripsi**: Agregasi nilai gizi dari semua ingredients  
**Business Logic**:
- Auto-calculated dari MenuIngredient data
- Compared dengan NutritionRequirement (AKG/RDA)
- Tracking stale data (perlu recalculate jika ingredients berubah)
- Detailed DV% (Daily Value percentage) untuk setiap nutrisi

**Calculation Trigger**:
1. Create/Update MenuIngredient
2. Update InventoryItem nutrition info
3. Manual recalculation request

**Query Pattern**:
```typescript
// Get menu with nutrition calculation
const menuWithNutrition = await db.nutritionMenu.findUnique({
  where: { id: 'menu-id' },
  include: {
    nutritionCalc: {
      include: {
        requirement: true // AKG reference
      }
    }
  }
})

// Check if meets standards
const meetsStandards = menuWithNutrition.nutritionCalc?.meetsAKG
const deficiencies = menuWithNutrition.nutritionCalc?.deficientNutrients || []
```

---

### 1.5 MenuCostCalculation (One-to-One - Computed)
```prisma
model MenuCostCalculation {
  id                      String        @id @default(cuid())
  menuId                  String        @unique
  totalIngredientCost     Float         @default(0)
  ingredientBreakdown     Json?
  laborCostPerHour        Float         @default(0)
  preparationHours        Float         @default(0)
  cookingHours            Float         @default(0)
  totalLaborCost          Float         @default(0)
  gasCost                 Float         @default(0)
  electricityCost         Float         @default(0)
  waterCost               Float         @default(0)
  totalUtilityCost        Float         @default(0)
  packagingCost           Float         @default(0)
  equipmentCost           Float         @default(0)
  overheadPercentage      Float         @default(15)
  overheadCost            Float         @default(0)
  grandTotalCost          Float         @default(0)
  plannedPortions         Int           @default(1)
  costPerPortion          Float         @default(0)
  ingredientCostRatio     Float         @default(0)
  laborCostRatio          Float         @default(0)
  costOptimizations       String[]
  alternativeIngredients  String[]
  isStale                 Boolean       @default(false)
  menu                    NutritionMenu @relation(...)
}
```

**Relasi**: `One-to-One` (Cascade Delete)  
**Deskripsi**: Comprehensive cost breakdown per menu  
**Business Logic**:
- **Direct Costs**: Ingredients, labor, utilities, packaging
- **Indirect Costs**: Equipment depreciation, overhead
- **Cost per portion** = Grand Total / Planned Portions
- **Cost ratios** untuk analisis struktur biaya
- Tracking stale data untuk recalculation

**Cost Components**:
```typescript
grandTotalCost = 
  totalIngredientCost + 
  totalLaborCost + 
  totalUtilityCost + 
  packagingCost + 
  equipmentCost + 
  overheadCost
```

**Query Pattern**:
```typescript
// Get menu with cost analysis
const menuWithCost = await db.nutritionMenu.findUnique({
  where: { id: 'menu-id' },
  include: {
    costCalc: true,
    ingredients: true // For breakdown
  }
})

// Compare cost vs budget
const isUnderBudget = menuWithCost.costCalc.costPerPortion <= menuWithCost.budgetAllocation
```

---

### 1.6 Allergen (Indirect via allergens field)
```prisma
model NutritionMenu {
  allergens String[] // Array of allergen names
}

model Allergen {
  id          String   @id @default(cuid())
  sppgId      String?
  name        String   @db.VarChar(100)
  description String?
  isCommon    Boolean  @default(true)
  category    String?  @db.VarChar(50)
  localName   String?  @db.VarChar(100)
  // ...
}
```

**Relasi**: `Many-to-Many` (Indirect via String Array)  
**Deskripsi**: Allergen tracking untuk menu safety  
**Business Logic**:
- Menu memiliki array of allergen names
- Allergen model sebagai master reference data
- Support custom allergens per SPPG
- Critical untuk menu assignment ke beneficiaries dengan alergi

**Query Pattern**:
```typescript
// Get menus without specific allergens
const safeMenus = await db.nutritionMenu.findMany({
  where: {
    programId: 'program-id',
    NOT: {
      allergens: {
        hasSome: ['peanuts', 'shellfish'] // Beneficiary allergies
      }
    }
  }
})

// Get all allergens in menu
const allergenDetails = await db.allergen.findMany({
  where: {
    name: { in: menu.allergens }
  }
})
```

---

## 🏭 2. Operational Relations

### 2.1 FoodProduction (One-to-Many)
```prisma
model FoodProduction {
  id                String                 @id @default(cuid())
  sppgId            String
  programId         String
  menuId            String  // ✅ Key relation
  productionDate    DateTime
  batchNumber       String                 @unique
  plannedPortions   Int
  actualPortions    Int?
  headCook          String
  assistantCooks    String[]
  status            ProductionStatus       @default(PLANNED)
  actualCost        Float?
  costPerPortion    Float?
  qualityPassed     Boolean?
  wasteAmount       Float?
  // ...
  menu              NutritionMenu          @relation(...)
  program           NutritionProgram       @relation(...)
  qualityChecks     QualityControl[]
  distributions     FoodDistribution[]
}
```

**Relasi**: `One-to-Many` (Menu → Productions)  
**Deskripsi**: Production instances dari menu  
**Business Logic**:
- Satu menu bisa diproduksi berkali-kali (different dates/batches)
- Track actual vs planned (portions, cost, quality)
- Link ke quality control dan distribution
- Production triggers inventory deduction

**Production Flow**:
```
Menu → FoodProduction → QualityControl → FoodDistribution → SchoolDistribution
```

**Query Pattern**:
```typescript
// Get all productions of a menu
const productions = await db.foodProduction.findMany({
  where: { 
    menuId: 'menu-id',
    productionDate: {
      gte: startDate,
      lte: endDate
    }
  },
  include: {
    qualityChecks: true,
    distributions: true
  },
  orderBy: { productionDate: 'desc' }
})

// Calculate average yield rate
const avgYield = productions.reduce((sum, p) => 
  sum + ((p.actualPortions || 0) / p.plannedPortions), 0
) / productions.length
```

---

### 2.2 SchoolDistribution (One-to-Many)
```prisma
model SchoolDistribution {
  id                String                @id @default(cuid())
  programId         String
  schoolId          String
  menuId            String  // ✅ Key relation
  distributionDate  DateTime
  plannedPortions   Int
  actualPortions    Int?
  deliveryStatus    DeliveryStatus
  qualityStatus     String?
  receivedBy        String?
  signature         String?
  schoolFeedback    String?
  satisfactionScore Int?
  issues            String[]
  // ...
  menu              NutritionMenu         @relation(...)
  program           NutritionProgram      @relation(...)
  school            SchoolBeneficiary     @relation(...)
  reports           SchoolFeedingReport[]
}
```

**Relasi**: `One-to-Many` (Menu → School Distributions)  
**Deskripsi**: Delivery tracking ke sekolah-sekolah  
**Business Logic**:
- Track delivery per school per date
- Quality and satisfaction monitoring
- Issue tracking dan follow-up
- Link ke feeding reports

**Query Pattern**:
```typescript
// Get distribution history for menu
const distributions = await db.schoolDistribution.findMany({
  where: { 
    menuId: 'menu-id',
    distributionDate: { gte: last30Days }
  },
  include: {
    school: true,
    reports: true
  }
})

// Calculate satisfaction rate
const avgSatisfaction = distributions
  .filter(d => d.satisfactionScore)
  .reduce((sum, d) => sum + d.satisfactionScore!, 0) / distributions.length
```

---

### 2.3 MenuAssignment (One-to-Many)
```prisma
model MenuAssignment {
  id              String           @id @default(cuid())
  menuPlanId      String
  menuId          String  // ✅ Key relation
  assignedDate    DateTime
  mealType        MealType
  plannedPortions Int              @default(0)
  estimatedCost   Float            @default(0)
  isSubstitute    Boolean          @default(false)
  status          AssignmentStatus @default(PLANNED)
  isProduced      Boolean          @default(false)
  isDistributed   Boolean          @default(false)
  actualPortions  Int?
  productionId    String?
  // ...
  menu            NutritionMenu    @relation(...)
  menuPlan        MenuPlan         @relation(...)
  production      FoodProduction?  @relation(...)
  
  @@unique([menuPlanId, assignedDate, mealType])
}
```

**Relasi**: `One-to-Many` (Menu → Assignments)  
**Deskripsi**: Assignment menu ke specific dates dalam menu plan  
**Business Logic**:
- Bridge between MenuPlan and NutritionMenu
- One menu bisa di-assign ke multiple dates
- Track production and distribution status
- Support substitute menus

**Planning Flow**:
```
MenuPlan → MenuAssignment → NutritionMenu → FoodProduction → Distribution
```

**Query Pattern**:
```typescript
// Get menu assignments for next week
const assignments = await db.menuAssignment.findMany({
  where: {
    menuId: 'menu-id',
    assignedDate: {
      gte: new Date(),
      lte: add(new Date(), { days: 7 })
    },
    status: 'PLANNED'
  },
  include: {
    menuPlan: true,
    production: true
  }
})

// Calculate menu usage frequency
const frequency = await db.menuAssignment.count({
  where: {
    menuId: 'menu-id',
    assignedDate: { gte: lastMonth }
  }
})
```

---

### 2.4 QualityControl (Indirect via FoodProduction)
```prisma
model QualityControl {
  id                  String             @id @default(cuid())
  productionId        String  // Links to FoodProduction (which has menuId)
  controlType         ControlType
  inspectorId         String
  hygieneScore        Int?
  tasteScore          Int?
  temperatureCheck    Float?
  portionSizeCheck    Boolean?
  presentationScore   Int?
  overallScore        Int?
  passed              Boolean?
  defects             String[]
  correctiveActions   String[]
  // ...
  production          FoodProduction @relation(...)
}
```

**Relasi**: `Indirect` (Menu → Production → Quality Control)  
**Deskripsi**: Quality assurance untuk production batches  
**Business Logic**:
- Every production should have quality checks
- Multiple quality control points per batch
- Failed QC blocks distribution
- Track defects and corrective actions

**Query Pattern**:
```typescript
// Get quality data for menu across all productions
const qualityData = await db.qualityControl.findMany({
  where: {
    production: {
      menuId: 'menu-id'
    }
  },
  include: {
    production: {
      include: {
        menu: true
      }
    }
  }
})

// Calculate menu quality average
const avgQuality = qualityData.reduce((sum, qc) => 
  sum + (qc.overallScore || 0), 0
) / qualityData.length
```

---

### 2.5 Feedback (Many-to-One - Optional)
```prisma
model Feedback {
  id                       String                  @id @default(cuid())
  sppgId                   String
  programId                String?
  menuId                   String?  // ✅ Optional relation
  distributionId           String?
  stakeholderId            String
  feedbackType             FeedbackType
  category                 FeedbackCategory
  subject                  String
  description              String
  priority                 FeedbackPriority
  sentiment                FeedbackSentiment?
  satisfactionScore        Int?
  urgencyScore             Int?
  status                   FeedbackStatus
  // ...
  menu                     NutritionMenu?       @relation(...)
  program                  NutritionProgram?    @relation(...)
  distribution             FoodDistribution?    @relation(...)
  stakeholder              FeedbackStakeholder  @relation(...)
}
```

**Relasi**: `Many-to-One` (Optional)  
**Deskripsi**: Feedback dan complaints terkait menu  
**Business Logic**:
- Feedback bisa spesifik ke menu tertentu
- Track satisfaction dan complaints
- Sentiment analysis untuk improvement
- Link ke stakeholders (parents, students, teachers)

**Query Pattern**:
```typescript
// Get all feedback for a menu
const feedback = await db.feedback.findMany({
  where: { 
    menuId: 'menu-id',
    feedbackType: 'COMPLAINT'
  },
  include: {
    stakeholder: true,
    responses: true
  },
  orderBy: { createdAt: 'desc' }
})

// Calculate menu satisfaction
const avgSatisfaction = await db.feedback.aggregate({
  where: { menuId: 'menu-id' },
  _avg: { satisfactionScore: true }
})
```

---

## 📅 3. Planning Relations

### 3.1 MenuPlan (Many-to-One via MenuAssignment)
```prisma
model MenuPlan {
  id                      String             @id @default(cuid())
  programId               String
  sppgId                  String
  name                    String
  startDate               DateTime
  endDate                 DateTime
  status                  MenuPlanStatus     @default(DRAFT)
  totalDays               Int                @default(0)
  totalMenus              Int                @default(0)
  averageCostPerDay       Float              @default(0)
  nutritionScore          Float?
  varietyScore            Float?
  meetsNutritionStandards Boolean            @default(false)
  meetsbudgetConstraints  Boolean            @default(false)
  // ...
  assignments             MenuAssignment[]  // ✅ Bridge to menus
  program                 NutritionProgram   @relation(...)
  sppg                    SPPG               @relation(...)
}
```

**Relasi**: `Many-to-Many` (via MenuAssignment)  
**Deskripsi**: Perencanaan menu jangka panjang (weekly/monthly)  
**Business Logic**:
- One plan contains multiple menu assignments
- One menu dapat di-assign ke multiple dates
- Automated variety calculation
- Budget compliance tracking
- Approval workflow (DRAFT → SUBMITTED → APPROVED → PUBLISHED)

**Planning Workflow**:
```
1. Create MenuPlan (DRAFT)
2. Add MenuAssignments (select menus for specific dates)
3. Validate nutrition & budget
4. Submit for approval
5. Approve → Publish
6. Execute → Track production
```

**Query Pattern**:
```typescript
// Get all plans using a menu
const menuPlans = await db.menuPlan.findMany({
  where: {
    assignments: {
      some: {
        menuId: 'menu-id'
      }
    }
  },
  include: {
    assignments: {
      where: { menuId: 'menu-id' }
    }
  }
})

// Calculate menu rotation frequency
const usageDays = menuPlans.reduce((sum, plan) => 
  sum + plan.assignments.filter(a => a.menuId === 'menu-id').length, 
  0
)
```

---

### 3.2 MenuPlanTemplate (Indirect)
```prisma
model MenuPlanTemplate {
  id              String    @id @default(cuid())
  menuPlanId      String
  sppgId          String
  name            String
  description     String?
  duration        Int       // Days
  templateData    Json      // Menu IDs and assignments
  isPublic        Boolean   @default(false)
  usageCount      Int       @default(0)
  rating          Float?
  // ...
  menuPlan        MenuPlan  @relation(...)
  sppg            SPPG      @relation(...)
}
```

**Relasi**: `Indirect` (Templates reference menuPlan which has menu assignments)  
**Deskripsi**: Reusable menu plan templates  
**Business Logic**:
- Save successful menu plans as templates
- Reuse across programs or SPPGs
- Track template effectiveness (rating, usage count)
- templateData JSON contains menu IDs and configuration

**Query Pattern**:
```typescript
// Find templates using specific menu
const templates = await db.menuPlanTemplate.findMany({
  where: {
    menuPlan: {
      assignments: {
        some: { menuId: 'menu-id' }
      }
    }
  },
  include: {
    menuPlan: {
      include: {
        assignments: {
          where: { menuId: 'menu-id' }
        }
      }
    }
  }
})
```

---

## 🔬 4. Research & Development Relations

### 4.1 MenuResearch (Indirect via MenuTestResult)
```prisma
model MenuResearch {
  id                  String                @id @default(cuid())
  sppgId              String
  researchTitle       String
  researchType        ResearchType
  objective           String
  methodology         String
  testStartDate       DateTime
  testEndDate         DateTime?
  testingStatus       ResearchStatus        @default(PLANNING)
  targetBeneficiaries BeneficiaryCategory[]
  findings            String?
  recommendations     String?
  isSuccessful        Boolean?
  // ...
  testResults         MenuTestResult[]  // ✅ Contains menu variations
  sppg                SPPG              @relation(...)
}
```

**Relasi**: `Indirect` (Research tests menu variations)  
**Deskripsi**: R&D untuk menu baru atau improvement  
**Business Logic**:
- Test new menu recipes sebelum production
- A/B testing untuk menu improvements
- Acceptability studies dengan target beneficiaries
- Data-driven menu development

**Research Types**:
- `NEW_MENU`: Testing completely new menu
- `RECIPE_IMPROVEMENT`: Optimization existing menu
- `NUTRITION_ENHANCEMENT`: Improving nutrition profile
- `COST_REDUCTION`: Finding cost-efficient alternatives
- `LOCAL_ADAPTATION`: Adapting to local ingredients

**Query Pattern**:
```typescript
// Find research related to menu
const research = await db.menuResearch.findMany({
  where: {
    testResults: {
      some: {
        menuVariation: { contains: 'menu-code' }
      }
    },
    testingStatus: 'COMPLETED'
  },
  include: {
    testResults: {
      orderBy: { overallScore: 'desc' }
    }
  }
})
```

---

### 4.2 MenuTestResult (Indirect)
```prisma
model MenuTestResult {
  id                    String       @id @default(cuid())
  researchId            String
  testDate              DateTime     @default(now())
  menuVariation         String  // ✅ Menu name/code being tested
  nutritionScore        Float?
  tasteScore            Float?
  textureScore          Float?
  appearanceScore       Float?
  overallScore          Float?
  acceptanceRate        Float?
  participantCount      Int?
  participantFeedback   String[]
  costPerPortion        Float?
  comparedToCurrentMenu Boolean      @default(false)
  improvementPercentage Float?
  // ...
  research              MenuResearch @relation(...)
}
```

**Relasi**: `Indirect` (Test results contain menu variations)  
**Deskripsi**: Detailed test results untuk menu R&D  
**Business Logic**:
- Multiple tests per research
- Score dari berbagai aspek (taste, texture, appearance, nutrition)
- Participant feedback collection
- Cost comparison
- Acceptance rate tracking

**Query Pattern**:
```typescript
// Find test results for menu variations
const testResults = await db.menuTestResult.findMany({
  where: {
    menuVariation: { contains: menuName },
    overallScore: { gte: 7.0 } // Minimum acceptable score
  },
  include: {
    research: true
  },
  orderBy: { overallScore: 'desc' }
})

// Best performing variation
const bestVariation = testResults[0]
```

---

## 🌾 5. Supporting Relations

### 5.1 InventoryItem (Many-to-Many via MenuIngredient)
```prisma
model InventoryItem {
  id                     String                  @id @default(cuid())
  sppgId                 String
  itemName               String
  itemCode               String
  category               InventoryCategory
  unit                   String
  unitPrice              Float
  currentStock           Float
  reorderPoint           Float
  // Nutrition per 100g
  caloriesPer100g        Float?
  proteinPer100g         Float?
  carbsPer100g           Float?
  fatPer100g             Float?
  fiberPer100g           Float?
  // ...
  menuIngredients        MenuIngredient[]  // ✅ Used in menus
  procurementItems       ProcurementItem[]
  stockMovements         StockMovement[]
}
```

**Relasi**: `Many-to-Many` (via MenuIngredient)  
**Deskripsi**: Inventory items yang digunakan sebagai ingredients  
**Business Logic**:
- One inventory item bisa digunakan di multiple menus
- Nutrition data per 100g untuk calculation
- Stock tracking untuk procurement planning
- Price tracking untuk cost calculation

**Integration Flow**:
```
InventoryItem → MenuIngredient → MenuNutritionCalculation
InventoryItem → MenuIngredient → MenuCostCalculation
```

**Query Pattern**:
```typescript
// Get all menus using specific ingredient
const menusUsingIngredient = await db.nutritionMenu.findMany({
  where: {
    ingredients: {
      some: {
        inventoryItemId: 'item-id'
      }
    }
  },
  include: {
    ingredients: {
      where: { inventoryItemId: 'item-id' }
    }
  }
})

// Impact analysis for price change
const affectedMenus = menusUsingIngredient.length
const totalQuantity = menusUsingIngredient.reduce((sum, menu) => 
  sum + menu.ingredients.reduce((s, ing) => s + ing.quantity, 0), 
  0
)
```

---

### 5.2 NutritionRequirement (One-to-Many via MenuNutritionCalculation)
```prisma
model NutritionRequirement {
  id                   String                     @id @default(cuid())
  sppgId               String
  requirementName      String
  description          String?
  targetGroup          BeneficiaryCategory
  ageMin               Int
  ageMax               Int
  gender               Gender?
  // AKG/RDA values
  caloriesRequired     Float
  proteinRequired      Float
  carbsRequired        Float
  fatRequired          Float
  fiberRequired        Float
  // ... all vitamins and minerals
  calculatedMenus      MenuNutritionCalculation[]  // ✅ Menus using this standard
  programs             NutritionProgram[]
}
```

**Relasi**: `One-to-Many` (Requirement → Calculations)  
**Deskripsi**: AKG/RDA standards untuk comparison  
**Business Logic**:
- Reference standards berdasarkan age group dan gender
- Menu nutrition compared dengan requirements
- Compliance tracking (meets/exceeds/deficient)
- Support different beneficiary categories

**Query Pattern**:
```typescript
// Get menus meeting requirements
const compliantMenus = await db.nutritionMenu.findMany({
  where: {
    nutritionCalc: {
      requirementId: 'requirement-id',
      meetsAKG: true
    }
  },
  include: {
    nutritionCalc: true
  }
})

// Gap analysis
const menusWithGaps = await db.menuNutritionCalculation.findMany({
  where: {
    requirementId: 'requirement-id',
    deficientNutrients: { isEmpty: false }
  },
  include: {
    menu: true
  }
})
```

---

### 5.3 NutritionProgram (Parent - Mandatory)
```prisma
model NutritionProgram {
  id                        String                    @id @default(cuid())
  sppgId                    String
  programName               String
  programCode               String
  programType               ProgramType
  targetBeneficiary         BeneficiaryCategory
  startDate                 DateTime
  endDate                   DateTime?
  budget                    Float
  nutritionRequirementId    String?
  // Program goals and metrics
  targetCaloriesPerMeal     Float?
  targetProteinPerMeal      Float?
  servingSchedule           Json?
  mealsPerDay               Int
  status                    ProgramStatus             @default(ACTIVE)
  // ...
  menus                     NutritionMenu[]  // ✅ All menus in program
  menuPlans                 MenuPlan[]
  productions               FoodProduction[]
  schoolDistributions       SchoolDistribution[]
  nutritionRequirement      NutritionRequirement?     @relation(...)
  sppg                      SPPG                      @relation(...)
}
```

**Relasi**: `One-to-Many` (Program → Menus)  
**Deskripsi**: Parent program yang mengorganisir menus  
**Business Logic**:
- Program mendefinisikan target nutrition dan budget
- All menus dalam program share same nutrition requirements
- Program-level tracking dan reporting
- Budget allocation per program

**Hierarchy**:
```
SPPG
 └── NutritionProgram
      ├── NutritionMenu (multiple)
      ├── MenuPlan (multiple)
      └── FoodProduction (multiple)
```

**Query Pattern**:
```typescript
// Get program with all menus and their status
const program = await db.nutritionProgram.findUnique({
  where: { id: 'program-id' },
  include: {
    menus: {
      include: {
        nutritionCalc: true,
        costCalc: true,
        ingredients: true
      }
    },
    nutritionRequirement: true
  }
})

// Program compliance summary
const totalMenus = program.menus.length
const compliantMenus = program.menus.filter(m => 
  m.nutritionCalc?.meetsAKG
).length
const complianceRate = (compliantMenus / totalMenus) * 100
```

---

## 📊 6. Relationship Summary Table

| Model | Relation Type | Cardinality | Cascade | Purpose |
|-------|--------------|-------------|---------|---------|
| **NutritionProgram** | Parent | Many-to-One | ✅ Yes | Program context |
| **MenuIngredient** | Child | One-to-Many | ✅ Yes | Composition |
| **RecipeStep** | Child | One-to-Many | ✅ Yes | Instructions |
| **MenuNutritionCalculation** | Computed | One-to-One | ✅ Yes | Nutrition aggregate |
| **MenuCostCalculation** | Computed | One-to-One | ✅ Yes | Cost aggregate |
| **FoodProduction** | Operational | One-to-Many | ❌ No | Production instances |
| **SchoolDistribution** | Operational | One-to-Many | ❌ No | Delivery tracking |
| **MenuAssignment** | Planning | One-to-Many | ❌ No | Plan assignments |
| **MenuPlan** | Planning | Many-to-Many | ❌ No | Long-term planning |
| **Feedback** | Quality | Many-to-One | ❌ No | User feedback |
| **InventoryItem** | Supporting | Many-to-Many | ❌ No | Ingredients source |
| **NutritionRequirement** | Supporting | Many-to-One | ❌ No | Standards reference |
| **Allergen** | Supporting | Many-to-Many | ❌ No | Safety tracking |
| **MenuResearch** | R&D | Indirect | ❌ No | Menu development |
| **QualityControl** | Quality | Indirect | ❌ No | Quality assurance |

---

## 🔄 7. Data Flow Diagrams

### 7.1 Menu Creation Flow
```
1. Create NutritionMenu
   ├── Set programId (required)
   ├── Set basic info (name, code, mealType)
   └── Set defaults (isActive, isHalal, etc.)

2. Add MenuIngredients
   ├── Link to InventoryItem (optional)
   ├── Set quantity, unit, cost
   └── Calculate totalCost per ingredient

3. Add RecipeSteps
   ├── Set stepNumber (sequential)
   ├── Define instruction, equipment, duration
   └── Add quality check points

4. Auto-calculate MenuNutritionCalculation
   ├── Aggregate nutrition from ingredients
   ├── Compare with NutritionRequirement
   └── Set compliance flags

5. Auto-calculate MenuCostCalculation
   ├── Sum ingredient costs
   ├── Add labor, utilities, overhead
   └── Calculate cost per portion

6. Validation
   ├── Check nutrition compliance
   ├── Check budget compliance
   └── Set nutritionStandardCompliance flag
```

---

### 7.2 Menu Planning Flow
```
1. Create MenuPlan
   ├── Set programId, sppgId
   ├── Set date range (startDate, endDate)
   └── Initialize as DRAFT

2. Add MenuAssignments
   ├── Select NutritionMenu for each date
   ├── Set mealType (BREAKFAST/SNACK/LUNCH)
   ├── Set plannedPortions
   └── Calculate estimatedCost

3. Validate MenuPlan
   ├── Check nutrition variety
   ├── Calculate averageCostPerDay
   ├── Check budget constraints
   └── Calculate nutritionScore, varietyScore

4. Submit for Approval
   ├── Status: DRAFT → SUBMITTED
   ├── Set submittedAt, submittedBy
   └── Trigger approval workflow

5. Approve & Publish
   ├── Status: SUBMITTED → APPROVED → PUBLISHED
   ├── Set approvedAt, publishedAt
   └── Activate for production

6. Execute Production
   ├── Create FoodProduction from assignments
   ├── Track actual vs planned
   └── Update assignment status
```

---

### 7.3 Menu Production & Distribution Flow
```
1. MenuAssignment (planned)
   └── assignedDate: 2025-10-25, mealType: SNACK, menuId: xxx

2. Create FoodProduction
   ├── Link to menuId from assignment
   ├── Set productionDate, plannedPortions
   ├── Assign headCook, assistantCooks
   └── Status: PLANNED

3. Execute Production
   ├── Status: PLANNED → IN_PROGRESS → COMPLETED
   ├── Track actualPortions, actualCost
   └── Record actualStartTime, actualEndTime

4. Quality Control
   ├── Create QualityControl record
   ├── Perform inspections (hygiene, taste, temp)
   ├── Set passed flag
   └── If failed: block distribution

5. Create FoodDistribution
   ├── Link to productionId
   ├── Split into delivery routes
   └── Assign to drivers/vehicles

6. School Distribution
   ├── Deliver to schools
   ├── Record receivedBy, signature
   ├── Collect feedback, satisfactionScore
   └── Track issues, followUp

7. Feeding Reports
   ├── Record actual students served
   ├── Track waste, participation
   └── Generate daily/weekly reports

8. Update MenuAssignment
   ├── Set isProduced: true
   ├── Set isDistributed: true
   ├── Record actualPortions, actualCost
   └── Status: PLANNED → COMPLETED
```

---

## 🎯 8. Key Business Rules

### 8.1 Menu Creation Rules
1. **Mandatory Program**: Menu MUST have programId
2. **Unique Code**: menuCode must be unique within program
3. **Allergen Safety**: allergens array must be populated
4. **Halal Compliance**: isHalal default true, can be changed
5. **Active Status**: Only active menus can be used in planning
6. **Budget Allocation**: costPerServing ≤ budgetAllocation

### 8.2 Nutrition Rules
1. **AKG Compliance**: meetsAKG checked against NutritionRequirement
2. **Deficiency Alert**: deficientNutrients must be addressed
3. **Excess Warning**: excessNutrients flagged for review
4. **Daily Value**: DV% calculated for all nutrients
5. **Stale Detection**: isStale = true if ingredients changed

### 8.3 Cost Rules
1. **Total Cost**: grandTotalCost = direct + indirect costs
2. **Cost Per Portion**: grandTotalCost / plannedPortions
3. **Budget Compliance**: costPerPortion ≤ program budget
4. **Overhead**: Default 15%, configurable per SPPG
5. **Labor Cost**: Based on hours × hourly rate
6. **Utility Costs**: Gas, electricity, water tracking

### 8.4 Planning Rules
1. **Variety Score**: Prevent same menu on consecutive days
2. **Rotation Frequency**: Limit menu repetition per week
3. **Allergen Check**: Match menu allergens vs beneficiary allergies
4. **Budget Constraint**: Sum of menuCosts ≤ program budget
5. **Nutrition Balance**: Average nutrition meets requirements

### 8.5 Production Rules
1. **Quality Gate**: Production can't distribute if QC failed
2. **Waste Tracking**: wasteAmount recorded and analyzed
3. **Yield Variance**: Alert if actual < 90% of planned
4. **Cost Variance**: Alert if actual > 110% of estimated
5. **Temperature Control**: actualTemperature must be safe range

### 8.6 Distribution Rules
1. **Delivery Status**: Track SCHEDULED → IN_TRANSIT → DELIVERED
2. **Quality at Delivery**: qualityStatus checked at schools
3. **Feedback Collection**: satisfactionScore from schools
4. **Issue Tracking**: issues array for follow-up
5. **Signature Required**: receivedBy + signature for confirmation

---

## 📈 9. Analytics & Reporting Queries

### 9.1 Menu Performance Metrics
```typescript
// Menu popularity (times assigned)
const menuPopularity = await db.menuAssignment.groupBy({
  by: ['menuId'],
  _count: { id: true },
  where: {
    assignedDate: { gte: last6Months }
  },
  orderBy: { _count: { id: 'desc' } }
})

// Menu satisfaction average
const menuSatisfaction = await db.schoolDistribution.groupBy({
  by: ['menuId'],
  _avg: { satisfactionScore: true },
  where: {
    satisfactionScore: { not: null },
    distributionDate: { gte: last3Months }
  }
})

// Menu cost efficiency
const costEfficiency = await db.nutritionMenu.findMany({
  include: {
    costCalc: true,
    nutritionCalc: true
  }
}).then(menus => menus.map(m => ({
  menuId: m.id,
  menuName: m.menuName,
  costPerPortion: m.costCalc?.costPerPortion || 0,
  caloriesPerRupiah: (m.nutritionCalc?.totalCalories || 0) / (m.costCalc?.costPerPortion || 1),
  proteinPerRupiah: (m.nutritionCalc?.totalProtein || 0) / (m.costCalc?.costPerPortion || 1),
  efficiencyScore: calculateEfficiencyScore(m)
})))

// Menu production yield
const productionYield = await db.foodProduction.groupBy({
  by: ['menuId'],
  _avg: {
    actualPortions: true,
    plannedPortions: true
  },
  where: {
    productionDate: { gte: lastQuarter },
    status: 'COMPLETED'
  }
}).then(results => results.map(r => ({
  ...r,
  yieldRate: (r._avg.actualPortions || 0) / (r._avg.plannedPortions || 1)
})))
```

---

### 9.2 Menu Compliance Reports
```typescript
// Nutrition compliance summary
const nutritionCompliance = await db.nutritionMenu.findMany({
  where: { programId: 'program-id' },
  include: { nutritionCalc: true }
}).then(menus => ({
  total: menus.length,
  compliant: menus.filter(m => m.nutritionCalc?.meetsAKG).length,
  deficient: menus.filter(m => m.nutritionCalc?.deficientNutrients.length > 0).length,
  excess: menus.filter(m => m.nutritionCalc?.excessNutrients.length > 0).length,
  complianceRate: (menus.filter(m => m.nutritionCalc?.meetsAKG).length / menus.length) * 100
}))

// Budget compliance summary
const budgetCompliance = await db.nutritionMenu.findMany({
  where: { programId: 'program-id' },
  include: { costCalc: true }
}).then(menus => ({
  total: menus.length,
  underBudget: menus.filter(m => 
    (m.costCalc?.costPerPortion || 0) <= (m.budgetAllocation || 0)
  ).length,
  overBudget: menus.filter(m => 
    (m.costCalc?.costPerPortion || 0) > (m.budgetAllocation || 0)
  ).length,
  averageCost: menus.reduce((sum, m) => 
    sum + (m.costCalc?.costPerPortion || 0), 0
  ) / menus.length
}))
```

---

### 9.3 Menu Feedback Analysis
```typescript
// Feedback sentiment analysis
const feedbackAnalysis = await db.feedback.findMany({
  where: {
    menuId: { not: null },
    createdAt: { gte: lastMonth }
  },
  include: {
    menu: {
      select: { id: true, menuName: true }
    }
  }
}).then(feedbacks => {
  const byMenu = groupBy(feedbacks, 'menuId')
  
  return Object.entries(byMenu).map(([menuId, items]) => ({
    menuId,
    menuName: items[0].menu.menuName,
    totalFeedback: items.length,
    complaints: items.filter(f => f.feedbackType === 'COMPLAINT').length,
    suggestions: items.filter(f => f.feedbackType === 'SUGGESTION').length,
    avgSatisfaction: average(items.map(f => f.satisfactionScore).filter(Boolean)),
    sentiment: {
      positive: items.filter(f => f.sentiment === 'POSITIVE').length,
      neutral: items.filter(f => f.sentiment === 'NEUTRAL').length,
      negative: items.filter(f => f.sentiment === 'NEGATIVE').length
    }
  }))
})
```

---

## 🔐 10. Multi-Tenancy Security

### Critical Rules untuk Menu Data Access:

```typescript
// ✅ CORRECT: Always filter by sppgId via program
const menus = await db.nutritionMenu.findMany({
  where: {
    program: {
      sppgId: session.user.sppgId  // MANDATORY!
    }
  }
})

// ✅ CORRECT: Check ownership before update
const menu = await db.nutritionMenu.findFirst({
  where: {
    id: menuId,
    program: {
      sppgId: session.user.sppgId
    }
  }
})

if (!menu) {
  throw new Error('Menu not found or access denied')
}

// ❌ WRONG: Direct query without SPPG filter
const menus = await db.nutritionMenu.findMany() // SECURITY RISK!

// ❌ WRONG: Trust client-provided sppgId
const menus = await db.nutritionMenu.findMany({
  where: {
    program: {
      sppgId: req.body.sppgId  // NEVER DO THIS!
    }
  }
})
```

---

## 🎓 11. Best Practices & Recommendations

### 11.1 Menu Design Principles
1. **Nutrition First**: Always validate against AKG requirements
2. **Cost Consciousness**: Target cost efficiency without compromising quality
3. **Allergen Safety**: Always populate allergens array
4. **Recipe Documentation**: Complete recipe steps with quality checks
5. **Variety Planning**: Use rotation strategies to prevent menu fatigue

### 11.2 Data Integrity Rules
1. **Cascade Deletes**: Be aware of cascade effects
2. **Soft Deletes**: Consider using isActive instead of hard delete
3. **Audit Trail**: Track all changes via updatedAt
4. **Stale Detection**: Recalculate when ingredients change
5. **Validation**: Use Zod schemas for all inputs

### 11.3 Performance Optimization
1. **Eager Loading**: Use `include` for related data in single query
2. **Selective Fields**: Use `select` to limit returned fields
3. **Pagination**: Always paginate large result sets
4. **Indexing**: Leverage existing indexes (programId, isActive, mealType)
5. **Caching**: Cache menu data with 5-minute TTL

### 11.4 Calculation Strategies
1. **Lazy Calculation**: Calculate on-demand, cache results
2. **Stale Detection**: Flag for recalculation when source data changes
3. **Batch Processing**: Recalculate multiple menus in background jobs
4. **Validation**: Always validate calculation inputs
5. **Error Handling**: Graceful degradation if calculation fails

---

## 🚀 12. Implementation Patterns

### 12.1 Creating Menu with Full Setup
```typescript
async function createCompleteMenu(input: MenuInput) {
  return await db.$transaction(async (tx) => {
    // 1. Create menu
    const menu = await tx.nutritionMenu.create({
      data: {
        programId: input.programId,
        menuName: input.menuName,
        menuCode: input.menuCode,
        mealType: input.mealType,
        servingSize: input.servingSize,
        allergens: input.allergens,
        isHalal: input.isHalal,
        budgetAllocation: input.budgetAllocation
      }
    })

    // 2. Create ingredients
    const ingredients = await tx.menuIngredient.createMany({
      data: input.ingredients.map(ing => ({
        menuId: menu.id,
        inventoryItemId: ing.inventoryItemId,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
        costPerUnit: ing.costPerUnit,
        totalCost: ing.quantity * ing.costPerUnit
      }))
    })

    // 3. Create recipe steps
    const recipeSteps = await tx.recipeStep.createMany({
      data: input.recipeSteps.map((step, index) => ({
        menuId: menu.id,
        stepNumber: index + 1,
        title: step.title,
        instruction: step.instruction,
        duration: step.duration,
        temperature: step.temperature,
        equipment: step.equipment
      }))
    })

    // 4. Calculate nutrition (async)
    await calculateMenuNutrition(menu.id, tx)

    // 5. Calculate cost (async)
    await calculateMenuCost(menu.id, tx)

    return menu
  })
}
```

---

### 12.2 Menu Nutrition Calculation
```typescript
async function calculateMenuNutrition(menuId: string, tx: PrismaTransaction) {
  // Get menu with ingredients
  const menu = await tx.nutritionMenu.findUnique({
    where: { id: menuId },
    include: {
      ingredients: {
        include: {
          inventoryItem: true
        }
      },
      program: {
        include: {
          nutritionRequirement: true
        }
      }
    }
  })

  if (!menu) throw new Error('Menu not found')

  // Calculate totals
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let totalFiber = 0
  // ... other nutrients

  for (const ingredient of menu.ingredients) {
    if (!ingredient.inventoryItem) continue

    const item = ingredient.inventoryItem
    const factor = ingredient.quantity / 100 // Convert to per-100g basis

    totalCalories += (item.caloriesPer100g || 0) * factor
    totalProtein += (item.proteinPer100g || 0) * factor
    totalCarbs += (item.carbsPer100g || 0) * factor
    totalFat += (item.fatPer100g || 0) * factor
    totalFiber += (item.fiberPer100g || 0) * factor
    // ... other nutrients
  }

  // Compare with requirements
  const requirement = menu.program.nutritionRequirement
  const meetsCalorieAKG = requirement ? 
    totalCalories >= requirement.caloriesRequired * 0.9 : false
  const meetsProteinAKG = requirement ? 
    totalProtein >= requirement.proteinRequired * 0.9 : false

  // Identify deficiencies
  const deficientNutrients: string[] = []
  const excessNutrients: string[] = []
  const adequateNutrients: string[] = []

  if (requirement) {
    if (totalCalories < requirement.caloriesRequired * 0.9) {
      deficientNutrients.push('calories')
    } else if (totalCalories > requirement.caloriesRequired * 1.2) {
      excessNutrients.push('calories')
    } else {
      adequateNutrients.push('calories')
    }
    // ... same for other nutrients
  }

  // Upsert calculation
  await tx.menuNutritionCalculation.upsert({
    where: { menuId },
    update: {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      // ... other nutrients
      caloriesDV: requirement ? (totalCalories / requirement.caloriesRequired) * 100 : 0,
      proteinDV: requirement ? (totalProtein / requirement.proteinRequired) * 100 : 0,
      meetsCalorieAKG,
      meetsProteinAKG,
      meetsAKG: meetsCalorieAKG && meetsProteinAKG,
      deficientNutrients,
      excessNutrients,
      adequateNutrients,
      calculatedAt: new Date(),
      isStale: false
    },
    create: {
      menuId,
      requirementId: requirement?.id,
      totalCalories,
      totalProtein,
      // ... same as update
    }
  })

  // Update menu compliance flag
  await tx.nutritionMenu.update({
    where: { id: menuId },
    data: {
      nutritionStandardCompliance: meetsCalorieAKG && meetsProteinAKG
    }
  })
}
```

---

## 📝 13. Conclusion

Model `NutritionMenu` adalah **central hub** dalam sistem SPPG dengan relasi yang sangat kompleks dan comprehensive. Setiap relasi memiliki purpose spesifik dalam lifecycle menu dari planning hingga evaluation.

### Key Takeaways:
1. **15+ Direct Relations**: Menu terhubung langsung dengan 15+ model lain
2. **Cascade Strategy**: Hanya child entities (ingredients, steps, calculations) yang cascade delete
3. **Multi-tenant Safe**: Always filter via `program.sppgId`
4. **Calculated Fields**: Nutrition dan cost calculations adalah computed values
5. **Lifecycle Tracking**: From planning → production → distribution → feedback
6. **Quality Assurance**: Multiple quality checkpoints throughout lifecycle
7. **Data Integrity**: Strong validation rules untuk compliance

### Integration Points:
- **Menu Management**: Creation, editing, activation
- **Planning**: MenuPlan → MenuAssignment → Menu
- **Production**: Menu → FoodProduction → QualityControl
- **Distribution**: Production → Distribution → SchoolDistribution
- **Feedback**: Menu → Feedback → Improvements
- **R&D**: Research → TestResults → Menu Development
- **Inventory**: InventoryItem → MenuIngredient → Menu

---

**Document Status**: ✅ Complete  
**Last Updated**: 20 Oktober 2025  
**Next Review**: Setelah schema changes atau business logic updates
