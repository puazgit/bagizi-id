# Production Module Access Guide

## 🔐 Authentication & Authorization

Production Module menggunakan **Role-Based Access Control (RBAC)** dengan middleware protection.

## ✅ Roles yang Dapat Mengakses `/production`

Berdasarkan `src/middleware.ts` line 147-150, roles berikut dapat mengakses Production Module:

1. **SPPG_KEPALA** - Kepala SPPG
   - Full access ke semua fitur production
   - Dapat membuat, edit, approve, delete production

2. **SPPG_ADMIN** - Administrator SPPG
   - Full access management
   - Dapat mengelola semua aspek production

3. **SPPG_PRODUKSI_MANAGER** - Manajer Produksi
   - Specialized production management
   - Fokus pada operational production

4. **SPPG_STAFF_DAPUR** - Staff Dapur
   - View dan execute production tasks
   - Dapat update status produksi

5. **SPPG_STAFF_QC** - Staff Quality Control
   - Fokus pada quality checks
   - Dapat menambah quality control records

6. **SPPG_AHLI_GIZI** - Ahli Gizi
   - View production terkait nutrition
   - Dapat validate menu nutritional compliance

## 📝 Login Credentials (From Seed Data)

### Production Regional Purwakarta

#### 1. Kepala SPPG (Full Access)
```
Email: kepala@sppg-purwakarta.com
Password: password123
Name: Dra. Siti Nurjanah, M.M.
Role: SPPG_KEPALA
Access: ✅ Full Production Module Access
```

#### 2. Admin SPPG (Full Management)
```
Email: admin@sppg-purwakarta.com
Password: password123
Name: Ahmad Fauzi, S.Gz.
Role: SPPG_ADMIN
Access: ✅ Full Production Module Access
```

#### 3. Manajer Produksi (Production Specialist)
```
Email: produksi@sppg-purwakarta.com
Password: password123
Name: Budi Santoso
Role: SPPG_PRODUKSI_MANAGER
Access: ✅ Full Production Module Access
```

#### 4. Ahli Gizi (Nutrition Related)
```
Email: gizi@sppg-purwakarta.com
Password: password123
Name: Dr. Maya Sari Dewi, S.Gz., M.Gizi
Role: SPPG_AHLI_GIZI
Access: ✅ Production Module Access (View + Nutritional Validation)
```

## 🚫 Roles yang TIDAK Dapat Mengakses

Roles berikut akan di-redirect ke `/dashboard?error=access-denied`:

- `SPPG_AKUNTAN` - Fokus pada financial/procurement
- `SPPG_DISTRIBUSI_MANAGER` - Fokus pada distribution
- `SPPG_HRD_MANAGER` - Fokus pada HR management
- `SPPG_STAFF_DISTRIBUSI` - Fokus pada distribution tasks
- `SPPG_STAFF_ADMIN` - General admin tasks
- `SPPG_VIEWER` - Read-only access
- `DEMO_USER` - Limited demo access

## 🔍 Testing Production Module Access

### Step 1: Login dengan Role yang Tepat
```bash
# Gunakan salah satu credentials di atas
# Recommended: produksi@sppg-purwakarta.com untuk testing production
```

### Step 2: Verify Session
Setelah login, session harus memiliki:
- `session.user.sppgId` - Not null (multi-tenant safety)
- `session.user.userRole` - One of allowed roles above
- `session.user.userType` - 'SPPG_USER' or 'SPPG_ADMIN'

### Step 3: Access Production Routes
```
✅ /production - List page dengan statistics
✅ /production/new - Create production form
✅ /production/[id] - Detail production view
✅ /production/[id]/edit - Edit production (only PLANNED status)
```

## 🛡️ Security Flow

```
User Request → Middleware Check → Role Verification → Route Access
     ↓              ↓                    ↓                 ↓
  /production → Is authenticated? → Has SPPG role? → Allowed?
                     ↓                    ↓                 ↓
                   YES               Checking...         YES/NO
                     ↓                    ↓                 ↓
              Has sppgId? → Is role in allowed list? → Grant/Deny
```

## 🔧 Permission Functions (from lib/permissions.ts)

```typescript
// Production permission check
export function canManageProduction(role: UserRole): boolean {
  return hasPermission(role, 'PRODUCTION_MANAGE')
}

// Roles with PRODUCTION_MANAGE permission:
const rolePermissions = {
  SPPG_KEPALA: [..., 'PRODUCTION_MANAGE', ...],
  SPPG_PRODUKSI_MANAGER: ['READ', 'WRITE', 'PRODUCTION_MANAGE', 'QUALITY_MANAGE'],
  SPPG_STAFF_DAPUR: ['READ', 'PRODUCTION_MANAGE'],
}
```

## � Fixed Issues

### Issue #1: Sidebar Link Redirect to Dashboard
**Problem**: Clicking "Production" in sidebar redirects to dashboard instead of `/production`

**Root Cause**: 
- `use-auth.ts` `canAccess('production')` only allowed 4 roles
- Middleware allowed 6 roles (including `SPPG_STAFF_QC` and `SPPG_AHLI_GIZI`)
- Mismatch caused sidebar to hide production link for some roles

**Solution**: 
✅ Updated `use-auth.ts` line 212 to match middleware permissions:
```typescript
case 'production':
  return hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 
                  'SPPG_STAFF_DAPUR', 'SPPG_STAFF_QC', 'SPPG_AHLI_GIZI'])
```

**Status**: ✅ RESOLVED - All 6 roles now have consistent access across middleware and sidebar

---

## �🐛 Troubleshooting

### Error: "Access Denied" when accessing /production

**Possible Causes:**
1. ❌ User role tidak termasuk dalam allowed list
2. ❌ User tidak memiliki `sppgId` (multi-tenant issue)
3. ❌ Session expired atau invalid

**Solutions:**
1. ✅ Login dengan role yang tepat (lihat list di atas)
2. ✅ Pastikan user ter-associate dengan SPPG
3. ✅ Clear cookies dan login ulang
4. ✅ Verify both middleware and use-auth have matching role lists

### Check Current Session
```typescript
// Di browser console (setelah login)
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.log(data))

// Expected output:
{
  user: {
    id: "...",
    email: "produksi@sppg-purwakarta.com",
    userRole: "SPPG_PRODUKSI_MANAGER",
    sppgId: "clxxx...",
    userType: "SPPG_USER"
  }
}
```

### Database Check
```bash
# Open Prisma Studio
npx prisma studio

# Check:
1. User table → Find your user → Check userRole and sppgId
2. SPPG table → Verify SPPG exists and status is ACTIVE
```

## 📊 Permission Matrix

| Role | Access Production | Create | Edit | Delete | Quality Control | Approve |
|------|------------------|--------|------|--------|----------------|---------|
| SPPG_KEPALA | ✅ Full | ✅ | ✅ | ✅ | ✅ | ✅ |
| SPPG_ADMIN | ✅ Full | ✅ | ✅ | ✅ | ✅ | ✅ |
| SPPG_PRODUKSI_MANAGER | ✅ Full | ✅ | ✅ | ✅ | ✅ | ⚠️ Limited |
| SPPG_STAFF_DAPUR | ✅ View + Execute | ⚠️ Limited | ⚠️ Status Only | ❌ | ⚠️ Add Only | ❌ |
| SPPG_STAFF_QC | ✅ View + QC | ❌ | ❌ | ❌ | ✅ Full | ❌ |
| SPPG_AHLI_GIZI | ✅ View + Validate | ⚠️ With Approval | ⚠️ Nutrition Only | ❌ | ⚠️ Nutrition | ❌ |
| SPPG_AKUNTAN | ❌ No Access | ❌ | ❌ | ❌ | ❌ | ❌ |
| Other SPPG Roles | ❌ No Access | ❌ | ❌ | ❌ | ❌ | ❌ |

## 🎯 Recommended Test Accounts

**For Full Production Testing:**
```
Email: produksi@sppg-purwakarta.com
Password: password123
Role: SPPG_PRODUKSI_MANAGER
Why: Specialized in production operations
```

**For Administrative Testing:**
```
Email: admin@sppg-purwakarta.com
Password: password123
Role: SPPG_ADMIN
Why: Full management access
```

**For Executive Testing:**
```
Email: kepala@sppg-purwakarta.com
Password: password123
Role: SPPG_KEPALA
Why: Highest authority, full access
```

## 📞 Support

Jika masih mengalami masalah akses:
1. Verify user exists in database via Prisma Studio
2. Check `src/middleware.ts` line 147-150 untuk role list
3. Check browser console untuk error messages
4. Check server logs untuk authentication issues

---

**Last Updated:** October 17, 2025
**Module:** Production Module Phase 5
**Status:** ✅ Complete with RBAC Protection
