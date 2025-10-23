# 🧪 Phase 4 Manual Testing Guide

**Server Status**: ✅ Running at http://localhost:3000  
**Test Duration**: ~10 minutes  
**Test Scope**: Verify 3 fixes are working in browser

---

## 🎯 Testing Objectives

Verify that all Phase 4 fixes are working correctly:

1. ✅ **Fix 1**: Age breakdown validation (schema-level)
2. ✅ **Fix 2**: activeStudents auto-calculation (form logic)
3. ✅ **Fix 3**: targetStudents documentation (UI enhancement)

---

## 📋 Pre-Testing Setup

### Step 0: Access Form
```
URL: http://localhost:3000/school/new
```

**Expected**: School form loads with 6 sections:
- 📝 Informasi Dasar
- 📊 Data Siswa  
- 📍 Lokasi
- 🍽️ Program Makan
- 🏢 Fasilitas
- ⚙️ Status & Catatan

---

## 🧪 Test 1: activeStudents Auto-Calculation

**Purpose**: Verify Fix 2 - activeStudents auto-fills from totalStudents

### Step-by-Step:

#### 1. Navigate to "Data Siswa" section
Click section 2 (📊 Data Siswa)

#### 2. Find totalStudents field
Look for: **"Total Siswa"**

#### 3. Enter totalStudents value
```
Enter: 150
```

#### 4. Observe activeStudents field
Look for: **"Siswa Aktif"**

**Expected Result**: ✅ activeStudents should auto-fill to `150`

**Why**: useEffect watches totalStudents and auto-fills activeStudents when it's 0

#### 5. Test Manual Override
```
Change activeStudents to: 140
Switch to another field
Come back
```

**Expected Result**: ✅ activeStudents stays at `140` (not reset to 150)

**Why**: Auto-fill only happens when activeStudents = 0

### ✅ Test 1 Checklist:
- [ ] activeStudents auto-fills when totalStudents is entered
- [ ] Auto-fill value matches totalStudents (150 = 150)
- [ ] Manual override is preserved (140 stays 140)
- [ ] No console errors appear

---

## 🧪 Test 2: Age Breakdown Validation

**Purpose**: Verify Fix 1 - Age breakdown sum must equal totalStudents

### Step-by-Step:

#### 1. Stay in "Data Siswa" section
Same section as Test 1

#### 2. Find age breakdown fields
Look for:
- **Siswa Usia 4-6 Tahun**
- **Siswa Usia 7-12 Tahun**
- **Siswa Usia 13-15 Tahun**
- **Siswa Usia 16-18 Tahun**

#### 3. Test Invalid Data (Sum ≠ Total)
```
totalStudents: 150 (already filled)
students4to6Years: 0
students7to12Years: 0
students13to15Years: 0
students16to18Years: 0
Sum: 0 (NOT 150!)
```

#### 4. Fill other required fields
Quick fill (minimum required):
```
Section 1 (Informasi Dasar):
- programId: Select any program
- schoolName: "Test School"
- schoolCode: "TEST-001"
- schoolType: "SD"
- schoolStatus: "ACTIVE"
- principalName: "Test Principal"
- contactPhone: "08123456789"
- contactEmail: "test@example.com"

Section 3 (Lokasi):
- schoolAddress: "Test Address"
- villageId: Select any village
- postalCode: "12345"

Section 4 (Program Makan):
- feedingDays: Check any day
- mealsPerDay: 1
- feedingTime: "12:00"
```

#### 5. Scroll to bottom and Submit
Click: **"Simpan Data Sekolah"** button

**Expected Result**: ❌ Validation error appears!

**Error Message**:
```
"Jumlah siswa per kelompok usia harus sama dengan total siswa"
```

**Error Location**: Near **totalStudents** field

#### 6. Fix the Age Breakdown
```
Update fields to:
students4to6Years: 30
students7to12Years: 80
students13to15Years: 30
students16to18Years: 10
Sum: 150 ✅ (matches totalStudents!)
```

#### 7. Submit Again
Click: **"Simpan Data Sekolah"**

**Expected Result**: ✅ Form submits successfully (or shows different validation errors if other fields are missing)

### ✅ Test 2 Checklist:
- [ ] Validation error appears when age sum ≠ totalStudents
- [ ] Error message is clear and actionable
- [ ] Error displays near totalStudents field
- [ ] Form submits successfully when age sum = totalStudents
- [ ] No console errors appear

---

## 🧪 Test 3: activeStudents Validation

**Purpose**: Verify Fix 2 (Part 2) - activeStudents must be > 0 when totalStudents > 0

### Step-by-Step:

#### 1. Create New Form or Reset
```
Option A: Refresh page (http://localhost:3000/school/new)
Option B: Clear form if possible
```

#### 2. Fill Basic Fields
Same as Test 2, quick fill required fields

#### 3. Test Invalid activeStudents
```
In "Data Siswa" section:
totalStudents: 100
activeStudents: 0 (manually set to 0)
```

**Note**: You need to bypass the auto-fill. To do this:
1. Enter totalStudents: 100 (activeStudents auto-fills to 100)
2. Manually change activeStudents to: 0
3. Tab to next field

#### 4. Fill age breakdown correctly
```
students4to6Years: 20
students7to12Years: 50
students13to15Years: 20
students16to18Years: 10
Sum: 100 ✅
```

#### 5. Submit Form
Click: **"Simpan Data Sekolah"**

**Expected Result**: ❌ Validation error appears!

**Error Message**:
```
"Siswa aktif harus lebih dari 0 jika ada total siswa"
```

**Error Location**: Near **activeStudents** field

#### 6. Fix activeStudents
```
Change activeStudents to: 95 (or any value > 0)
```

#### 7. Submit Again
Click: **"Simpan Data Sekolah"**

**Expected Result**: ✅ Form submits successfully

### ✅ Test 3 Checklist:
- [ ] Validation error appears when activeStudents = 0 but totalStudents > 0
- [ ] Error message is clear and actionable
- [ ] Error displays near activeStudents field
- [ ] Form submits successfully when activeStudents > 0
- [ ] No console errors appear

---

## 🧪 Test 4: targetStudents Documentation

**Purpose**: Verify Fix 3 - Clear documentation for targetStudents field

### Step-by-Step:

#### 1. Navigate to "Data Siswa" section
Click section 2 (📊 Data Siswa)

#### 2. Find targetStudents field
Look for: **"Target Siswa Penerima Manfaat"**

#### 3. Read FormDescription
Check text below the input field

**Expected Text**:
```
"Target siswa untuk perencanaan ke depan 
(boleh lebih besar dari total siswa saat ini)"
```

#### 4. Verify Clarity
Ask yourself:
- ✅ Is it clear this is for planning purposes?
- ✅ Does it explain why value can exceed totalStudents?
- ✅ Is the language professional and concise?

### ✅ Test 4 Checklist:
- [ ] FormDescription is visible under targetStudents field
- [ ] Text explains planning purpose clearly
- [ ] Text mentions value can exceed totalStudents
- [ ] No spelling/grammar errors
- [ ] Styling matches other form descriptions

---

## 🎯 Edge Cases Testing (Optional)

### Edge Case 1: New School (No Students)
```
totalStudents: 0
targetStudents: 100
activeStudents: 0
All age breakdowns: 0
```

**Expected**: ✅ Form submits successfully (new school scenario)

### Edge Case 2: All Students Active
```
totalStudents: 100
activeStudents: 100
```

**Expected**: ✅ Form submits successfully

### Edge Case 3: Large Numbers
```
totalStudents: 5000
activeStudents: 4800
students4to6Years: 1000
students7to12Years: 3000
students13to15Years: 800
students16to18Years: 200
```

**Expected**: ✅ Form handles large numbers correctly

---

## 📊 Test Results Template

Copy and fill this out after testing:

```markdown
## Test Results - Phase 4 Fixes

**Tester**: [Your Name]
**Date**: October 22, 2025
**Browser**: [Chrome/Firefox/Safari]
**Screen Size**: [Desktop/Tablet/Mobile]

### Test 1: activeStudents Auto-Calculation
- [ ] ✅ PASS / ❌ FAIL
- Issues found: [None / List issues]
- Screenshots: [If any issues]

### Test 2: Age Breakdown Validation
- [ ] ✅ PASS / ❌ FAIL
- Issues found: [None / List issues]
- Screenshots: [If any issues]

### Test 3: activeStudents Validation
- [ ] ✅ PASS / ❌ FAIL
- Issues found: [None / List issues]
- Screenshots: [If any issues]

### Test 4: targetStudents Documentation
- [ ] ✅ PASS / ❌ FAIL
- Issues found: [None / List issues]
- Screenshots: [If any issues]

### Overall Assessment
- Total Tests: 4
- Passed: [X]
- Failed: [X]
- Critical Issues: [None / List]
- Minor Issues: [None / List]

### Recommendation
- [ ] ✅ Fixes work perfectly - Proceed to Phase 5
- [ ] ⚠️ Minor tweaks needed - Fix and retest
- [ ] ❌ Major issues found - Requires debugging

### Additional Notes
[Any other observations, suggestions, or feedback]
```

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: Auto-fill Not Working
**Symptom**: activeStudents doesn't auto-fill when totalStudents is entered

**Debug**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for React errors
4. Check if useEffect is running

**Possible Causes**:
- useEffect not properly imported
- form.watch subscription not working
- Browser cache issue (hard refresh: Cmd+Shift+R)

### Issue 2: Validation Not Triggering
**Symptom**: No error message appears when submitting invalid data

**Debug**:
1. Check browser Console for errors
2. Verify Zod schema is imported correctly
3. Check if form.handleSubmit is working
4. Try logging validation errors

**Possible Causes**:
- Schema not compiled correctly
- Form submission not connected to schema
- Validation error not displayed in UI

### Issue 3: Error Message Not Visible
**Symptom**: Validation fails but error message doesn't show

**Debug**:
1. Check if FormMessage component exists
2. Verify error path matches field name
3. Check CSS display properties
4. Scroll to field with error

**Possible Causes**:
- FormMessage not rendered
- Error path mismatch (e.g., 'totalStudents' vs 'total_students')
- CSS hiding the error
- Error appears but off-screen

---

## ✅ Success Criteria

**Phase 4 fixes are successful if:**

1. ✅ **Auto-Calculation Works**
   - activeStudents auto-fills from totalStudents
   - Manual override is preserved
   - No race conditions or flickering

2. ✅ **Validation Works**
   - Age breakdown sum validation triggers
   - activeStudents validation triggers
   - Error messages are clear and visible
   - Form submits when data is valid

3. ✅ **Documentation Works**
   - targetStudents description is visible
   - Text is clear and helpful
   - Styling is consistent

4. ✅ **No Regressions**
   - Other fields still work
   - Form submission successful
   - No console errors
   - No performance issues

---

## 🚀 After Testing

### If All Tests Pass ✅
1. Mark Test 1-4 as PASS in results template
2. Update todo list: Phase 4 → 100% Complete
3. Proceed to Phase 5: UI Layout Fixes

### If Issues Found ⚠️
1. Document issues in results template
2. Take screenshots if helpful
3. Check console for errors
4. Report findings
5. Debug and fix issues
6. Re-test

---

## 📞 Need Help?

If you encounter issues during testing:

1. **Check Console**: F12 → Console tab for errors
2. **Check Network**: F12 → Network tab for API calls
3. **Clear Cache**: Hard refresh (Cmd+Shift+R)
4. **Restart Server**: Stop and `npm run dev` again
5. **Report Issues**: Provide screenshots + console logs

---

**Happy Testing!** 🧪✨

Remember: These fixes prevent **critical data inconsistency issues** that would break distribution planning and reporting. Take your time to verify they work correctly!

---

*Server: http://localhost:3000/school/new*  
*Last Updated: October 22, 2025*
