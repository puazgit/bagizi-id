#!/bin/bash

echo "🌱 Running Inventory Seed..."
echo ""

# Run the inventory seed script
npx tsx prisma/seeds/inventory-seed.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Inventory seed completed successfully!"
  echo ""
  echo "📋 Next steps:"
  echo "1. Refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)"
  echo "2. Go to: http://localhost:3000/menu/cmgqcxwfl001esv3jt4c2syps"
  echo "3. Click 'Bahan' tab"
  echo "4. You should now see the '📦 Pilih dari Inventory' selector!"
else
  echo ""
  echo "❌ Inventory seed failed!"
  echo ""
  echo "Try manual creation via Prisma Studio:"
  echo "npm run db:studio"
fi
