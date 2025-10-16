#!/bin/bash

echo "🔄 Force Refresh - Clearing All Caches"
echo "======================================"

# Stop any running dev server
echo "\n1️⃣ Stopping dev server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "   No server running on port 3000"

# Clear Next.js cache
echo "\n2️⃣ Clearing Next.js cache..."
rm -rf .next
echo "   ✓ .next directory removed"

# Clear node_modules cache
echo "\n3️⃣ Clearing node_modules cache..."
rm -rf node_modules/.cache
echo "   ✓ node_modules/.cache removed"

# Restart dev server
echo "\n4️⃣ Starting dev server..."
echo "   Please run: npm run dev"
echo ""
echo "5️⃣ After server starts:"
echo "   - Open browser in INCOGNITO mode"
echo "   - Or hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"
echo ""
echo "✅ Cache cleared! Ready to restart."
