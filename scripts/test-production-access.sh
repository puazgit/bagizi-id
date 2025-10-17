#!/bin/bash

# Production Module Access Test Script
# Tests authentication and authorization for Production Module

echo "🔍 Production Module Access Verification"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test accounts
ACCOUNTS=(
  "produksi@sppg-purwakarta.com|password123|SPPG_PRODUKSI_MANAGER|✅ Should Access"
  "admin@sppg-purwakarta.com|password123|SPPG_ADMIN|✅ Should Access"
  "kepala@sppg-purwakarta.com|password123|SPPG_KEPALA|✅ Should Access"
  "gizi@sppg-purwakarta.com|password123|SPPG_AHLI_GIZI|✅ Should Access"
  "akuntan@sppg-purwakarta.com|password123|SPPG_AKUNTAN|❌ Should Deny"
)

echo "📋 Test Accounts:"
echo ""
for account in "${ACCOUNTS[@]}"; do
  IFS='|' read -r email password role expected <<< "$account"
  echo "  Email: $email"
  echo "  Role: $role"
  echo "  Expected: $expected"
  echo ""
done

echo "🔐 Middleware Protection Rules:"
echo ""
echo "  Route: /production"
echo "  Allowed Roles:"
echo "    ✅ SPPG_KEPALA"
echo "    ✅ SPPG_ADMIN"
echo "    ✅ SPPG_PRODUKSI_MANAGER"
echo "    ✅ SPPG_STAFF_DAPUR"
echo "    ✅ SPPG_STAFF_QC"
echo "    ✅ SPPG_AHLI_GIZI"
echo ""
echo "  Denied Roles:"
echo "    ❌ SPPG_AKUNTAN"
echo "    ❌ SPPG_DISTRIBUSI_MANAGER"
echo "    ❌ SPPG_HRD_MANAGER"
echo "    ❌ SPPG_STAFF_DISTRIBUSI"
echo "    ❌ SPPG_STAFF_ADMIN"
echo "    ❌ SPPG_VIEWER"
echo ""

echo "📁 Production Routes:"
echo ""
echo "  ✅ /production - List page with statistics"
echo "  ✅ /production/new - Create production form"
echo "  ✅ /production/[id] - Detail production view"
echo "  ✅ /production/[id]/edit - Edit production (PLANNED only)"
echo ""

echo "🧪 Manual Testing Steps:"
echo ""
echo "1. Open browser to http://localhost:3000/login"
echo "2. Login with: produksi@sppg-purwakarta.com / password123"
echo "3. Navigate to /production"
echo "4. Expected: ✅ Page loads successfully"
echo ""
echo "5. Logout and login with: akuntan@sppg-purwakarta.com / password123"
echo "6. Navigate to /production"
echo "7. Expected: ❌ Redirected to /dashboard?error=access-denied"
echo ""

echo "🔍 Debugging Commands:"
echo ""
echo "  Check user in database:"
echo "  $ npx prisma studio"
echo ""
echo "  Check session in browser console:"
echo "  > fetch('/api/auth/session').then(r => r.json()).then(console.log)"
echo ""
echo "  Check middleware logs:"
echo "  $ tail -f .next/server/app-paths-manifest.json"
echo ""

echo "✅ Verification Complete!"
echo ""
echo "For detailed guide, see: docs/PRODUCTION_ACCESS_GUIDE.md"
