# 🏗️ Bagizi-ID SaaS Platform - Copilot Instructions

## 📊 Platform Overview

**Bagizi-ID** adalah **Enterprise-Grade SaaS Platform** modern dan professional untuk manajemen SPPG (Satuan Pelayanan Pemenuhan Gizi) dengan 3 layer:

> **🎯 Vision**: Membangun aplikasi **enterprise-level** yang scalable, secure, dan maintainable dengan standar industri terbaru untuk melayani ribuan SPPG di seluruh Indonesia.

### Layer 1: Marketing Website (Public)
- Landing pages & features showcase
- Blog, testimonials, case studies
- Lead capture & demo requests
- Routes: `/`, `/features`, `/pricing`, `/blog/*`, `/case-studies/*`

### Layer 2: SPPG Dashboard (Protected - Multi-tenant)
- **SPPG sebagai TENANT utama** (bukan "Customer")
- Full operational management: Menu → Procurement → Production → Distribution → Reporting
- Routes: `/dashboard/*`, `/menu/*`, `/procurement/*`, `/production/*`, `/distribution/*`
- Roles: `SPPG_ADMIN`, `SPPG_USER`, `SPPG_AHLI_GIZI`, etc.

### Layer 3: Platform Admin (Protected - Platform Management)
- Manage all SPPG tenants
- Subscription & billing management
- Platform analytics & monitoring
- Routes: `/admin/*`
- Role: `SUPERADMIN`, `PLATFORM_SUPPORT`

---

## 🎯 Enterprise-Grade Tech Stack

### Core Framework & Runtime
- **Framework**: Next.js 15+ (App Router) - Production-ready React framework
- **Runtime**: Node.js 18+ dengan Edge Runtime support
- **TypeScript**: Strict mode dengan enterprise-level type safety

### Authentication & Security
- **Authentication**: Auth.js v5 dengan enterprise multi-role system
- **Authorization**: RBAC (Role-Based Access Control) dengan fine-grained permissions
- **Security**: OWASP compliance, rate limiting, input sanitization
- **Audit Trail**: Comprehensive logging untuk compliance

### Database & Data Layer
- **Database**: PostgreSQL 15+ dengan connection pooling
- **ORM**: Prisma dengan enterprise migrations strategy
- **Caching**: Redis untuk session management & performance
- **Backup**: Automated daily backups dengan point-in-time recovery

### State Management & API
- **Client State**: Zustand dengan enterprise patterns per feature module
- **Server State**: TanStack Query (React Query) dengan optimistic updates
- **Validation**: Zod schemas dengan enterprise validation rules per domain
- **API**: RESTful API Endpoints dengan OpenAPI 3.0 documentation
- **Architecture**: Feature-based modular architecture dengan domain separation

### UI/UX & Design System
- **Styling**: Tailwind CSS dengan enterprise design tokens dan CSS variables
- **Components**: shadcn/ui (Radix UI primitives) dengan full accessibility compliance
- **Dark Mode**: Comprehensive dark mode support dengan seamless theme switching
- **Design System**: shadcn/ui component library dengan enterprise customization
- **Icons**: Lucide React untuk consistent iconography
- **Forms**: React Hook Form + Zod integration dengan shadcn/ui form components
- **Data Display**: Advanced data tables, charts, dan dashboard components
- **Responsive**: Mobile-first design dengan adaptive layouts

### Architecture & Development
- **Architecture**: Domain-Driven Design (DDD) dengan clean architecture
- **Patterns**: Repository, Service Layer, CQRS untuk scalability
- **Code Quality**: ESLint + Prettier + Husky untuk enterprise standards
- **Testing**: Jest + Testing Library + Playwright untuk E2E
- **Documentation**: JSDoc + TypeDoc untuk API documentation

### DevOps & Production
- **Deployment**: Vercel Pro atau AWS dengan auto-scaling
- **Monitoring**: Real-time error tracking dengan Sentry
- **Analytics**: User behavior tracking dengan enterprise privacy
- **Performance**: Core Web Vitals optimization
- **CDN**: Global content delivery untuk Indonesia-wide access

---

## � Enterprise-Grade Development Principles

### Core Principles
1. **Scalability First**: Aplikasi harus dapat menangani 10,000+ concurrent users
2. **Security by Design**: Zero-trust architecture dengan multiple security layers
3. **Performance Optimized**: Sub-3 second loading times dengan optimized bundle sizes
4. **Accessibility Compliant**: WCAG 2.1 AA compliance untuk inclusive design
5. **Mobile-First**: Progressive Web App (PWA) dengan offline capabilities
6. **Data Privacy**: GDPR-compliant dengan comprehensive data protection

### Enterprise Quality Standards
```typescript
// Code Quality Metrics
const enterpriseStandards = {
  testCoverage: '>=90%',           // Minimum test coverage
  typeScriptStrict: true,         // No any types allowed
  performanceScore: '>=95',       // Lighthouse performance score
  accessibilityScore: '>=95',     // WCAG compliance score
  bundleSize: '<500KB',           // Initial bundle size limit
  loadTime: '<3s',                // First contentful paint
  errorRate: '<0.1%',             // Production error rate
  uptime: '99.9%'                 // Service level agreement
}
```

### Enterprise Development Workflow
```bash
# Development Pipeline
1. Feature Branch → Development
2. Code Review → Quality Gates
3. Automated Testing → CI/CD
4. Staging Deployment → QA
5. Production Deployment → Monitoring

# Quality Gates
- ✅ TypeScript compilation with zero errors
- ✅ ESLint + Prettier formatting
- ✅ Unit tests (>=90% coverage)
- ✅ Integration tests passing
- ✅ E2E tests in staging
- ✅ Security vulnerability scan
- ✅ Performance budget check
- ✅ Accessibility audit
```

### Enterprise Monitoring & Observability
```typescript
// Production Monitoring Stack
const monitoring = {
  errorTracking: 'Sentry',        // Real-time error monitoring
  performance: 'Web Vitals',      // Core performance metrics  
  uptime: 'Pingdom/UptimeRobot',  // Service availability
  analytics: 'Vercel Analytics',   // User behavior insights
  logging: 'Structured JSON',      // Centralized log management
  alerts: 'Slack/Email',          // Real-time incident alerts
  dashboards: 'Grafana/DataDog'   // Executive reporting
}
```

---

## 🏗️ Feature-Based Modular Architecture

### Robust Feature Structure
Platform menggunakan **feature-based architecture** dengan domain separation yang komprehensif:

```
src/features/{feature_name}/
├── components/          # Feature-specific UI components
│   ├── {Feature}List.tsx
│   ├── {Feature}Form.tsx
│   ├── {Feature}Card.tsx
│   └── index.ts        # Export barrel
├── hooks/              # Feature-specific hooks dengan TanStack Query
│   ├── use{Feature}.ts
│   ├── use{Feature}Mutations.ts
│   ├── use{Feature}Queries.ts
│   └── index.ts
├── stores/             # Zustand stores per feature
│   ├── {feature}Store.ts
│   ├── {feature}Selectors.ts
│   └── index.ts
├── schemas/            # Zod validation schemas
│   ├── {feature}Schema.ts
│   ├── {feature}Request.ts
│   ├── {feature}Response.ts
│   └── index.ts
├── types/              # TypeScript definitions
│   ├── {feature}.types.ts
│   ├── api.types.ts
│   └── index.ts
├── lib/                # Feature utilities & helpers
│   ├── {feature}Utils.ts
│   ├── {feature}Formatters.ts
│   ├── {feature}Constants.ts
│   └── index.ts
├── api/                # API client functions
│   ├── {feature}Api.ts
│   ├── endpoints.ts
│   └── index.ts
└── __tests__/          # Feature tests
    ├── components/
    ├── hooks/
    ├── stores/
    └── api/
```

### Core Feature Examples

#### **SPPG Feature Structure**
```
src/features/sppg/
├── menu/              # Menu management feature
│   ├── components/    # MenuList, MenuForm, MenuCard, NutritionTable
│   ├── hooks/         # useMenus, useCreateMenu, useMenuQueries
│   ├── stores/        # menuStore.ts, menuSelectors.ts
│   ├── schemas/       # menuSchema.ts, menuRequest.ts, menuResponse.ts
│   ├── types/         # menu.types.ts, nutrition.types.ts
│   ├── lib/           # menuUtils.ts, nutritionCalculator.ts
│   └── api/           # menuApi.ts, menuEndpoints.ts
├── procurement/       # Procurement management
│   ├── components/    # ProcurementList, SupplierSelect, OrderForm
│   ├── hooks/         # useProcurement, useSuppliers, useProcurementMutations
│   ├── stores/        # procurementStore.ts, supplierStore.ts
│   ├── schemas/       # procurementSchema.ts, orderSchema.ts
│   ├── types/         # procurement.types.ts, supplier.types.ts
│   ├── lib/           # procurementUtils.ts, costCalculator.ts
│   └── api/           # procurementApi.ts, supplierApi.ts
├── production/        # Food production management
├── distribution/      # Distribution management
├── inventory/         # Inventory management
├── hrd/              # Human resource management
└── reports/          # Reporting and analytics
```

#### **Admin Feature Structure**
```
src/features/admin/
├── sppg-management/   # Manage all SPPG tenants
│   ├── components/    # SppgList, SppgCard, SppgForm, SppgMetrics
│   ├── hooks/         # useSppgs, useCreateSppg, useSppgAnalytics
│   ├── stores/        # sppgManagementStore.ts, sppgSelectors.ts
│   ├── schemas/       # sppgSchema.ts, sppgRequest.ts
│   ├── types/         # sppg-management.types.ts
│   ├── lib/           # sppgUtils.ts, tenantManager.ts
│   └── api/           # sppgApi.ts, tenantApi.ts
├── billing/          # Subscription & billing management
│   ├── components/    # BillingTable, InvoiceCard, SubscriptionForm
│   ├── hooks/         # useBilling, useSubscriptions, useInvoices
│   ├── stores/        # billingStore.ts, subscriptionStore.ts
│   ├── schemas/       # billingSchema.ts, subscriptionSchema.ts
│   ├── types/         # billing.types.ts, subscription.types.ts
│   ├── lib/           # billingUtils.ts, subscriptionCalculator.ts
│   └── api/           # billingApi.ts, subscriptionApi.ts
├── analytics/        # Platform analytics and monitoring
├── user-management/  # Platform user management
└── system-settings/ # Platform configuration
```

### Component Hierarchy & Dark Mode Support
```
components/
├── ui/                 # shadcn/ui primitives with full dark mode
│   ├── button.tsx      # Radix UI + CVA variants
│   ├── card.tsx        # Auto dark mode via CSS variables
│   ├── input.tsx       # Form controls with theme support
│   ├── form.tsx        # React Hook Form integration
│   ├── data-table.tsx  # Enterprise table with filtering/sorting
│   ├── dialog.tsx      # Modal dialogs
│   ├── dropdown-menu.tsx # Action menus
│   ├── badge.tsx       # Status indicators
│   ├── separator.tsx   # Dividers
│   ├── skeleton.tsx    # Loading states
│   └── theme-toggle.tsx # Theme switcher
├── shared/             # Cross-domain reusable components
│   ├── layouts/
│   │   ├── AppLayout.tsx        # Main app shell with theme
│   │   ├── SppgLayout.tsx       # SPPG dashboard layout
│   │   └── AdminLayout.tsx      # Admin dashboard layout
│   ├── navigation/
│   │   ├── Sidebar.tsx          # Theme-aware navigation
│   │   ├── Breadcrumb.tsx       # shadcn/ui breadcrumb
│   │   └── UserMenu.tsx         # shadcn/ui dropdown menu
│   └── data-display/
│       ├── StatsCard.tsx        # shadcn/ui card variants
│       ├── Charts/              # Chart components with dark mode
│       └── LoadingSpinner.tsx   # shadcn/ui skeleton
└── features/           # Feature-based modules (not sppg/admin folders)
    ├── sppg/           # SPPG feature modules
    └── admin/          # Admin feature modules
```

### Component-Based Architecture for Complex Pages

**🎯 When to Split Components (The 200-Line Rule)**

**ALWAYS split components when:**
- ✅ Page file exceeds **200 lines**
- ✅ Multiple distinct sections/tabs (detail pages, dashboards)
- ✅ Repeated UI patterns (stat cards, info sections)
- ✅ Complex forms with multiple steps
- ✅ Heavy business logic mixed with presentation

**Detail Page Pattern (Recommended)**

```typescript
// ❌ BAD: Monolithic 900-line page file
src/app/(admin)/admin/sppg/[id]/page.tsx  // 900 lines - hard to maintain!

// ✅ GOOD: Component-based architecture
src/features/admin/sppg-management/
├── components/
│   ├── detail/                          # Detail page components
│   │   ├── SppgDetailHeader.tsx         # ~80 lines: Title, actions, badges
│   │   ├── SppgOverviewTab.tsx          # ~120 lines: Stats & quick info
│   │   ├── SppgProfileTab.tsx           # ~100 lines: Organization details
│   │   ├── SppgLocationTab.tsx          # ~150 lines: Address & contacts
│   │   ├── SppgBudgetTab.tsx            # ~180 lines: Financial details
│   │   ├── SppgDemoTab.tsx              # ~80 lines: Demo settings (conditional)
│   │   ├── SppgSystemTab.tsx            # ~60 lines: Audit trail
│   │   └── index.ts                     # Export barrel
│   └── SppgForm.tsx                     # Already exists
└── ...

src/app/(admin)/admin/sppg/[id]/page.tsx  # ~120 lines: Orchestrator only!
```

**Page File Responsibilities (Orchestrator Pattern)**

```typescript
// src/app/(admin)/admin/sppg/[id]/page.tsx (~120 lines max)
'use client'

import { useParams } from 'next/navigation'
import { useSppg, useDeleteSppg } from '@/features/admin/sppg-management/hooks'
import {
  SppgDetailHeader,
  SppgOverviewTab,
  SppgProfileTab,
  SppgLocationTab,
  SppgBudgetTab,
  SppgDemoTab,
  SppgSystemTab,
} from '@/features/admin/sppg-management/components/detail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

export default function SppgDetailPage() {
  const params = useParams()
  const { data: sppg, isLoading, error } = useSppg(params.id as string)
  const { mutate: deleteSppg } = useDeleteSppg()

  // Loading & error states
  if (isLoading) return <DetailPageSkeleton />
  if (error || !sppg) return <ErrorState error={error} />

  // Action handlers
  const handleDelete = () => deleteSppg(sppg.id, { onSuccess: () => router.push('/admin/sppg') })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with actions */}
      <SppgDetailHeader 
        sppg={sppg} 
        onDelete={handleDelete}
        onEdit={() => router.push(`/admin/sppg/${sppg.id}/edit`)}
      />

      {/* Tabs with components */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="location">Location & Contacts</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          {sppg.isDemoAccount && <TabsTrigger value="demo">Demo Settings</TabsTrigger>}
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><SppgOverviewTab sppg={sppg} /></TabsContent>
        <TabsContent value="profile"><SppgProfileTab sppg={sppg} /></TabsContent>
        <TabsContent value="location"><SppgLocationTab sppg={sppg} /></TabsContent>
        <TabsContent value="budget"><SppgBudgetTab sppg={sppg} /></TabsContent>
        {sppg.isDemoAccount && (
          <TabsContent value="demo"><SppgDemoTab sppg={sppg} /></TabsContent>
        )}
        <TabsContent value="system"><SppgSystemTab sppg={sppg} /></TabsContent>
      </Tabs>
    </div>
  )
}
```

**Component Structure Pattern**

```typescript
// src/features/admin/sppg-management/components/detail/SppgOverviewTab.tsx
/**
 * SPPG Overview Tab Component
 * Displays key metrics and quick information
 * 
 * @component
 * @example
 * <SppgOverviewTab sppg={sppgData} />
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgOverviewTabProps {
  sppg: SppgDetail
}

export function SppgOverviewTab({ sppg }: SppgOverviewTabProps) {
  return (
    <div className="grid gap-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Organization</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Only use fields that exist in Prisma schema! */}
          <StatCard 
            label="Status" 
            value={<StatusBadge status={sppg.status} />} 
            icon={CheckCircle2}
          />
          <StatCard 
            label="Organization Type" 
            value={getOrganizationTypeLabel(sppg.organizationType)} 
            icon={Building2}
          />
          <StatCard 
            label="Target Recipients" 
            value={sppg.targetRecipients} 
            icon={Users}
          />
          <StatCard 
            label="Monthly Budget" 
            value={formatCurrency(sppg.monthlyBudget)} 
            icon={DollarSign}
          />
        </CardContent>
      </Card>

      {/* Other sections... */}
    </div>
  )
}

// Helper component
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  )
}
```

**Component Naming Conventions**

```typescript
// Pattern: {Entity}{Section}{ComponentType}.tsx
SppgDetailHeader.tsx       // Header section
SppgOverviewTab.tsx        // Tab content
SppgBudgetCard.tsx         // Specific card component
SppgStatusBadge.tsx        // Reusable badge

// NOT like this:
SppgDetail.tsx             // Too vague
Detail.tsx                 // Missing context
Overview.tsx               // Missing entity
```

**Benefits of Component-Based Architecture**

```typescript
const benefits = {
  maintainability: {
    smallerFiles: '80-180 lines vs 900 lines',
    focusedLogic: 'One responsibility per component',
    easierBugFixes: 'Isolated changes, less side effects'
  },
  
  reusability: {
    sharedComponents: 'StatCard, InfoSection reused across tabs',
    consistentUI: 'Same patterns everywhere',
    lessCode: 'DRY principle applied'
  },
  
  testability: {
    unitTests: 'Test components in isolation',
    mockingEasy: 'Mock only what you need',
    fasterTests: 'Smaller test suites'
  },
  
  collaboration: {
    parallelWork: 'Multiple devs on different tabs',
    clearOwnership: 'Each file has clear purpose',
    codeReview: 'Smaller, focused PRs'
  },
  
  performance: {
    lazyLoading: 'Load tab components on demand',
    memoization: 'React.memo on individual components',
    smallerBundles: 'Code splitting per component'
  }
}
```

**When NOT to Split Components**

```typescript
// ✅ Keep simple pages as single file (<150 lines)
src/app/(admin)/admin/sppg/new/page.tsx  // 88 lines - OK!

// ✅ Simple forms (<200 lines)
src/features/admin/simple-form/SimpleForm.tsx  // 150 lines - OK!

// ❌ DON'T over-engineer
// Bad: Creating components for every 20 lines
src/features/admin/sppg/components/
├── SppgTitleComponent.tsx      // 15 lines - TOO SMALL!
├── SppgDescriptionText.tsx     // 20 lines - TOO SMALL!
└── SppgCodeDisplay.tsx         // 18 lines - TOO SMALL!
```

**Migration Strategy (Refactor Existing Pages)**

```typescript
// Step 1: Identify sections in monolithic file
// - Header (title, actions, badges)
// - Tab 1: Overview
// - Tab 2: Profile
// - Tab 3: Location
// - etc.

// Step 2: Create component directory
mkdir -p src/features/{feature}/components/detail

// Step 3: Extract components one by one
// Start with simplest (SystemTab) → most complex (BudgetTab)

// Step 4: Replace inline code with component imports
// Old: 200 lines of inline JSX
// New: <SppgOverviewTab sppg={sppg} />

// Step 5: Test after each extraction
// Ensure no regressions

// Step 6: Clean up imports and types
```

### Service Layer Pattern
```typescript
// src/domains/menu/services/menuService.ts
export class MenuService {
  constructor(
    private menuRepository: MenuRepository,
    private nutritionCalculator: NutritionCalculator,
    private costCalculator: CostCalculator
  ) {}

  async createMenu(input: MenuInput, sppgId: string): Promise<ServiceResult<Menu>> {
    // 1. Validation
    const validated = menuSchema.safeParse(input)
    if (!validated.success) {
      return ServiceResult.error('Validation failed')
    }

    // 2. Business logic
    const nutrition = await this.nutritionCalculator.calculate(input.ingredients)
    const cost = await this.costCalculator.calculate(input.ingredients, sppgId)

    // 3. Create entity
    const menu = await this.menuRepository.create({
      ...validated.data,
      nutrition,
      cost,
      sppgId
    })

    return ServiceResult.success(menu)
  }
}
```

### Repository Pattern
```typescript
// src/domains/menu/repositories/menuRepository.ts
export class MenuRepository {
  constructor(private db: PrismaClient) {}

  async findBySppgId(sppgId: string): Promise<Menu[]> {
    return this.db.nutritionMenu.findMany({
      where: {
        program: {
          sppgId
        }
      },
      include: {
        program: true,
        ingredients: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
  }

  async create(data: CreateMenuData): Promise<Menu> {
    return this.db.nutritionMenu.create({
      data,
      include: {
        program: true,
        ingredients: {
          include: {
            inventoryItem: true
          }
        }
      }
    })
  }
}
```

---

## 🌙 Dark Mode Implementation

### Theme Configuration
```typescript
// src/lib/theme.ts
export const themeConfig = {
  colors: {
    light: {
      primary: 'hsl(222.2 84% 4.9%)',
      secondary: 'hsl(210 40% 96%)',
      muted: 'hsl(210 40% 96%)',
      accent: 'hsl(210 40% 96%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      card: 'hsl(0 0% 100%)',
      border: 'hsl(214.3 31.8% 91.4%)',
    },
    dark: {
      primary: 'hsl(210 40% 98%)',
      secondary: 'hsl(217.2 32.6% 17.5%)',
      muted: 'hsl(217.2 32.6% 17.5%)',
      accent: 'hsl(217.2 32.6% 17.5%)',
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)',
      card: 'hsl(222.2 84% 4.9%)',
      border: 'hsl(217.2 32.6% 17.5%)',
    }
  }
}
```

### Dark Mode Components
```typescript
// src/components/ui/card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          // Dark mode automatically applied via CSS variables
          variant === 'outlined' && 'border-2',
          variant === 'elevated' && 'shadow-lg',
          className
        )}
        {...props}
      />
    )
  }
)
```

### Theme Provider Setup
```typescript
// src/components/ui/theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
```

---

## � shadcn/ui Component Library

### Core Component Setup

#### Installation & Configuration
```bash
# Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button card input label select textarea
npx shadcn@latest add form table dialog sheet dropdown-menu
npx shadcn@latest add toast sonner badge avatar tabs
npx shadcn@latest add accordion alert-dialog calendar
npx shadcn@latest add checkbox radio-group switch slider
npx shadcn@latest add navigation-menu pagination breadcrumb
npx shadcn@latest add progress separator skeleton
```

#### Components Configuration
```typescript
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Enterprise UI Components

#### Enhanced Button Component
```typescript
// src/components/ui/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

#### Enhanced Card Component
```typescript
// src/components/ui/card.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: '',
        outlined: 'border-2 border-border',
        elevated: 'shadow-lg dark:shadow-primary/5',
        interactive: 'hover:shadow-md transition-shadow cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants 
}
```

### shadcn/ui Form Integration (React Hook Form + Zod)

#### Complete Form Components
```typescript
// src/features/sppg/menu/components/MenuForm.tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCreateMenu } from '@/features/sppg/menu/hooks'
import { menuSchema, type MenuInput } from '@/features/sppg/menu/schemas'
import { CalendarDays, Users, DollarSign } from 'lucide-react'

interface MenuFormProps {
  programId: string
  onSuccess?: () => void
}

export function MenuForm({ programId, onSuccess }: MenuFormProps) {
  const { mutate: createMenu, isPending } = useCreateMenu()

  const form = useForm<MenuInput>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      programId,
      menuName: '',
      menuCode: '',
      mealType: 'SNACK',
      servingSize: 200,
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      costPerServing: 0,
    },
  })

  const onSubmit = (data: MenuInput) => {
    createMenu(data, {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      }
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Buat Menu Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <Badge variant="outline">Informasi Dasar</Badge>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="menuName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Menu</FormLabel>
                      <FormControl>
                        <Input placeholder="Nasi Gudeg Ayam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Makanan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis makanan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BREAKFAST">Sarapan</SelectItem>
                          <SelectItem value="SNACK">Makanan Tambahan</SelectItem>
                          <SelectItem value="LUNCH">Makan Siang</SelectItem>
                          <SelectItem value="DINNER">Makan Malam</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Nutrition Information */}
            <div className="space-y-4">
              <Badge variant="secondary">Informasi Gizi</Badge>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kalori (kal)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="350"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costPerServing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Biaya per Porsi
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="8500"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Biaya dalam Rupiah per porsi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" size="lg">
                Batal
              </Button>
              <Button type="submit" disabled={isPending} size="lg">
                {isPending ? 'Menyimpan...' : 'Simpan Menu'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### Data Display Components

#### Enterprise Data Table
```typescript
// src/features/sppg/menu/components/MenuTable.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'

interface Menu {
  id: string
  menuName: string
  mealType: string
  servingSize: number
  calories: number
  protein: number
  costPerServing: number
}

interface MenuTableProps {
  data: Menu[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export function MenuTable({ data, onEdit, onDelete, onView }: MenuTableProps) {
  const columns: ColumnDef<Menu>[] = [
    {
      accessorKey: 'menuName',
      header: 'Nama Menu',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('menuName')}</div>
      ),
    },
    {
      accessorKey: 'mealType',
      header: 'Jenis',
      cell: ({ row }) => {
        const mealType = row.getValue('mealType') as string
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
          BREAKFAST: 'default',
          SNACK: 'secondary',
          LUNCH: 'default',
          DINNER: 'destructive',
        }
        
        return (
          <Badge variant={variants[mealType] || 'secondary'}>
            {mealType === 'BREAKFAST' && 'Sarapan'}
            {mealType === 'SNACK' && 'Snack'}
            {mealType === 'LUNCH' && 'Makan Siang'}
            {mealType === 'DINNER' && 'Makan Malam'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'servingSize',
      header: 'Porsi (g)',
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('servingSize')}</div>
      ),
    },
    {
      accessorKey: 'calories',
      header: 'Kalori',
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('calories')} kal</div>
      ),
    },
    {
      accessorKey: 'protein',
      header: 'Protein',
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('protein')} g</div>
      ),
    },
    {
      accessorKey: 'costPerServing',
      header: 'Biaya',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('costPerServing'))
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(amount)

        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const menu = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(menu.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(menu.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Menu
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(menu.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Menu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="menuName"
      searchPlaceholder="Cari menu..."
    />
  )
}
```

### Component Standards & Best Practices

#### shadcn/ui Component Usage Rules
1. **Always use shadcn/ui components** - Never create custom UI primitives
2. **Extend with variants** - Use cva for component variations
3. **Dark mode support** - All components automatically support dark mode via CSS variables
4. **Accessibility first** - All components are built on Radix UI primitives
5. **TypeScript strict** - All components are fully typed with proper interfaces
6. **Consistent styling** - Use Tailwind classes with design system tokens

#### Component Organization
```typescript
// Feature component structure
src/features/sppg/menu/components/
├── MenuCard.tsx          # Card display component
├── MenuForm.tsx          # Form with React Hook Form + Zod
├── MenuTable.tsx         # Data table with sorting/filtering
├── MenuDialog.tsx        # Modal dialogs
├── MenuStats.tsx         # Statistics cards
└── index.ts             # Export barrel
```

---

## �🌱 Prisma Seed Architecture

### Master Seed File
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { seedSppg } from './seeds/sppg-seed'
import { seedUsers } from './seeds/user-seed'
import { seedNutrition } from './seeds/nutrition-seed'
import { seedInventory } from './seeds/inventory-seed'
import { seedProcurement } from './seeds/procurement-seed'
import { seedDemo } from './seeds/demo-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Core Platform Data
    console.log('📊 Seeding SPPG entities...')
    const sppgs = await seedSppg(prisma)

    console.log('👥 Seeding users and roles...')
    const users = await seedUsers(prisma, sppgs)

    // 2. Master Data
    console.log('🥗 Seeding nutrition data...')
    await seedNutrition(prisma)

    console.log('📦 Seeding inventory items...')
    await seedInventory(prisma, sppgs)

    // 3. Operational Data
    console.log('🛒 Seeding procurement data...')
    await seedProcurement(prisma, sppgs)

    // 4. Demo Data (Optional)
    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('🎭 Seeding demo data...')
      await seedDemo(prisma, sppgs)
    }

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

### Partial Seed Files Structure
```typescript
// prisma/seeds/sppg-seed.ts
import { PrismaClient, Sppg } from '@prisma/client'

export async function seedSppg(prisma: PrismaClient): Promise<Sppg[]> {
  console.log('  → Creating SPPG entities...')

  const sppgs = await Promise.all([
    // Production SPPG
    prisma.sppg.upsert({
      where: { sppgCode: 'SPPG-JKT-001' },
      update: {},
      create: {
        sppgName: 'SPPG Jakarta Pusat',
        sppgCode: 'SPPG-JKT-001',
        address: 'Jl. MH Thamrin No. 1, Jakarta Pusat',
        phone: '021-12345678',
        email: 'jakarta.pusat@sppg.id',
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
        subscriptionStatus: 'ACTIVE',
        isDemoAccount: false,
        maxBeneficiaries: 10000,
        allowedFeatures: [
          'MENU_MANAGEMENT',
          'PROCUREMENT',
          'PRODUCTION',
          'DISTRIBUTION',
          'REPORTING',
          'ANALYTICS'
        ]
      }
    }),

    // Demo SPPG
    prisma.sppg.upsert({
      where: { sppgCode: 'DEMO-SPPG-001' },
      update: {},
      create: {
        sppgName: 'Demo SPPG',
        sppgCode: 'DEMO-SPPG-001',
        address: 'Demo Address',
        phone: '021-00000000',
        email: 'demo@sppg.id',
        status: 'ACTIVE',
        subscriptionPlan: 'TRIAL',
        subscriptionStatus: 'TRIAL',
        isDemoAccount: true,
        demoExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        demoMaxBeneficiaries: 100,
        demoAllowedFeatures: [
          'MENU_MANAGEMENT',
          'PROCUREMENT',
          'BASIC_REPORTING'
        ]
      }
    })
  ])

  console.log(`  ✓ Created ${sppgs.length} SPPG entities`)
  return sppgs
}
```

```typescript
// prisma/seeds/nutrition-seed.ts
import { PrismaClient } from '@prisma/client'

export async function seedNutrition(prisma: PrismaClient) {
  console.log('  → Creating nutrition reference data...')

  // Food categories
  const foodCategories = await Promise.all([
    prisma.foodCategory.upsert({
      where: { name: 'Protein Hewani' },
      update: {},
      create: {
        name: 'Protein Hewani',
        description: 'Sumber protein dari hewan'
      }
    }),
    prisma.foodCategory.upsert({
      where: { name: 'Protein Nabati' },
      update: {},
      create: {
        name: 'Protein Nabati',
        description: 'Sumber protein dari tumbuhan'
      }
    }),
    prisma.foodCategory.upsert({
      where: { name: 'Karbohidrat' },
      update: {},
      create: {
        name: 'Karbohidrat',
        description: 'Sumber energi utama'
      }
    })
  ])

  // Nutrition standards for different age groups
  await Promise.all([
    prisma.nutritionStandard.upsert({
      where: { 
        ageGroup_gender: {
          ageGroup: 'BALITA_2_5',
          gender: 'MALE'
        }
      },
      update: {},
      create: {
        ageGroup: 'BALITA_2_5',
        gender: 'MALE',
        calories: 1125,
        protein: 25,
        carbohydrates: 155,
        fat: 44,
        fiber: 16,
        calcium: 650,
        iron: 8,
        vitaminA: 400,
        vitaminC: 40
      }
    })
  ])

  console.log('  ✓ Created nutrition reference data')
}
```

### Prisma Seed Architecture

#### **Seed File Organization**
```
prisma/
├── seed.ts                    # Master seed file
└── seeds/                     # Model-specific seed files
    ├── sppg-seed.ts          # SPPG entities
    ├── user-seed.ts          # Users & roles
    ├── nutrition-seed.ts     # Nutrition data
    ├── inventory-seed.ts     # Inventory items
    ├── procurement-seed.ts   # Procurement data
    ├── menu-seed.ts          # Menu and recipes
    ├── production-seed.ts    # Production data
    ├── distribution-seed.ts  # Distribution data
    ├── regional-seed.ts      # Indonesian regional data
    └── demo-seed.ts          # Demo data
```

#### **Master Seed File Pattern**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { seedSppg } from './seeds/sppg-seed'
import { seedUsers } from './seeds/user-seed'
import { seedNutrition } from './seeds/nutrition-seed'
import { seedInventory } from './seeds/inventory-seed'
import { seedProcurement } from './seeds/procurement-seed'
import { seedDemo } from './seeds/demo-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Core Platform Data
    console.log('📊 Seeding SPPG entities...')
    const sppgs = await seedSppg(prisma)

    console.log('👥 Seeding users and roles...')
    const users = await seedUsers(prisma, sppgs)

    // 2. Master Data
    console.log('🥗 Seeding nutrition data...')
    await seedNutrition(prisma)

    console.log('📦 Seeding inventory items...')
    await seedInventory(prisma, sppgs)

    // 3. Operational Data
    console.log('🛒 Seeding procurement data...')
    await seedProcurement(prisma, sppgs)

    // 4. Demo Data (Optional)
    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('🎭 Seeding demo data...')
      await seedDemo(prisma, sppgs)
    }

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

#### **Individual Seed File Pattern**
```typescript
// prisma/seeds/{model}-seed.ts
import { PrismaClient, {ModelName} } from '@prisma/client'

export async function seed{ModelName}(
  prisma: PrismaClient,
  dependencies?: any[]
): Promise<{ModelName}[]> {
  console.log('  → Creating {ModelName} entities...')

  const entities = await Promise.all([
    prisma.{modelName}.upsert({
      where: { uniqueField: 'value' },
      update: {},
      create: {
        // Entity data with relationships
        field: 'value',
        relationId: dependencies?.[0]?.id
      }
    })
  ])

  console.log(`  ✓ Created ${entities.length} {ModelName} entities`)
  return entities
}
```

### Seed Commands in package.json
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:demo": "SEED_DEMO_DATA=true tsx prisma/seed.ts", 
    "db:seed:dev": "NODE_ENV=development tsx prisma/seed.ts",
    "db:seed:model": "tsx prisma/seeds/{model}-seed.ts",
    "db:reset": "prisma migrate reset --force && npm run db:seed"
  }
}
```

---

## 🔐 User Roles & Permissions

### Platform Level Roles
```typescript
SUPERADMIN           // Full platform access
PLATFORM_SUPPORT     // Customer support
PLATFORM_ANALYST     // Analytics only
```

### SPPG Level Roles (Tenant Users)
```typescript
// Management
SPPG_KEPALA         // Kepala SPPG - Full SPPG access
SPPG_ADMIN          // Administrator SPPG

// Operational
SPPG_AHLI_GIZI      // Ahli Gizi - Menu & nutrition
SPPG_AKUNTAN        // Akuntan - Financial
SPPG_PRODUKSI_MANAGER
SPPG_DISTRIBUSI_MANAGER
SPPG_HRD_MANAGER

// Staff
SPPG_STAFF_DAPUR
SPPG_STAFF_DISTRIBUSI
SPPG_STAFF_ADMIN
SPPG_STAFF_QC

// Limited
SPPG_VIEWER         // Read-only
DEMO_USER           // Demo account
```

### Marketing Level
```typescript
DEMO_REQUEST        // User requesting demo
PROSPECT            // Prospective customer
```

---

## 📁 Struktur Folder

```
bagizi-id/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Layer 1: Public
│   │   │   ├── page.tsx
│   │   │   ├── features/
│   │   │   ├── pricing/
│   │   │   ├── blog/
│   │   │   └── case-studies/
│   │   │
│   │   ├── (auth)/                # Authentication
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── demo-request/
│   │   │
│   │   ├── (sppg)/                # Layer 2: SPPG Operations
│   │   │   ├── dashboard/
│   │   │   ├── menu/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │   ├── procurement/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── plan/
│   │   │   │   └── orders/
│   │   │   ├── production/
│   │   │   ├── distribution/
│   │   │   ├── inventory/
│   │   │   ├── hrd/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── (admin)/               # Layer 3: Platform Admin
│   │   │   ├── admin/
│   │   │   ├── sppg/              # Manage all SPPG
│   │   │   ├── subscriptions/
│   │   │   ├── billing/
│   │   │   ├── analytics/
│   │   │   ├── demo-requests/
│   │   │   └── platform-settings/
│   │   │
│   │   ├── api/                   # API Endpoints (NOT Server Actions)
│   │   │   ├── auth/
│   │   │   ├── sppg/              # SPPG API Routes
│   │   │   │   ├── menu/
│   │   │   │   │   ├── route.ts   # GET, POST /api/sppg/menu
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts # GET, PUT, DELETE /api/sppg/menu/[id]
│   │   │   │   ├── procurement/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── plans/
│   │   │   │   │   └── orders/
│   │   │   │   ├── production/
│   │   │   │   ├── distribution/
│   │   │   │   ├── inventory/
│   │   │   │   ├── hrd/
│   │   │   │   └── reports/
│   │   │   └── admin/             # Admin API Routes  
│   │   │       ├── sppg/
│   │   │       │   ├── route.ts   # GET, POST /api/admin/sppg
│   │   │       │   └── [id]/
│   │   │       ├── billing/
│   │   │       ├── analytics/
│   │   │       └── platform-settings/
│   │   │
│   │   └── providers.tsx
│   │
│   ├── features/                  # Feature-Based Modular Architecture
│   │   ├── sppg/                  # SPPG Features (Robust Modules)
│   │   │   ├── menu/
│   │   │   │   ├── components/    # MenuList, MenuForm, MenuCard
│   │   │   │   ├── hooks/         # useMenus, useCreateMenu, useMenuMutations
│   │   │   │   ├── stores/        # menuStore.ts, menuSelectors.ts
│   │   │   │   ├── schemas/       # menuSchema.ts, menuRequest.ts, menuResponse.ts
│   │   │   │   ├── types/         # menu.types.ts, nutrition.types.ts
│   │   │   │   ├── lib/           # menuUtils.ts, nutritionCalculator.ts
│   │   │   │   └── api/           # menuApi.ts (calls /api/sppg/menu)
│   │   │   ├── procurement/       # Procurement Management
│   │   │   │   ├── components/    # ProcurementList, SupplierSelect
│   │   │   │   ├── hooks/         # useProcurement, useSuppliers
│   │   │   │   ├── stores/        # procurementStore.ts
│   │   │   │   ├── schemas/       # procurementSchema.ts
│   │   │   │   ├── types/         # procurement.types.ts
│   │   │   │   ├── lib/           # procurementUtils.ts
│   │   │   │   └── api/           # procurementApi.ts
│   │   │   ├── production/
│   │   │   ├── distribution/
│   │   │   ├── inventory/
│   │   │   ├── hrd/
│   │   │   └── reports/
│   │   │
│   │   └── admin/                 # Admin Features (Robust Modules)
│   │       ├── sppg-management/
│   │       │   ├── components/    # SppgList, SppgCard, SppgForm
│   │       │   ├── hooks/         # useSppgs, useCreateSppg
│   │       │   ├── stores/        # sppgManagementStore.ts
│   │       │   ├── schemas/       # sppgSchema.ts
│   │       │   ├── types/         # sppg-management.types.ts
│   │       │   ├── lib/           # sppgUtils.ts, tenantManager.ts
│   │       │   └── api/           # sppgApi.ts (calls /api/admin/sppg)
│   │       ├── billing/
│   │       ├── analytics/
│   │       └── platform-settings/
│   │
│   ├── components/
│   │   │   ├── analytics/
│   │   │   ├── billing/
│   │   │   └── platform-settings/
│   │   ├── shared/                # Cross-layer shared components
│   │   │   ├── layouts/           # Layout components
│   │   │   ├── navigation/        # Navigation components
│   │   │   ├── forms/             # Generic form components
│   │   │   ├── data-display/      # Tables, cards, etc.
│   │   │   └── feedback/          # Toasts, modals, etc.
│   │   └── ui/                    # UI primitives with dark mode
│   │       ├── button.tsx         # Dark mode variants
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── modal.tsx
│   │       ├── toast.tsx
│   │       ├── theme-toggle.tsx   # Dark mode toggle
│   │       └── theme-provider.tsx # Dark mode provider
│   │
│   ├── lib/
│   │   ├── auth.ts                # Auth.js config
│   │   ├── db.ts                  # Prisma client
│   │   ├── permissions.ts         # RBAC logic
│   │   ├── theme.ts               # Theme configuration
│   │   └── utils.ts
│   │
│   ├── stores/                    # Zustand stores (Modular)
│   │   ├── theme/
│   │   │   └── themeStore.ts      # Dark mode state
│   │   ├── auth/
│   │   │   └── authStore.ts
│   │   ├── sppg/
│   │   │   ├── menuStore.ts
│   │   │   ├── procurementStore.ts
│   │   │   └── productionStore.ts
│   │   └── admin/
│   │       ├── adminStore.ts
│   │       └── analyticsStore.ts
│   │
│   ├── domains/                   # Domain-specific logic
│   │   ├── menu/
│   │   │   ├── services/          # Business logic
│   │   │   ├── repositories/      # Data access layer
│   │   │   └── validators/        # Domain validation
│   │   ├── procurement/
│   │   ├── production/
│   │   └── distribution/
│   │
│   ├── schemas/
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── procurement.ts
│   │   ├── production.ts
│   │   ├── distribution.ts
│   │   ├── inventory.ts
│   │   └── subscription.ts
│   │
│   ├── hooks/
│   │   ├── theme/
│   │   │   └── useTheme.ts        # Dark mode hook
# Note: SPPG hooks are in components/sppg/{domain}/hooks/ following Pattern 2
│   │   └── admin/                 # Admin hooks
│   │       ├── useSppgs.ts
│   │       └── useSubscriptions.ts
│   │

│   └── types/
│       ├── index.ts
│       ├── theme.ts               # Theme types
│       └── auth.ts                # Auth-specific types
│       # Note: Domain types are in components/sppg/{domain}/types/ following Pattern 2
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                    # Master seed file
│   └── seeds/                     # Partial seed files
│       ├── sppg-seed.ts          # SPPG entities
│       ├── user-seed.ts          # Users & roles
│       ├── nutrition-seed.ts     # Nutrition data
│       ├── inventory-seed.ts     # Inventory items
│       ├── procurement-seed.ts   # Procurement data
│       └── demo-seed.ts          # Demo data
└── middleware.ts
```

---

## 🔒 Multi-Tenancy Architecture

### SPPG sebagai Tenant
```typescript
// CRITICAL: Setiap query SPPG data HARUS filter by sppgId
const menus = await db.nutritionMenu.findMany({
  where: {
    program: {
      sppgId: session.user.sppgId  // MANDATORY!
    }
  }
})
```

### Data Isolation Rules
1. **SPPG User** hanya bisa akses data SPPG mereka sendiri
2. **SUPERADMIN** bisa akses semua SPPG data
3. **DEMO_USER** hanya akses demo SPPG dengan batasan fitur

---

## 📐 Coding Standards

### 1. API Endpoint Pattern (Multi-tenant Safe)

```typescript
// src/app/api/sppg/menu/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { menuSchema } from '@/features/sppg/menu/schemas'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Role Check
    if (!canManageMenu(session.user.userRole)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 3. SPPG Access Check (CRITICAL FOR MULTI-TENANCY!)
    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG not found or access denied' }, { status: 403 })
    }

    // 4. Parse Request Body
    const body = await request.json()
    
    // 5. Validation
    const validated = menuSchema.safeParse(body)
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.errors
      }, { status: 400 })
    }

    // 6. Business Logic with sppgId
    const menu = await db.nutritionMenu.create({
      data: {
        ...validated.data,
        program: {
          connect: {
            id: validated.data.programId
          }
        }
      },
      include: {
        program: {
          select: {
            sppgId: true
          }
        }
      }
    })

    // Verify created menu belongs to user's SPPG
    if (menu.program.sppgId !== session.user.sppgId) {
      await db.nutritionMenu.delete({ where: { id: menu.id } })
      return Response.json({ error: 'Access violation' }, { status: 403 })
    }
    
    return Response.json({ success: true, data: menu }, { status: 201 })
  } catch (error) {
    console.error('Create menu error:', error)
    return Response.json({ 
      error: 'Failed to create menu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
```

### 2. Client-side API Call Pattern

```typescript
// src/features/sppg/menu/api/menuApi.ts
import { MenuInput, MenuResponse } from '@/features/sppg/menu/types'

export const menuApi = {
  // Create new menu
  async create(data: MenuInput): Promise<ApiResponse<MenuResponse>> {
    const response = await fetch('/api/sppg/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create menu')
    }

    return response.json()
  },

  // Get all menus (auto-filtered by sppgId on server)
  async getAll(): Promise<ApiResponse<MenuResponse[]>> {
    const response = await fetch('/api/sppg/menu')
    
    if (!response.ok) {
      throw new Error('Failed to fetch menus')
    }

    return response.json()
  },

  // Update menu
  async update(id: string, data: Partial<MenuInput>): Promise<ApiResponse<MenuResponse>> {
    const response = await fetch(`/api/sppg/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update menu')
    }

    return response.json()
  },

  // Delete menu
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`/api/sppg/menu/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete menu')
    }

    return response.json()
  }
}

// Type for consistent API responses
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: any
}
```

### 2a. **CRITICAL: Enterprise API Client Pattern** ⭐

**ALWAYS use centralized API clients instead of direct `fetch()` calls in hooks/stores!**

#### ✅ **Standard API Client Structure**

All API clients MUST follow this enterprise pattern:

```typescript
// src/features/{layer}/{domain}/api/{resource}Api.ts
import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

/**
 * {Resource} API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await resourceApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await resourceApi.getAll(undefined, headers())
 * ```
 */
export const resourceApi = {
  /**
   * Fetch all resources with optional filtering
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async getAll(
    filters?: FilterType,
    headers?: HeadersInit
  ): Promise<ApiResponse<ResourceType[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.field) params.append('field', filters.field)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/resource?${queryString}`
      : `${baseUrl}/api/sppg/resource`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch resources')
    }
    
    return response.json()
  },

  /**
   * Create new resource
   * @param data - Resource creation data
   * @param headers - Optional headers for SSR
   */
  async create(
    data: CreateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ResourceType>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/resource`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create resource')
    }
    
    return response.json()
  },

  /**
   * Update existing resource
   */
  async update(
    id: string,
    data: Partial<UpdateInput>,
    headers?: HeadersInit
  ): Promise<ApiResponse<ResourceType>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/resource/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update resource')
    }
    
    return response.json()
  },

  /**
   * Delete resource
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/resource/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete resource')
    }
    
    return response.json()
  },
}
```

#### 📁 **API Client File Organization**

```
src/features/{layer}/{domain}/
├── api/
│   ├── {resource}Api.ts    # Main API client file
│   ├── index.ts            # Export barrel: export * from './{resource}Api'
│   └── README.md           # API documentation (optional)
├── hooks/
│   └── use{Resource}.ts    # Import API client, use in TanStack Query
├── stores/
│   └── {resource}Store.ts  # Import API client, use in Zustand actions
└── types/
    └── {resource}.types.ts # TypeScript interfaces
```

#### ✅ **Correct Usage in Hooks**

```typescript
// src/features/sppg/menu/hooks/useMenus.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '@/features/sppg/menu/api'  // ✅ Import centralized API
import { toast } from 'sonner'

// Query hook
export function useMenus(filters?: MenuFilters) {
  return useQuery({
    queryKey: ['menus', filters],
    queryFn: async () => {
      const result = await menuApi.getAll(filters)  // ✅ Use API client
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch menus')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000
  })
}

// Mutation hook
export function useCreateMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: MenuInput) => {
      const result = await menuApi.create(data)  // ✅ Use API client
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create menu')
      }
      
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success('Menu created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}
```

#### ❌ **WRONG: Direct fetch() in Hooks**

```typescript
// ❌ NEVER DO THIS - Direct fetch in hooks
export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const response = await fetch('/api/sppg/menu')  // ❌ Wrong!
      return response.json()
    }
  })
}

// ❌ NEVER DO THIS - Internal API object in hooks
const internalApi = {
  async getMenus() {
    const response = await fetch('/api/sppg/menu')  // ❌ Wrong!
    return response.json()
  }
}
```

#### ✅ **Correct Usage in Zustand Stores**

```typescript
// src/features/sppg/dashboard/stores/dashboardStore.ts
import { create } from 'zustand'
import { dashboardApi } from '../api'  // ✅ Import centralized API

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  
  refreshData: async () => {
    const { setLoading, setError } = get()
    setLoading(true)
    
    try {
      const result = await dashboardApi.getDashboard()  // ✅ Use API client
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch dashboard')
      }
      
      set({ data: result.data })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
}))
```

#### 🎯 **API Client Standards Checklist**

When creating or refactoring API clients:

- [ ] **Location**: `src/features/{layer}/{domain}/api/{resource}Api.ts`
- [ ] **Imports**: Use `getBaseUrl()` and `getFetchOptions()` from `@/lib/api-utils`
- [ ] **SSR Support**: All methods accept optional `headers?: HeadersInit` parameter
- [ ] **Return Type**: Always return `Promise<ApiResponse<T>>`
- [ ] **Error Handling**: Check `response.ok` and throw with proper error message
- [ ] **Documentation**: Include JSDoc with `@param`, `@returns`, `@example`
- [ ] **Export**: Export via `api/index.ts` barrel file
- [ ] **No Direct Fetch**: NEVER use `fetch()` directly in hooks/stores

#### 📊 **Benefits of Centralized API Clients**

1. **✅ Single Source of Truth** - All API calls in one place
2. **✅ SSR Ready** - Optional headers support for server-side rendering
3. **✅ Type Safe** - Full TypeScript coverage with proper types
4. **✅ Testable** - Easy to mock API clients in tests
5. **✅ Maintainable** - Changes in one place affect all consumers
6. **✅ Reusable** - Same client used across hooks, stores, components
7. **✅ Documented** - Comprehensive JSDoc with usage examples
8. **✅ Consistent** - Same patterns across entire codebase

#### 🚀 **Real-World Examples**

**Dashboard API Client** (6 methods, 155 lines):
- `src/features/sppg/dashboard/api/dashboardApi.ts`
- Methods: `getStats()`, `getActivities()`, `getNotifications()`, `markNotificationRead()`, `clearNotifications()`, `getDashboard()`

**Allergens API Client** (4 methods, 163 lines):
- `src/features/sppg/menu/api/allergensApi.ts`
- Methods: `getAll()`, `create()`, `update()`, `delete()`

**Programs API Client** (existing):
- `src/features/sppg/menu/api/programsApi.ts`
- Methods: `getAll()`, `create()`, `update()`, etc.

---

### 3. Multi-tenant Query Pattern (Server-side)

```typescript
// ✅ CORRECT: Always filter by sppgId in API endpoints
// src/app/api/sppg/menu/route.ts
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user.sppgId) {
    return Response.json({ error: 'SPPG access required' }, { status: 403 })
  }

  const menus = await db.nutritionMenu.findMany({
    where: {
      program: {
        sppgId: session.user.sppgId  // MANDATORY!
      }
    },
    include: {
      program: {
        select: {
          name: true,
          sppgId: true
        }
      }
    }
  })

  return Response.json({ success: true, data: menus })
}

// ❌ WRONG: Missing sppgId filter - SECURITY RISK!
async function getMenus() {
  return await db.nutritionMenu.findMany() // NO! This exposes all data!
}
```

### 4. TanStack Query Hook Pattern (Client-side)

```typescript
// src/features/sppg/menu/hooks/useMenus.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '@/features/sppg/menu/api/menuApi'
import { MenuInput } from '@/features/sppg/menu/types'
import { toast } from 'sonner'

// Query for fetching menus
export function useMenus() {
  return useQuery({
    queryKey: ['sppg', 'menus'],
    queryFn: () => menuApi.getAll(),
    select: (data) => data.data, // Extract data from API response
  })
}

// Mutation for creating menu
export function useCreateMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: MenuInput) => menuApi.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch menus
      queryClient.invalidateQueries({ queryKey: ['sppg', 'menus'] })
      toast.success('Menu berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat menu')
    }
  })
}

// Mutation for updating menu
export function useUpdateMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuInput> }) => 
      menuApi.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific menu in cache
      queryClient.setQueryData(['sppg', 'menus'], (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((menu: any) => 
            menu.id === variables.id ? response.data : menu
          )
        }
      })
      toast.success('Menu berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui menu')
    }
  })
}

// Mutation for deleting menu
export function useDeleteMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => menuApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove menu from cache
      queryClient.setQueryData(['sppg', 'menus'], (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.filter((menu: any) => menu.id !== deletedId)
        }
      })
      toast.success('Menu berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus menu')
    }
  })
}
```

### 5. Permission Check Helper

```typescript
// src/lib/permissions.ts
import { UserRole, PermissionType } from '@prisma/client'

const rolePermissions: Record<UserRole, PermissionType[]> = {
  // Platform Level
  PLATFORM_SUPERADMIN: ['ALL'],
  PLATFORM_SUPPORT: ['READ', 'REPORTS_VIEW'],
  PLATFORM_ANALYST: ['READ', 'ANALYTICS_VIEW'],

  // SPPG Management
  SPPG_KEPALA: [
    'READ', 'WRITE', 'DELETE', 'APPROVE',
    'MENU_MANAGE', 'PROCUREMENT_MANAGE', 
    'PRODUCTION_MANAGE', 'DISTRIBUTION_MANAGE',
    'FINANCIAL_MANAGE', 'HR_MANAGE'
  ],
  SPPG_ADMIN: [
    'READ', 'WRITE', 'MENU_MANAGE', 
    'PROCUREMENT_MANAGE', 'USER_MANAGE'
  ],

  // SPPG Operational
  SPPG_AHLI_GIZI: [
    'READ', 'WRITE', 'MENU_MANAGE', 
    'QUALITY_MANAGE'
  ],
  SPPG_AKUNTAN: [
    'READ', 'WRITE', 'FINANCIAL_MANAGE', 
    'PROCUREMENT_MANAGE'
  ],
  SPPG_PRODUKSI_MANAGER: [
    'READ', 'WRITE', 'PRODUCTION_MANAGE', 
    'QUALITY_MANAGE'
  ],
  SPPG_DISTRIBUSI_MANAGER: [
    'READ', 'WRITE', 'DISTRIBUTION_MANAGE'
  ],

  // SPPG Staff
  SPPG_STAFF_DAPUR: ['READ', 'PRODUCTION_MANAGE'],
  SPPG_STAFF_DISTRIBUSI: ['READ', 'DISTRIBUTION_MANAGE'],
  SPPG_STAFF_QC: ['READ', 'QUALITY_MANAGE'],
  
  // Limited
  SPPG_VIEWER: ['READ'],
  DEMO_USER: ['READ']
}

export function hasPermission(
  role: UserRole, 
  permission: PermissionType
): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes('ALL') || permissions.includes(permission)
}

export function canManageMenu(role: UserRole): boolean {
  return hasPermission(role, 'MENU_MANAGE')
}

export function canManageProcurement(role: UserRole): boolean {
  return hasPermission(role, 'PROCUREMENT_MANAGE')
}

export async function checkSppgAccess(sppgId: string | null) {
  if (!sppgId) return null
  
  return await db.sppg.findFirst({
    where: {
      id: sppgId,
      status: 'ACTIVE'
    }
  })
}
```

### 6. Middleware Pattern (Multi-role Routing)

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/case-studies')

  // Auth routes
  const isAuthRoute = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/demo-request')

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // SPPG routes
  const isSppgRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/production') ||
    pathname.startsWith('/distribution') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/hrd') ||
    pathname.startsWith('/reports')

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute) {
    const redirectUrl = 
      session.user.userRole === 'PLATFORM_SUPERADMIN' 
        ? '/admin' 
        : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Check admin access
  if (isAdminRoute) {
    const isAdmin = 
      session?.user.userRole === 'PLATFORM_SUPERADMIN' ||
      session?.user.userRole === 'PLATFORM_SUPPORT' ||
      session?.user.userRole === 'PLATFORM_ANALYST'
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Check SPPG access
  if (isSppgRoute) {
    // Must have sppgId
    if (!session?.user.sppgId) {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    // Check if SPPG role
    const isSppgUser = session.user.userRole?.startsWith('SPPG_')
    if (!isSppgUser) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## 🎨 Component Naming Conventions

### By Layer
```typescript
// Marketing Layer
components/marketing/
  - Hero.tsx
  - PricingCard.tsx
  - TestimonialSlider.tsx

// SPPG Layer
components/sppg/
  - menu/MenuCard.tsx
  - menu/MenuForm.tsx
  - procurement/ProcurementTable.tsx
  - production/ProductionSchedule.tsx
  - distribution/DistributionMap.tsx

// Admin Layer
components/admin/
  - SppgTable.tsx
  - SubscriptionCard.tsx
  - PlatformAnalytics.tsx
```

### Database Model Naming
```typescript
// Your schema already follows this!
SPPG                     // Tenant entity
User                     // User with sppgId
NutritionProgram         // Belongs to SPPG
NutritionMenu            // Belongs to Program
Procurement              // Belongs to SPPG
FoodProduction           // Belongs to SPPG
FoodDistribution         // Belongs to SPPG
```

---

## 🔍 Key Business Logic Patterns

### Menu Planning Flow
```typescript
// 1. Create Nutrition Program (SPPG Level)
NutritionProgram → sppgId required

// 2. Create Menus for Program
NutritionMenu → programId → program.sppgId

// 3. Add Ingredients
MenuIngredient → menuId → connects to InventoryItem

// 4. Calculate Nutrition & Cost
MenuNutritionCalculation
MenuCostCalculation
```

### Procurement Flow
```typescript
// 1. Create Procurement Plan
ProcurementPlan → sppgId required

// 2. Create Procurement Orders
Procurement → sppgId + planId

// 3. Add Items
ProcurementItem → inventoryItemId

// 4. Update Inventory
StockMovement → automatic on procurement completion
```

### Production Flow
```typescript
// 1. Schedule Production
FoodProduction → sppgId + programId + menuId

// 2. Quality Control
QualityControl → productionId

// 3. Distribution
FoodDistribution → sppgId + productionId
```

---

## ⚡ Critical Security Rules

### ✅ DO (Enterprise Security)
- Always filter by `sppgId` for SPPG users with database-level isolation
- Check `session.user.sppgId` in every server action with JWT validation
- Use `checkSppgAccess()` helper with rate limiting protection
- Validate role permissions with fine-grained RBAC before operations
- Use Prisma `include` with ownership checks and field-level permissions
- Log all sensitive operations in `AuditLog` with tamper-proof timestamps
- Implement CSRF protection on all state-changing operations
- Use input sanitization and SQL injection prevention
- Apply rate limiting per user/IP with exponential backoff
- Encrypt sensitive data at rest with AES-256 encryption
- Use HTTPS everywhere with HSTS headers
- Implement proper session management with secure cookies

### ❌ DON'T (Security Violations)
- Don't trust any client-side data including `sppgId`
- Don't skip ownership verification or rely on client-side checks
- Don't expose other SPPG data to unauthorized users (data leakage)
- Don't allow privilege escalation or cross-tenant data access
- Don't use raw SQL without parameterization (SQL injection risk)
- Don't log sensitive data (PII, passwords, tokens) in plain text
- Don't expose internal errors or stack traces to end users
- Don't store secrets in client-side code or environment variables
- Don't implement authentication/authorization logic on the frontend
- Don't skip input validation or trust user-supplied data

### 🔒 Enterprise Compliance Requirements
```typescript
// Security Compliance Checklist
const complianceRequirements = {
  authentication: {
    mfa: true,                    // Multi-factor authentication
    sessionTimeout: '8 hours',    // Auto-logout for security
    passwordPolicy: 'Strong',     // Minimum 12 chars + complexity
    accountLockout: '5 attempts'  // Brute force protection
  },
  dataProtection: {
    encryption: 'AES-256',        // Data at rest encryption
    transmission: 'TLS 1.3',      // Data in transit encryption
    backups: 'Encrypted',         // Backup encryption
    retention: '7 years',         // Data retention policy
    rightToErasure: true          // GDPR compliance
  },
  auditTrail: {
    allUserActions: true,         // Complete audit log
    immutableLogs: true,          // Tamper-proof logging
    logRetention: '10 years',     // Compliance requirement
    realTimeAlerts: true          // Security incident detection
  },
  accessControl: {
    rbac: true,                   // Role-based access control
    principleOfLeastPrivilege: true, // Minimal permissions
    regularAccessReview: true,    // Quarterly access audit
    segregationOfDuties: true     // No single point of control
  }
}
```

---

## 📊 Example SPPG Component (shadcn/ui + Dark Mode)

```typescript
// src/components/sppg/menu/MenuCard.tsx
'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { useDeleteMenu } from '@/hooks/sppg/useMenu'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MenuCardProps {
  menu: {
    id: string
    menuName: string
    mealType: string
    servingSize: number
    calories: number
    protein: number
    costPerServing: number
    program: {
      name: string
    }
  }
  variant?: 'default' | 'compact'
}

export const MenuCard: FC<MenuCardProps> = ({ menu, variant = 'default' }) => {
  const { mutate: deleteMenu, isPending } = useDeleteMenu()

  const handleDelete = () => {
    if (confirm(`Hapus menu "${menu.menuName}"?`)) {
      deleteMenu(menu.id)
    }
  }

  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      variant === 'compact' && 'p-4'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={cn(
            'font-semibold text-foreground',
            variant === 'compact' ? 'text-lg' : 'text-xl'
          )}>
            {menu.menuName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {menu.program.name} • {menu.mealType}
          </p>
        </div>
        <Badge 
          variant="secondary" 
          className="ml-4 bg-primary/10 text-primary dark:bg-primary/20"
        >
          {menu.servingSize}g
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground">Kalori</span>
          <p className="font-semibold text-foreground">
            {menu.calories} kal
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Protein</span>
          <p className="font-semibold text-foreground">
            {menu.protein}g
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Biaya</span>
          <p className="font-semibold text-foreground">
            Rp {menu.costPerServing.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/menu/${menu.id}`}>
            Lihat Detail
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/menu/${menu.id}/edit`}>
            Edit
          </Link>
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isPending}
          variant="outline"
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 dark:border-destructive/50 dark:hover:bg-destructive/20"
        >
          {isPending ? 'Menghapus...' : 'Hapus'}
        </Button>
      </div>
    </Card>
  )
}
```

### Dark Mode UI Components Examples

```typescript
// src/components/ui/button.tsx (Dark Mode Support)
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:hover:bg-destructive/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-border dark:hover:bg-accent/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary/60',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/30',
        link: 'text-primary underline-offset-4 hover:underline dark:text-primary-foreground'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)
```

```typescript
// src/components/shared/layouts/SppgLayout.tsx (Dark Mode Layout)
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/navigation/Sidebar'
import { TopBar } from '@/components/shared/navigation/TopBar'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { cn } from '@/lib/utils'

interface SppgLayoutProps {
  children: React.ReactNode
}

export function SppgLayout({ children }: SppgLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar 
            open={sidebarOpen} 
            onOpenChange={setSidebarOpen}
            className="hidden lg:flex lg:flex-col lg:w-64"
          />

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar onMenuClick={() => setSidebarOpen(true)} />
            
            <main className={cn(
              'flex-1 overflow-y-auto',
              'bg-muted/30 dark:bg-background',
              'p-4 lg:p-6'
            )}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
```

```typescript
// src/components/shared/navigation/ThemeToggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 🎯 Demo System Pattern

```typescript
// Demo SPPG has special flags
const demoSppg = await db.sppg.findFirst({
  where: {
    id: session.user.sppgId,
    isDemoAccount: true
  }
})

if (demoSppg) {
  // Check demo expiry
  if (demoSppg.demoExpiresAt && new Date() > demoSppg.demoExpiresAt) {
    return { success: false, error: 'Demo expired' }
  }

  // Check feature access
  if (!demoSppg.demoAllowedFeatures.includes(featureName)) {
    return { success: false, error: 'Feature not available in demo' }
  }

  // Check limits
  const beneficiaryCount = await db.schoolBeneficiary.count({
    where: {
      program: {
        sppgId: demoSppg.id
      }
    }
  })

  if (beneficiaryCount >= (demoSppg.demoMaxBeneficiaries || 100)) {
    return { 
      success: false, 
      error: 'Demo limit reached. Upgrade to continue.' 
    }
  }
}
```

---

## 📝 Code Generation Guidelines

When generating code for Bagizi-ID:

1. **Identify Layer**: Marketing / SPPG / Admin
2. **Use API Endpoints**: Create REST API routes in `/api/` directory (NOT server actions)
3. **Use Centralized API Clients**: ALWAYS use API clients from `src/features/{layer}/{domain}/api/` (see Section 2a)
4. **Use shadcn/ui Components**: Always use shadcn/ui primitives, never create custom UI
5. **Check Role Requirements**: What roles can access this?
6. **Implement Multi-tenancy**: Always include `sppgId` filtering in API endpoints
7. **Follow Feature Architecture**: Use `src/features/{feature}/` modular structure
8. **Follow Naming**: Use schema model names exactly
9. **Add Type Safety**: Use Prisma types + Zod validation
10. **Error Handling**: Return proper HTTP status codes with `{ success, data?, error? }`
11. **Client-side API**: Use TanStack Query hooks with API clients (NEVER direct fetch)
12. **Form Integration**: Use React Hook Form + Zod + shadcn/ui form components
13. **Dark Mode Support**: All components automatically support dark mode via CSS variables
14. **Audit Logging**: Log sensitive operations

**CRITICAL**: For API calls in hooks/stores, see **Section 2a** for the complete enterprise API client pattern. NEVER use direct `fetch()` calls!

---

## � Development Scripts & Examples

## 📋 Development SOP (Standard Operating Procedures)

### **CRITICAL: Always Check Existing Files Before Creating New Ones**

#### 🔍 **Pre-Development Validation Steps:**

1. **Schema Validation First**
   - ✅ Check `prisma/schema.prisma` for existing models and relationships
   - ✅ Verify enum types and field definitions before referencing them
   - ✅ Ensure relationships and foreign keys exist in schema
   - ❌ Never assume schema structures exist without verification

2. **File Existence Check**
   - ✅ Always use `read_file` to check existing file content before editing
   - ✅ Use `list_dir` to verify directory structure before creating files
   - ✅ Check `src/lib/`, `src/components/ui/`, and `src/types/` for existing utilities
   - ❌ Never create duplicate files or overwrite existing functionality

3. **Import Path Validation**
   - ✅ Verify `@/lib/prisma`, `@/lib/utils`, `@/components/ui` exports exist
   - ✅ Check existing TypeScript interfaces and types before creating new ones
   - ✅ Use existing Prisma types from `@prisma/client` when available
   - ❌ Never create custom types that already exist in Prisma schema

4. **Component Integration Check**
   - ✅ Verify shadcn/ui components are installed before using them
   - ✅ Check existing form schemas in `src/schemas/` or feature schemas
   - ✅ Use existing hooks and utilities before creating new ones
   - ❌ Never duplicate existing shadcn/ui or utility functionality

#### 📐 **Development Workflow Pattern:**

```typescript
// Step 1: Check Schema First
// Read prisma/schema.prisma to understand data structure

// Step 2: Check Existing Files
// Use read_file to verify existing implementations

// Step 3: Check Dependencies
// Verify imports and types exist before using them

// Step 4: Follow Feature Architecture
// Use src/features/{layer}/{feature}/ structure

// Step 5: Use Existing Components
// Leverage existing shadcn/ui and utility functions
```

#### 🛡️ **Quality Gates Checklist:**

**Before Writing Any Code:**
- [ ] Schema models and enums verified in `prisma/schema.prisma`
- [ ] Existing file content checked with `read_file`
- [ ] Import paths validated for existing exports
- [ ] TypeScript types checked in Prisma client
- [ ] shadcn/ui components availability confirmed

**During Development:**
- [ ] Follow feature-based modular architecture
- [ ] Use existing utilities from `@/lib/utils`
- [ ] Implement proper TypeScript strict typing
- [ ] Include multi-tenant `sppgId` filtering where required
- [ ] Use shadcn/ui components exclusively for UI

**After Implementation:**
- [ ] TypeScript compilation with zero errors
- [ ] All imports resolve correctly
- [ ] Multi-tenant security patterns applied
- [ ] Enterprise patterns followed consistently

#### 🔄 **Integration Priority Order:**

1. **Use Existing Schema** → Check Prisma models first
2. **Use Existing Components** → Leverage shadcn/ui library
3. **Use Existing Utilities** → Check `@/lib/` for helpers
4. **Use Existing Types** → Import from `@prisma/client`
5. **Use Existing Hooks** → Check feature hooks directory
6. **Create New** → Only when existing solutions don't exist

#### 📝 **Documentation Requirements:**

**Every File Must Include:**
```typescript
/**
 * @fileoverview [Brief description of file purpose]
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */
```

**Every Function Must Include:**
```typescript
/**
 * [Function description with business logic context]
 * @param {Type} param - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} Error conditions
 * @example
 * const result = await functionName(param)
 */
```

#### 🎯 **Enterprise Compliance:**

- **Security**: Always implement `sppgId` filtering for multi-tenancy
- **Performance**: Use existing optimized utilities and components
- **Maintainability**: Follow established patterns and conventions
- **Scalability**: Use feature-based architecture consistently
- **Accessibility**: Leverage shadcn/ui accessibility features
- **Type Safety**: Maintain strict TypeScript compliance

### **SOP Violation = Development Halt** ⚠️
- Failure to follow SOP requires immediate code review
- Missing schema validation leads to runtime errors
- Duplicate functionality creates technical debt
- Non-standard patterns break enterprise compliance

---

### Package.json Scripts

#### Core Development Scripts
```json
{
  "scripts": {
    // Development
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    
    // Database Management
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:reset": "prisma migrate reset --force",
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:demo": "SEED_DEMO_DATA=true tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    
    // Docker & Environment
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:reset": "docker-compose down -v && docker-compose up -d",
    
    // shadcn/ui Components
    "ui:add": "npx shadcn@latest add",
    "ui:init": "npx shadcn@latest init",
    "ui:update": "npx shadcn@latest update",
    
    // Testing & Quality
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    
    // Production & Deployment
    "build:analyze": "ANALYZE=true npm run build",
    "preview": "npm run build && npm run start",
    "clean": "rm -rf .next node_modules/.cache",
    
    // Code Quality
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky install"
  }
}
```

### Development Workflow Scripts

#### Quick Setup Script
```bash
#!/bin/bash
# setup-dev.sh - Quick development environment setup

echo "🚀 Setting up Bagizi-ID development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
echo "🔧 Setting up environment..."
cp .env.example .env.local
echo "✏️  Please update .env.local with your database credentials"

# Start Docker services
echo "🐳 Starting Docker services..."
npm run docker:up

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "📊 Pushing database schema..."
npm run db:push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

# Start development server
echo "🏃‍♂️ Starting development server..."
npm run dev
```

#### Database Management Scripts
```bash
#!/bin/bash
# db-reset.sh - Complete database reset and reseed

echo "🗄️ Resetting database..."

# Reset database
npm run db:reset

# Seed with demo data
npm run db:seed:demo

echo "✅ Database reset complete with demo data!"
```

```bash
#!/bin/bash
# db-backup.sh - Create database backup

echo "💾 Creating database backup..."

# Create backup directory
mkdir -p backups

# Generate backup filename with timestamp
BACKUP_FILE="backups/bagizi_$(date +%Y%m%d_%H%M%S).sql"

# Create database dump
docker exec bagizi-postgres pg_dump -U bagizi_user bagizi_db > $BACKUP_FILE

echo "✅ Database backup created: $BACKUP_FILE"
```

#### Component Generation Scripts
```bash
#!/bin/bash
# create-feature.sh - Generate new feature structure

FEATURE_NAME=$1
LAYER=$2  # sppg or admin

if [ -z "$FEATURE_NAME" ] || [ -z "$LAYER" ]; then
  echo "Usage: ./create-feature.sh <feature-name> <sppg|admin>"
  exit 1
fi

echo "🏗️ Creating feature: $FEATURE_NAME for layer: $LAYER"

# Create feature directory structure
mkdir -p "src/features/$LAYER/$FEATURE_NAME"/{components,hooks,stores,schemas,types,lib,api,__tests__}

# Create index files
touch "src/features/$LAYER/$FEATURE_NAME"/components/index.ts
touch "src/features/$LAYER/$FEATURE_NAME"/hooks/index.ts
touch "src/features/$LAYER/$FEATURE_NAME"/stores/index.ts
touch "src/features/$LAYER/$FEATURE_NAME"/schemas/index.ts
touch "src/features/$LAYER/$FEATURE_NAME"/types/index.ts
touch "src/features/$LAYER/$FEATURE_NAME"/lib/index.ts
touch "src/features/$LAYER/$FEATURE_NAME"/api/index.ts

# Create basic component template
cat > "src/features/$LAYER/$FEATURE_NAME/components/${FEATURE_NAME^}List.tsx" << EOF
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ${FEATURE_NAME^}List() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>${FEATURE_NAME^} List</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your ${FEATURE_NAME} component content goes here.</p>
        <Button>Add New ${FEATURE_NAME^}</Button>
      </CardContent>
    </Card>
  )
}
EOF

# Create basic schema template
cat > "src/features/$LAYER/$FEATURE_NAME/schemas/${FEATURE_NAME}Schema.ts" << EOF
import { z } from 'zod'

export const ${FEATURE_NAME}Schema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Name is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type ${FEATURE_NAME^}Input = z.infer<typeof ${FEATURE_NAME}Schema>
export type ${FEATURE_NAME^}Response = Required<${FEATURE_NAME^}Input>
EOF

# Create API template
cat > "src/features/$LAYER/$FEATURE_NAME/api/${FEATURE_NAME}Api.ts" << EOF
import { ${FEATURE_NAME^}Input, ${FEATURE_NAME^}Response } from '../types'

export const ${FEATURE_NAME}Api = {
  async getAll(): Promise<ApiResponse<${FEATURE_NAME^}Response[]>> {
    const response = await fetch('/api/$LAYER/$FEATURE_NAME')
    if (!response.ok) throw new Error('Failed to fetch $FEATURE_NAME')
    return response.json()
  },

  async create(data: ${FEATURE_NAME^}Input): Promise<ApiResponse<${FEATURE_NAME^}Response>> {
    const response = await fetch('/api/$LAYER/$FEATURE_NAME', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create $FEATURE_NAME')
    return response.json()
  },
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
EOF

echo "✅ Feature $FEATURE_NAME created successfully!"
echo "📁 Location: src/features/$LAYER/$FEATURE_NAME/"
```

#### API Route Generation Script
```bash
#!/bin/bash
# create-api.sh - Generate API route structure

RESOURCE=$1
LAYER=$2  # sppg or admin

if [ -z "$RESOURCE" ] || [ -z "$LAYER" ]; then
  echo "Usage: ./create-api.sh <resource-name> <sppg|admin>"
  exit 1
fi

echo "🔌 Creating API routes for: $RESOURCE in layer: $LAYER"

# Create API directory structure
mkdir -p "src/app/api/$LAYER/$RESOURCE"
mkdir -p "src/app/api/$LAYER/$RESOURCE/[id]"

# Create main route file
cat > "src/app/api/$LAYER/$RESOURCE/route.ts" << EOF
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { ${RESOURCE}Schema } from '@/features/$LAYER/$RESOURCE/schemas'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SPPG access check for multi-tenancy
    if (session.user.sppgId) {
      const sppg = await checkSppgAccess(session.user.sppgId)
      if (!sppg) {
        return Response.json({ error: 'SPPG access denied' }, { status: 403 })
      }
    }

    // Fetch data with proper filtering
    const items = await db.${RESOURCE}.findMany({
      where: session.user.sppgId ? { sppgId: session.user.sppgId } : {},
    })

    return Response.json({ success: true, data: items })
  } catch (error) {
    console.error('GET /$LAYER/$RESOURCE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = ${RESOURCE}Schema.safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.errors
      }, { status: 400 })
    }

    // Create new item
    const item = await db.${RESOURCE}.create({
      data: {
        ...validated.data,
        sppgId: session.user.sppgId, // Multi-tenant safety
      }
    })

    return Response.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('POST /$LAYER/$RESOURCE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
EOF

# Create individual item route file
cat > "src/app/api/$LAYER/$RESOURCE/[id]/route.ts" << EOF
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { ${RESOURCE}Schema } from '@/features/$LAYER/$RESOURCE/schemas'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await db.${RESOURCE}.findUnique({
      where: { 
        id: params.id,
        ...(session.user.sppgId && { sppgId: session.user.sppgId })
      }
    })

    if (!item) {
      return Response.json({ error: '${RESOURCE^} not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: item })
  } catch (error) {
    console.error('GET /$LAYER/$RESOURCE/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = ${RESOURCE}Schema.partial().safeParse(body)
    
    if (!validated.success) {
      return Response.json({ 
        error: 'Validation failed',
        details: validated.error.errors
      }, { status: 400 })
    }

    // Update item
    const item = await db.${RESOURCE}.update({
      where: { 
        id: params.id,
        ...(session.user.sppgId && { sppgId: session.user.sppgId })
      },
      data: validated.data
    })

    return Response.json({ success: true, data: item })
  } catch (error) {
    console.error('PUT /$LAYER/$RESOURCE/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete item
    await db.${RESOURCE}.delete({
      where: { 
        id: params.id,
        ...(session.user.sppgId && { sppgId: session.user.sppgId })
      }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('DELETE /$LAYER/$RESOURCE/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
EOF

echo "✅ API routes created successfully!"
echo "📁 Location: src/app/api/$LAYER/$RESOURCE/"
```

### Development Utilities

#### Environment Setup Script
```bash
#!/bin/bash
# env-setup.sh - Setup environment variables

echo "🔧 Setting up environment variables..."

# Create .env.local from template
cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://bagizi_user:bagizi_password@localhost:5432/bagizi_db"

# Auth.js
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Redis (for sessions)
REDIS_URL="redis://localhost:6379"

# Seeding
SEED_DEMO_DATA=true

# Development
NODE_ENV=development
EOF

echo "✅ Environment file created: .env.local"
echo "⚠️  Please update the secret keys and credentials!"
```

#### Code Quality Scripts
```bash
#!/bin/bash
# quality-check.sh - Run all quality checks

echo "🔍 Running code quality checks..."

# TypeScript check
echo "📝 Checking TypeScript..."
npm run type-check

# Linting
echo "🧹 Linting code..."
npm run lint

# Format check
echo "💅 Checking formatting..."
npm run format:check

# Tests
echo "🧪 Running tests..."
npm run test

echo "✅ All quality checks completed!"
```

#### Performance Analysis Script
```bash
#!/bin/bash
# analyze-bundle.sh - Analyze bundle size

echo "📊 Analyzing bundle size..."

# Build with analysis
npm run build:analyze

echo "🔍 Bundle analysis complete!"
echo "📈 Check .next/analyze/ for detailed reports"
```

### Deployment Scripts

#### Production Build Script
```bash
#!/bin/bash
# build-production.sh - Production build with optimizations

echo "🏗️ Building for production..."

# Clean previous builds
npm run clean

# Install dependencies
npm ci

# Run quality checks
npm run lint
npm run type-check
npm run test

# Build application
npm run build

echo "✅ Production build complete!"
```

#### Docker Deployment Script
```bash
#!/bin/bash
# deploy-docker.sh - Deploy with Docker

echo "🐳 Deploying with Docker..."

# Build Docker image
docker build -t bagizi-id:latest .

# Run container
docker run -d \
  --name bagizi-id-app \
  -p 3000:3000 \
  --env-file .env.production \
  bagizi-id:latest

echo "✅ Docker deployment complete!"
echo "🌐 Application available at http://localhost:3000"
```

### Makefile for Easy Command Management

#### Complete Makefile
```makefile
# Bagizi-ID Development Makefile

# Variables
DOCKER_COMPOSE = docker-compose
NODE_MODULES = node_modules
PRISMA_SCHEMA = prisma/schema.prisma
NEXT_BUILD = .next

# Help command
.PHONY: help
help: ## Show this help message
	@echo "Bagizi-ID Development Commands:"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\033[36m%-20s\033[0m %s\n", "Command", "Description"} /^[a-zA-Z_-]+:.*?##/ { printf "\033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development
.PHONY: install
install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm install

.PHONY: dev
dev: ## Start development server
	@echo "🚀 Starting development server..."
	npm run dev

.PHONY: build
build: ## Build production application
	@echo "🏗️ Building application..."
	npm run build

.PHONY: start
start: ## Start production server
	@echo "▶️ Starting production server..."
	npm run start

.PHONY: clean
clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	rm -rf $(NEXT_BUILD) node_modules/.cache
	npm run clean

##@ Database
.PHONY: db-setup
db-setup: ## Setup database (generate + push + seed)
	@echo "🗄️ Setting up database..."
	npm run db:generate
	npm run db:push
	npm run db:seed

.PHONY: db-reset
db-reset: ## Reset database completely
	@echo "🔄 Resetting database..."
	npm run db:reset

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "⚡ Running migrations..."
	npm run db:migrate

.PHONY: db-seed
db-seed: ## Seed database with data
	@echo "🌱 Seeding database..."
	npm run db:seed

.PHONY: db-seed-demo
db-seed-demo: ## Seed database with demo data
	@echo "🎭 Seeding demo data..."
	npm run db:seed:demo

.PHONY: db-studio
db-studio: ## Open Prisma Studio
	@echo "🎨 Opening Prisma Studio..."
	npm run db:studio

##@ Docker
.PHONY: docker-up
docker-up: ## Start Docker containers
	@echo "🐳 Starting Docker containers..."
	$(DOCKER_COMPOSE) up -d

.PHONY: docker-down
docker-down: ## Stop Docker containers
	@echo "🛑 Stopping Docker containers..."
	$(DOCKER_COMPOSE) down

.PHONY: docker-logs
docker-logs: ## Show Docker logs
	@echo "📋 Showing Docker logs..."
	$(DOCKER_COMPOSE) logs -f

.PHONY: docker-reset
docker-reset: ## Reset Docker environment
	@echo "🔄 Resetting Docker environment..."
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d

##@ Code Quality
.PHONY: lint
lint: ## Run linting
	@echo "🔍 Running linter..."
	npm run lint

.PHONY: lint-fix
lint-fix: ## Fix linting issues
	@echo "🔧 Fixing lint issues..."
	npm run lint:fix

.PHONY: format
format: ## Format code
	@echo "💅 Formatting code..."
	npm run format

.PHONY: format-check
format-check: ## Check code formatting
	@echo "📝 Checking formatting..."
	npm run format:check

.PHONY: type-check
type-check: ## Run TypeScript type checking
	@echo "📋 Type checking..."
	npm run type-check

.PHONY: quality
quality: lint format-check type-check ## Run all quality checks
	@echo "✅ All quality checks completed!"

##@ Testing
.PHONY: test
test: ## Run tests
	@echo "🧪 Running tests..."
	npm run test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "👀 Running tests in watch mode..."
	npm run test:watch

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	@echo "📊 Running tests with coverage..."
	npm run test:coverage

.PHONY: test-e2e
test-e2e: ## Run E2E tests
	@echo "🎭 Running E2E tests..."
	npm run test:e2e

##@ UI Components
.PHONY: ui-add
ui-add: ## Add shadcn/ui component (usage: make ui-add COMPONENT=button)
	@echo "🎨 Adding UI component: $(COMPONENT)"
	npx shadcn@latest add $(COMPONENT)

.PHONY: ui-update
ui-update: ## Update all shadcn/ui components
	@echo "🔄 Updating UI components..."
	npx shadcn@latest update

##@ Environment
.PHONY: env-setup
env-setup: ## Setup environment file
	@echo "🔧 Setting up environment..."
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "✅ .env.local created from .env.example"; \
		echo "⚠️  Please update database credentials in .env.local"; \
	else \
		echo "⚠️  .env.local already exists"; \
	fi

##@ Full Setup
.PHONY: setup
setup: install env-setup docker-up db-setup ## Complete project setup
	@echo ""
	@echo "🎉 Bagizi-ID setup complete!"
	@echo "🚀 Run 'make dev' to start development server"

.PHONY: reset
reset: docker-reset db-reset ## Reset entire environment
	@echo "🔄 Environment reset complete!"

##@ Deployment
.PHONY: build-prod
build-prod: clean quality test build ## Production build with quality checks
	@echo "✅ Production build completed!"

.PHONY: deploy-check
deploy-check: ## Pre-deployment checks
	@echo "🔍 Running deployment checks..."
	npm run type-check
	npm run lint
	npm run test
	@echo "✅ Deployment checks passed!"

# Default target
.DEFAULT_GOAL := help
```

### Command Usage Examples

#### Daily Development Workflow
```bash
# Initial setup (first time)
make setup

# Daily development
make docker-up    # Start database services
make dev         # Start development server

# Database operations
make db-reset    # Reset database
make db-seed     # Seed with production data
make db-seed-demo # Seed with demo data
make db-studio   # Open Prisma Studio

# Code quality
make quality     # Run all quality checks
make lint-fix    # Fix linting issues
make format      # Format code

# Testing
make test        # Run unit tests
make test-e2e    # Run E2E tests
make test-coverage # Run with coverage

# UI Components
make ui-add COMPONENT=button     # Add specific component
make ui-add COMPONENT=data-table # Add data table
make ui-update                   # Update all components

# Clean up
make clean       # Clean build artifacts
make reset       # Reset entire environment
```

### VS Code Tasks Integration

#### .vscode/tasks.json
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Setup Development Environment",
      "type": "shell",
      "command": "make",
      "args": ["setup"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": true,
        "clear": false
      },
      "problemMatcher": []
    },
    {
      "label": "Start Development Server",
      "type": "shell",
      "command": "make",
      "args": ["dev"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Database Reset & Seed",
      "type": "shell",
      "command": "make",
      "args": ["db-reset"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Run Quality Checks",
      "type": "shell",
      "command": "make",
      "args": ["quality"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$eslint-stylish", "$tsc"]
    },
    {
      "label": "Build Production",
      "type": "shell",
      "command": "make",
      "args": ["build-prod"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$eslint-stylish", "$tsc"]
    },
    {
      "label": "Add shadcn/ui Component",
      "type": "shell",
      "command": "npx",
      "args": ["shadcn@latest", "add", "${input:componentName}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "componentName",
      "description": "shadcn/ui component name",
      "default": "button",
      "type": "promptString"
    }
  ]
}
```

---

## �🚀 Quick Reference

### Common Queries
```typescript
// Get current SPPG
const sppg = await db.sppg.findUnique({
  where: { id: session.user.sppgId }
})

// Get SPPG programs
const programs = await db.nutritionProgram.findMany({
  where: { sppgId: session.user.sppgId }
})

// Get program menus
const menus = await db.nutritionMenu.findMany({
  where: {
    program: {
      sppgId: session.user.sppgId
    }
  }
})

// Get SPPG inventory
const inventory = await db.inventoryItem.findMany({
  where: { sppgId: session.user.sppgId }
})
```

### Session Structure
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    userRole: UserRole
    sppgId: string | null  // CRITICAL FOR MULTI-TENANCY!
    userType: UserType
  }
}
```

---

## ✅ Validation Examples

```typescript
// src/schemas/menu.ts
import { z } from 'zod'
import { MealType } from '@prisma/client'

export const menuSchema = z.object({
  programId: z.string().cuid(),
  menuName: z.string().min(3, 'Nama menu minimal 3 karakter'),
  menuCode: z.string().min(2),
  mealType: z.nativeEnum(MealType),
  servingSize: z.number().min(1).max(1000),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbohydrates: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0),
  costPerServing: z.number().min(0)
})

export type MenuInput = z.infer<typeof menuSchema>
```

---

---

## ⚡ Enterprise Performance & Scalability

### Performance Optimization Strategy
```typescript
// Performance Budget & Metrics
const performanceBudget = {
  // Core Web Vitals (Enterprise SLA)
  firstContentfulPaint: '<1.5s',     // Critical rendering path
  largestContentfulPaint: '<2.5s',   // Main content visibility
  cumulativeLayoutShift: '<0.1',      // Visual stability
  firstInputDelay: '<100ms',          // Interactivity
  
  // Bundle Size Optimization
  initialBundle: '<300KB',            // First load bundle
  routeBundle: '<150KB',              // Route-based code splitting
  imageOptimization: 'WebP/AVIF',     // Next.js Image optimization
  
  // Database Performance
  queryTime: '<100ms',                // Average query response
  connectionPooling: true,            // Database connection reuse
  indexOptimization: true,            // Proper database indexing
  
  // Caching Strategy
  staticAssets: '1 year',             // CDN caching
  apiResponses: '5 minutes',          // API response caching
  databaseQueries: '1 minute'         // Query result caching
}
```

### Scalability Architecture
```typescript
// Enterprise Scaling Strategy
const scalabilityPlan = {
  horizontal: {
    loadBalancing: 'Auto-scaling',    // Handle traffic spikes
    multiRegion: 'Indonesia-focused', // Jakarta, Surabaya, Medan
    cdn: 'Global edge network',       // Fast content delivery
    microservices: 'Domain-based'     // Service decomposition
  },
  
  vertical: {
    databaseSharding: 'By SPPG',      // Data partitioning
    readReplicas: 'Multiple regions', // Read scaling
    connectionPooling: 'PgBouncer',   // Connection optimization
    caching: 'Redis Cluster'          // Distributed caching
  },
  
  monitoring: {
    realTimeMetrics: true,            // Live performance data
    predictiveScaling: true,          // AI-based scaling
    costOptimization: true,           // Resource efficiency
    alerting: 'Multi-channel'         // Proactive notifications
  }
}
```

### Enterprise Code Quality Standards
```typescript
// Code Quality Enforcement
const qualityGates = {
  // Static Analysis
  typescript: {
    strict: true,                     // No implicit any
    noUnusedLocals: true,            // Clean code
    noUnusedParameters: true,        // Parameter hygiene
    exactOptionalPropertyTypes: true  // Type precision
  },
  
  // Code Style
  eslint: {
    extends: ['@next/next', 'prettier'], // Industry standards
    rules: {
      'complexity': ['error', 10],    // Cyclomatic complexity
      'max-depth': ['error', 4],      // Nesting levels
      'max-lines-per-function': ['error', 50] // Function size
    }
  },
  
  // Testing Requirements
  testing: {
    unitTests: '>=90%',               // Line coverage
    integrationTests: 'All APIs',     // End-to-end coverage
    e2eTests: 'Critical paths',       // User journey testing
    mutationTesting: '>=80%'          // Test quality score
  },
  
  // Documentation
  documentation: {
    apiDocs: 'OpenAPI 3.0',           // API documentation
    codeComments: 'JSDoc standard',   // Inline documentation
    readmeDocs: 'Updated weekly',     // Project documentation
    architectureDocs: 'C4 Model'      // System architecture
  }
}
```

---

## 🎯 Enterprise Development Guidelines

**Dengan konteks enterprise-grade ini, GitHub Copilot akan:**
✅ Generate kode dengan enterprise security standards
✅ Implement performance optimization patterns
✅ Follow scalability best practices
✅ Apply comprehensive error handling
✅ Create accessible and inclusive UI components
✅ Generate production-ready, maintainable code
✅ Include proper monitoring and observability
✅ Follow enterprise compliance requirements
✅ Implement proper caching strategies
✅ Generate comprehensive test coverage
✅ Apply security-first development approach
✅ Create professional, consistent user experiences

**Enterprise-Ready SaaS Platform**: Bagizi-ID siap melayani ribuan SPPG dengan standar enterprise yang tinggi! 🚀

---

## 📐 Pattern 2 Architecture Notes

**CRITICAL: This project follows Pattern 2 (Component-Level Domain Architecture)**

### ✅ Correct Pattern 2 Structure:
```
components/sppg/{domain}/
├── components/     # Domain UI components
├── hooks/         # Domain-specific hooks
├── types/         # Domain-specific types  
└── utils/         # Domain utilities
```

### ❌ Avoid Centralized Pattern:
- ❌ `hooks/sppg/` - Use `components/sppg/{domain}/hooks/` instead
- ❌ `types/domains/` - Use `components/sppg/{domain}/types/` instead
- ❌ Cross-domain imports - Each domain is self-contained

### 🎯 Pattern 2 Benefits:
- **Self-contained domains** - Each domain has its own hooks/types/utils
- **No cross-dependencies** - Domains don't import from each other
- **Clear boundaries** - Business logic stays within domain
- **Scalable architecture** - Easy to add new domains independently

**Remember**: Always use component-level domain structure, never centralized SPPG folders!

---

## 🔗 API-First Architecture Notes

**CRITICAL: This project uses API endpoints instead of server actions**

### ✅ API Endpoint Structure:
```
src/app/api/
├── sppg/           # SPPG API routes
│   ├── menu/
│   │   ├── route.ts           # GET, POST /api/sppg/menu
│   │   └── [id]/
│   │       └── route.ts       # GET, PUT, DELETE /api/sppg/menu/[id]
│   ├── procurement/
│   │   ├── route.ts
│   │   ├── plans/route.ts
│   │   └── orders/route.ts
│   └── production/
└── admin/          # Admin API routes  
    ├── sppg/
    │   ├── route.ts           # GET, POST /api/admin/sppg
    │   └── [id]/route.ts      # GET, PUT, DELETE /api/admin/sppg/[id]
    └── billing/
        └── route.ts
```

### 🎯 API-First Benefits:
- **Clear separation** - API logic separate from UI components
- **Better testing** - Each endpoint can be tested independently
- **Scalable architecture** - Easy to add rate limiting, caching, middleware
- **Type safety** - Full TypeScript support with proper error handling
- **Standard HTTP** - RESTful patterns with proper status codes
- **Documentation ready** - Can generate OpenAPI/Swagger docs

### ❌ Avoid Server Actions:
- ❌ `'use server'` - Use API endpoints instead
- ❌ Server actions in components - Use fetch calls to API endpoints
- ❌ Direct database calls in components - Always go through API layer

### 🎯 API Client Pattern (CRITICAL):
- ✅ **ALL API calls MUST use centralized API clients** (see Section 2a)
- ✅ Create API client files in `src/features/{layer}/{domain}/api/{resource}Api.ts`
- ✅ Use `getBaseUrl()` and `getFetchOptions()` from `@/lib/api-utils`
- ✅ Import API clients in hooks/stores, NEVER use direct `fetch()`
- ✅ See **Section 2a** above for complete enterprise API client pattern and examples

**Remember**: Always create API endpoints in `/api/` directory, then call them from client-side code using **centralized API clients** (NOT direct fetch) with TanStack Query!