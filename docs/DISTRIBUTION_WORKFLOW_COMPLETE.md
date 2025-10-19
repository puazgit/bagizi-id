# 🚚 Workflow Distribusi SPPG - Complete Flow

**Date**: October 19, 2025  
**Version**: Enterprise v1.0  
**Author**: Bagizi-ID Development Team

---

## 📊 Executive Summary

Workflow distribusi SPPG terdiri dari **4 tahap utama** dengan **3 entitas kunci**:

### Entitas Kunci:
1. **DistributionSchedule** - Perencanaan jadwal distribusi
2. **FoodDistribution** - Eksekusi distribusi aktual
3. **DistributionDelivery** - Tracking pengiriman individual

### Tahap Workflow:
1. **Planning** - Membuat jadwal distribusi
2. **Execution** - Melaksanakan distribusi
3. **Delivery** - Tracking pengiriman ke lokasi
4. **Completion** - Verifikasi dan dokumentasi

---

## 🔄 Complete Distribution Workflow

### **TAHAP 1: PLANNING (DistributionSchedule)**

**Tujuan**: Merencanakan distribusi untuk tanggal tertentu

#### Data yang Dibuat:
```typescript
DistributionSchedule {
  distributionDate: DateTime     // Tanggal distribusi
  wave: MORNING | MIDDAY         // Gelombang distribusi
  menuName: string               // Menu yang akan didistribusikan
  totalPortions: int             // Total porsi yang disiapkan
  estimatedBeneficiaries: int    // Estimasi penerima
  deliveryMethod: string         // Metode pengiriman
  status: "PLANNED"              // Status awal
}
```

#### Relasi:
- ✅ Terhubung ke **SPPG** (multi-tenant)
- ✅ Memiliki banyak **DistributionDelivery** (delivery plans)
- ✅ Memiliki banyak **VehicleAssignment** (vehicle planning)

#### Aksi User:
1. Buat jadwal baru (`POST /api/sppg/distribution/schedule`)
2. Tentukan tanggal, gelombang, menu, jumlah porsi
3. Assign kendaraan jika perlu
4. Status: `PLANNED`

#### URL:
- List: `/distribution/schedule`
- Create: `/distribution/schedule/new`
- Detail: `/distribution/schedule/[id]`

---

### **TAHAP 2: EXECUTION (FoodDistribution)**

**Tujuan**: Melaksanakan distribusi yang sudah dijadwalkan

#### Data yang Dibuat:
```typescript
FoodDistribution {
  scheduleId: string             // ✅ Link ke DistributionSchedule
  distributionDate: DateTime     // Tanggal eksekusi
  distributionCode: string       // Kode unik
  mealType: MealType            // Jenis makanan
  distributionPoint: string      // Lokasi distribusi
  plannedRecipients: int         // Target penerima
  actualRecipients: int?         // Penerima aktual (diisi saat selesai)
  totalPortions: int             // Total porsi
  status: SCHEDULED → IN_PROGRESS → COMPLETED
  
  // Tracking Details
  departureTime: DateTime?       // Waktu berangkat
  arrivalTime: DateTime?         // Waktu tiba
  completionTime: DateTime?      // Waktu selesai
  
  // Quality Control
  foodQuality: QualityGrade?
  temperatureRecords: ...
}
```

#### Relasi:
- ✅ Belongs to **DistributionSchedule** (scheduleId)
- ✅ Belongs to **SPPG** (sppgId)
- ✅ Belongs to **NutritionProgram** (programId)
- ✅ Has many **DistributionDelivery** (individual deliveries)
- ✅ Has many **VehicleAssignment**
- ✅ Optional: Belongs to **FoodProduction** (productionId)

#### Aksi User:
1. Dari schedule, create execution (`POST /api/sppg/distribution`)
2. Mulai distribusi (update status → `IN_PROGRESS`)
3. Track perjalanan dan quality
4. Selesai (update status → `COMPLETED`)

#### Status Flow:
```
SCHEDULED → IN_PROGRESS → COMPLETED
         ↓               ↓
      CANCELLED       FAILED
```

#### URL:
- List: `/distribution` atau `/distribution/execution`
- Create from Schedule: `/distribution/schedule/[id]/execute`
- Detail: `/distribution/[id]`
- Start: `/distribution/[id]/start`
- Complete: `/distribution/[id]/complete`

---

### **TAHAP 3: DELIVERY TRACKING (DistributionDelivery)**

**Tujuan**: Track pengiriman individual ke setiap lokasi/penerima

#### Data yang Dibuat:
```typescript
DistributionDelivery {
  scheduleId: string             // ✅ Link ke DistributionSchedule
  distributionId: string?        // ✅ Link ke FoodDistribution (saat execution)
  schoolBeneficiaryId: string?   // Target sekolah
  
  // Target Information
  targetType: string             // "SCHOOL" | "COMMUNITY" | etc
  targetName: string             // Nama lokasi
  targetAddress: string          // Alamat lengkap
  
  // Timing
  estimatedArrival: DateTime     // Estimasi tiba
  actualArrival: DateTime?       // Waktu tiba aktual
  departureTime: DateTime?       // Waktu berangkat
  arrivalTime: DateTime?         // Waktu tiba
  deliveryCompletedAt: DateTime? // Waktu selesai delivery
  
  // Portions
  portionsPlanned: int           // Porsi yang direncanakan
  portionsDelivered: int         // Porsi yang terkirim
  
  // Team
  driverName: string             // Nama driver
  helperNames: string[]          // Tim helper
  vehicleInfo: string?           // Info kendaraan
  
  // Status & GPS
  status: ASSIGNED | DEPARTED | DELIVERED | FAILED
  currentLocation: string?       // GPS real-time "lat,lng"
  routeTrackingPoints: string[]  // GPS trail
  
  // Proof of Delivery
  recipientName: string?
  recipientSignature: string?    // URL signature
  deliveryPhoto: string?         // URL photo
  notes: string?
  
  // Quality Check
  foodQualityChecked: boolean
  foodTemperature: Decimal?
}
```

#### Relasi:
- ✅ Belongs to **DistributionSchedule** (scheduleId) - WAJIB
- ✅ Belongs to **FoodDistribution** (distributionId) - Optional, diisi saat execution
- ✅ Optional: **SchoolBeneficiary** (schoolBeneficiaryId)
- ✅ Has many **DeliveryPhoto**
- ✅ Has many **DeliveryIssue**
- ✅ Has many **DeliveryTracking** (GPS points)

#### Aksi User:
1. **Planning Phase**: Create delivery plans dari schedule
2. **Execution Phase**: Link ke FoodDistribution
3. **Departure**: Update status → `DEPARTED`, record GPS
4. **In Transit**: Update GPS tracking points
5. **Arrival**: Update status → `DELIVERED`, capture photo, signature
6. **Failed**: Report issues, mark as `FAILED`

#### Status Flow:
```
ASSIGNED → DEPARTED → DELIVERED
         ↓          ↓
      CANCELLED   FAILED
```

#### URL:
- List All: `/distribution/delivery` 
- By Schedule: `/distribution/schedule/[scheduleId]/deliveries`
- By Execution: `/distribution/delivery/execution/[executionId]`
- Detail: `/distribution/delivery/[id]`
- Track Live: `/distribution/delivery/[id]/track`
- Complete: `/distribution/delivery/[id]/complete`

---

## 🎯 Complete Workflow Example

### Scenario: SPPG Jakarta Pusat distribusi ke 3 sekolah

#### **DAY 1 - PLANNING**

**1. Create Schedule**
```typescript
POST /api/sppg/distribution/schedule
{
  distributionDate: "2025-10-20",
  wave: "MORNING",
  menuName: "Nasi Gudeg + Susu",
  totalPortions: 300,
  estimatedBeneficiaries: 300,
  deliveryMethod: "Mobil Box",
  targetCategories: ["SD_KELAS_1_3"],
  distributionTeam: ["driver-1", "helper-1", "helper-2"]
}

Response: DistributionSchedule { id: "sched-123", status: "PLANNED" }
```

**2. Create Delivery Plans** (3 sekolah)
```typescript
POST /api/sppg/distribution/schedule/sched-123/deliveries
{
  deliveries: [
    {
      targetType: "SCHOOL",
      targetName: "SDN 01 Menteng",
      targetAddress: "Jl. Menteng Raya No.1",
      portionsPlanned: 100,
      estimatedArrival: "2025-10-20T07:30:00",
      driverName: "Pak Budi",
      helperNames: ["Mas Andi", "Mas Dedi"]
    },
    {
      targetType: "SCHOOL",
      targetName: "SDN 02 Gondangdia",
      targetAddress: "Jl. Gondangdia No.5",
      portionsPlanned: 100,
      estimatedArrival: "2025-10-20T08:00:00",
      driverName: "Pak Budi",
      helperNames: ["Mas Andi", "Mas Dedi"]
    },
    {
      targetType: "SCHOOL",
      targetName: "SDN 03 Kebon Sirih",
      targetAddress: "Jl. Kebon Sirih No.8",
      portionsPlanned: 100,
      estimatedArrival: "2025-10-20T08:30:00",
      driverName: "Pak Budi",
      helperNames: ["Mas Andi", "Mas Dedi"]
    }
  ]
}

Response: 3 x DistributionDelivery { status: "ASSIGNED" }
```

#### **DAY 2 - EXECUTION (20 Oct 2025)**

**3. Start Distribution Execution**
```typescript
POST /api/sppg/distribution
{
  scheduleId: "sched-123",
  distributionDate: "2025-10-20",
  distributionPoint: "Dapur SPPG Jakarta Pusat",
  address: "Jl. Thamrin No.10",
  plannedRecipients: 300,
  mealType: "BREAKFAST",
  totalPortions: 300
}

Response: FoodDistribution { id: "dist-456", status: "SCHEDULED" }
```

**4. Link Deliveries to Execution**
```typescript
PATCH /api/sppg/distribution/delivery/[delivery-id]
{
  distributionId: "dist-456"  // Link all 3 deliveries to this execution
}
```

**5. Depart from Kitchen** (06:30)
```typescript
POST /api/sppg/distribution/dist-456/start
{
  departureTime: "2025-10-20T06:30:00",
  departureTemp: 65.5,
  departureLocation: "-6.1751,106.8650"
}

Response: FoodDistribution { status: "IN_PROGRESS" }
```

**6. First Delivery - SDN 01 Menteng** (07:30)
```typescript
POST /api/sppg/distribution/delivery/del-1/start
{
  departureTime: "2025-10-20T06:30:00",
  departureLocation: "-6.1751,106.8650"
}

Response: DistributionDelivery { status: "DEPARTED" }

// Arrive at school
POST /api/sppg/distribution/delivery/del-1/arrive
{
  arrivalTime: "2025-10-20T07:25:00",
  arrivalLocation: "-6.1820,106.8410",
  arrivalTemp: 63.0
}

// Complete delivery
POST /api/sppg/distribution/delivery/del-1/complete
{
  deliveryCompletedAt: "2025-10-20T07:35:00",
  portionsDelivered: 100,
  recipientName: "Ibu Kepala Sekolah",
  recipientSignature: "signature-url",
  deliveryPhoto: "photo-url",
  foodQualityChecked: true,
  foodTemperature: 62.0
}

Response: DistributionDelivery { status: "DELIVERED" }
```

**7. Second Delivery - SDN 02 Gondangdia** (08:00)
```typescript
// Repeat same flow...
POST /api/sppg/distribution/delivery/del-2/start
POST /api/sppg/distribution/delivery/del-2/arrive
POST /api/sppg/distribution/delivery/del-2/complete

Response: DistributionDelivery { status: "DELIVERED" }
```

**8. Third Delivery - SDN 03 Kebon Sirih** (08:30)
```typescript
// Repeat same flow...
POST /api/sppg/distribution/delivery/del-3/start
POST /api/sppg/distribution/delivery/del-3/arrive
POST /api/sppg/distribution/delivery/del-3/complete

Response: DistributionDelivery { status: "DELIVERED" }
```

**9. Complete Distribution Execution** (09:00)
```typescript
POST /api/sppg/distribution/dist-456/complete
{
  completionTime: "2025-10-20T09:00:00",
  actualRecipients: 300,
  totalPortionsDelivered: 300,
  totalBeneficiariesReached: 300,
  foodQuality: "EXCELLENT",
  completionNotes: "Semua delivery berhasil, tidak ada kendala"
}

Response: FoodDistribution { status: "COMPLETED" }
```

---

## 📱 User Interface Navigation

### For SPPG Admin/Staff:

#### Planning Phase:
```
1. /distribution/schedule → View all schedules
2. /distribution/schedule/new → Create new schedule
3. /distribution/schedule/[id] → View schedule detail
   - Assign vehicles
   - Create delivery plans
   - View team assignment
```

#### Execution Phase:
```
1. /distribution → View all executions
2. /distribution/schedule/[id]/execute → Start execution from schedule
3. /distribution/[id] → View execution detail
   - Start distribution
   - View progress
   - Complete distribution
```

#### Delivery Tracking:
```
1. /distribution/delivery → View ALL deliveries across all schedules
2. /distribution/schedule/[id]/deliveries → Deliveries for specific schedule
3. /distribution/delivery/execution/[id] → Deliveries for specific execution
4. /distribution/delivery/[id] → Single delivery detail
5. /distribution/delivery/[id]/track → Live GPS tracking
6. /distribution/delivery/[id]/complete → Complete delivery with POD
```

---

## 🔑 Key Relationships

### Multi-Tenant Security:
```
SPPG (sppgId)
  └─ DistributionSchedule (sppgId via schedule)
      └─ DistributionDelivery (sppgId via schedule.sppgId)
          └─ FoodDistribution (sppgId direct + scheduleId)
```

### Data Flow:
```
1. PLANNING:
   Schedule → Delivery Plans (ASSIGNED)

2. EXECUTION:
   Schedule → FoodDistribution (SCHEDULED)
            → Link Deliveries (distributionId)
            → Start (IN_PROGRESS)

3. DELIVERY:
   Delivery (ASSIGNED) → DEPARTED → DELIVERED
                      → GPS Tracking
                      → Photos/Signatures

4. COMPLETION:
   All Deliveries (DELIVERED) → FoodDistribution (COMPLETED)
                              → Schedule (COMPLETED)
```

---

## ✅ Rekomendasi Implementasi `/distribution/delivery`

Berdasarkan analisis workflow di atas, **halaman `/distribution/delivery` HARUS menampilkan ALL DELIVERIES**, karena:

### Alasan:
1. ✅ **Independent Entity**: `DistributionDelivery` adalah entitas yang valid dan independen
2. ✅ **Real-time Monitoring**: Admin perlu monitor SEMUA pengiriman aktif
3. ✅ **Cross-Schedule View**: Delivery bisa dari berbagai schedule yang berbeda
4. ✅ **Driver Assignment**: Staff perlu lihat semua delivery per driver
5. ✅ **Status Tracking**: Monitor delivery yang late, failed, in-progress

### Yang Harus Dibuat:
1. ✅ API: `GET /api/sppg/distribution/delivery` - List all deliveries
2. ✅ Hook: `useAllDeliveries()` - Fetch all deliveries
3. ✅ Component: `AllDeliveriesList` - Display with filters
4. ✅ Page: `/distribution/delivery/page.tsx` - Main page

### Fitur yang Dibutuhkan:
- Filter by: status, driver, date range, schedule
- Sort by: estimated arrival, status, portions
- Search: by target name, address, driver
- Quick actions: View detail, Track live, Complete
- Statistics: Total, In Progress, Completed, Failed, Late deliveries

---

## 📊 Summary

| Entity | Purpose | Status Flow | Main URL |
|--------|---------|-------------|----------|
| **DistributionSchedule** | Planning | PLANNED → PREPARED → IN_PROGRESS → COMPLETED | `/distribution/schedule` |
| **FoodDistribution** | Execution | SCHEDULED → IN_PROGRESS → COMPLETED | `/distribution` |
| **DistributionDelivery** | Tracking | ASSIGNED → DEPARTED → DELIVERED | `/distribution/delivery` |

**Kesimpulan**: Semua 3 entitas memiliki halaman list sendiri karena masing-masing punya use case dan user story yang berbeda! 🎯
