#!/bin/bash

echo "🔍 Verifying Priority 2 Implementation..."
echo "=========================================="

# Check files exist
echo "\n📁 Checking Required Files..."
[ -f "src/features/sppg/menu/components/MenuIngredientForm.tsx" ] && echo "✅ MenuIngredientForm.tsx exists" || echo "❌ MenuIngredientForm.tsx missing"
[ -f "src/app/api/sppg/inventory/items/route.ts" ] && echo "✅ Inventory API exists" || echo "❌ Inventory API missing"
[ -f "src/features/sppg/menu/hooks/useInventory.ts" ] && echo "✅ Inventory hook exists" || echo "❌ Inventory hook missing"
[ -f "src/features/sppg/menu/api/inventoryApi.ts" ] && echo "✅ Inventory API client exists" || echo "❌ Inventory API client missing"

# Check line count
echo "\n📊 Checking File Size..."
LINES=$(wc -l < "src/features/sppg/menu/components/MenuIngredientForm.tsx" 2>/dev/null || echo "0")
echo "MenuIngredientForm.tsx: $LINES lines"
if [ "$LINES" -gt 600 ]; then
  echo "✅ File size looks good (expected 600+)"
else
  echo "⚠️  File might be incomplete (expected 600+, got $LINES)"
fi

# Check for key features
echo "\n🔍 Checking for Key Features in Code..."
INVENTORY_COUNT=$(grep -c "Pilih dari Inventory" "src/features/sppg/menu/components/MenuIngredientForm.tsx" 2>/dev/null || echo "0")
STOCK_COUNT=$(grep -c "checkStockAvailability" "src/features/sppg/menu/components/MenuIngredientForm.tsx" 2>/dev/null || echo "0")
DUPLICATE_COUNT=$(grep -c "checkDuplicate" "src/features/sppg/menu/components/MenuIngredientForm.tsx" 2>/dev/null || echo "0")
DIALOG_COUNT=$(grep -c "AlertDialog" "src/features/sppg/menu/components/MenuIngredientForm.tsx" 2>/dev/null || echo "0")

[ "$INVENTORY_COUNT" -gt 0 ] && echo "✅ Inventory selector found ($INVENTORY_COUNT occurrences)" || echo "❌ Inventory selector missing"
[ "$STOCK_COUNT" -gt 0 ] && echo "✅ Stock validation found ($STOCK_COUNT occurrences)" || echo "❌ Stock validation missing"
[ "$DUPLICATE_COUNT" -gt 0 ] && echo "✅ Duplicate check found ($DUPLICATE_COUNT occurrences)" || echo "❌ Duplicate check missing"
[ "$DIALOG_COUNT" -gt 0 ] && echo "✅ Duplicate dialog found ($DIALOG_COUNT occurrences)" || echo "❌ Duplicate dialog missing"

# Check imports
echo "\n📦 Checking Important Imports..."
grep -q "useInventoryItems" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ useInventoryItems hook imported" || echo "❌ useInventoryItems hook not imported"
grep -q "useMenuIngredients" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ useMenuIngredients hook imported" || echo "❌ useMenuIngredients hook not imported"
grep -q "AlertDialog" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ AlertDialog components imported" || echo "❌ AlertDialog components not imported"

# Check state management
echo "\n🔧 Checking State Management..."
grep -q "useState" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ useState imported" || echo "❌ useState not imported"
grep -q "selectedInventoryItem" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ selectedInventoryItem state found" || echo "❌ selectedInventoryItem state missing"
grep -q "showDuplicateDialog" "src/features/sppg/menu/components/MenuIngredientForm.tsx" && echo "✅ showDuplicateDialog state found" || echo "❌ showDuplicateDialog state missing"

echo "\n=========================================="
echo "✨ Verification Complete!"
echo ""
echo "📋 Summary:"
echo "- Total lines: $LINES"
echo "- Inventory selector: $INVENTORY_COUNT mentions"
echo "- Stock validation: $STOCK_COUNT mentions"
echo "- Duplicate check: $DUPLICATE_COUNT mentions"
echo "- Dialog components: $DIALOG_COUNT mentions"
echo ""
echo "🔧 Next Steps:"
echo "1. If all checks passed: Restart dev server (npm run dev)"
echo "2. Hard refresh browser: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"
echo "3. Clear .next cache if needed: rm -rf .next && npm run dev"
echo "4. Check browser console for errors (F12)"
echo ""
echo "📖 Full troubleshooting guide: docs/PRIORITY2_TROUBLESHOOTING.md"
