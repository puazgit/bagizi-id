/**
 * @fileoverview Procurement domain TypeScript types based on Prisma models
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import type { 
  ProcurementStatus, 
  ProcurementMethod, 
  QualityGrade,
  InventoryCategory,
  SupplierType 
} from '@prisma/client'

// ================================ RE-EXPORT PRISMA ENUMS ================================

export type { 
  ProcurementStatus, 
  ProcurementMethod, 
  QualityGrade,
  InventoryCategory,
  SupplierType 
}

// ================================ PROCUREMENT PLAN TYPES ================================

/**
 * Procurement Plan type matching ProcurementPlan Prisma model
 * Used for monthly/quarterly procurement planning and budgeting
 */
export interface ProcurementPlan {
  id: string
  sppgId: string
  programId?: string | null
  
  // Planning Period
  planName: string
  planMonth: string // "2024-10"
  planYear: number
  planQuarter?: number | null // 1, 2, 3, 4
  
  // Budget Planning
  totalBudget: number
  allocatedBudget: number
  usedBudget: number
  remainingBudget: number
  
  // Categories Budget
  proteinBudget?: number | null
  carbBudget?: number | null
  vegetableBudget?: number | null
  fruitBudget?: number | null
  otherBudget?: number | null
  
  // Targets
  targetRecipients: number
  targetMeals: number // Total target meals untuk periode
  costPerMeal?: number | null // Target cost per meal
  
  // Approval Workflow
  approvalStatus: string // "DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "REVISION"
  submittedBy?: string | null // User ID
  submittedAt?: Date | null
  approvedBy?: string | null // User ID
  approvedAt?: Date | null
  rejectionReason?: string | null
  
  // Planning Details
  notes?: string | null
  emergencyBuffer?: number | null // Buffer untuk kondisi darurat
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Procurement Plan with relations and statistics
 */
export interface ProcurementPlanWithDetails extends ProcurementPlan {
  sppg: {
    id: string
    sppgName: string
    sppgCode: string
  }
  program?: {
    id: string
    programName: string
  } | null
  procurements: Procurement[]
  
  // Computed statistics
  totalProcurements: number
  completedProcurements: number
  pendingProcurements: number
  budgetUtilization: number // Percentage
}

// ================================ PROCUREMENT TYPES ================================

/**
 * Core Procurement type matching Procurement Prisma model
 * Represents a single procurement transaction/order
 */
export interface Procurement {
  id: string
  sppgId: string
  planId?: string | null
  
  // Procurement Details
  procurementCode: string
  procurementDate: Date
  expectedDelivery?: Date | null
  actualDelivery?: Date | null
  
  // Supplier Relationship (Normalized)
  supplierId: string
  supplierName?: string | null // Legacy, will be deprecated
  supplierContact?: string | null // Legacy, will be deprecated
  
  // Purchase Information
  purchaseMethod: ProcurementMethod
  paymentTerms?: string | null // "CASH_ON_DELIVERY", "NET_30", "NET_15"
  
  // Financial
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  paidAmount: number
  paymentStatus: string // "UNPAID", "PARTIAL", "PAID", "OVERDUE"
  paymentDue?: Date | null
  
  // Status & Quality
  status: ProcurementStatus
  deliveryStatus: string // "ORDERED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"
  qualityGrade?: QualityGrade | null
  qualityNotes?: string | null
  
  // Documentation
  receiptNumber?: string | null
  receiptPhoto?: string | null // URL foto nota
  deliveryPhoto?: string | null // URL foto saat diterima
  invoiceNumber?: string | null
  
  // Logistics
  deliveryMethod?: string | null // "PICKUP", "DELIVERY", "SHIPPED"
  transportCost?: number | null
  packagingType?: string | null
  
  // Quality Control
  inspectedBy?: string | null // User ID
  inspectedAt?: Date | null
  acceptanceStatus?: string | null // "ACCEPTED", "REJECTED", "PARTIAL"
  rejectionReason?: string | null
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Procurement with full relations for detailed view
 */
export interface ProcurementWithDetails extends Procurement {
  sppg: {
    id: string
    sppgName: string
    sppgCode: string
  }
  plan?: ProcurementPlan | null
  supplier: Supplier
  items: ProcurementItem[]
  
  // Computed fields
  totalItems: number
  totalQuantity: number
  averageItemPrice: number
}

// ================================ PROCUREMENT ITEM TYPES ================================

/**
 * Procurement Item type matching ProcurementItem Prisma model
 * Individual items within a procurement order
 */
export interface ProcurementItem {
  id: string
  procurementId: string
  inventoryItemId?: string | null
  
  // Item Details
  itemName: string
  itemCode?: string | null
  category: InventoryCategory
  brand?: string | null
  
  // Quantity & Units
  orderedQuantity: number
  receivedQuantity?: number | null
  unit: string
  
  // Pricing
  pricePerUnit: number
  totalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  
  // Quality Specifications
  qualityStandard?: string | null // Standar kualitas yang diminta
  qualityReceived?: string | null // Kualitas yang diterima
  gradeRequested?: string | null // Grade yang diminta
  gradeReceived?: string | null // Grade yang diterima
  
  // Expiry & Storage
  expiryDate?: Date | null
  batchNumber?: string | null
  productionDate?: Date | null
  storageRequirement?: string | null // Persyaratan penyimpanan
  
  // Acceptance
  isAccepted: boolean
  rejectionReason?: string | null
  returnedQuantity: number
  
  // Nutrition Information (optional)
  caloriesPer100g?: number | null
  proteinPer100g?: number | null
  fatPer100g?: number | null
  carbsPer100g?: number | null
  
  // Notes
  notes?: string | null
}

/**
 * Procurement Item with inventory relation
 */
export interface ProcurementItemWithDetails extends ProcurementItem {
  procurement: {
    id: string
    procurementCode: string
    procurementDate: Date
  }
  inventoryItem?: {
    id: string
    itemName: string
    itemCode: string
    currentStock: number
    unit: string
  } | null
}

// ================================ SUPPLIER TYPES ================================

/**
 * Supplier type matching Supplier Prisma model (comprehensive)
 */
export interface Supplier {
  id: string
  sppgId: string
  
  // Basic Supplier Information
  supplierCode: string
  supplierName: string
  businessName?: string | null // Legal business name
  supplierType: SupplierType
  category: string // "PROTEIN", "VEGETABLES", "DAIRY", "GRAINS"
  
  // Contact Information
  primaryContact: string // Contact person name
  phone: string
  email?: string | null
  whatsapp?: string | null
  website?: string | null
  
  // Address & Location
  address: string
  city: string
  province: string
  postalCode?: string | null
  coordinates?: string | null // GPS coordinates
  deliveryRadius?: number | null // Delivery radius in KM
  
  // Business Documentation
  businessLicense?: string | null // License number
  taxId?: string | null // NPWP
  hallaLicense?: string | null // Halal certification
  foodSafetyLicense?: string | null // Food safety certification
  
  // Financial & Terms
  paymentTerms: string
  creditLimit?: number | null
  currency: string
  bankAccount?: string | null
  bankName?: string | null
  
  // Supplier Performance & Rating
  overallRating: number // 0.0 - 5.0
  qualityRating: number
  deliveryRating: number
  priceCompetitiveness: number
  serviceRating: number
  
  // Performance Statistics
  totalOrders: number
  successfulDeliveries: number
  failedDeliveries: number
  averageDeliveryTime?: number | null // In hours
  onTimeDeliveryRate: number // Percentage
  totalPurchaseValue: number // Total IDR value
  
  // Supplier Capabilities
  minOrderValue?: number | null
  maxOrderCapacity?: number | null // Maximum order they can handle
  leadTimeHours?: number | null // Standard lead time
  deliveryDays: string[] // ["MONDAY", "TUESDAY"]
  specialties: string[] // Product specialties
  certifications: string[] // Various certifications
  
  // Supplier Status & Flags
  isActive: boolean
  isPreferred: boolean
  isBlacklisted: boolean
  blacklistReason?: string | null
  lastAuditDate?: Date | null
  nextAuditDue?: Date | null
  
  // Compliance & Quality
  isHalalCertified: boolean
  isFoodSafetyCertified: boolean
  isISOCertified: boolean
  complianceStatus: string // "PENDING", "VERIFIED", "EXPIRED"
  lastInspectionDate?: Date | null
  
  // Relationship Management
  partnershipLevel: string // "STANDARD", "PREFERRED", "STRATEGIC"
  contractStartDate?: Date | null
  contractEndDate?: Date | null
  relationshipManager?: string | null // Internal PIC
  
  // Digital Integration
  hasAPIIntegration: boolean
  apiEndpoint?: string | null
  supportsEDI: boolean // Electronic Data Interchange
  preferredOrderMethod: string // "PHONE", "EMAIL", "WHATSAPP", "API"
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastContactDate?: Date | null
}

/**
 * Supplier with relations and computed metrics
 */
export interface SupplierWithDetails extends Supplier {
  sppg: {
    id: string
    sppgName: string
  }
  procurements: Procurement[]
  evaluations: SupplierEvaluation[]
  contracts: SupplierContract[]
  products: SupplierProduct[]
  
  // Computed metrics
  totalActiveContracts: number
  averageOrderValue: number
  lastOrderDate?: Date | null
  performanceScore: number // Overall performance 0-100
}

// ================================ SUPPLIER EVALUATION TYPES ================================

/**
 * Supplier Evaluation type for performance tracking
 */
export interface SupplierEvaluation {
  id: string
  supplierId: string
  sppgId: string
  
  // Evaluation Details
  evaluationType: string // "MONTHLY", "QUARTERLY", "ANNUAL", "POST_ORDER"
  evaluationPeriod: string // "2025-Q1", "2025-01"
  
  // Performance Scores (1-5 scale)
  qualityScore: number
  deliveryScore: number
  serviceScore: number
  priceScore: number
  complianceScore: number
  overallScore: number
  
  // Detailed Assessment
  strengths?: string | null
  weaknesses?: string | null
  recommendations?: string | null
  actionItems?: unknown | null // JSON
  
  // Evaluation Context
  orderVolume?: number | null
  orderValue?: number | null
  deliveryCount: number
  complaintCount: number
  
  // Evaluation Status
  status: string // "DRAFT", "COMPLETED", "APPROVED"
  evaluatedBy: string // User ID
  approvedBy?: string | null // Manager ID
  
  // Timestamps
  evaluationDate: Date
  createdAt: Date
  updatedAt: Date
}

// ================================ SUPPLIER CONTRACT TYPES ================================

/**
 * Supplier Contract type for contract management
 */
export interface SupplierContract {
  id: string
  supplierId: string
  sppgId: string
  
  // Contract Information
  contractNumber: string
  contractType: string // "FRAMEWORK", "SPOT", "LONG_TERM"
  contractStatus: string // "DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"
  
  // Contract Terms
  startDate: Date
  endDate: Date
  autoRenew: boolean
  renewalPeriod?: number | null // Days for renewal notice
  
  // Financial Terms
  contractValue?: number | null
  paymentTerms: string
  currency: string
  priceAdjustment?: string | null // "FIXED", "CPI_LINKED", "NEGOTIABLE"
  
  // Performance Terms
  deliveryTimeframe: string
  qualityStandards?: string | null
  penaltyTerms?: string | null
  bonusTerms?: string | null
  
  // Legal & Compliance
  governingLaw?: string | null
  disputeResolution?: string | null
  confidentiality: boolean
  
  // Document Management
  contractDocument?: string | null // File path/URL
  signedBy?: string | null // Supplier representative
  witnessedBy?: string | null // Internal witness
  
  // Timestamps
  signedDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

// ================================ SUPPLIER PRODUCT TYPES ================================

/**
 * Supplier Product Catalog type
 */
export interface SupplierProduct {
  id: string
  supplierId: string
  sppgId: string
  
  // Product Information
  productCode: string
  productName: string
  category: string
  subcategory?: string | null
  description?: string | null
  
  // Specifications
  unit: string // "KG", "PCS", "LITER"
  packagingType?: string | null
  shelfLife?: number | null // Days
  storageCondition?: string | null
  
  // Pricing
  basePrice: number
  currency: string
  pricePerUnit: number
  minimumOrder?: number | null
  maximumOrder?: number | null
  
  // Availability
  isAvailable: boolean
  leadTimeHours: number
  stockLevel: string // "AVAILABLE", "LIMITED", "OUT_OF_STOCK"
  
  // Quality Information
  hasHalalCert: boolean
  hasOrganicCert: boolean
  qualityGrade?: QualityGrade | null
  certifications: string[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastPriceUpdate?: Date | null
}

// ================================ INPUT/OUTPUT TYPES FOR API ================================

/**
 * Input type for creating new procurement plan
 */
export interface CreateProcurementPlanInput {
  programId?: string
  planName: string
  planMonth: string
  planYear: number
  planQuarter?: number
  totalBudget: number
  proteinBudget?: number
  carbBudget?: number
  vegetableBudget?: number
  fruitBudget?: number
  otherBudget?: number
  targetRecipients: number
  targetMeals: number
  costPerMeal?: number
  notes?: string
  emergencyBuffer?: number
}

/**
 * Input type for updating procurement plan
 */
export interface UpdateProcurementPlanInput extends Partial<CreateProcurementPlanInput> {
  approvalStatus?: string
  rejectionReason?: string
}

/**
 * Input type for creating new procurement order
 */
export interface CreateProcurementInput {
  planId?: string
  procurementDate: Date
  expectedDelivery?: Date
  supplierId: string
  purchaseMethod: ProcurementMethod
  paymentTerms?: string
  subtotalAmount: number
  taxAmount?: number
  discountAmount?: number
  shippingCost?: number
  totalAmount: number
  paymentDue?: Date
  deliveryMethod?: string
  transportCost?: number
  packagingType?: string
  items: CreateProcurementItemInput[]
}

/**
 * Input type for procurement items
 */
export interface CreateProcurementItemInput {
  inventoryItemId?: string
  itemName: string
  itemCode?: string
  category: InventoryCategory
  brand?: string
  orderedQuantity: number
  unit: string
  pricePerUnit: number
  totalPrice: number
  discountPercent?: number
  discountAmount?: number
  finalPrice: number
  qualityStandard?: string
  gradeRequested?: string
  expiryDate?: Date
  storageRequirement?: string
  notes?: string
}

/**
 * Input type for updating procurement
 */
export interface UpdateProcurementInput extends Partial<CreateProcurementInput> {
  actualDelivery?: Date
  status?: ProcurementStatus
  deliveryStatus?: string
  qualityGrade?: QualityGrade
  qualityNotes?: string
  receiptNumber?: string
  receiptPhoto?: string
  deliveryPhoto?: string
  invoiceNumber?: string
  inspectedBy?: string
  inspectedAt?: Date
  acceptanceStatus?: string
  rejectionReason?: string
  paidAmount?: number
  paymentStatus?: string
}

/**
 * Input type for creating supplier
 */
export interface CreateSupplierInput {
  supplierName: string
  businessName?: string
  supplierType: SupplierType
  category: string
  primaryContact: string
  phone: string
  email?: string
  whatsapp?: string
  website?: string
  address: string
  city: string
  province: string
  postalCode?: string
  coordinates?: string
  deliveryRadius?: number
  paymentTerms?: string
  creditLimit?: number
  minOrderValue?: number
  maxOrderCapacity?: number
  leadTimeHours?: number
  deliveryDays?: string[]
  specialties?: string[]
  certifications?: string[]
  isHalalCertified?: boolean
  isFoodSafetyCertified?: boolean
  isISOCertified?: boolean
  preferredOrderMethod?: string
}

/**
 * Input type for updating supplier
 */
export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  isActive?: boolean
  isPreferred?: boolean
  isBlacklisted?: boolean
  blacklistReason?: string
  complianceStatus?: string
  partnershipLevel?: string
  contractStartDate?: Date
  contractEndDate?: Date
  relationshipManager?: string
}

// ================================ API RESPONSE TYPES ================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/**
 * Procurement statistics for dashboard
 */
export interface ProcurementStatistics {
  totalProcurements: number
  totalAmount: number
  averageOrderValue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  totalSuppliers: number
  activeSuppliers: number
  onTimeDeliveryRate: number
  averageDeliveryTime: number
  budgetUtilization: number
  topSuppliers: Array<{
    supplierId: string
    supplierName: string
    totalOrders: number
    totalAmount: number
  }>
  categoryBreakdown: Array<{
    category: string
    totalAmount: number
    percentage: number
  }>
}

// ================================ FILTER & SEARCH TYPES ================================

/**
 * Procurement filter options
 */
export interface ProcurementFilters {
  status?: ProcurementStatus[]
  deliveryStatus?: string[]
  paymentStatus?: string[]
  supplierId?: string
  planId?: string
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
  purchaseMethod?: ProcurementMethod[]
}

/**
 * Supplier filter options
 */
export interface SupplierFilters {
  supplierType?: SupplierType[]
  category?: string[]
  city?: string[]
  province?: string[]
  isActive?: boolean
  isPreferred?: boolean
  minRating?: number
  partnershipLevel?: string[]
  complianceStatus?: string[]
}
