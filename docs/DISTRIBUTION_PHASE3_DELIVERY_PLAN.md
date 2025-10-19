# 📦 DISTRIBUTION PHASE 3 - DELIVERY TRACKING PLAN

**Module**: DistributionDelivery (Individual Delivery Management)  
**Estimated Lines**: ~1,800 lines  
**Dependencies**: PHASE 2 (FoodDistribution Execution) ✅ COMPLETE  
**Status**: 🚧 IN PROGRESS

---

## 🎯 Objectives

Membangun sistem tracking individual delivery dengan granular tracking untuk setiap pengiriman ke sekolah/lokasi penerima manfaat.

### **Key Features**:
1. **Individual Delivery Tracking** - Track setiap delivery secara independent
2. **GPS Location Tracking** - Real-time location monitoring
3. **Photo Evidence** - Upload bukti foto pengiriman
4. **Recipient Signature** - Digital signature capture
5. **Status Updates** - Real-time status transition tracking
6. **Quality Check** - Food quality verification at delivery point
7. **Issue Reporting** - Delivery-specific issue tracking

---

## 📊 Data Model Analysis

### **Existing Schema** (from Prisma):

```prisma
model DistributionDelivery {
  id                    String              @id @default(cuid())
  distributionId        String
  schoolBeneficiaryId   String
  
  // Schedule & Route
  plannedTime           DateTime
  actualTime            DateTime?
  plannedRoute          String?
  actualRoute           String?
  
  // Delivery Details
  portionsDelivered     Int
  recipientName         String
  recipientTitle        String?
  recipientSignature    String?             // URL to signature image
  deliveryNotes         String?
  
  // Status
  status                DeliveryStatus      @default(PENDING)
  
  // Timestamps
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  // Relations
  distribution          FoodDistribution    @relation(...)
  schoolBeneficiary     SchoolBeneficiary   @relation(...)
  photos                DeliveryPhoto[]
  issues                DeliveryIssue[]
  
  @@index([distributionId, status])
  @@index([schoolBeneficiaryId])
}

enum DeliveryStatus {
  PENDING
  IN_TRANSIT
  ARRIVED
  DELIVERED
  FAILED
}

model DeliveryPhoto {
  id                String              @id @default(cuid())
  deliveryId        String
  photoUrl          String
  photoType         PhotoType
  caption           String?
  takenAt           DateTime            @default(now())
  
  delivery          DistributionDelivery @relation(...)
  
  @@index([deliveryId, photoType])
}

enum PhotoType {
  VEHICLE_BEFORE
  VEHICLE_AFTER
  FOOD_QUALITY
  DELIVERY_PROOF
  RECIPIENT
  OTHER
}

model DeliveryIssue {
  id                String              @id @default(cuid())
  deliveryId        String
  issueType         IssueType
  severity          IssueSeverity
  description       String
  resolvedAt        DateTime?
  resolutionNotes   String?
  
  delivery          DistributionDelivery @relation(...)
  
  @@index([deliveryId, resolvedAt])
}
```

### **Schema Enhancements Needed**:

#### 1. **Add GPS Tracking Fields to DistributionDelivery**:
```prisma
model DistributionDelivery {
  // ... existing fields ...
  
  // GPS Tracking (NEW)
  departureLocation     String?             // GPS: "lat,lng"
  arrivalLocation       String?             // GPS: "lat,lng"
  currentLocation       String?             // GPS: "lat,lng" (real-time)
  routeTrackingPoints   String[]            // GPS trail: ["lat,lng", ...]
  
  // Quality Check (NEW)
  foodQualityChecked    Boolean             @default(false)
  foodQualityNotes      String?
  foodTemperature       Decimal?            // Celsius
  
  // Timing (NEW)
  departureTime         DateTime?
  arrivalTime           DateTime?
  deliveryCompletedAt   DateTime?
  
  // ... rest of fields ...
}
```

#### 2. **Enhance DeliveryPhoto Model**:
```prisma
model DeliveryPhoto {
  // ... existing fields ...
  
  // GPS Location of Photo (NEW)
  locationTaken         String?             // GPS: "lat,lng"
  
  // Metadata (NEW)
  fileSize              Int?                // bytes
  mimeType              String?
  
  // ... rest of fields ...
}
```

#### 3. **Add DeliveryTracking Model** (NEW):
```prisma
model DeliveryTracking {
  id                String              @id @default(cuid())
  deliveryId        String
  
  // GPS Tracking
  latitude          Decimal             @db.Decimal(10, 8)
  longitude         Decimal             @db.Decimal(11, 8)
  accuracy          Decimal?            // meters
  
  // Status at this point
  status            DeliveryStatus
  notes             String?
  
  // Timestamp
  recordedAt        DateTime            @default(now())
  
  // Relations
  delivery          DistributionDelivery @relation(...)
  
  @@index([deliveryId, recordedAt])
  @@index([recordedAt])
}
```

---

## 🏗️ Implementation Plan

### **PHASE 3A: Foundation Layer** (~600 lines)

#### 1. **Prisma Schema Updates** ✅
- Update DistributionDelivery model with GPS fields
- Enhance DeliveryPhoto model
- Create DeliveryTracking model
- Create migration

#### 2. **Types Layer** (~150 lines)
**File**: `src/features/sppg/distribution/delivery/types/delivery.types.ts`

```typescript
export interface DeliveryWithRelations {
  id: string
  distributionId: string
  schoolBeneficiaryId: string
  
  // Times
  plannedTime: Date
  actualTime: Date | null
  departureTime: Date | null
  arrivalTime: Date | null
  deliveryCompletedAt: Date | null
  
  // GPS
  departureLocation: string | null
  arrivalLocation: string | null
  currentLocation: string | null
  routeTrackingPoints: string[]
  
  // Delivery
  portionsDelivered: number
  recipientName: string
  recipientTitle: string | null
  recipientSignature: string | null
  deliveryNotes: string | null
  
  // Quality
  foodQualityChecked: boolean
  foodQualityNotes: string | null
  foodTemperature: number | null
  
  // Status
  status: DeliveryStatus
  
  // Relations
  distribution: {
    id: string
    distributionCode: string
    status: DistributionStatus
  }
  schoolBeneficiary: {
    id: string
    schoolName: string
    address: string
    contactPerson: string
  }
  photos: DeliveryPhoto[]
  issues: DeliveryIssue[]
  trackingPoints: DeliveryTracking[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface DeliveryListItem {
  id: string
  schoolName: string
  address: string
  plannedTime: Date
  actualTime: Date | null
  status: DeliveryStatus
  portionsDelivered: number
  hasIssues: boolean
  photoCount: number
  currentLocation: string | null
}

export interface DeliveryDetail extends DeliveryWithRelations {
  metrics: DeliveryMetrics
}

export interface DeliveryMetrics {
  isLate: boolean
  delayMinutes: number | null
  isCompleted: boolean
  hasSignature: boolean
  hasPhotos: boolean
  qualityChecked: boolean
  hasActiveIssues: boolean
  trackingPointsCount: number
}

export interface GPSCoordinate {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface RoutePoint extends GPSCoordinate {
  timestamp: Date
  status: DeliveryStatus
  notes?: string
}
```

#### 3. **Schemas Layer** (~200 lines)
**File**: `src/features/sppg/distribution/delivery/schemas/deliverySchema.ts`

```typescript
// Update delivery status
export const updateDeliveryStatusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().optional()
  }).optional(),
  notes: z.string().optional()
})

// Start delivery (departure)
export const startDeliverySchema = z.object({
  departureTime: z.coerce.date(),
  departureLocation: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  vehicleChecked: z.boolean(),
  foodQualityOk: z.boolean()
})

// Arrive at location
export const arriveDeliverySchema = z.object({
  arrivalTime: z.coerce.date(),
  arrivalLocation: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  notes: z.string().optional()
})

// Complete delivery
export const completeDeliverySchema = z.object({
  deliveryCompletedAt: z.coerce.date(),
  portionsDelivered: z.number().int().min(1),
  recipientName: z.string().min(3),
  recipientTitle: z.string().optional(),
  recipientSignature: z.string().url().optional(),
  deliveryNotes: z.string().optional(),
  foodQualityChecked: z.boolean(),
  foodQualityNotes: z.string().optional(),
  foodTemperature: z.number().optional()
})

// Upload photo
export const uploadPhotoSchema = z.object({
  photoUrl: z.string().url(),
  photoType: z.nativeEnum(PhotoType),
  caption: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  fileSize: z.number().int().optional(),
  mimeType: z.string().optional()
})

// Report delivery issue
export const reportDeliveryIssueSchema = z.object({
  issueType: z.nativeEnum(IssueType),
  severity: z.nativeEnum(IssueSeverity),
  description: z.string().min(10)
})

// Track location
export const trackLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  status: z.nativeEnum(DeliveryStatus),
  notes: z.string().optional()
})
```

#### 4. **API Client** (~150 lines)
**File**: `src/features/sppg/distribution/delivery/api/deliveryApi.ts`

```typescript
export const deliveryApi = {
  // List deliveries (by execution)
  async getByExecution(executionId: string, headers?: HeadersInit) {},
  
  // Get single delivery detail
  async getById(id: string, headers?: HeadersInit) {},
  
  // Update status
  async updateStatus(id: string, data: UpdateStatusInput, headers?: HeadersInit) {},
  
  // Start delivery (departure)
  async start(id: string, data: StartDeliveryInput, headers?: HeadersInit) {},
  
  // Arrive at location
  async arrive(id: string, data: ArriveDeliveryInput, headers?: HeadersInit) {},
  
  // Complete delivery
  async complete(id: string, data: CompleteDeliveryInput, headers?: HeadersInit) {},
  
  // Mark as failed
  async fail(id: string, reason: string, headers?: HeadersInit) {},
  
  // Upload photo
  async uploadPhoto(id: string, data: UploadPhotoInput, headers?: HeadersInit) {},
  
  // Report issue
  async reportIssue(id: string, data: ReportIssueInput, headers?: HeadersInit) {},
  
  // Track location
  async trackLocation(id: string, data: TrackLocationInput, headers?: HeadersInit) {},
  
  // Get tracking history
  async getTrackingHistory(id: string, headers?: HeadersInit) {}
}
```

#### 5. **API Routes** (~500 lines - 8 files)

```
src/app/api/sppg/distribution/delivery/
├── execution/[executionId]/route.ts    # GET list by execution
├── [id]/route.ts                       # GET detail, PUT update
├── [id]/start/route.ts                 # POST start delivery
├── [id]/arrive/route.ts                # POST arrive
├── [id]/complete/route.ts              # POST complete
├── [id]/photo/route.ts                 # POST upload photo
├── [id]/issue/route.ts                 # POST report issue
└── [id]/tracking/route.ts              # GET history, POST track
```

---

### **PHASE 3B: React Hooks Layer** (~300 lines)

#### Query Hooks (~150 lines)
**File**: `src/features/sppg/distribution/delivery/hooks/useDeliveries.ts`

```typescript
// List deliveries by execution
export function useDeliveries(executionId: string)

// Single delivery detail
export function useDelivery(id: string)

// Tracking history
export function useDeliveryTracking(id: string)

// Active deliveries (in-transit/arrived)
export function useActiveDeliveries(executionId: string)
```

#### Mutation Hooks (~150 lines)
**File**: `src/features/sppg/distribution/delivery/hooks/useDeliveryMutations.ts`

```typescript
// Status updates
export function useUpdateDeliveryStatus()
export function useStartDelivery()
export function useArriveDelivery()
export function useCompleteDelivery()
export function useFailDelivery()

// Media & tracking
export function useUploadPhoto()
export function useReportDeliveryIssue()
export function useTrackLocation()
```

---

### **PHASE 3C: UI Components Layer** (~600 lines)

#### Components (4 files):

1. **DeliveryList.tsx** (~200 lines)
   - DataTable with deliveries
   - Filter by status
   - Sort by planned time
   - Status badges
   - Action dropdown

2. **DeliveryCard.tsx** (~150 lines)
   - Card view for mobile
   - Key metrics display
   - Status indicator
   - Quick actions
   - GPS location display

3. **DeliveryDetail.tsx** (~250 lines)
   - Comprehensive detail view
   - Map with route tracking
   - Photo gallery
   - Signature display
   - Action buttons
   - Timeline

4. **DeliveryMap.tsx** (~200 lines)
   - Real-time map view
   - Route visualization
   - Current location marker
   - School location marker
   - Tracking points trail

---

### **PHASE 3D: Page Routes Layer** (~300 lines)

#### Pages (4 files):

1. **`/distribution/delivery/execution/[executionId]/page.tsx`**
   - List deliveries for specific execution
   - Filter & search
   - Bulk actions

2. **`/distribution/delivery/[id]/page.tsx`**
   - Delivery detail page
   - Full information display
   - Action buttons

3. **`/distribution/delivery/[id]/track/page.tsx`**
   - Live tracking page
   - Map with real-time updates
   - Location history

4. **`/distribution/delivery/[id]/complete/page.tsx`**
   - Completion form
   - Signature capture
   - Photo upload
   - Quality check form

---

## 📊 Implementation Statistics (Estimated)

```
Foundation Layer:        ~600 lines
  - Prisma Updates:       ~100 lines
  - Types:                ~150 lines
  - Schemas:              ~200 lines
  - API Client:           ~150 lines
  - API Routes:           ~500 lines (8 files)

React Hooks Layer:       ~300 lines
  - Query Hooks:          ~150 lines
  - Mutation Hooks:       ~150 lines

UI Components Layer:     ~600 lines
  - DeliveryList:         ~200 lines
  - DeliveryCard:         ~150 lines
  - DeliveryDetail:       ~250 lines
  - DeliveryMap:          ~200 lines

Page Routes Layer:       ~300 lines
  - List Page:            ~100 lines
  - Detail Page:          ~80 lines
  - Track Page:           ~120 lines
  - Complete Page:        ~100 lines

TOTAL ESTIMATED:         ~1,800 lines
```

---

## 🎯 Key Features to Implement

### **1. GPS Tracking**
- ✅ Track departure location
- ✅ Track arrival location
- ✅ Real-time location updates
- ✅ Route history visualization
- ✅ Distance calculation

### **2. Photo Management**
- ✅ Upload multiple photos
- ✅ Photo categorization (6 types)
- ✅ GPS tagging photos
- ✅ Photo gallery view
- ✅ Thumbnail generation

### **3. Digital Signature**
- ✅ Signature capture component
- ✅ Signature image upload
- ✅ Recipient information
- ✅ Signature verification

### **4. Quality Check**
- ✅ Food quality checkbox
- ✅ Temperature recording
- ✅ Quality notes
- ✅ Photo evidence

### **5. Status Management**
- ✅ PENDING → IN_TRANSIT (start)
- ✅ IN_TRANSIT → ARRIVED (arrive)
- ✅ ARRIVED → DELIVERED (complete)
- ✅ Any → FAILED (mark failed)

### **6. Issue Tracking**
- ✅ Delivery-specific issues
- ✅ Issue severity levels
- ✅ Resolution tracking
- ✅ Issue history

---

## 🔐 Security Considerations

1. **Multi-tenant Isolation**
   - All queries filtered by `sppgId`
   - Verify delivery belongs to user's SPPG

2. **Photo Upload Security**
   - Validate file types (image only)
   - File size limits (max 5MB)
   - Virus scanning
   - Secure storage (S3/R2)

3. **GPS Data Privacy**
   - Encrypt GPS coordinates
   - Limited retention period
   - Access control

4. **Digital Signature**
   - Tamper-proof storage
   - Audit trail
   - Non-repudiation

---

## 🎨 UI/UX Considerations

### **Mobile-First Design**
- Touch-friendly buttons
- GPS permission handling
- Offline support
- Photo capture optimization

### **Real-Time Updates**
- Auto-refresh active deliveries
- WebSocket for live tracking (future)
- Push notifications

### **Progressive Enhancement**
- Work without GPS (manual entry)
- Work without camera (skip photos)
- Graceful degradation

---

## 🚀 Implementation Timeline

**Estimated Time**: 6-8 hours

1. **Foundation Layer** (2-3 hours)
   - Prisma schema updates
   - Types, schemas, API client
   - API routes

2. **React Hooks Layer** (1-2 hours)
   - Query hooks
   - Mutation hooks

3. **UI Components Layer** (2-3 hours)
   - DeliveryList, DeliveryCard
   - DeliveryDetail, DeliveryMap

4. **Page Routes Layer** (1-2 hours)
   - All 4 pages
   - Testing & fixes

---

## ✅ Success Criteria

- [ ] All TypeScript compiles with zero errors
- [ ] All API endpoints functional
- [ ] GPS tracking works (with fallback)
- [ ] Photo upload works
- [ ] Signature capture works
- [ ] Status transitions work
- [ ] Multi-tenant security verified
- [ ] Indonesian localization complete
- [ ] Mobile responsive
- [ ] Dark mode support

---

**Status**: 🚧 Ready to implement  
**Next Step**: Start Foundation Layer (Prisma schema updates)
