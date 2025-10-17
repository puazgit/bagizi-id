# 🗺️ Procurement Schema Mapping - Prisma to Code

**Date**: October 16, 2025  
**Purpose**: Accurate mapping of Prisma schema to TypeScript code

---

## 📊 Model: SPPG

### Fields Used in Procurement:
```typescript
{
  id: string
  code: string          // NOT sppgCode
  name: string          // NOT sppgName
  // ... other fields
}
```

### ⚠️ Common Mistakes:
- ❌ `sppgName` → ✅ `name`
- ❌ `sppgCode` → ✅ `code`

---

## 📊 Model: ProcurementPlan

### Actual Schema Fields:
```prisma
{
  id: string
  sppgId: string
  programId: string | null
  
  // Planning Period
  planName: string
  planMonth: string        // "2024-10"
  planYear: number
  planQuarter: number | null
  
  // Budget
  totalBudget: number
  allocatedBudget: number
  usedBudget: number
  remainingBudget: number
  
  // Category Budgets
  proteinBudget: number | null
  carbBudget: number | null
  vegetableBudget: number | null
  fruitBudget: number | null
  otherBudget: number | null
  
  // Targets
  targetRecipients: number
  targetMeals: number
  costPerMeal: number | null
  
  // Approval
  approvalStatus: string   // "DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "REVISION"
  submittedBy: string | null
  submittedAt: DateTime | null
  approvedBy: string | null
  approvedAt: DateTime | null
  rejectionReason: string | null
  
  notes: string | null
  emergencyBuffer: number | null
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### ⚠️ Key Points:
- ❌ No `planStartDate` field
- ✅ Use `planMonth` (string format "YYYY-MM")
- ✅ `approvalStatus` is a string, not enum

---

## 📊 Model: Procurement

### Actual Schema Fields:
```prisma
{
  id: string
  sppgId: string
  planId: string | null
  
  // Details
  procurementCode: string (unique)
  procurementDate: DateTime
  expectedDelivery: DateTime | null
  actualDelivery: DateTime | null
  
  // Supplier (NORMALIZED)
  supplierId: string
  supplierName: string | null     // Legacy, deprecated
  supplierContact: string | null  // Legacy, deprecated
  
  // Purchase
  purchaseMethod: ProcurementMethod (enum)
  paymentTerms: string | null
  
  // Financial
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  paidAmount: number
  paymentStatus: string           // "UNPAID", "PARTIAL", "PAID", "OVERDUE"
  paymentDue: DateTime | null
  
  // Status
  status: ProcurementStatus (enum)
  deliveryStatus: string          // "ORDERED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"
  qualityGrade: QualityGrade | null (enum)
  qualityNotes: string | null
  
  // Documentation
  receiptNumber: string | null
  receiptPhoto: string | null
  deliveryPhoto: string | null
  invoiceNumber: string | null
  
  // Logistics
  deliveryMethod: string | null
  transportCost: number | null
  packagingType: string | null
  
  // Quality Control
  inspectedBy: string | null
  inspectedAt: DateTime | null
  acceptanceStatus: string | null  // "ACCEPTED", "REJECTED", "PARTIAL"
  rejectionReason: string | null
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### ⚠️ Key Points:
- ❌ No `deliveryDate` → ✅ Use `actualDelivery`
- ❌ `paymentStatus` is string, not PaymentStatus enum
- ❌ `deliveryStatus` is string, not DeliveryStatus enum
- ✅ `status` uses ProcurementStatus enum

---

## 📊 Model: ProcurementItem

### Actual Schema Fields:
```prisma
{
  id: string
  procurementId: string
  inventoryItemId: string | null
  
  // Item Details
  itemName: string
  itemCode: string | null
  category: InventoryCategory (enum)
  brand: string | null
  
  // Quantity
  orderedQuantity: number       // NOT quantityOrdered
  receivedQuantity: number | null // NOT quantityReceived
  unit: string
  
  // Pricing
  pricePerUnit: number
  totalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  
  // Quality
  qualityStandard: string | null
  qualityReceived: string | null
  gradeRequested: string | null
  gradeReceived: string | null
  
  // Expiry & Storage
  expiryDate: DateTime | null
  batchNumber: string | null
  productionDate: DateTime | null
  storageRequirement: string | null
  
  // Acceptance
  isAccepted: boolean
  rejectionReason: string | null
  returnedQuantity: number
  
  // Nutrition (optional)
  caloriesPer100g: number | null
  proteinPer100g: number | null
  fatPer100g: number | null
  carbsPer100g: number | null
  
  notes: string | null
}
```

### ⚠️ Key Points:
- ❌ `quantityOrdered` → ✅ `orderedQuantity`
- ❌ `quantityReceived` → ✅ `receivedQuantity`
- ❌ No `qualityGrade` field on items

---

## 📊 Model: Supplier

### Relations:
```prisma
{
  // Relations
  sppg: SPPG
  procurements: Procurement[]
  inventoryItems: InventoryItem[]
  supplierEvaluations: SupplierEvaluation[]  // NOT evaluations
  supplierContracts: SupplierContract[]      // NOT contracts
  supplierProducts: SupplierProduct[]        // NOT products
}
```

### ⚠️ Key Points:
- ❌ `supplier.evaluations` → ✅ `supplier.supplierEvaluations`
- ❌ `supplier.contracts` → ✅ `supplier.supplierContracts`
- ❌ `supplier.products` → ✅ `supplier.supplierProducts`

---

## 🎯 Enums - Correct Values

### ProcurementStatus (enum):
```typescript
enum ProcurementStatus {
  DRAFT = "DRAFT"
  PENDING_APPROVAL = "PENDING_APPROVAL"  // NOT SUBMITTED
  APPROVED = "APPROVED"
  ORDERED = "ORDERED"                    // NOT IN_PROGRESS
  PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED"
  FULLY_RECEIVED = "FULLY_RECEIVED"
  COMPLETED = "COMPLETED"
  CANCELLED = "CANCELLED"
  REJECTED = "REJECTED"
}
```

### DeliveryStatus (string, NOT enum):
```typescript
// Procurement.deliveryStatus (string field)
type DeliveryStatusString = 
  | "ORDERED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
```

### PaymentStatus (string, NOT enum):
```typescript
// Procurement.paymentStatus (string field)
type PaymentStatusString =
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
```

### QualityGrade (enum):
```typescript
enum QualityGrade {
  EXCELLENT = "EXCELLENT"
  GOOD = "GOOD"
  ACCEPTABLE = "ACCEPTABLE"
  POOR = "POOR"
  REJECTED = "REJECTED"
}
```

---

## ✅ Correct Usage Examples

### ❌ WRONG:
```typescript
// Wrong enum values
status: ProcurementStatus.SUBMITTED  // Doesn't exist
status: ProcurementStatus.IN_PROGRESS // Doesn't exist

// Wrong field names
procurements.filter(p => p.deliveryStatus === DeliveryStatus.PENDING)
item.quantityOrdered  // Should be orderedQuantity
item.quantityReceived // Should be receivedQuantity

// Wrong relation names
supplier.evaluations  // Should be supplierEvaluations
supplier.contracts    // Should be supplierContracts

// Wrong SPPG fields
sppg.sppgName        // Should be name
```

### ✅ CORRECT:
```typescript
// Correct enum values
status: ProcurementStatus.PENDING_APPROVAL
status: ProcurementStatus.ORDERED

// Correct field names
procurements.filter(p => p.deliveryStatus === "DELIVERED")
item.orderedQuantity
item.receivedQuantity

// Correct relation names
supplier.supplierEvaluations
supplier.supplierContracts

// Correct SPPG fields
sppg.name
```

---

## 🔧 Migration Strategy

### Step 1: Fix Type Definitions
Update `/src/features/sppg/procurement/types/index.ts` to match schema exactly

### Step 2: Fix API Endpoints
1. `/api/sppg/suppliers/[id]/route.ts` - Fix relation names
2. `/api/sppg/suppliers/[id]/performance/route.ts` - Fix field names
3. `/api/sppg/procurement/statistics/route.ts` - Fix enum values

### Step 3: Update Schemas
Update Zod schemas in `/src/features/sppg/procurement/schemas/index.ts` if needed

### Step 4: Test & Verify
- ✅ TypeScript compilation
- ✅ API endpoint functionality
- ✅ Database queries work correctly

---

**Status**: Documentation Complete  
**Next**: Apply fixes to all API endpoints systematically
