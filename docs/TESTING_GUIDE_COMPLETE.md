# 🧪 Comprehensive Testing Guide - Bagizi-ID

## 📋 Overview
Panduan testing lengkap untuk fitur-fitur yang telah diimplementasikan dalam Bagizi-ID, khususnya **School Integration** dan **Edit Distribution** yang baru saja diselesaikan.

## 🎯 Testing Priorities

### Priority 1: Core Functionality ⭐⭐⭐
1. **Edit Distribution Page** - `/distribution/[id]/edit`
2. **School Integration Features** - Auto-populate dan manual mode
3. **Multi-tenant Security** - Data isolation per SPPG

### Priority 2: User Experience ⭐⭐
1. **Form Validation** - Zod schema validation
2. **Loading States** - Form feedback dan error handling
3. **Navigation** - Breadcrumbs dan redirect flows

### Priority 3: Edge Cases ⭐
1. **Permission Checks** - Role-based access
2. **Empty States** - No data scenarios
3. **Network Errors** - API failure handling

---

## 🔐 Test Credentials

```bash
# SPPG Admin (Full Access)
Email: admin@sppg-purwakarta.com
Password: password123
Role: SPPG_ADMIN
Access: All distribution operations

# Ahli Gizi (Limited Access)
Email: gizi@sppg-purwakarta.com
Password: password123
Role: SPPG_AHLI_GIZI
Access: Read-only for distribution

# Demo Account
Email: demo@sppg-purwakarta.com
Password: demo123
Role: DEMO_USER
Access: Limited demo features
```

---

## 🏫 School Integration Testing

### Test URLs
```bash
# Distribution List (with School Integration)
http://localhost:3000/distribution

# Create Distribution (with School Integration)  
http://localhost:3000/distribution/create

# Edit Distribution (NEW - with School Integration)
http://localhost:3000/distribution/cmgw78x6c00ey8oklt5jc8irz/edit
```

### 🎯 Test Scenario 1: Auto-Populate Mode

**Objective**: Verify school data auto-populates when school is selected

**Steps**:
1. Login dengan `admin@sppg-purwakarta.com`
2. Navigate ke `/distribution/cmgw78x6c00ey8oklt5jc8irz/edit`
3. Di section "Detail Pengiriman", klik dropdown "Sekolah Tujuan"
4. Pilih salah satu sekolah (contoh: "SDN Purwakarta 1")

**Expected Results**:
- ✅ Alamat sekolah ter-isi otomatis
- ✅ Contact person ter-isi otomatis
- ✅ Nomor telepon ter-isi otomatis
- ✅ Jumlah siswa ter-isi otomatis
- ✅ Mode auto-populate indicator muncul

**Validation Checklist**:
- [ ] School dropdown populated with real data
- [ ] Address auto-fills correctly
- [ ] Contact person shows school data
- [ ] Phone number format correct
- [ ] Student count shows integer
- [ ] Form shows auto-populate mode active

### 🎯 Test Scenario 2: Manual Override Mode

**Objective**: Test manual input when auto-populate is disabled

**Steps**:
1. Dari scenario 1, toggle off "Auto-populate"
2. Clear semua field yang ter-isi otomatis
3. Input manual data berbeda:
   - Alamat: "Manual Address Test"
   - Contact: "Manual Contact Person"
   - Phone: "081234567890"
   - Students: "50"

**Expected Results**:
- ✅ Dapat mengedit semua field secara manual
- ✅ Auto-populate disabled dan field editable
- ✅ Validation tetap berjalan
- ✅ Data manual tersimpan

**Validation Checklist**:
- [ ] Toggle switch works correctly
- [ ] All fields become editable
- [ ] Manual input accepted
- [ ] Validation rules applied
- [ ] Form submission works

### 🎯 Test Scenario 3: School Selection Workflow

**Objective**: Test complete school selection workflow

**Steps**:
1. Start dengan "Pilih sekolah tujuan" 
2. Select different schools dan observe changes
3. Switch between auto-populate ON/OFF
4. Try "Manual Input" option

**Expected Results**:
- ✅ Each school selection updates related fields
- ✅ Toggle works for each school
- ✅ Manual mode allows custom input
- ✅ Consistent behavior across selections

**Validation Checklist**:
- [ ] School list shows active schools only
- [ ] Each selection triggers auto-populate
- [ ] No data leakage between schools
- [ ] Manual input option available
- [ ] State management consistent

---

## 📝 Form Validation Testing

### 🎯 Test Scenario 4: Required Field Validation

**Objective**: Verify all required fields are validated

**Steps**:
1. Navigate ke edit distribution page
2. Clear required fields satu per satu
3. Try submit form untuk trigger validation
4. Verify error messages

**Required Fields to Test**:
- Distribution date (tanggal distribusi)
- Distribution time (waktu distribusi)  
- Target school (sekolah tujuan)
- Food quantity (jumlah makanan)
- Status (if applicable)

**Expected Results**:
- ✅ Clear error messages untuk each required field
- ✅ Form submission blocked when invalid
- ✅ Error styling applied to invalid fields
- ✅ Success state when all valid

**Validation Checklist**:
- [ ] Date field required validation
- [ ] Time field required validation
- [ ] School selection required
- [ ] Food quantity numeric validation
- [ ] Error messages clear and helpful

### 🎯 Test Scenario 5: Business Logic Validation

**Objective**: Test business rules and constraints

**Steps**:
1. Try set distribution date in the past
2. Try set invalid food quantities (negative, zero)
3. Try assign non-existent staff
4. Try edit distribution in wrong status

**Expected Results**:
- ✅ Past dates rejected with clear message
- ✅ Invalid quantities rejected
- ✅ Staff validation based on role
- ✅ Status-based edit restrictions

**Validation Checklist**:
- [ ] Date must be today or future
- [ ] Quantities must be positive integers
- [ ] Staff must have proper role
- [ ] Status restrictions enforced

---

## 🔄 API Integration Testing

### 🎯 Test Scenario 6: Update Distribution API

**Objective**: Verify form data correctly calls API and updates database

**Steps**:
1. Make changes to distribution form
2. Submit form dan monitor network requests
3. Verify database updates
4. Check for proper multi-tenant isolation

**API Endpoint**: `PUT /api/sppg/distribution/[id]`

**Expected Results**:
- ✅ Correct API endpoint called
- ✅ Proper request payload sent
- ✅ Success response received
- ✅ UI updated with new data
- ✅ Database reflects changes
- ✅ Only SPPG data accessible

**Validation Checklist**:
- [ ] Network request to correct endpoint
- [ ] Request includes proper authentication
- [ ] Payload matches form data
- [ ] Response handled correctly
- [ ] Optimistic updates work
- [ ] Error handling for API failures

### 🎯 Test Scenario 7: Multi-tenant Security

**Objective**: Ensure data isolation between SPPGs

**Steps**:
1. Login as different SPPG users
2. Try access same distribution ID
3. Verify each sees only their data
4. Try manipulate URLs to access other SPPG data

**Expected Results**:
- ✅ Each SPPG sees only their distributions
- ✅ 403 errors when accessing other SPPG data
- ✅ URL manipulation blocked
- ✅ Database queries properly filtered

**Validation Checklist**:
- [ ] Distribution data filtered by sppgId
- [ ] School data filtered by SPPG
- [ ] Staff data filtered by SPPG  
- [ ] No cross-SPPG data leakage
- [ ] Proper error messages for unauthorized access

---

## 🎨 UI/UX Testing

### 🎯 Test Scenario 8: Responsive Design

**Objective**: Verify form works across different screen sizes

**Steps**:
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Check form section layout dan navigation

**Expected Results**:
- ✅ Form sections adapt to screen size
- ✅ School integration dropdown works on mobile
- ✅ All buttons accessible
- ✅ Reading flow maintained

**Validation Checklist**:
- [ ] Desktop: All sections visible
- [ ] Tablet: Proper section stacking
- [ ] Mobile: Touch-friendly inputs
- [ ] Responsive dropdown behavior
- [ ] Proper spacing on all devices

### 🎯 Test Scenario 9: Loading States

**Objective**: Test loading indicators dan error states

**Steps**:
1. Throttle network to simulate slow connections
2. Submit form dan observe loading states
3. Simulate API errors
4. Test empty states

**Expected Results**:
- ✅ Loading spinners during API calls
- ✅ Disabled state during submission
- ✅ Clear error messages
- ✅ Proper empty state handling

**Validation Checklist**:
- [ ] Form shows loading during submission
- [ ] Buttons disabled appropriately
- [ ] Error states clearly displayed
- [ ] Empty states have helpful messages
- [ ] Network error handling

---

## 🔒 Permission Testing

### 🎯 Test Scenario 10: Role-Based Access

**Objective**: Verify different roles have appropriate access levels

**Test Matrix**:

| Role | View Distribution | Edit Distribution | Delete Distribution |
|------|-------------------|-------------------|---------------------|
| SPPG_ADMIN | ✅ | ✅ | ✅ |
| SPPG_DISTRIBUSI_MANAGER | ✅ | ✅ | ❌ |
| SPPG_STAFF_DISTRIBUSI | ✅ | ✅ | ❌ |
| SPPG_AHLI_GIZI | ✅ | ❌ | ❌ |
| DEMO_USER | ✅ (limited) | ❌ | ❌ |

**Steps for Each Role**:
1. Login dengan role credentials
2. Navigate to distribution edit page
3. Verify available actions
4. Try unauthorized actions

**Expected Results**:
- ✅ Appropriate buttons shown/hidden
- ✅ Unauthorized actions blocked
- ✅ Clear messaging about permissions
- ✅ Graceful fallback for insufficient permissions

---

## 📊 Data Consistency Testing

### 🎯 Test Scenario 11: Data Integrity

**Objective**: Ensure data consistency across related entities

**Steps**:
1. Edit distribution yang connected ke production
2. Verify production data integrity maintained
3. Check school beneficiary data consistency
4. Validate nutrition program relationships

**Expected Results**:
- ✅ Related entities remain consistent
- ✅ Foreign key constraints enforced
- ✅ Cascade updates handled properly
- ✅ No orphaned records created

**Validation Checklist**:
- [ ] Production relationships maintained
- [ ] School data consistency
- [ ] Menu assignments preserved
- [ ] Audit trail updated

---

## 🚀 Performance Testing

### 🎯 Test Scenario 12: Load Performance

**Objective**: Verify form performs well with real data loads

**Steps**:
1. Test with large school lists (100+ schools)
2. Test form with complex distribution data
3. Monitor render times dan memory usage
4. Test concurrent user scenarios

**Expected Results**:
- ✅ Form loads in <2 seconds
- ✅ School dropdown performs well
- ✅ No memory leaks during navigation
- ✅ Smooth user interactions

**Performance Targets**:
- Page load: <2s
- Form submission: <1s
- School dropdown: <500ms
- Memory usage: <50MB increase

---

## 📝 Test Results Template

### Test Execution Report

**Test Date**: ___________
**Tester**: ___________
**Environment**: `http://localhost:3000`

#### Test Results Summary

| Test Scenario | Status | Notes |
|---------------|---------|--------|
| Auto-Populate Mode | ⏳ Pending | |
| Manual Override Mode | ⏳ Pending | |
| School Selection Workflow | ⏳ Pending | |
| Required Field Validation | ⏳ Pending | |
| Business Logic Validation | ⏳ Pending | |
| Update Distribution API | ⏳ Pending | |
| Multi-tenant Security | ⏳ Pending | |
| Responsive Design | ⏳ Pending | |
| Loading States | ⏳ Pending | |
| Role-Based Access | ⏳ Pending | |
| Data Integrity | ⏳ Pending | |
| Load Performance | ⏳ Pending | |

#### Critical Issues Found
- [ ] None
- [ ] Minor issues (list below)
- [ ] Major issues (list below)
- [ ] Blocking issues (list below)

#### Recommendations
1. ___________
2. ___________
3. ___________

---

## 🎯 Next Steps After Testing

### If All Tests Pass ✅
1. **Production Deployment Prep**
   - Environment variable setup
   - Database migration scripts
   - Monitoring setup

2. **User Training Materials**
   - School integration workflow guide
   - Distribution management documentation
   - Troubleshooting guide

3. **Advanced Features**
   - Bulk distribution operations
   - Advanced filtering
   - Export capabilities

### If Issues Found ❌
1. **Issue Categorization**
   - Critical: Blocks core functionality
   - Major: Impacts user experience
   - Minor: Cosmetic or edge cases

2. **Fix Priority**
   - P0: Critical security issues
   - P1: Core functionality breaks
   - P2: UX improvements
   - P3: Nice-to-have enhancements

3. **Regression Testing**
   - Re-test fixed issues
   - Verify no new issues introduced
   - Update test cases as needed

---

## 📞 Support Information

**Development Team**: Bagizi-ID Development Team
**Testing Period**: October 2024
**Documentation**: This guide + copilot-instructions.md
**Support Channel**: Development team review sessions

---

**Happy Testing! 🚀**

**Remember**: Setiap bug yang ditemukan sekarang adalah fitur yang lebih stabil di production nanti!