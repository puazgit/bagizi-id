# 🚀 Program API Quick Reference

**Migration Date**: October 20, 2025  
**Status**: ✅ Migration Complete

---

## 📌 Quick Changes

### Endpoint URLs
```typescript
// ❌ OLD (Deprecated until Dec 31, 2025)
/api/sppg/programs
/api/sppg/programs/:id

// ✅ NEW (Use this)
/api/sppg/program
/api/sppg/program/:id
```

### Auto-Generated programCode
```typescript
// ❌ OLD: Manual code required
{
  "programCode": "PROG-001",  // You provide
  "name": "Program Gizi 2025"
}

// ✅ NEW: Auto-generated
{
  "name": "Program Gizi 2025"  // Code generated automatically
}
// Result: "PROG-SPPG-JKT-001-89234567-A4B2"
```

### Response Format
```typescript
// ❌ OLD
programs: Program[]

// ✅ NEW
{
  success: true,
  data: Program[]
}
```

---

## 🔧 How to Use New Endpoint

### Import API Client
```typescript
import { programApi } from '@/features/sppg/program/api'
```

### Get All Programs
```typescript
const result = await programApi.getAll()
if (result.success) {
  console.log(result.data) // Program[]
}
```

### Get Program by ID
```typescript
const result = await programApi.getById('program-id')
if (result.success) {
  console.log(result.data) // Program
}
```

### Create New Program
```typescript
const result = await programApi.create({
  name: "Program Gizi Balita 2025",
  description: "Program gizi untuk balita",
  programType: "SUPPLEMENTARY_FEEDING",
  targetGroup: "BALITA_2_5",
  targetRecipients: 500,
  // ... other fields
  // NO programCode needed - auto-generated!
})

if (result.success) {
  console.log(result.data.programCode)
  // Output: "PROG-SPPG-JKT-001-89234567-A4B2"
}
```

### Update Program
```typescript
const result = await programApi.update('program-id', {
  name: "Updated Name",
  targetRecipients: 600
})
```

### Delete Program
```typescript
const result = await programApi.delete('program-id')
// Requires SPPG_KEPALA role
```

---

## 🔑 Permissions

| Action | Roles |
|--------|-------|
| **View** | All SPPG users |
| **Create** | SPPG_KEPALA, SPPG_ADMIN, SPPG_AHLI_GIZI |
| **Update** | SPPG_KEPALA, SPPG_ADMIN, SPPG_AHLI_GIZI |
| **Delete** | SPPG_KEPALA only |

---

## 🧪 Testing Commands

```bash
# Type check
npm run type-check

# Verify no old endpoint references
grep -r "/api/sppg/programs" src/features/

# Start dev server
npm run dev

# Run tests
npm run test
```

---

## 📚 Full Documentation

- [Complete Migration Guide](/docs/PROGRAM_MIGRATION_GUIDE.md)
- [Migration Summary](/docs/PROGRAM_MIGRATION_SUMMARY.md)
- [Program Domain Implementation](/docs/PROGRAM_DOMAIN_IMPLEMENTATION.md)

---

**Need Help?** Check documentation or contact dev team.

**Last Updated**: October 20, 2025
