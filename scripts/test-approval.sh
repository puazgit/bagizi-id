#!/bin/bash

# Quick Approval Test Script
# Run this to diagnose approval issues

echo "🔍 Bagizi-ID Approval System Diagnostic"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "1️⃣ Checking if server is running..."
if curl -s http://localhost:3000/api/auth/session > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running or not accessible${NC}"
    echo "   Run: npm run dev"
    exit 1
fi
echo ""

# Test 2: Check database connection
echo "2️⃣ Checking database connection..."
if npx prisma db pull --print > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection OK${NC}"
else
    echo -e "${RED}❌ Cannot connect to database${NC}"
    echo "   Check if PostgreSQL is running: docker ps"
    exit 1
fi
echo ""

# Test 3: Check migration status
echo "3️⃣ Checking migration status..."
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ Migrations are up to date${NC}"
elif echo "$MIGRATION_STATUS" | grep -q "pending"; then
    echo -e "${YELLOW}⚠️  Pending migrations found${NC}"
    echo "   Run: npx prisma migrate dev"
else
    echo -e "${RED}❌ Migration status unknown${NC}"
    echo "$MIGRATION_STATUS"
fi
echo ""

# Test 4: Check if workflow fields exist in schema
echo "4️⃣ Checking workflow fields in schema..."
SCHEMA_FILE="prisma/schema.prisma"
REQUIRED_FIELDS=("approvedBy" "approvedAt" "submittedBy" "submittedAt" "rejectedBy" "rejectedAt" "publishedBy")
MISSING_FIELDS=()

for field in "${REQUIRED_FIELDS[@]}"; do
    if grep -q "$field" "$SCHEMA_FILE"; then
        echo -e "${GREEN}✅ Field '$field' exists${NC}"
    else
        echo -e "${RED}❌ Field '$field' missing${NC}"
        MISSING_FIELDS+=("$field")
    fi
done

if [ ${#MISSING_FIELDS[@]} -gt 0 ]; then
    echo -e "${RED}Missing fields detected. Schema may need update.${NC}"
fi
echo ""

# Test 5: Check if API endpoint exists
echo "5️⃣ Checking API endpoint files..."
API_ENDPOINTS=(
    "src/app/api/sppg/menu-planning/[id]/submit/route.ts"
    "src/app/api/sppg/menu-planning/[id]/approve/route.ts"
    "src/app/api/sppg/menu-planning/[id]/reject/route.ts"
    "src/app/api/sppg/menu-planning/[id]/publish/route.ts"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    if [ -f "$endpoint" ]; then
        echo -e "${GREEN}✅ ${endpoint##*/}${NC}"
    else
        echo -e "${RED}❌ ${endpoint##*/} missing${NC}"
    fi
done
echo ""

# Test 6: Check TypeScript compilation
echo "6️⃣ Checking TypeScript compilation..."
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors found${NC}"
    echo "   Run: npm run type-check"
fi
echo ""

# Test 7: Check for test user in database
echo "7️⃣ Checking test users in database..."
echo ""
echo "Run this query in your database client:"
echo ""
echo "SELECT email, user_role, sppg_id IS NOT NULL as has_sppg"
echo "FROM users"
echo "WHERE email IN ("
echo "  'kepala@sppg-purwakarta.com',"
echo "  'admin@sppg-purwakarta.com',"
echo "  'gizi@sppg-purwakarta.com'"
echo ");"
echo ""
echo "Expected:"
echo "  kepala@sppg-purwakarta.com | SPPG_KEPALA | true"
echo "  admin@sppg-purwakarta.com  | SPPG_ADMIN  | true"
echo "  gizi@sppg-purwakarta.com   | SPPG_AHLI_GIZI | true"
echo ""

# Summary
echo "========================================"
echo "✅ Diagnostic complete!"
echo ""
echo "📝 Next steps to test approval:"
echo ""
echo "1. Login as: kepala@sppg-purwakarta.com"
echo "   Password: password123"
echo ""
echo "2. Create a plan and submit for review:"
echo "   - Go to /menu-planning"
echo "   - Create new plan"
echo "   - Click '...' menu → 'Submit for Review'"
echo ""
echo "3. Approve the plan:"
echo "   - Open plan detail"
echo "   - Click '...' menu → 'Approve Plan'"
echo "   - Should show approval dialog"
echo ""
echo "4. If error occurs:"
echo "   - Check browser console (F12)"
echo "   - Check server logs in terminal"
echo "   - Check docs/APPROVAL_ERROR_TROUBLESHOOTING.md"
echo ""
echo "🔍 For detailed error info, enable dev mode:"
echo "   - Add to .env.local: NODE_ENV=development"
echo "   - Error details will show in API responses"
echo ""
