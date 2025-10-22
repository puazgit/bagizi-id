# Form Submission Debug Session

**Date**: January 19, 2025  
**Issue**: "Buat Menu" button tidak berfungsi - tidak ada data yang ditambahkan  
**Status**: 🔍 Debugging - Menunggu hasil log browser

---

## 📋 Issue Summary

User melaporkan bahwa tombol "Buat Menu" tidak berfungsi ketika diklik. Form tidak menambahkan data ke database dan tidak ada feedback error atau success yang muncul.

---

## 🔍 Investigation Results

### 1. **Form Structure ✅**
- Form element: `<form onSubmit={form.handleSubmit(onSubmit)}>`
- Submit button: `<Button type="submit">` ✅
- Conclusion: Form structure correct

### 2. **onSubmit Handler ✅**
Location: `src/features/sppg/menu/components/MenuForm.tsx` (lines 184-217)

```typescript
const onSubmit = (data: MenuFormData) => {
  if (isEditing && menu) {
    updateMenu(...)
  } else {
    createMenu(data as unknown as MenuInput, {
      onSuccess: (response) => {
        toast.success('Menu berhasil dibuat')
        form.reset()
        onSuccess?.(response.data!.menu)
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  }
}
```

Conclusion: Handler looks correct with proper branching, callbacks, and error handling

### 3. **Hooks Import ✅**
```typescript
import { useCreateMenu, useUpdateMenu } from '../hooks'
```

Location verified:
- `src/features/sppg/menu/hooks/index.ts` exists ✅
- `useCreateMenu` hook defined correctly (lines 117-142) ✅
- Hook has its own success/error handlers with toast and query invalidation ✅

### 4. **API Client ✅**
Location: `src/features/sppg/menu/api/menuApi.ts`

```typescript
async createMenu(data: MenuInput, headers?: HeadersInit): Promise<ApiResponse<MenuCreateResponse>> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/sppg/menu`, {
    ...getFetchOptions(headers),
    method: 'POST',
    body: JSON.stringify(data),
  })
  return handleApiResponse<MenuCreateResponse>(response)
}
```

Conclusion: API client looks correct ✅

### 5. **Backend API Endpoint ✅**
Location: `src/app/api/sppg/menu/route.ts`

POST endpoint structure:
1. Authentication check ✅
2. SPPG access check ✅
3. Role check ✅
4. Body parsing and validation ✅
5. Program ownership verification ✅
6. Duplicate check ✅
7. Menu creation ✅
8. Success response with 201 status ✅

Conclusion: Backend endpoint looks correct ✅

---

## 🛠️ Debug Solution Implemented

Added comprehensive logging to track execution flow:

### **File Modified**: `src/features/sppg/menu/components/MenuForm.tsx`

### **Change 1: Form Submit Handler with Validation Logging**
```typescript
<form 
  onSubmit={(e) => {
    console.log('📋 Form submit event triggered')
    e.preventDefault()
    form.handleSubmit((data) => {
      console.log('🔍 Form validation passed, calling onSubmit', data)
      onSubmit(data)
    }, (errors) => {
      console.error('❌ Form validation failed', errors)
    })()
  }} 
  className="space-y-8"
>
```

**What This Logs**:
- ✅ When form submit event is triggered
- ✅ If validation passes with the validated data
- ❌ If validation fails with error details

### **Change 2: Enhanced onSubmit Handler**
```typescript
const onSubmit = (data: MenuFormData) => {
  console.log('🎯 MenuForm onSubmit called', { isEditing, data })
  
  if (isEditing && menu) {
    console.log('📝 Updating menu', menu.id)
    updateMenu(...)
  } else {
    console.log('➕ Creating new menu', data)
    createMenu(data as unknown as MenuInput, {
      onSuccess: (response) => {
        console.log('✅ Create menu success', response)
        toast.success('Menu berhasil dibuat')
        form.reset()
        onSuccess?.(response.data!.menu)
      },
      onError: (error) => {
        console.error('❌ Create menu error', error)
        toast.error(error.message)
      }
    })
  }
}
```

**What This Logs**:
- ✅ When onSubmit is called with form data
- ✅ Which operation (create vs update)
- ✅ Success response from API
- ❌ Error response from API

---

## 📊 Debugging Steps for User

### **Step 1: Open Browser Console**
1. Open aplikasi di browser (Chrome/Firefox/Safari)
2. Tekan `F12` atau `Cmd+Option+I` (Mac) untuk buka Developer Tools
3. Pilih tab **Console**

### **Step 2: Clear Console dan Test**
1. Clear console dengan tombol 🚫 atau ketik `clear()`
2. Isi form create menu dengan data test
3. Klik tombol **"Buat Menu"**

### **Step 3: Analyze Console Output**

#### **Scenario A: Form Validation Failed** ❌
```
📋 Form submit event triggered
❌ Form validation failed {errors object}
```

**Problem**: Form tidak pass validasi  
**Solution**: Check error object untuk field mana yang invalid  
**Common Issues**:
- Required fields kosong (programId, menuName, menuCode, mealType, servingSize)
- Invalid format (menuCode pattern mismatch)
- Invalid type (string di number field)

#### **Scenario B: onSubmit Not Called** ⚠️
```
📋 Form submit event triggered
🔍 Form validation passed, calling onSubmit {data}
(nothing else appears)
```

**Problem**: onSubmit function tidak dipanggil meskipun validation passed  
**Possible Causes**:
- Hook tidak ter-import dengan benar
- createMenu function undefined
- JavaScript error di onSubmit (silent failure)

**Action**: Check untuk error di atas log ini

#### **Scenario C: API Call Failed** ❌
```
📋 Form submit event triggered
🔍 Form validation passed, calling onSubmit {data}
🎯 MenuForm onSubmit called {data}
➕ Creating new menu {data}
❌ Create menu error {error}
```

**Problem**: API request gagal  
**Check**:
1. Network tab → Failed request dengan status code (401/403/500)
2. Error message untuk detail

#### **Scenario D: Success (Expected)** ✅
```
📋 Form submit event triggered
🔍 Form validation passed, calling onSubmit {data}
🎯 MenuForm onSubmit called {data}
➕ Creating new menu {data}
✅ Create menu success {response}
```

**Result**: Menu created successfully, toast appears, form resets

---

## 🔧 Possible Issues & Solutions

### **Issue 1: Form Validation Failing**

**Symptoms**:
```
❌ Form validation failed {
  programId: { message: "Required" },
  menuCode: { message: "Invalid format" }
}
```

**Solution**:
1. Check required fields are filled
2. Verify menuCode matches pattern (e.g., "SAR-123456")
3. Ensure servingSize is number > 0

### **Issue 2: API Authentication/Permission Error**

**Symptoms**:
```
❌ Create menu error: Unauthorized - Login required
❌ Create menu error: Insufficient permissions
```

**Solution**:
1. Check user logged in
2. Verify user has SPPG role (SPPG_ADMIN, SPPG_AHLI_GIZI, etc.)
3. Check session.user.sppgId exists

### **Issue 3: Network Request Failed**

**Symptoms**:
```
❌ Create menu error: Failed to fetch
❌ Create menu error: Network error
```

**Solution**:
1. Check Network tab in DevTools
2. Verify API endpoint URL correct (`/api/sppg/menu`)
3. Check request payload format
4. Verify backend server running

### **Issue 4: Backend Validation Error**

**Symptoms**:
```
❌ Create menu error: Menu code already exists
❌ Create menu error: Program not found
```

**Solution**:
1. Generate new menu code (duplicate issue)
2. Verify programId valid and belongs to user's SPPG
3. Check database constraints

---

## 📝 Next Steps

### **After User Reports Console Output**:

1. **If Validation Failed**:
   - Identify which fields are invalid
   - Fix validation rules or form default values
   - Consider making optional fields truly optional

2. **If onSubmit Not Called**:
   - Check for JavaScript errors in console
   - Verify hooks are imported correctly
   - Check TypeScript compilation errors

3. **If API Call Failed**:
   - Check Network tab for request details
   - Verify authentication and permissions
   - Check backend logs for errors

4. **If Success But No Data**:
   - Check database directly
   - Verify Prisma query executed
   - Check transaction rollback

---

## 🎯 Expected Outcome

After user provides console logs, we will:
1. ✅ Identify exact failure point
2. ✅ Implement targeted fix
3. ✅ Verify form submission works
4. ✅ Remove debug logs (or keep if useful)
5. ✅ Document final solution

---

## 📚 Related Files

- **Component**: `src/features/sppg/menu/components/MenuForm.tsx`
- **Hooks**: `src/features/sppg/menu/hooks/index.ts`
- **API Client**: `src/features/sppg/menu/api/menuApi.ts`
- **Backend**: `src/app/api/sppg/menu/route.ts`
- **Schema**: `src/features/sppg/menu/schemas/index.ts`
- **Types**: `src/features/sppg/menu/types/index.ts`

---

**Status**: 🕐 Waiting for user to test and provide console logs
**Next Action**: User will click "Buat Menu" button and share console output
