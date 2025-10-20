# FIX #6-8: Data Quality & Workflow Integrity

**Priority**: 🔥 HIGH (Data Quality Issues)  
**Estimate**: 26 hours (3-4 days) - Fix #6 (6h) + Fix #7 (12h) + Fix #8 (8h)  
**Status**: ⏳ PENDING  
**Dependencies**: None (can run parallel with other fixes)  
**Phase**: 1 - Week 4

---

## 📋 Problem Statement Summary

### Fix #6: Procurement Supplier Data Cleanup (6 hours)
### Fix #7: MenuPlan Approval Workflow (12 hours)
### Fix #8: SchoolBeneficiary Address Standardization (8 hours)

---

## 🎯 FIX #6: Procurement Supplier Data Cleanup

### Current Broken State

```prisma
model Procurement {
  id              String      @id @default(cuid())
  sppgId          String
  
  // ❌ CRITICAL: Duplicate supplier data (free-text + optional FK)
  supplierId      String?     // Optional FK
  supplierName    String      // Free-text duplicate
  supplierContact String      // Free-text duplicate
  
  orderNumber     String
  orderDate       DateTime
  expectedDelivery DateTime?
  status          String      // Free text enum
  totalCost       Float
  
  // Relations
  sppg            Sppg @relation(...)
  supplier        Supplier? @relation(...)  // ❌ Optional
  items           ProcurementItem[]
}
```

### Issues

1. **❌ HIGH - Optional Supplier Link**: Some procurements not linked to Supplier master
2. **❌ MEDIUM - Duplicate Data**: supplierName/supplierContact duplicates Supplier table
3. **❌ MEDIUM - Reporting Unreliable**: Can't track supplier performance accurately

### Business Impact

```typescript
// Problem: Can't generate accurate supplier performance report
const report = await db.procurement.findMany({
  where: { supplierId: 'supplier-123' }
})

// ❌ Misses procurements where supplierId = null but supplierName matches
// Result: Incomplete supplier history, wrong spend totals
```

### Target State

```prisma
model Procurement {
  id              String      @id @default(cuid())
  sppgId          String
  
  // ✅ REQUIRED supplier link (no free text)
  supplierId      String
  
  orderNumber     String      @unique
  orderDate       DateTime
  expectedDelivery DateTime?
  status          ProcurementStatus  // ✅ Enum
  totalCost       Float
  
  // Relations
  sppg            Sppg @relation(...)
  supplier        Supplier @relation(...)  // ✅ Required
  items           ProcurementItem[]
}

enum ProcurementStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  ORDERED
  PARTIAL_RECEIVED
  RECEIVED
  CANCELLED
}
```

### Implementation (6 hours)

#### Step 1: Link Existing Procurements to Suppliers (2h)

```typescript
// prisma/scripts/link-procurements-to-suppliers.ts

async function linkProcurementsToSuppliers() {
  const orphanedProcurements = await db.procurement.findMany({
    where: { supplierId: null },
    include: {
      sppg: true
    }
  })
  
  console.log(`Found ${orphanedProcurements.length} procurements without supplier link`)
  
  for (const procurement of orphanedProcurements) {
    // Try to find matching supplier
    const suppliers = await db.supplier.findMany({
      where: { sppgId: procurement.sppgId }
    })
    
    // Exact name match
    const exactMatch = suppliers.find(
      s => s.supplierName.toLowerCase() === procurement.supplierName.toLowerCase()
    )
    
    if (exactMatch) {
      await db.procurement.update({
        where: { id: procurement.id },
        data: { supplierId: exactMatch.id }
      })
      console.log(`✅ Linked: ${procurement.supplierName} → ${exactMatch.supplierName}`)
      continue
    }
    
    // Fuzzy match
    const fuzzyMatches = suppliers
      .map(s => ({
        supplier: s,
        similarity: stringSimilarity(procurement.supplierName, s.supplierName)
      }))
      .filter(m => m.similarity > 0.8)
      .sort((a, b) => b.similarity - a.similarity)
    
    if (fuzzyMatches.length > 0) {
      await db.procurement.update({
        where: { id: procurement.id },
        data: { supplierId: fuzzyMatches[0].supplier.id }
      })
      console.log(`✅ Fuzzy match: ${procurement.supplierName} → ${fuzzyMatches[0].supplier.supplierName} (${(fuzzyMatches[0].similarity * 100).toFixed(0)}%)`)
      continue
    }
    
    // Create new supplier
    const newSupplier = await db.supplier.create({
      data: {
        sppgId: procurement.sppgId,
        supplierName: procurement.supplierName,
        contactPerson: procurement.supplierContact.split(',')[0] || procurement.supplierName,
        phone: procurement.supplierContact.includes(',') 
          ? procurement.supplierContact.split(',')[1]?.trim() 
          : procurement.supplierContact,
        supplierType: 'OTHER',
        status: 'ACTIVE',
        notes: 'Auto-created during procurement migration'
      }
    })
    
    await db.procurement.update({
      where: { id: procurement.id },
      data: { supplierId: newSupplier.id }
    })
    
    console.log(`✅ Created supplier: ${procurement.supplierName}`)
  }
}
```

#### Step 2: Schema Migration (2h)

```sql
-- Make supplierId required
ALTER TABLE "Procurement"
  ALTER COLUMN "supplierId" SET NOT NULL;

-- Create ProcurementStatus enum
CREATE TYPE "ProcurementStatus" AS ENUM (
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ORDERED',
  'PARTIAL_RECEIVED',
  'RECEIVED',
  'CANCELLED'
);

-- Migrate status to enum
UPDATE "Procurement"
SET "status" = 
  CASE
    WHEN LOWER("status") IN ('draft', 'new') THEN 'DRAFT'
    WHEN LOWER("status") IN ('pending', 'pending approval') THEN 'PENDING_APPROVAL'
    WHEN LOWER("status") IN ('approved') THEN 'APPROVED'
    WHEN LOWER("status") IN ('ordered', 'sent') THEN 'ORDERED'
    WHEN LOWER("status") IN ('partial', 'partial received') THEN 'PARTIAL_RECEIVED'
    WHEN LOWER("status") IN ('received', 'complete') THEN 'RECEIVED'
    WHEN LOWER("status") IN ('cancelled', 'canceled') THEN 'CANCELLED'
    ELSE 'DRAFT'
  END;

ALTER TABLE "Procurement"
  ALTER COLUMN "status" TYPE "ProcurementStatus"
  USING "status"::"ProcurementStatus";

-- Remove duplicate fields
ALTER TABLE "Procurement"
  DROP COLUMN IF EXISTS "supplierName",
  DROP COLUMN IF EXISTS "supplierContact";

-- Add unique constraint
ALTER TABLE "Procurement"
  ADD CONSTRAINT "Procurement_orderNumber_unique" UNIQUE ("orderNumber");
```

#### Step 3: Update ProcurementService (1h)

```typescript
// src/features/sppg/procurement/services/ProcurementService.ts

export class ProcurementService {
  async createProcurement(data: {
    sppgId: string
    supplierId: string  // ✅ Required
    orderDate: Date
    items: Array<{
      inventoryItemId: string
      quantityOrdered: number
      unitPrice: number
    }>
  }) {
    // Validate supplier exists and is active
    const supplier = await db.supplier.findFirst({
      where: {
        id: data.supplierId,
        sppgId: data.sppgId,
        status: 'ACTIVE'
      }
    })
    
    if (!supplier) {
      throw new Error('Supplier not found or inactive')
    }
    
    // Generate order number
    const orderNumber = await this.generateOrderNumber(data.sppgId)
    
    // Calculate total cost
    const totalCost = data.items.reduce(
      (sum, item) => sum + (item.quantityOrdered * item.unitPrice),
      0
    )
    
    return db.procurement.create({
      data: {
        sppgId: data.sppgId,
        supplierId: data.supplierId,
        orderNumber,
        orderDate: data.orderDate,
        status: 'DRAFT',
        totalCost,
        items: {
          create: data.items.map(item => ({
            inventoryItemId: item.inventoryItemId,
            quantityOrdered: item.quantityOrdered,
            unitPrice: item.unitPrice,
            totalPrice: item.quantityOrdered * item.unitPrice
          }))
        }
      },
      include: {
        supplier: true,
        items: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
  }
}
```

#### Step 4: Verification (1h)

```sql
-- Verify all procurements have supplier
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN "supplierId" IS NOT NULL THEN 1 END) as with_supplier,
  COUNT(CASE WHEN "supplierId" IS NULL THEN 1 END) as without_supplier
FROM "Procurement";
-- Expected: without_supplier = 0

-- Test supplier performance report
SELECT 
  s."supplierName",
  COUNT(p."id") as total_orders,
  SUM(p."totalCost") as total_spend,
  AVG(p."totalCost") as avg_order_value,
  COUNT(CASE WHEN p."status" = 'RECEIVED' THEN 1 END) as completed_orders
FROM "Supplier" s
LEFT JOIN "Procurement" p ON s."id" = p."supplierId"
WHERE s."sppgId" = 'test-sppg-id'
GROUP BY s."id", s."supplierName"
ORDER BY total_spend DESC;
```

---

## 🎯 FIX #7: MenuPlan Approval Workflow

### Current Broken State

```prisma
model MenuPlan {
  id              String      @id @default(cuid())
  programId       String
  planName        String
  startDate       DateTime
  endDate         DateTime
  
  // ❌ CRITICAL: No approval workflow
  // Any user can create and activate menu plans
  // No validation or approval required
  
  status          String      // Free text
  isActive        Boolean     @default(false)
  
  // Relations
  program         NutritionProgram @relation(...)
  menuAssignments MenuAssignment[]
}
```

### Issues

1. **❌ CRITICAL - No Approval Workflow**: Menu plans can be activated without review
2. **❌ HIGH - Security Risk**: Unauthorized users can create plans
3. **❌ MEDIUM - No Audit Trail**: Can't track who approved what when

### Business Impact

```typescript
// Problem: Unauthorized staff creates menu plan
const menuPlan = await db.menuPlan.create({
  data: {
    programId: 'program-123',
    planName: 'Weekly Menu',
    isActive: true  // ❌ Activated immediately without approval!
  }
})

// ❌ PROBLEMS:
// 1. No approval from Ahli Gizi required
// 2. No validation of nutritional requirements
// 3. Plan goes live immediately
// 4. Can cause production errors if menu items unavailable
```

### Target State

```prisma
model MenuPlan {
  id              String      @id @default(cuid())
  programId       String
  planName        String
  startDate       DateTime
  endDate         DateTime
  
  // ✅ Approval workflow
  status          MenuPlanStatus  @default(DRAFT)
  isActive        Boolean     @default(false)
  
  // ✅ Approval tracking
  submittedBy     String?
  submittedAt     DateTime?
  approvedBy      String?     // Ahli Gizi user ID
  approvedAt      DateTime?
  rejectedBy      String?
  rejectedAt      DateTime?
  rejectionReason String?
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  createdBy       String?
  
  // Relations
  program         NutritionProgram @relation(...)
  menuAssignments MenuAssignment[]
  submitter       User? @relation("MenuPlanSubmitter", ...)
  approver        User? @relation("MenuPlanApprover", ...)
}

enum MenuPlanStatus {
  DRAFT             // Being edited
  PENDING_APPROVAL  // Submitted for review
  APPROVED          // Approved by Ahli Gizi
  REJECTED          // Rejected, needs revision
  ACTIVE            // Currently in use
  COMPLETED         // Period ended
  CANCELLED         // Cancelled
}
```

### Implementation (12 hours)

#### Step 1: Add Approval Fields (2h)

```sql
-- Add approval workflow fields
ALTER TABLE "MenuPlan"
  ADD COLUMN IF NOT EXISTS "submittedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

-- Create MenuPlanStatus enum
CREATE TYPE "MenuPlanStatus" AS ENUM (
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED'
);

-- Migrate existing data
UPDATE "MenuPlan"
SET "status" = 
  CASE
    WHEN "isActive" = true THEN 'ACTIVE'
    WHEN LOWER("status") IN ('draft', 'new') THEN 'DRAFT'
    WHEN LOWER("status") IN ('approved') THEN 'APPROVED'
    WHEN LOWER("status") IN ('rejected') THEN 'REJECTED'
    WHEN LOWER("status") IN ('completed', 'done') THEN 'COMPLETED'
    WHEN LOWER("status") IN ('cancelled', 'canceled') THEN 'CANCELLED'
    ELSE 'DRAFT'
  END;

ALTER TABLE "MenuPlan"
  ALTER COLUMN "status" TYPE "MenuPlanStatus"
  USING "status"::"MenuPlanStatus";

-- Add foreign keys for approval tracking
ALTER TABLE "MenuPlan"
  ADD CONSTRAINT "MenuPlan_submittedBy_fkey"
    FOREIGN KEY ("submittedBy") REFERENCES "User"("id")
    ON DELETE SET NULL,
  ADD CONSTRAINT "MenuPlan_approvedBy_fkey"
    FOREIGN KEY ("approvedBy") REFERENCES "User"("id")
    ON DELETE SET NULL,
  ADD CONSTRAINT "MenuPlan_rejectedBy_fkey"
    FOREIGN KEY ("rejectedBy") REFERENCES "User"("id")
    ON DELETE SET NULL;
```

#### Step 2: Create MenuPlanApprovalService (4h)

```typescript
// src/features/sppg/menu/services/MenuPlanApprovalService.ts

export class MenuPlanApprovalService {
  /**
   * Submit menu plan for approval
   */
  async submitForApproval(
    menuPlanId: string,
    userId: string
  ): Promise<MenuPlan> {
    const menuPlan = await db.menuPlan.findUnique({
      where: { id: menuPlanId },
      include: {
        menuAssignments: {
          include: {
            menu: {
              include: {
                ingredients: true
              }
            }
          }
        }
      }
    })
    
    if (!menuPlan) {
      throw new Error('Menu plan not found')
    }
    
    if (menuPlan.status !== 'DRAFT') {
      throw new Error('Only draft menu plans can be submitted')
    }
    
    // Validate menu plan has assignments
    if (menuPlan.menuAssignments.length === 0) {
      throw new Error('Menu plan must have at least one menu assignment')
    }
    
    // Validate all menus have ingredients
    for (const assignment of menuPlan.menuAssignments) {
      if (assignment.menu.ingredients.length === 0) {
        throw new Error(`Menu "${assignment.menu.menuName}" has no ingredients`)
      }
    }
    
    // Update status
    return db.menuPlan.update({
      where: { id: menuPlanId },
      data: {
        status: 'PENDING_APPROVAL',
        submittedBy: userId,
        submittedAt: new Date()
      }
    })
  }
  
  /**
   * Approve menu plan (Ahli Gizi only)
   */
  async approve(
    menuPlanId: string,
    userId: string,
    userRole: string
  ): Promise<MenuPlan> {
    // Check permission
    if (!['SPPG_AHLI_GIZI', 'SPPG_KEPALA'].includes(userRole)) {
      throw new Error('Only Ahli Gizi or Kepala SPPG can approve menu plans')
    }
    
    const menuPlan = await db.menuPlan.findUnique({
      where: { id: menuPlanId },
      include: {
        menuAssignments: {
          include: {
            menu: true
          }
        }
      }
    })
    
    if (!menuPlan) {
      throw new Error('Menu plan not found')
    }
    
    if (menuPlan.status !== 'PENDING_APPROVAL') {
      throw new Error('Only pending menu plans can be approved')
    }
    
    // Validate nutritional requirements
    await this.validateNutritionalRequirements(menuPlan)
    
    return db.menuPlan.update({
      where: { id: menuPlanId },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date()
      }
    })
  }
  
  /**
   * Reject menu plan
   */
  async reject(
    menuPlanId: string,
    userId: string,
    userRole: string,
    reason: string
  ): Promise<MenuPlan> {
    if (!['SPPG_AHLI_GIZI', 'SPPG_KEPALA'].includes(userRole)) {
      throw new Error('Only Ahli Gizi or Kepala SPPG can reject menu plans')
    }
    
    const menuPlan = await db.menuPlan.findUnique({
      where: { id: menuPlanId }
    })
    
    if (!menuPlan) {
      throw new Error('Menu plan not found')
    }
    
    if (menuPlan.status !== 'PENDING_APPROVAL') {
      throw new Error('Only pending menu plans can be rejected')
    }
    
    return db.menuPlan.update({
      where: { id: menuPlanId },
      data: {
        status: 'REJECTED',
        rejectedBy: userId,
        rejectedAt: new Date(),
        rejectionReason: reason
      }
    })
  }
  
  /**
   * Activate approved menu plan
   */
  async activate(
    menuPlanId: string,
    userId: string
  ): Promise<MenuPlan> {
    const menuPlan = await db.menuPlan.findUnique({
      where: { id: menuPlanId },
      include: {
        program: true
      }
    })
    
    if (!menuPlan) {
      throw new Error('Menu plan not found')
    }
    
    if (menuPlan.status !== 'APPROVED') {
      throw new Error('Only approved menu plans can be activated')
    }
    
    // Check date range validity
    if (menuPlan.startDate > menuPlan.endDate) {
      throw new Error('Start date must be before end date')
    }
    
    if (menuPlan.endDate < new Date()) {
      throw new Error('Cannot activate menu plan with past end date')
    }
    
    return db.$transaction(async (tx) => {
      // Deactivate other active plans for same program
      await tx.menuPlan.updateMany({
        where: {
          programId: menuPlan.programId,
          isActive: true,
          id: { not: menuPlanId }
        },
        data: {
          isActive: false,
          status: 'COMPLETED'
        }
      })
      
      // Activate this plan
      return tx.menuPlan.update({
        where: { id: menuPlanId },
        data: {
          status: 'ACTIVE',
          isActive: true
        }
      })
    })
  }
  
  /**
   * Validate nutritional requirements
   */
  private async validateNutritionalRequirements(
    menuPlan: MenuPlan & {
      menuAssignments: Array<{
        menu: NutritionMenu
      }>
    }
  ): Promise<void> {
    // Get program's nutritional targets
    const program = await db.nutritionProgram.findUnique({
      where: { id: menuPlan.programId }
    })
    
    if (!program) {
      throw new Error('Program not found')
    }
    
    // Validate each menu meets minimum requirements
    for (const assignment of menuPlan.menuAssignments) {
      const menu = assignment.menu
      
      if (menu.calories < (program.targetCalories || 0) * 0.8) {
        throw new Error(
          `Menu "${menu.menuName}" calories (${menu.calories}) below 80% of target (${program.targetCalories})`
        )
      }
      
      if (menu.protein < (program.targetProtein || 0) * 0.8) {
        throw new Error(
          `Menu "${menu.menuName}" protein (${menu.protein}g) below 80% of target (${program.targetProtein}g)`
        )
      }
    }
  }
}
```

#### Step 3: Create Approval UI (4h)

```typescript
// src/features/sppg/menu/components/MenuPlanApprovalCard.tsx

'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Clock, Send } from 'lucide-react'

interface MenuPlanApprovalCardProps {
  menuPlan: {
    id: string
    planName: string
    status: string
    submittedBy?: { name: string }
    submittedAt?: Date
    approvedBy?: { name: string }
    approvedAt?: Date
    rejectedBy?: { name: string }
    rejectedAt?: Date
    rejectionReason?: string
  }
  userRole: string
  onSubmit?: () => void
  onApprove?: () => void
  onReject?: (reason: string) => void
}

export function MenuPlanApprovalCard({
  menuPlan,
  userRole,
  onSubmit,
  onApprove,
  onReject
}: MenuPlanApprovalCardProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  
  const canApprove = ['SPPG_AHLI_GIZI', 'SPPG_KEPALA'].includes(userRole)
  const canSubmit = menuPlan.status === 'DRAFT'
  const isPending = menuPlan.status === 'PENDING_APPROVAL'
  const isApproved = menuPlan.status === 'APPROVED'
  const isRejected = menuPlan.status === 'REJECTED'
  
  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject?.(rejectionReason)
      setRejectDialogOpen(false)
      setRejectionReason('')
    }
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Approval Status</span>
            <Badge variant={
              isApproved ? 'success' :
              isPending ? 'warning' :
              isRejected ? 'destructive' :
              'secondary'
            }>
              {menuPlan.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Draft State */}
          {canSubmit && (
            <Alert>
              <Send className="h-4 w-4" />
              <AlertDescription>
                This menu plan is in draft status. Submit it for approval by Ahli Gizi.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Submitted Info */}
          {menuPlan.submittedBy && (
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">Submitted by:</p>
              <p className="font-medium">{menuPlan.submittedBy.name}</p>
              <p className="text-xs text-muted-foreground">
                {menuPlan.submittedAt?.toLocaleString('id-ID')}
              </p>
            </div>
          )}
          
          {/* Pending Approval */}
          {isPending && canApprove && (
            <Alert variant="warning">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This menu plan is pending your approval. Please review and approve/reject.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Approved Info */}
          {isApproved && menuPlan.approvedBy && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Approved</span>
              </div>
              <div className="mt-2 text-sm">
                <p className="text-muted-foreground">Approved by:</p>
                <p className="font-medium">{menuPlan.approvedBy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {menuPlan.approvedAt?.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}
          
          {/* Rejected Info */}
          {isRejected && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Rejected</span>
              </div>
              {menuPlan.rejectedBy && (
                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">Rejected by:</p>
                  <p className="font-medium">{menuPlan.rejectedBy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {menuPlan.rejectedAt?.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              {menuPlan.rejectionReason && (
                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">Reason:</p>
                  <p className="italic">{menuPlan.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {canSubmit && (
              <Button onClick={onSubmit} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            
            {isPending && canApprove && (
              <>
                <Button onClick={onApprove} className="flex-1" variant="default">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => setRejectDialogOpen(true)}
                  className="flex-1"
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Menu Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="font-medium mb-2 block">Rejection Reason *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this menu plan is being rejected..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Reject Menu Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

#### Step 4: Testing & Verification (2h)

```typescript
// Test approval workflow

describe('MenuPlanApprovalService', () => {
  it('should complete full approval workflow', async () => {
    // Create draft menu plan
    const menuPlan = await db.menuPlan.create({
      data: {
        programId: 'test-program',
        planName: 'Test Weekly Menu',
        status: 'DRAFT',
        startDate: new Date(),
        endDate: addDays(new Date(), 7)
      }
    })
    
    // Submit for approval
    const submitted = await approvalService.submitForApproval(
      menuPlan.id,
      'staff-user-id'
    )
    expect(submitted.status).toBe('PENDING_APPROVAL')
    expect(submitted.submittedBy).toBe('staff-user-id')
    
    // Approve (as Ahli Gizi)
    const approved = await approvalService.approve(
      menuPlan.id,
      'ahli-gizi-id',
      'SPPG_AHLI_GIZI'
    )
    expect(approved.status).toBe('APPROVED')
    expect(approved.approvedBy).toBe('ahli-gizi-id')
    
    // Activate
    const activated = await approvalService.activate(
      menuPlan.id,
      'staff-user-id'
    )
    expect(activated.status).toBe('ACTIVE')
    expect(activated.isActive).toBe(true)
  })
})
```

---

## 🎯 FIX #8: SchoolBeneficiary Address Standardization

### Current Broken State

```prisma
model SchoolBeneficiary {
  id              String      @id @default(cuid())
  programId       String
  schoolName      String
  
  // ❌ CRITICAL: Multiple address fields (inconsistent)
  address         String      // Main address
  deliveryAddress String?     // Optional separate delivery address
  
  district        String?     // Kecamatan
  city            String?     // Kota
  province        String?     // Provinsi
  postalCode      String?     // Kode Pos
  
  // Geographic
  latitude        Float?
  longitude       Float?
}
```

### Issues

1. **❌ CRITICAL - Duplicate Addresses**: address vs deliveryAddress causes confusion
2. **❌ HIGH - Inconsistent Data**: Some have district, some don't
3. **❌ MEDIUM - No Address Validation**: Wrong/incomplete addresses

### Business Impact

```typescript
// Problem: Delivery to wrong location
const school = await db.schoolBeneficiary.findUnique({
  where: { id: 'school-123' }
})

// ❌ Which address to use for delivery?
// school.address = "Jl. Merdeka No. 123"
// school.deliveryAddress = "Jl. Sudirman No. 456"  // Different!

// Driver gets confused, delivers to wrong place
```

### Target State

```prisma
model SchoolBeneficiary {
  id              String      @id @default(cuid())
  programId       String
  schoolName      String
  
  // ✅ Single standardized address
  address         String      // Full address
  district        String      // Kecamatan (required)
  city            String      // Kota (required)
  province        String      // Provinsi (required)
  postalCode      String      // Kode Pos (required)
  
  // ✅ GPS coordinates (required)
  latitude        Float
  longitude       Float
  
  // ✅ Delivery notes (optional)
  deliveryNotes   String?     // Special delivery instructions
  landmark        String?     // Nearby landmark
}
```

### Implementation (8 hours)

#### Step 1: Data Cleanup (3h)

```typescript
// Standardize addresses using external API
async function standardizeAddresses() {
  const schools = await db.schoolBeneficiary.findMany()
  
  for (const school of schools) {
    try {
      // Use main address if delivery address blank
      const primaryAddress = school.deliveryAddress || school.address
      
      // Call geocoding API (Google Maps, Nominatim, etc.)
      const geocoded = await geocodeAddress(primaryAddress)
      
      await db.schoolBeneficiary.update({
        where: { id: school.id },
        data: {
          address: geocoded.formattedAddress,
          district: geocoded.district,
          city: geocoded.city,
          province: geocoded.province,
          postalCode: geocoded.postalCode,
          latitude: geocoded.lat,
          longitude: geocoded.lng,
          deliveryNotes: school.deliveryAddress 
            ? `Legacy delivery address: ${school.deliveryAddress}`
            : null
        }
      })
      
      console.log(`✅ Standardized: ${school.schoolName}`)
      
    } catch (error) {
      console.error(`❌ Failed: ${school.schoolName}`, error)
    }
  }
}
```

#### Step 2: Schema Migration (2h)

```sql
-- Make address fields required
ALTER TABLE "SchoolBeneficiary"
  ALTER COLUMN "district" SET NOT NULL,
  ALTER COLUMN "city" SET NOT NULL,
  ALTER COLUMN "province" SET NOT NULL,
  ALTER COLUMN "postalCode" SET NOT NULL,
  ALTER COLUMN "latitude" SET NOT NULL,
  ALTER COLUMN "longitude" SET NOT NULL;

-- Add delivery notes
ALTER TABLE "SchoolBeneficiary"
  ADD COLUMN IF NOT EXISTS "deliveryNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "landmark" TEXT;

-- Remove duplicate deliveryAddress
ALTER TABLE "SchoolBeneficiary"
  DROP COLUMN IF EXISTS "deliveryAddress";

-- Add geospatial index
CREATE INDEX "SchoolBeneficiary_location_idx"
  ON "SchoolBeneficiary" USING GIST (
    point(longitude, latitude)
  );
```

#### Step 3: Create AddressValidationService (2h)

```typescript
export class AddressValidationService {
  async validateAndGeocodeAddress(data: {
    address: string
    city: string
    province: string
  }): Promise<{
    isValid: boolean
    formattedAddress: string
    district: string
    city: string
    province: string
    postalCode: string
    latitude: number
    longitude: number
  }> {
    // Call geocoding API
    const result = await this.geocode(
      `${data.address}, ${data.city}, ${data.province}, Indonesia`
    )
    
    if (!result) {
      throw new Error('Address could not be validated')
    }
    
    return {
      isValid: true,
      formattedAddress: result.formatted_address,
      district: result.district,
      city: result.city,
      province: result.province,
      postalCode: result.postal_code,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng
    }
  }
}
```

#### Step 4: Verification (1h)

```sql
-- Verify all schools have complete address
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN "district" IS NOT NULL THEN 1 END) as with_district,
  COUNT(CASE WHEN "latitude" IS NOT NULL THEN 1 END) as with_gps
FROM "SchoolBeneficiary";

-- Find nearest schools to a point (delivery route optimization)
SELECT 
  "schoolName",
  "address",
  SQRT(
    POW(69.1 * ("latitude" - -6.2088), 2) +
    POW(69.1 * (-106.8456 - "longitude") * COS("latitude" / 57.3), 2)
  ) as distance_miles
FROM "SchoolBeneficiary"
ORDER BY distance_miles
LIMIT 10;
```

---

## ✅ Combined Definition of Done

**Fix #6: Procurement Supplier (6h)**
- [ ] All procurements linked to suppliers (0 orphans)
- [ ] Duplicate fields removed
- [ ] ProcurementStatus enum implemented
- [ ] Supplier performance reports working

**Fix #7: MenuPlan Approval (12h)**
- [ ] Approval workflow implemented
- [ ] Only Ahli Gizi can approve
- [ ] Full audit trail (who/when)
- [ ] Nutritional validation enforced
- [ ] UI components working

**Fix #8: SchoolBeneficiary Address (8h)**
- [ ] All schools have standardized addresses
- [ ] GPS coordinates required
- [ ] Duplicate deliveryAddress removed
- [ ] Address validation working
- [ ] Route optimization enabled

**Overall**
- [ ] All 3 fixes tested
- [ ] Documentation updated
- [ ] Data quality metrics at 100%

---

**Status**: ✅ Complete implementation plan  
**Total**: 26 hours (6h + 12h + 8h)  
**Completion**: 2025-10-30 (Week 4 end)
