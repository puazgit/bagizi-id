# 🎨 Menu Planning Detail Page - Enterprise UX/UI Audit Report

**Date**: October 16, 2025  
**Auditor**: Enterprise UX Team  
**Page**: `/menu-planning/menu-plan-draft-pwk-nov-2025`  
**Component**: `MenuPlanDetail.tsx` + `PlanAnalytics.tsx`  
**Status**: ⚠️ **NEEDS IMPROVEMENT** - 72/100 Enterprise Score

---

## 📊 Executive Summary

Audit terhadap halaman detail Menu Planning menunjukkan bahwa aplikasi memiliki **foundation yang solid** namun masih memerlukan **enhancement signifikan** untuk mencapai standar truly enterprise-grade.

**Overall Assessment**:
- ✅ **Strengths**: Solid component structure, good use of shadcn/ui, proper TypeScript typing
- ⚠️ **Weaknesses**: UX flow, visual hierarchy, accessibility, responsive design, empty states
- 🚨 **Critical Issues**: 8 major UX problems identified
- 📈 **Potential**: With fixes, can reach 95/100 enterprise score

---

## 🎯 Enterprise-Grade Criteria Checklist

### 1. Visual Hierarchy & Design System (65/100) ⚠️

#### ❌ **Critical Issues Identified**:

**1.1. Header Section - Lacks Visual Separation**
```typescript
// CURRENT PROBLEM (Lines 166-188):
<CardHeader>
  <div className="flex items-start justify-between">
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <StatusBadge status={plan.status} />
      </div>
      <CardDescription>
        {plan.program.name} • {format(new Date(plan.startDate), 'PPP')}...
      </CardDescription>
    </div>
    <DropdownMenu>...</DropdownMenu>
  </div>
  
  {/* Quick Stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
    <QuickStat... />
  </div>
</CardHeader>
```

**Issues**:
- ❌ Title dan metadata program terlalu dekat (no visual breathing room)
- ❌ Quick stats cards langsung di bawah header tanpa separator
- ❌ StatusBadge positioning kurang prominent
- ❌ Dropdown menu icon terlalu small (accessibility issue)

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
<CardHeader className="space-y-6 pb-6">
  {/* Title Section with Better Spacing */}
  <div className="flex items-start justify-between">
    <div className="space-y-3"> {/* Increased from space-y-1 */}
      <div className="flex items-center gap-3">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {plan.name}
        </CardTitle>
        <StatusBadge status={plan.status} size="lg" /> {/* Add size prop */}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="font-normal">
          {plan.program.programCode}
        </Badge>
        <span>•</span>
        <span>{plan.program.name}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>
          {format(new Date(plan.startDate), 'PPP', { locale: localeId })} - 
          {format(new Date(plan.endDate), 'PPP', { locale: localeId })}
        </span>
      </div>
    </div>
    
    {/* Improved Action Menu */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" disabled={isPending}>
          <MoreVertical className="h-5 w-5" /> {/* Larger icon */}
          <span className="ml-2 hidden sm:inline">Aksi</span>
        </Button>
      </DropdownMenuTrigger>
      ...
    </DropdownMenu>
  </div>
  
  {/* Visual Separator */}
  <Separator />
  
  {/* Quick Stats with Better Styling */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <QuickStat... />
  </div>
</CardHeader>
```

**Impact**: 🎯 Improved visual hierarchy, better readability, more professional appearance

---

**1.2. Quick Stats Cards - Weak Visual Design**

```typescript
// CURRENT PROBLEM (Lines 433-448):
const QuickStat: FC<QuickStatProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}
```

**Issues**:
- ❌ Padding terlalu kecil (p-3 - feels cramped)
- ❌ Icon size terlalu kecil (h-4 w-4)
- ❌ Label text terlalu kecil (text-xs - hard to read)
- ❌ Value text tidak prominent enough (text-lg kurang)
- ❌ No hover effect (not interactive enough)
- ❌ No loading skeleton state

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
interface QuickStatProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: number
  loading?: boolean
}

const QuickStat: FC<QuickStatProps> = ({ icon, label, value, trend, loading }) => {
  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="rounded-xl bg-primary/10 p-3 text-primary ring-2 ring-primary/5">
              <div className="h-5 w-5">{icon}</div>
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {value}
              </p>
            </div>
          </div>
          
          {/* Trend Indicator */}
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none" />
    </Card>
  )
}
```

**Impact**: 🎯 More prominent metrics, better readability, professional appearance

---

**1.3. Status Badge - Inconsistent Sizing & Positioning**

```typescript
// CURRENT PROBLEM (Lines 408-426):
const StatusBadge: FC<{ status: MenuPlanStatus }> = ({ status }) => {
  const config = {
    DRAFT: { label: 'Draf', variant: 'secondary' as const, className: '...' },
    // ... more statuses
  }
  
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
```

**Issues**:
- ❌ No size variants (always same size)
- ❌ No icon to reinforce status meaning
- ❌ Colors not consistent with enterprise standards
- ❌ No animation for status changes

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
interface StatusBadgeProps {
  status: MenuPlanStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  animated?: boolean
}

const StatusBadge: FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = false,
  animated = true
}) => {
  const config = {
    DRAFT: { 
      label: 'Draf', 
      icon: FileText,
      variant: 'secondary' as const, 
      className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      ringColor: 'ring-slate-200 dark:ring-slate-700'
    },
    PENDING_REVIEW: { 
      label: 'Menunggu Review',
      icon: Clock,
      variant: 'default' as const, 
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      ringColor: 'ring-yellow-200 dark:ring-yellow-800'
    },
    APPROVED: { 
      label: 'Disetujui',
      icon: CheckCircle,
      variant: 'default' as const, 
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      ringColor: 'ring-green-200 dark:ring-green-800'
    },
    ACTIVE: { 
      label: 'Aktif',
      icon: Activity,
      variant: 'default' as const, 
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      ringColor: 'ring-emerald-200 dark:ring-emerald-800'
    },
    // ... more statuses
  }

  const { label, icon: Icon, variant, className, ringColor } = config[status] || config.DRAFT

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <Badge 
      variant={variant} 
      className={cn(
        className,
        sizeClasses[size],
        'ring-2',
        ringColor,
        animated && 'transition-all duration-200',
        'font-semibold'
      )}
    >
      {showIcon && Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
      {label}
    </Badge>
  )
}
```

**Impact**: 🎯 More flexible, consistent, and professional status display

---

### 2. Information Architecture (70/100) ⚠️

#### ❌ **Critical Issues**:

**2.1. Tab Navigation - Insufficient Context**

```typescript
// CURRENT PROBLEM (Lines 270-293):
<TabsList className="grid w-full grid-cols-3">
  <TabsTrigger value="overview">
    <Clock className="mr-2 h-4 w-4" />
    Ringkasan
  </TabsTrigger>
  <TabsTrigger value="calendar">
    <Calendar className="mr-2 h-4 w-4" />
    Kalender
  </TabsTrigger>
  <TabsTrigger value="analytics">
    <BarChart3 className="mr-2 h-4 w-4" />
    Analitik
  </TabsTrigger>
</TabsList>
```

**Issues**:
- ❌ No badge indicators (e.g., assignment count in calendar tab)
- ❌ No tooltip explaining what each tab contains
- ❌ Icons too small (h-4 w-4)
- ❌ No keyboard navigation indicators
- ❌ Tab labels tidak descriptive enough

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
<TabsList className="grid w-full grid-cols-3 h-auto p-1">
  <TabsTrigger 
    value="overview" 
    className="flex flex-col sm:flex-row items-center gap-2 py-3"
  >
    <Clock className="h-5 w-5" />
    <div className="flex flex-col items-center sm:items-start">
      <span className="font-medium">Ringkasan</span>
      <span className="text-xs text-muted-foreground hidden sm:block">
        Detail lengkap rencana
      </span>
    </div>
  </TabsTrigger>
  
  <TabsTrigger 
    value="calendar"
    className="flex flex-col sm:flex-row items-center gap-2 py-3 relative"
  >
    <Calendar className="h-5 w-5" />
    <div className="flex flex-col items-center sm:items-start">
      <span className="font-medium">Kalender</span>
      <span className="text-xs text-muted-foreground hidden sm:block">
        Penugasan menu
      </span>
    </div>
    {plan.assignments?.length > 0 && (
      <Badge 
        variant="secondary" 
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {plan.assignments.length}
      </Badge>
    )}
  </TabsTrigger>
  
  <TabsTrigger 
    value="analytics"
    className="flex flex-col sm:flex-row items-center gap-2 py-3"
  >
    <BarChart3 className="h-5 w-5" />
    <div className="flex flex-col items-center sm:items-start">
      <span className="font-medium">Analitik</span>
      <span className="text-xs text-muted-foreground hidden sm:block">
        Laporan & grafik
      </span>
    </div>
  </TabsTrigger>
</TabsList>
```

**Impact**: 🎯 Better user guidance, more context, improved navigation

---

**2.2. Overview Tab - Information Overload**

```typescript
// CURRENT PROBLEM (Lines 456-632):
const OverviewTab: FC<{ plan: MenuPlanDetailType }> = ({ plan }) => {
  return (
    <div className="space-y-6 pt-4">
      {/* Description */}
      {plan.description && (...)}
      
      <Separator />
      
      {/* Details - All crammed together */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">...</div>
        <div className="space-y-4">...</div>
      </div>
      
      {/* Metrics */}
      {(plan.nutritionScore || ...) && (...)}
      
      {/* Assignments Summary */}
      {plan.assignments && (...)}
    </div>
  )
}
```

**Issues**:
- ❌ Too much information in one view (cognitive overload)
- ❌ No progressive disclosure
- ❌ No collapsible sections
- ❌ Metrics cards tidak grouped logically
- ❌ Assignment list tidak sortable/filterable

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
const OverviewTab: FC<{ plan: MenuPlanDetailType }> = ({ plan }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'details', 'metrics' // Default expanded
  ])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Description - Always visible */}
      {plan.description && (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertDescription className="text-sm leading-relaxed">
            {plan.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Collapsible Section: Plan Details */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('details')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detail Rencana
            </CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.includes('details') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.includes('details') && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Informasi Program
                </h4>
                <dl className="space-y-3">
                  <DetailRow label="Program" value={plan.program.name} />
                  <DetailRow label="Kode Program" value={plan.program.programCode} />
                  <DetailRow 
                    label="Target Penerima" 
                    value={plan.program.targetRecipients?.toLocaleString() || 'N/A'} 
                  />
                </dl>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Status & Timeline
                </h4>
                <dl className="space-y-3">
                  <DetailRow label="Status" value={<StatusBadge status={plan.status} size="sm" />} />
                  <DetailRow label="Dibuat Oleh" value={plan.creator.name} />
                  <DetailRow
                    label="Dibuat Pada"
                    value={format(new Date(plan.createdAt), 'PPP', { locale: localeId })}
                  />
                </dl>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Collapsible Section: Quality Metrics */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('metrics')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Metrik Kualitas
            </CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.includes('metrics') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.includes('metrics') && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.nutritionScore && (
                <MetricCard label="Skor Nutrisi" value={plan.nutritionScore} max={100} />
              )}
              {plan.varietyScore && (
                <MetricCard label="Skor Variasi" value={plan.varietyScore} max={100} />
              )}
              {plan.costEfficiency && (
                <MetricCard label="Efisiensi Biaya" value={plan.costEfficiency} max={100} />
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Collapsible Section: Recent Assignments */}
      {plan.assignments && plan.assignments.length > 0 && (
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('assignments')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Assignment Terkini
                <Badge variant="secondary" className="ml-2">
                  {plan.assignments.length}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm">
                {expandedSections.includes('assignments') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          {expandedSections.includes('assignments') && (
            <CardContent className="pt-0">
              <div className="space-y-2">
                {plan.assignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{assignment.menu.menuName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {assignment.mealType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(assignment.assignedDate), 'PPP', { locale: localeId })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {assignment.plannedPortions || 0} porsi
                    </Badge>
                  </div>
                ))}
              </div>
              
              {plan.assignments.length > 5 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setActiveTab('calendar')}
                >
                  Lihat Semua {plan.assignments.length} Assignment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
```

**Impact**: 🎯 Better information organization, reduced cognitive load, improved UX

---

### 3. Responsive Design (60/100) 🚨

#### ❌ **Critical Issues**:

**3.1. Mobile Layout - Broken Grid**

```typescript
// CURRENT PROBLEM (Lines 224-234):
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
  <QuickStat... />
</div>
```

**Issues**:
- ❌ Grid 2 kolom di mobile terlalu cramped
- ❌ Quick stats cards overflow on small screens
- ❌ Icons dan text terlalu kecil di mobile
- ❌ No touch-friendly button sizes

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4">
  <QuickStat... />
</div>

// And improve QuickStat for mobile:
const QuickStat: FC<QuickStatProps> = ({ icon, label, value }) => {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="rounded-xl bg-primary/10 p-2.5 sm:p-3 text-primary shrink-0">
            <div className="h-5 w-5 sm:h-6 sm:w-6">{icon}</div>
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {label}
            </p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**3.2. Tablet Layout - Suboptimal**

```typescript
// CURRENT PROBLEM:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <OverviewTab plan={plan} />
  </div>
  <div>
    <ApprovalWorkflow... />
  </div>
</div>
```

**Issues**:
- ❌ No md: breakpoint (jumps dari 1 kolom ke 3 kolom)
- ❌ Approval workflow sidebar hilang di tablet
- ❌ Content terlalu sempit atau terlalu lebar

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
<div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
  <div className="md:col-span-8 lg:col-span-8 xl:col-span-9">
    <OverviewTab plan={plan} />
  </div>
  <div className="md:col-span-4 lg:col-span-4 xl:col-span-3">
    <div className="sticky top-4">
      <ApprovalWorkflow... />
    </div>
  </div>
</div>
```

**Impact**: 🎯 Better responsive behavior across all screen sizes

---

### 4. Accessibility (55/100) 🚨

#### ❌ **Critical Issues**:

**4.1. Missing ARIA Labels**

```typescript
// CURRENT PROBLEM:
<DropdownMenuTrigger asChild>
  <Button variant="outline" size="icon" disabled={isPending}>
    <MoreVertical className="h-4 w-4" />
  </Button>
</DropdownMenuTrigger>
```

**Issues**:
- ❌ No aria-label for screen readers
- ❌ No keyboard shortcuts indication
- ❌ No focus visible indicators

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
<DropdownMenuTrigger asChild>
  <Button 
    variant="outline" 
    size="icon" 
    disabled={isPending}
    aria-label="Menu aksi rencana"
    aria-expanded={dropdownOpen}
    aria-haspopup="menu"
  >
    <MoreVertical className="h-4 w-4" />
    <span className="sr-only">Buka menu aksi</span>
  </Button>
</DropdownMenuTrigger>
```

**4.2. Color Contrast Issues**

```typescript
// CURRENT PROBLEM (Line 412):
className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
```

**Issues**:
- ⚠️ Some badge colors don't meet WCAG AA standards
- ❌ Muted text terlalu light (hard to read)

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
// Use color palette with verified WCAG AA compliance
const BADGE_COLORS = {
  DRAFT: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-50',
  PENDING_REVIEW: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-50',
  APPROVED: 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-50',
  // ... etc with proper contrast ratios
}
```

**4.3. Keyboard Navigation**

**Issues**:
- ❌ No keyboard shortcuts for common actions
- ❌ Tab order not optimized
- ❌ No skip to content link

**Enterprise Solution**:
```typescript
// Add keyboard shortcuts:
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + E = Edit
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault()
      handleEdit()
    }
    // Ctrl/Cmd + S = Submit
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (plan.status === 'DRAFT') setShowSubmitDialog(true)
    }
  }
  
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [plan.status])

// Add keyboard hints in UI:
<DropdownMenuItem onClick={handleEdit}>
  <Edit className="mr-2 h-4 w-4" />
  Edit Rencana
  <kbd className="ml-auto text-xs text-muted-foreground">
    ⌘E
  </kbd>
</DropdownMenuItem>
```

**Impact**: 🎯 WCAG 2.1 AA compliance, better accessibility

---

### 5. Empty States & Error Handling (50/100) 🚨

#### ❌ **Critical Issues**:

**5.1. No Empty State for Tabs**

```typescript
// CURRENT PROBLEM:
{plan.assignments && plan.assignments.length > 0 && (
  // Show assignments
)}
```

**Issues**:
- ❌ Kalau assignments.length === 0, tab kosong (no guidance)
- ❌ No call-to-action untuk create assignment
- ❌ No illustration/icon

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
{plan.assignments && plan.assignments.length > 0 ? (
  // Show assignments
) : (
  <Card>
    <CardContent className="py-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full bg-muted p-6">
          <CalendarDays className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Belum Ada Assignment</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Rencana menu ini belum memiliki assignment. Gunakan tab Kalender untuk menambahkan menu ke tanggal tertentu.
          </p>
        </div>
        <Button 
          onClick={() => setActiveTab('calendar')}
          className="mt-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Assignment Pertama
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

**5.2. Generic Error Messages**

```typescript
// CURRENT PROBLEM (Lines 146-163):
if (error || !plan) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error?.message || 'Rencana menu tidak ditemukan'}
      </AlertDescription>
    </Alert>
  )
}
```

**Issues**:
- ❌ No error recovery options
- ❌ No retry button
- ❌ No help link
- ❌ Generic error message

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
if (error || !plan) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Gagal Memuat Rencana Menu</h3>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Rencana menu tidak ditemukan atau Anda tidak memiliki akses.'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
            <Button 
              onClick={() => router.push('/menu-planning')}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Button>
          </div>
          
          <Button variant="link" size="sm" asChild>
            <a href="/help/menu-planning" className="text-xs">
              Butuh bantuan? Lihat panduan →
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Impact**: 🎯 Better user guidance, improved error recovery

---

### 6. Loading States (65/100) ⚠️

#### ⚠️ **Issues**:

**6.1. Generic Skeleton Loader**

```typescript
// CURRENT PROBLEM (Lines 728-749):
const DetailSkeleton: FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
```

**Issues**:
- ⚠️ Skeleton doesn't match actual layout closely enough
- ❌ No progressive loading (everything loads at once)
- ❌ No loading percentage indicator

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
const DetailSkeleton: FC = () => {
  return (
    <Card>
      <CardHeader className="space-y-6">
        {/* Title Section Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        
        <Separator />
        
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-4 pt-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Impact**: 🎯 More accurate loading preview, better perceived performance

---

### 7. Interaction Feedback (70/100) ⚠️

#### ⚠️ **Issues**:

**7.1. Button States - Insufficient Feedback**

```typescript
// CURRENT PROBLEM:
<Button variant="outline" size="icon" disabled={isPending}>
  <MoreVertical className="h-4 w-4" />
</Button>
```

**Issues**:
- ❌ No loading spinner when action in progress
- ❌ Disabled state not clear enough
- ❌ No success/error animation

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
<Button 
  variant="outline" 
  size="icon" 
  disabled={isPending}
  className={cn(
    "transition-all",
    isPending && "cursor-not-allowed opacity-60"
  )}
>
  {isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <MoreVertical className="h-4 w-4" />
  )}
</Button>

// For action buttons:
<AlertDialogAction
  onClick={handleDelete}
  disabled={isDeleting}
  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
>
  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isDeleting ? 'Menghapus...' : 'Hapus'}
</AlertDialogAction>
```

**7.2. No Toast Notifications for Success**

**Issues**:
- ❌ After successful action, no confirmation toast
- ❌ User tidak tahu action berhasil atau tidak

**Enterprise Solution**:
```typescript
// Add toast after successful actions:
const handleDelete = () => {
  deletePlan(planId, {
    onSuccess: () => {
      toast.success('Rencana menu berhasil dihapus', {
        description: 'Data telah dihapus dari sistem'
      })
      router.push('/menu-planning')
    },
    onError: (error) => {
      toast.error('Gagal menghapus rencana menu', {
        description: error.message
      })
    }
  })
  setShowDeleteDialog(false)
}
```

**Impact**: 🎯 Clear feedback, better user confidence

---

### 8. Performance Optimization (75/100) ⚠️

#### ⚠️ **Issues**:

**8.1. No Memoization**

```typescript
// CURRENT PROBLEM:
const QuickStat: FC<QuickStatProps> = ({ icon, label, value }) => {
  return (...)
}
```

**Issues**:
- ❌ Components re-render unnecessarily
- ❌ No React.memo for expensive components

**Enterprise Solution**:
```typescript
// RECOMMENDED IMPROVEMENT:
const QuickStat = React.memo<QuickStatProps>(({ icon, label, value, trend }) => {
  return (...)
})

const StatusBadge = React.memo<StatusBadgeProps>(({ status, size }) => {
  return (...)
})

const MetricCard = React.memo<MetricCardProps>(({ label, value, max }) => {
  return (...)
})
```

**8.2. No Data Prefetching**

**Issues**:
- ❌ Analytics data loaded only when tab clicked
- ❌ No optimistic updates

**Enterprise Solution**:
```typescript
// Prefetch analytics on component mount:
useEffect(() => {
  if (plan?.id) {
    // Prefetch analytics
    queryClient.prefetchQuery({
      queryKey: ['menuPlanAnalytics', plan.id],
      queryFn: () => fetchMenuPlanAnalytics(plan.id)
    })
  }
}, [plan?.id, queryClient])
```

**Impact**: 🎯 Better performance, smoother experience

---

## 📋 Priority Fixes Checklist

### 🔴 **HIGH PRIORITY** (Must Fix for Enterprise-Grade):

1. ✅ **Visual Hierarchy Improvements**
   - [ ] Add Separator between header and quick stats
   - [ ] Improve StatusBadge with size variants and icons
   - [ ] Enhance QuickStat cards with better spacing and styling
   - [ ] Add trend indicators to metrics

2. ✅ **Responsive Design Fixes**
   - [ ] Fix mobile grid layout (1 column instead of 2)
   - [ ] Add tablet breakpoints (md:)
   - [ ] Make buttons touch-friendly (min 44x44px)
   - [ ] Test on actual mobile devices

3. ✅ **Accessibility Compliance**
   - [ ] Add ARIA labels to all interactive elements
   - [ ] Fix color contrast issues (WCAG AA)
   - [ ] Add keyboard shortcuts with visual indicators
   - [ ] Test with screen readers

4. ✅ **Empty States & Error Handling**
   - [ ] Create empty state for assignments tab
   - [ ] Improve error messages with recovery options
   - [ ] Add retry buttons and help links
   - [ ] Create illustrations for empty states

### 🟡 **MEDIUM PRIORITY** (Should Fix for Better UX):

5. ✅ **Information Architecture**
   - [ ] Add collapsible sections in Overview tab
   - [ ] Improve tab navigation with badges and tooltips
   - [ ] Add progressive disclosure for complex data
   - [ ] Create better assignment list with filters

6. ✅ **Loading States**
   - [ ] Create accurate skeleton loaders
   - [ ] Add progressive loading indicators
   - [ ] Show loading percentages for long operations

7. ✅ **Interaction Feedback**
   - [ ] Add loading spinners to all action buttons
   - [ ] Implement toast notifications for all actions
   - [ ] Add success/error animations
   - [ ] Improve disabled state visibility

### 🟢 **LOW PRIORITY** (Nice to Have):

8. ✅ **Performance Optimization**
   - [ ] Memoize expensive components
   - [ ] Add data prefetching
   - [ ] Implement optimistic updates
   - [ ] Add lazy loading for charts

9. ✅ **Advanced Features**
   - [ ] Add export functionality
   - [ ] Implement advanced filtering
   - [ ] Add batch operations
   - [ ] Create keyboard shortcuts panel

---

## 🎯 Enterprise Score Breakdown

| Category | Current Score | Target Score | Gap |
|----------|--------------|--------------|-----|
| Visual Hierarchy | 65/100 | 95/100 | -30 |
| Information Architecture | 70/100 | 95/100 | -25 |
| Responsive Design | 60/100 | 95/100 | -35 |
| Accessibility | 55/100 | 95/100 | -40 |
| Empty States | 50/100 | 95/100 | -45 |
| Loading States | 65/100 | 90/100 | -25 |
| Interaction Feedback | 70/100 | 95/100 | -25 |
| Performance | 75/100 | 95/100 | -20 |
| **OVERALL** | **72/100** | **95/100** | **-23** |

---

## 🚀 Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
- Fix responsive design issues
- Improve accessibility (ARIA labels, contrast)
- Add empty states and better error handling
- Enhance loading states

**Expected Score After Phase 1**: 82/100

### Phase 2: UX Enhancements (Week 2)
- Improve visual hierarchy
- Add collapsible sections
- Better tab navigation
- Enhanced interaction feedback

**Expected Score After Phase 2**: 90/100

### Phase 3: Polish & Optimization (Week 3)
- Performance optimization
- Advanced features
- Final polish and testing
- Cross-browser testing

**Expected Score After Phase 3**: 95/100 ✅ **ENTERPRISE-GRADE**

---

## 💡 Key Recommendations

1. **Focus on Accessibility First** - WCAG compliance is non-negotiable for enterprise apps
2. **Mobile-First Approach** - Many users akan akses dari mobile devices
3. **Progressive Disclosure** - Don't overwhelm users with information
4. **Consistent Feedback** - Every action should have clear feedback
5. **Performance Matters** - Fast loading = better UX

---

## 📊 Conclusion

Halaman Menu Planning Detail memiliki **foundation yang solid** namun memerlukan **significant improvements** untuk mencapai truly enterprise-grade status.

**Strengths** ✅:
- Clean component structure
- Good use of shadcn/ui
- Proper TypeScript typing
- Working functionality

**Weaknesses** ⚠️:
- Visual hierarchy needs work
- Responsive design issues
- Accessibility gaps
- Missing empty states
- Limited interaction feedback

**Next Steps** 🎯:
1. Implement Phase 1 critical fixes
2. Test with real users
3. Iterate based on feedback
4. Achieve 95/100 enterprise score

**Timeline**: 3 weeks for complete transformation to enterprise-grade

---

**Audit Completed**: October 16, 2025  
**Reviewed By**: Enterprise UX Team  
**Status**: ⚠️ **IMPROVEMENT NEEDED** - 72/100 → Target: 95/100
