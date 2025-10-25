#!/bin/bash

echo "🧪 Testing SPPG API with Session Cookie"
echo "========================================"
echo ""

# Note: This won't work without actual session cookie
# But we can see the response structure

echo "📡 Testing: GET /api/admin/sppg"
echo "Expected: JSON with success: true, data: { data: [...], pagination: {...} }"
echo ""

curl -X GET "http://localhost:3000/api/admin/sppg" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -s \
  | head -c 500

echo ""
echo ""
echo "Note: If you see HTML (<!DOCTYPE), it means auth is required."
echo "This is expected for API test without browser session."
echo ""
echo "To test properly:"
echo "1. Open browser: http://localhost:3000/admin/sppg"
echo "2. Open DevTools Console (F12)"
echo "3. Look for debug logs: '🔍 SppgList Debug:'"
echo "4. Check Network tab for /api/admin/sppg request"
echo ""
