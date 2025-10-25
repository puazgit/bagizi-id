# 🔐 Demo Credentials - Bagizi-ID 2025

## 📋 Overview
Comprehensive demo accounts for testing **all roles and permissions** in Bagizi-ID platform.

**Default Password for ALL Accounts**: `demo2025`

---

## 🌐 PLATFORM LEVEL USERS
> Platform administrators with system-wide access (no SPPG assignment)

| Email | Role | Access Level | Description |
|-------|------|--------------|-------------|
| `superadmin@bagizi.id` | PLATFORM_SUPERADMIN | Full System Access | Complete platform control, manage all SPPGs |
| `support@bagizi.id` | PLATFORM_SUPPORT | Support Functions | Customer support, troubleshooting |
| `analyst@bagizi.id` | PLATFORM_ANALYST | Analytics & Reporting | Platform analytics, cross-SPPG insights |

**Features:**
- ✅ Access to admin dashboard (`/admin`)
- ✅ Manage all SPPG tenants
- ✅ View system-wide analytics
- ✅ Platform configuration
- ✅ Billing and subscription management

---

## 👑 SPPG MANAGEMENT LEVEL
> Senior leadership with full operational control within DEMO-2025 SPPG

| Email | Role | Access Level | Description |
|-------|------|--------------|-------------|
| `kepala@demo.sppg.id` | SPPG_KEPALA | Full SPPG Access | Head of SPPG, complete operational control |
| `admin@demo.sppg.id` | SPPG_ADMIN | Administrator | System administration, user management |

**Features:**
- ✅ Complete dashboard access (`/dashboard`)
- ✅ All operational modules (Menu, Procurement, Production, Distribution)
- ✅ Financial management
- ✅ HR management
- ✅ Approval workflows
- ✅ Comprehensive reporting

---

## 💼 SPPG OPERATIONAL MANAGERS
> Department heads with specialized access

| Email | Role | Department | Primary Functions |
|-------|------|------------|-------------------|
| `ahligizi@demo.sppg.id` | SPPG_AHLI_GIZI | Nutrition | Menu planning, nutrition calculation, quality control |
| `akuntan@demo.sppg.id` | SPPG_AKUNTAN | Finance | Financial reports, procurement, cost analysis |
| `produksi@demo.sppg.id` | SPPG_PRODUKSI_MANAGER | Production | Production scheduling, kitchen management |
| `distribusi@demo.sppg.id` | SPPG_DISTRIBUSI_MANAGER | Distribution | Route planning, delivery management |
| `hrd@demo.sppg.id` | SPPG_HRD_MANAGER | HR | Staff management, scheduling, performance |

**Features:**
- ✅ Department-specific dashboards
- ✅ Module access based on role
- ✅ Report generation
- ✅ Team management within department

---

## 👷 SPPG OPERATIONAL STAFF
> Field workers and operational personnel

| Email | Role | Department | Primary Tasks |
|-------|------|------------|---------------|
| `dapur@demo.sppg.id` | SPPG_STAFF_DAPUR | Kitchen | Food preparation, production execution |
| `kurir@demo.sppg.id` | SPPG_STAFF_DISTRIBUSI | Logistics | Food delivery, route execution |
| `adminstaff@demo.sppg.id` | SPPG_STAFF_ADMIN | Admin | Data entry, documentation |
| `qc@demo.sppg.id` | SPPG_STAFF_QC | Quality Control | Food quality inspection, compliance checks |

**Features:**
- ✅ Task-specific interfaces
- ✅ Mobile-friendly views
- ✅ Real-time updates
- ✅ Limited administrative access

---

## 👁️ LIMITED ACCESS ACCOUNTS
> Restricted access for viewing and testing

| Email | Role | Access Type | Description |
|-------|------|-------------|-------------|
| `viewer@demo.sppg.id` | SPPG_VIEWER | Read-Only | View all data, no modifications |
| `demo@demo.sppg.id` | DEMO_USER | Trial Limited | Time-limited demo access |

**Features:**
- ✅ Dashboard viewing
- ✅ Report access
- ❌ No data modification
- ❌ No administrative functions

---

## 🏢 DEMO SPPG DETAILS

**Organization Information:**
- **Code**: `DEMO-2025`
- **Name**: SPPG Demo Bagizi 2025
- **Type**: Government (PEMERINTAH)
- **Location**: Purwakarta, Jawa Barat
- **Status**: Active (Demo)

**Subscription:**
- **Plan**: PROFESSIONAL (Trial)
- **Valid Period**: January 1, 2025 - December 31, 2025
- **Features Enabled**: All 10 features

**Capacity:**
- **Recipients**: Up to 1000 beneficiaries
- **Service Radius**: 20km
- **Age Range**: 2-5 years
- **Budget Threshold**: 90%

---

## 🔑 Login Instructions

### Web Application
1. Navigate to: `https://bagizi.id/login` (or your deployment URL)
2. Enter email from table above
3. Enter password: `demo2025`
4. Click "Sign In"

### Testing Different Roles
To test role-specific features:
1. **Logout** from current account
2. **Login** with different role email
3. Navigate to role-specific modules
4. Test permissions and feature access

---

## 🧪 Testing Scenarios

### Scenario 1: Menu Management (Nutritionist)
- **Login**: `ahligizi@demo.sppg.id`
- **Access**: `/menu`
- **Test**: Create menu, calculate nutrition, approve recipes

### Scenario 2: Production Planning (Production Manager)
- **Login**: `produksi@demo.sppg.id`
- **Access**: `/production`
- **Test**: Schedule production, assign kitchen staff, track output

### Scenario 3: Financial Reporting (Accountant)
- **Login**: `akuntan@demo.sppg.id`
- **Access**: `/reports`, `/procurement`
- **Test**: View cost analysis, generate financial reports

### Scenario 4: Distribution Routes (Distribution Manager)
- **Login**: `distribusi@demo.sppg.id`
- **Access**: `/distribution`
- **Test**: Plan routes, assign drivers, track deliveries

### Scenario 5: Platform Administration (Super Admin)
- **Login**: `superadmin@bagizi.id`
- **Access**: `/admin`
- **Test**: Manage SPPGs, view analytics, configure system

---

## 🚨 Security Notes

⚠️ **Important Security Guidelines:**

1. **Demo Environment Only**: These credentials are for testing purposes
2. **Change Passwords**: In production, immediately change all demo passwords
3. **Limited Lifetime**: Demo accounts valid only during 2025
4. **No Sensitive Data**: Do not use demo accounts for real operational data
5. **Regular Audits**: Monitor demo account activity for security

---

## 📊 Feature Access Matrix

| Feature | Superadmin | Kepala | Admin | Ahli Gizi | Akuntan | Manager | Staff | Viewer |
|---------|:----------:|:------:|:-----:|:---------:|:-------:|:-------:|:-----:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Menu Management | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 👁️ |
| Nutrition Calc | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 👁️ |
| Cost Calculation | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 👁️ |
| Procurement | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 👁️ |
| Production | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 👁️ |
| Distribution | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 👁️ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 👁️ |
| Reporting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| User Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full Access
- 👁️ View Only
- ❌ No Access

---

## 🆘 Support

**Questions or Issues?**
- Technical Support: `support@bagizi.id` (demo account)
- Platform Admin: `superadmin@bagizi.id` (demo account)
- Documentation: See project README.md

---

**Last Updated**: January 2025  
**Version**: Bagizi-ID 2025 Demo Release  
**Deployment**: Coolify Production Environment
