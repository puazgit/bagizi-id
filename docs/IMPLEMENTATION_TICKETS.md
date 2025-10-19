# 🎫 UI/UX Enhancement Implementation Tickets

**Generated From**: UI/UX Schema Audit Report  
**Date**: October 19, 2025  
**Total Tickets**: 15  
**Priority Levels**: High (8) | Medium (5) | Low (2)

---

## 📊 Quick Stats

| Priority | Count | Estimated Hours | Status |
|----------|-------|-----------------|--------|
| 🔥 High | 8 | 32 hours | Not Started |
| 📊 Medium | 5 | 20 hours | Not Started |
| 📝 Low | 2 | 6 hours | Not Started |
| **Total** | **15** | **58 hours** | **0% Complete** |

---

## 🔥 HIGH PRIORITY TICKETS

### Ticket #1: Temperature Monitoring Component
**Priority**: 🔥 HIGH (CRITICAL - Food Safety)  
**Component**: ExecutionDetail.tsx  
**Effort**: 4 hours  
**Impact**: Critical for food safety compliance

**Description**:
Implement comprehensive temperature monitoring display for FoodDistribution execution. Currently, temperature fields (departureTemp, arrivalTemp, servingTemp) are completely missing from UI.

**Acceptance Criteria**:
- [ ] Display departureTemp, arrivalTemp, servingTemp in dedicated card
- [ ] Use color coding: Green (safe), Yellow (warning), Red (danger)
- [ ] Show temperature compliance status vs food safety standards
- [ ] Add temperature trend visualization (line chart)
- [ ] Display temperature ranges and acceptable limits
- [ ] Add warning alerts if temperature is out of safe range
- [ ] Show temperature history timeline

**Technical Specs**:
```typescript
interface TemperatureMonitoring {
  departureTemp?: number
  arrivalTemp?: number
  servingTemp?: number
  safeRangeMin: number
  safeRangeMax: number
  warningRangeMin: number
  warningRangeMax: number
}

// Food safety standards (example)
const SAFE_TEMP_RANGES = {
  hot_food: { min: 60, max: 85 },    // °C
  cold_food: { min: 0, max: 5 },     // °C
  transport: { min: 5, max: 63 }     // Danger zone
}
```

**UI Design**:
- Card with thermometer icon
- Three temperature readings with icons (departure/arrival/serving)
- Visual gauge for each temperature
- Color-coded status badges
- Timeline showing temperature changes
- Compliance checklist

**Dependencies**:
- None

**Related Models**:
- FoodDistribution (departureTemp, arrivalTemp, servingTemp)

---

### Ticket #2: Team Information Section
**Priority**: 🔥 HIGH  
**Component**: ExecutionDetail.tsx  
**Effort**: 3 hours  
**Impact**: Essential for accountability and operations

**Description**:
Display complete team information for distribution execution. Currently, distributor, driver, and volunteers are not shown in UI.

**Acceptance Criteria**:
- [ ] Display distributor name and contact (from distributorId)
- [ ] Show driver information with photo (from driverId)
- [ ] List all volunteers with roles
- [ ] Add contact information for each team member
- [ ] Show team member availability status
- [ ] Link to employee/volunteer detail pages
- [ ] Display team size and capacity

**Technical Specs**:
```typescript
interface TeamMember {
  id: string
  name: string
  role: 'DISTRIBUTOR' | 'DRIVER' | 'VOLUNTEER'
  contact?: string
  photo?: string
  status: 'ACTIVE' | 'BUSY' | 'OFFLINE'
}

// Fetch team details
const getTeamInfo = async (execution: FoodDistribution) => {
  const distributor = await fetchUser(execution.distributorId)
  const driver = execution.driverId ? await fetchUser(execution.driverId) : null
  const volunteers = await Promise.all(
    execution.volunteers.map(id => fetchUser(id))
  )
  
  return { distributor, driver, volunteers }
}
```

**UI Design**:
- Team section card with users icon
- Avatar grid for team members
- Role badges for each member
- Contact buttons (call/message)
- Team performance metrics
- Shift schedule if applicable

**Dependencies**:
- User/Employee API endpoints
- SppgTeamMember model integration

**Related Models**:
- FoodDistribution (distributorId, driverId, volunteers)
- Employee
- SppgTeamMember

---

### Ticket #3: Photo Gallery Component
**Priority**: 🔥 HIGH  
**Component**: ExecutionDetail.tsx  
**Effort**: 5 hours  
**Impact**: Essential for documentation and compliance

**Description**:
Implement photo gallery to display distribution documentation photos. Currently, photos[] array is not displayed in UI.

**Acceptance Criteria**:
- [ ] Display all photos from photos[] array
- [ ] Group photos by stage (departure/transit/arrival/serving)
- [ ] Implement lightbox for full-size viewing
- [ ] Add photo metadata (timestamp, location)
- [ ] Enable photo upload interface
- [ ] Support multiple image formats (JPG, PNG, WebP)
- [ ] Show photo count badge
- [ ] Add photo download functionality
- [ ] Implement photo zoom and pan

**Technical Specs**:
```typescript
interface DistributionPhoto {
  id: string
  url: string
  stage: 'DEPARTURE' | 'TRANSIT' | 'ARRIVAL' | 'SERVING'
  timestamp: Date
  location?: { lat: number; lng: number }
  uploadedBy: string
  description?: string
}

// Use next/image for optimization
import Image from 'next/image'

// Photo stage labels
const PHOTO_STAGE_LABELS = {
  DEPARTURE: 'Saat Keberangkatan',
  TRANSIT: 'Dalam Perjalanan',
  ARRIVAL: 'Saat Tiba',
  SERVING: 'Saat Penyajian'
}
```

**UI Design**:
- Photo grid with 3 columns
- Stage filter tabs
- Lightbox modal with navigation
- Photo metadata overlay
- Upload dropzone area
- Drag-and-drop support
- Progress indicators for uploads

**Dependencies**:
- Image upload API endpoint
- Cloud storage (S3/Cloudinary)
- Lightbox library (react-image-lightbox or similar)

**Related Models**:
- FoodDistribution (photos[])
- DeliveryPhoto (for delivery-specific photos)

---

### Ticket #4: Quality Metrics Display
**Priority**: 🔥 HIGH  
**Component**: ExecutionDetail.tsx  
**Effort**: 3 hours  
**Impact**: Important for quality assurance

**Description**:
Display quality metrics for distribution execution. Currently, foodQuality, hygieneScore, and packagingCondition are not shown.

**Acceptance Criteria**:
- [ ] Display foodQuality grade with colored badge
- [ ] Show hygieneScore with visual indicator (1-100)
- [ ] Display packagingCondition status
- [ ] Add quality trend chart
- [ ] Show comparison with historical averages
- [ ] Display quality checklist
- [ ] Add quality certification badges
- [ ] Show quality improvement suggestions

**Technical Specs**:
```typescript
interface QualityMetrics {
  foodQuality: 'A' | 'B' | 'C' | 'D' | 'F'
  hygieneScore: number // 1-100
  packagingCondition: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'DAMAGED'
}

// Quality grade colors
const QUALITY_COLORS = {
  A: 'green',
  B: 'blue',
  C: 'yellow',
  D: 'orange',
  F: 'red'
}

// Hygiene score interpretation
const getHygieneLevel = (score: number) => {
  if (score >= 90) return { level: 'EXCELLENT', color: 'green' }
  if (score >= 75) return { level: 'GOOD', color: 'blue' }
  if (score >= 60) return { level: 'ACCEPTABLE', color: 'yellow' }
  if (score >= 40) return { level: 'POOR', color: 'orange' }
  return { level: 'CRITICAL', color: 'red' }
}
```

**UI Design**:
- Quality card with certificate icon
- Large grade badge (A/B/C/D/F)
- Hygiene score circular progress
- Packaging condition status badge
- Quality trend mini-chart
- Quality checklist items
- Historical comparison

**Dependencies**:
- Quality standards reference data

**Related Models**:
- FoodDistribution (foodQuality, hygieneScore, packagingCondition)

---

### Ticket #5: Transport Details Section
**Priority**: 🔥 HIGH  
**Component**: ExecutionDetail.tsx  
**Effort**: 4 hours  
**Impact**: Important for logistics transparency

**Description**:
Display complete transport information including vehicle details and cost breakdown. Currently missing vehicleType, vehiclePlate, and all cost fields.

**Acceptance Criteria**:
- [ ] Display vehicleType and vehiclePlate
- [ ] Show vehicle capacity and utilization
- [ ] Display cost breakdown (transport, fuel, other)
- [ ] Calculate total distribution cost
- [ ] Show cost per portion and per beneficiary
- [ ] Link to Vehicle detail page
- [ ] Display route optimization metrics
- [ ] Show fuel efficiency data
- [ ] Add cost comparison with budget

**Technical Specs**:
```typescript
interface TransportDetails {
  vehicleType?: string
  vehiclePlate?: string
  transportCost?: number
  fuelCost?: number
  otherCosts?: number
  totalCost: number
  costPerPortion: number
  costPerBeneficiary: number
}

// Calculate costs
const calculateDistributionCosts = (execution: FoodDistribution) => {
  const total = 
    (execution.transportCost || 0) +
    (execution.fuelCost || 0) +
    (execution.otherCosts || 0)
  
  const perPortion = total / execution.totalPortionsDelivered || 0
  const perBeneficiary = total / execution.totalBeneficiariesReached || 0
  
  return { total, perPortion, perBeneficiary }
}
```

**UI Design**:
- Transport card with truck icon
- Vehicle info section with plate number
- Cost breakdown table
- Cost pie chart
- Cost per unit metrics
- Budget comparison progress bar
- Efficiency indicators

**Dependencies**:
- Vehicle model API
- Budget data for comparison

**Related Models**:
- FoodDistribution (vehicleType, vehiclePlate, transportCost, fuelCost, otherCosts)
- Vehicle (vehicleId relation)
- VehicleAssignment

---

### Ticket #6: Timeline Visualization Component (Reusable)
**Priority**: 🔥 HIGH  
**Component**: Shared component for all distribution views  
**Effort**: 5 hours  
**Impact**: Essential for all distribution components

**Description**:
Create reusable timeline component to display all timestamp fields across distribution components. Should work for ScheduleDetail, DeliveryDetail, and ExecutionDetail.

**Acceptance Criteria**:
- [ ] Display all relevant timestamps in chronological order
- [ ] Show relative time ("2 hours ago")
- [ ] Display absolute time (formatted with date-fns)
- [ ] Visualize timeline with progress indicator
- [ ] Highlight current stage
- [ ] Show time between events
- [ ] Support different timestamp sets per component
- [ ] Add tooltip with detailed timestamp info
- [ ] Mobile-responsive design

**Technical Specs**:
```typescript
// src/components/shared/data-display/Timeline.tsx
interface TimelineEvent {
  id: string
  label: string
  timestamp?: Date
  status: 'completed' | 'current' | 'upcoming'
  icon?: React.ReactNode
  description?: string
}

interface TimelineProps {
  events: TimelineEvent[]
  orientation?: 'horizontal' | 'vertical'
  showRelativeTime?: boolean
  highlightCurrent?: boolean
}

// For ExecutionDetail
const executionTimelineEvents: TimelineEvent[] = [
  { label: 'Dibuat', timestamp: execution.createdAt, status: 'completed' },
  { label: 'Dimulai', timestamp: execution.actualStartTime, status: 'current' },
  { label: 'Berangkat', timestamp: execution.departureTime, status: 'upcoming' },
  { label: 'Tiba', timestamp: execution.arrivalTime, status: 'upcoming' },
  { label: 'Selesai', timestamp: execution.completionTime, status: 'upcoming' }
]
```

**UI Design**:
- Horizontal timeline with dots and connecting lines
- Color-coded dots (green=completed, blue=current, gray=upcoming)
- Relative time labels below each dot
- Hover tooltip with absolute time
- Progress line showing completion
- Icons for each stage
- Responsive: vertical on mobile

**Dependencies**:
- date-fns for formatting
- Lucide React icons

**Related Models**:
- DistributionSchedule (startedAt, completedAt, createdAt, updatedAt)
- DistributionDelivery (assignedAt, departedAt, arrivedAt, deliveredAt, failedAt)
- FoodDistribution (all timestamp fields)

---

### Ticket #7: Audit Trail Component (Reusable)
**Priority**: 🔥 HIGH  
**Component**: Shared component  
**Effort**: 4 hours  
**Impact**: Important for accountability

**Description**:
Create reusable audit trail component to display who did what and when. Show createdBy, updatedBy, deliveredBy, completedBy fields with user information.

**Acceptance Criteria**:
- [ ] Display activity feed with user avatars
- [ ] Show action type (created/updated/delivered/completed)
- [ ] Display timestamp with relative time
- [ ] Show user name and role
- [ ] Add action description
- [ ] Sort by timestamp (newest first)
- [ ] Support different action types per model
- [ ] Link to user profile
- [ ] Show IP address or device info (if available)

**Technical Specs**:
```typescript
// src/components/shared/data-display/AuditTrail.tsx
interface AuditEntry {
  id: string
  action: 'created' | 'updated' | 'delivered' | 'completed' | 'cancelled'
  userId: string
  userName: string
  userRole?: string
  userAvatar?: string
  timestamp: Date
  description?: string
  changes?: Record<string, { from: any; to: any }>
}

interface AuditTrailProps {
  entries: AuditEntry[]
  maxEntries?: number
  showChanges?: boolean
}

// Action labels and icons
const AUDIT_ACTION_CONFIG = {
  created: { label: 'Dibuat oleh', icon: PlusCircle, color: 'blue' },
  updated: { label: 'Diperbarui oleh', icon: Edit, color: 'orange' },
  delivered: { label: 'Dikirim oleh', icon: Package, color: 'green' },
  completed: { label: 'Diselesaikan oleh', icon: CheckCircle, color: 'green' },
  cancelled: { label: 'Dibatalkan oleh', icon: XCircle, color: 'red' }
}
```

**UI Design**:
- Activity feed list
- User avatar on left
- Action description with timestamp
- Color-coded action badges
- Expandable change details
- Load more button for pagination
- Empty state message

**Dependencies**:
- User API for fetching user details

**Related Models**:
- All models with createdBy, updatedBy, deliveredBy, completedBy fields

---

### Ticket #8: Route Comparison Map View
**Priority**: 🔥 HIGH  
**Component**: DeliveryDetail.tsx  
**Effort**: 6 hours  
**Impact**: Important for route optimization

**Description**:
Implement map view comparing plannedRoute vs actualRoute for deliveries. Show deviations, distance differences, and optimization insights.

**Acceptance Criteria**:
- [ ] Display map with planned route (blue line)
- [ ] Display map with actual route (red line)
- [ ] Show deviation points with markers
- [ ] Calculate distance difference
- [ ] Show time difference
- [ ] Display efficiency percentage
- [ ] Add route analysis summary
- [ ] Show traffic/weather impact
- [ ] Export route comparison report

**Technical Specs**:
```typescript
interface RouteComparison {
  plannedRoute: string // JSON polyline
  actualRoute: string // JSON polyline
  plannedDistance: number // km
  actualDistance: number // km
  plannedDuration: number // minutes
  actualDuration: number // minutes
  deviations: Array<{
    location: { lat: number; lng: number }
    reason?: string
    timeImpact: number
  }>
}

// Use react-leaflet or Google Maps
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'

const calculateRouteEfficiency = (planned: number, actual: number) => {
  return Math.round((planned / actual) * 100)
}
```

**UI Design**:
- Full-width map container
- Toggle between planned/actual/both views
- Route comparison stats panel
- Deviation markers with popups
- Legend explaining colors
- Export button for PDF report
- Zoom controls

**Dependencies**:
- react-leaflet or @react-google-maps/api
- Route parsing utilities
- Map tiles API key

**Related Models**:
- DistributionDelivery (plannedRoute, actualRoute)

---

## 📊 MEDIUM PRIORITY TICKETS

### Ticket #9: Menu Items JSON Parser
**Priority**: 📊 MEDIUM  
**Component**: ExecutionDetail.tsx  
**Effort**: 3 hours  
**Impact**: Useful for transparency

**Description**:
Parse and display menuItems JSON in structured table format. Currently not displayed.

**Acceptance Criteria**:
- [ ] Parse menuItems JSON
- [ ] Display in structured table
- [ ] Show portion sizes
- [ ] Display nutritional information
- [ ] Add menu item icons/images
- [ ] Calculate total nutrition
- [ ] Enable menu item editing
- [ ] Show allergen information

**Technical Specs**:
```typescript
interface MenuItem {
  id: string
  name: string
  portionSize: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  allergens?: string[]
}

// Parse JSON
const parseMenuItems = (jsonString: string): MenuItem[] => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to parse menu items:', error)
    return []
  }
}
```

**UI Design**:
- Table with columns: Name, Portion, Nutrition
- Expandable rows for details
- Allergen badges
- Total row at bottom

**Dependencies**:
- None

**Related Models**:
- FoodDistribution (menuItems JSON)

---

### Ticket #10: Environmental Context Card
**Priority**: 📊 MEDIUM  
**Component**: ExecutionDetail.tsx  
**Effort**: 3 hours  
**Impact**: Useful for context

**Description**:
Display environmental conditions during distribution: weather, temperature, humidity.

**Acceptance Criteria**:
- [ ] Display weatherCondition
- [ ] Show ambient temperature
- [ ] Show humidity percentage
- [ ] Add weather icon
- [ ] Explain impact on distribution
- [ ] Show weather-related warnings
- [ ] Link to weather forecast

**Technical Specs**:
```typescript
interface EnvironmentalContext {
  weatherCondition?: string
  temperature?: number // °C
  humidity?: number // %
}

const WEATHER_ICONS = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️'
}

const getWeatherImpact = (weather: string, temp: number) => {
  if (temp > 35) return 'Suhu tinggi dapat mempengaruhi kualitas makanan'
  if (weather === 'rainy') return 'Hujan dapat menghambat distribusi'
  return 'Kondisi cuaca normal'
}
```

**UI Design**:
- Compact card with weather icon
- Temperature and humidity display
- Impact warning if applicable
- Weather trend indicator

**Dependencies**:
- None (uses existing data)

**Related Models**:
- FoodDistribution (weatherCondition, temperature, humidity)

---

### Ticket #11: Enhanced Timing Display
**Priority**: 📊 MEDIUM  
**Component**: ExecutionDetail.tsx  
**Effort**: 3 hours  
**Impact**: Useful for analysis

**Description**:
Add complete timeline with all timing fields including departureTime, arrivalTime, completionTime.

**Acceptance Criteria**:
- [ ] Display all timing fields
- [ ] Calculate delays
- [ ] Show efficiency metrics
- [ ] Visualize timeline
- [ ] Compare planned vs actual
- [ ] Add time optimization tips

**Technical Specs**:
```typescript
interface CompleteTimeline {
  createdAt: Date
  actualStartTime?: Date
  departureTime?: Date
  arrivalTime?: Date
  completionTime?: Date
  actualEndTime?: Date
}

const calculateDelays = (timeline: CompleteTimeline) => {
  // Calculate time between events
  const preparationTime = actualStartTime - createdAt
  const transitTime = arrivalTime - departureTime
  const totalTime = actualEndTime - actualStartTime
  
  return { preparationTime, transitTime, totalTime }
}
```

**UI Design**:
- Complete timeline visualization
- Delay indicators
- Time duration labels
- Efficiency percentage

**Dependencies**:
- Timeline component (#6)

**Related Models**:
- FoodDistribution (all timing fields)

---

### Ticket #12: Planning vs Actual Comparison
**Priority**: 📊 MEDIUM  
**Component**: ExecutionDetail.tsx  
**Effort**: 4 hours  
**Impact**: Useful for insights

**Description**:
Compare planned values vs actual values to identify variances and patterns.

**Acceptance Criteria**:
- [ ] Compare plannedRecipients vs actualRecipients
- [ ] Compare plannedStartTime vs actualStartTime
- [ ] Calculate variance percentages
- [ ] Show variance reasons
- [ ] Identify patterns
- [ ] Generate insights
- [ ] Add variance alerts

**Technical Specs**:
```typescript
interface VarianceAnalysis {
  metric: string
  planned: number
  actual: number
  variance: number
  variancePercent: number
  reason?: string
}

const analyzeVariance = (planned: number, actual: number) => {
  const variance = actual - planned
  const variancePercent = Math.round((variance / planned) * 100)
  
  return { variance, variancePercent }
}
```

**UI Design**:
- Comparison table
- Variance badges (positive/negative)
- Trend indicators
- Insights panel

**Dependencies**:
- None

**Related Models**:
- FoodDistribution (plannedRecipients, actualRecipients, plannedStartTime, actualStartTime)

---

### Ticket #13: Distribution Point Details
**Priority**: 📊 MEDIUM  
**Component**: ExecutionDetail.tsx  
**Effort**: 3 hours  
**Impact**: Nice to have

**Description**:
Display complete distribution point information including name, address, and map location.

**Acceptance Criteria**:
- [ ] Display distributionPoint name
- [ ] Show full address
- [ ] Render coordinates on map
- [ ] Add directions link
- [ ] Show nearby schools
- [ ] Display access notes

**Technical Specs**:
```typescript
interface DistributionPoint {
  name: string
  address: string
  coordinates?: { lat: number; lng: number }
  accessNotes?: string
}

// Generate Google Maps directions link
const getDirectionsLink = (coords: { lat: number; lng: number }) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
}
```

**UI Design**:
- Location card with map pin icon
- Address display
- Mini map preview
- Directions button
- Access notes section

**Dependencies**:
- Map component

**Related Models**:
- FoodDistribution (distributionPoint, address, coordinates)

---

## 📝 LOW PRIORITY TICKETS

### Ticket #14: Signature Display Component
**Priority**: 📝 LOW  
**Component**: ExecutionDetail.tsx  
**Effort**: 2 hours  
**Impact**: Nice to have

**Description**:
Display electronic signature for distribution completion.

**Acceptance Criteria**:
- [ ] Display signature image
- [ ] Show signer name and timestamp
- [ ] Verify signature validity
- [ ] Add signature zoom
- [ ] Export signature

**Technical Specs**:
```typescript
interface SignatureData {
  signatureUrl: string
  signerName: string
  signedAt: Date
  verified: boolean
}
```

**UI Design**:
- Signature preview
- Signer info below
- Verification badge

**Dependencies**:
- Image display component

**Related Models**:
- FoodDistribution (signature)

---

### Ticket #15: Historical Trend Charts
**Priority**: 📝 LOW  
**Component**: All detail components  
**Effort**: 4 hours  
**Impact**: Nice to have

**Description**:
Add trend charts showing historical data for metrics like quality scores, temperature compliance, efficiency.

**Acceptance Criteria**:
- [ ] Quality score trend
- [ ] Temperature compliance trend
- [ ] Efficiency trend
- [ ] Cost trend
- [ ] Interactive charts
- [ ] Export chart data

**Technical Specs**:
```typescript
import { LineChart, BarChart } from 'recharts'

interface TrendData {
  date: string
  value: number
  label: string
}
```

**UI Design**:
- Compact line charts
- Date range selector
- Legend with colors
- Tooltip on hover

**Dependencies**:
- recharts or similar charting library

**Related Models**:
- Historical data from all distribution models

---

## 📋 Implementation Priority Matrix

| Ticket | Priority | Effort | Impact | Dependencies | Start After |
|--------|----------|--------|--------|--------------|-------------|
| #1 Temperature Monitoring | 🔥 HIGH | 4h | Critical | None | Immediate |
| #2 Team Information | 🔥 HIGH | 3h | High | User API | Immediate |
| #3 Photo Gallery | 🔥 HIGH | 5h | High | Upload API | Immediate |
| #4 Quality Metrics | 🔥 HIGH | 3h | High | None | Immediate |
| #5 Transport Details | 🔥 HIGH | 4h | High | Vehicle API | Immediate |
| #6 Timeline Component | 🔥 HIGH | 5h | High | None | Immediate |
| #7 Audit Trail Component | 🔥 HIGH | 4h | High | User API | #6 |
| #8 Route Comparison | 🔥 HIGH | 6h | High | Maps API | Immediate |
| #9 Menu Parser | 📊 MEDIUM | 3h | Medium | None | After HIGH |
| #10 Environmental Card | 📊 MEDIUM | 3h | Medium | None | After HIGH |
| #11 Enhanced Timing | 📊 MEDIUM | 3h | Medium | #6 | After #6 |
| #12 Variance Comparison | 📊 MEDIUM | 4h | Medium | None | After HIGH |
| #13 Point Details | 📊 MEDIUM | 3h | Low | Maps | After HIGH |
| #14 Signature Display | 📝 LOW | 2h | Low | None | After MEDIUM |
| #15 Trend Charts | 📝 LOW | 4h | Low | Chart lib | After MEDIUM |

---

## 🎯 Sprint Planning Recommendation

### Sprint 1 (Week 1): Critical Food Safety & Team
**Goal**: Implement critical missing functionality  
**Duration**: 5 days  
**Total Effort**: 19 hours

- [ ] #1 Temperature Monitoring (4h) - Day 1
- [ ] #4 Quality Metrics (3h) - Day 2
- [ ] #2 Team Information (3h) - Day 2
- [ ] #6 Timeline Component (5h) - Day 3-4
- [ ] #7 Audit Trail Component (4h) - Day 4-5

**Deliverable**: Food safety compliance + accountability features

---

### Sprint 2 (Week 2): Documentation & Transport
**Goal**: Complete visibility and transparency  
**Duration**: 5 days  
**Total Effort**: 15 hours

- [ ] #3 Photo Gallery (5h) - Day 1-2
- [ ] #5 Transport Details (4h) - Day 3
- [ ] #8 Route Comparison (6h) - Day 4-5

**Deliverable**: Complete documentation and logistics tracking

---

### Sprint 3 (Week 3): Context & Analysis
**Goal**: Enhanced insights and context  
**Duration**: 5 days  
**Total Effort**: 16 hours

- [ ] #9 Menu Parser (3h) - Day 1
- [ ] #10 Environmental Card (3h) - Day 1
- [ ] #11 Enhanced Timing (3h) - Day 2
- [ ] #12 Variance Comparison (4h) - Day 3
- [ ] #13 Point Details (3h) - Day 4

**Deliverable**: Complete contextual information

---

### Sprint 4 (Week 4): Polish & Enhancements
**Goal**: Final touches and nice-to-haves  
**Duration**: 3 days  
**Total Effort**: 6 hours

- [ ] #14 Signature Display (2h) - Day 1
- [ ] #15 Trend Charts (4h) - Day 2-3

**Deliverable**: Polished UI with analytics

---

## 📝 Technical Notes

### Common Dependencies
- **shadcn/ui**: All UI components
- **date-fns**: Date formatting and relative time
- **lucide-react**: Icons
- **next/image**: Image optimization
- **TanStack Query**: Data fetching
- **Zustand**: State management (if needed)

### API Endpoints Required
```typescript
// New endpoints to create
POST /api/sppg/distribution/execution/[id]/upload-photo
GET /api/sppg/users/[id] // For team member details
GET /api/sppg/vehicles/[id] // For vehicle details
```

### Testing Requirements
- [ ] Unit tests for all new components
- [ ] Integration tests for API calls
- [ ] E2E tests for critical workflows
- [ ] Visual regression tests
- [ ] Performance testing for large datasets

### Performance Considerations
- Lazy load photo galleries
- Paginate audit trail entries
- Cache user/vehicle lookups
- Optimize map rendering
- Debounce chart updates

---

## ✅ Definition of Done

For each ticket to be considered complete:
- [ ] Code implementation complete
- [ ] Unit tests written and passing
- [ ] Component documented with JSDoc
- [ ] Storybook story created (if applicable)
- [ ] Responsive design verified (mobile + desktop)
- [ ] Dark mode support verified
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Code review completed
- [ ] QA testing passed
- [ ] Documentation updated

---

## 🔗 Related Documents
- [UI_UX_SCHEMA_AUDIT.md](./UI_UX_SCHEMA_AUDIT.md) - Full audit report
- [UI_UX_SCHEMA_AUDIT_QUICK_REF.md](./UI_UX_SCHEMA_AUDIT_QUICK_REF.md) - Quick reference
- [DISTRIBUTION_DOMAIN_COMPLETE.md](./DISTRIBUTION_DOMAIN_COMPLETE.md) - Domain overview

---

**Next Actions**:
1. Review and prioritize tickets with team
2. Assign tickets to developers
3. Set up sprint board (Jira/Linear/GitHub Projects)
4. Create technical spike for #8 (Route Comparison) if needed
5. Schedule sprint planning meeting
