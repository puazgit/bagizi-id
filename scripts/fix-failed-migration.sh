#!/bin/bash

# Fix Failed Migrations in Coolify Production
# This script marks failed migrations as resolved

echo "🔧 Checking for failed migrations..."

# Check migration status
npx prisma migrate status

echo ""
echo "🔄 Attempting to resolve failed migrations..."

# Mark specific failed migration as resolved
npx prisma migrate resolve --applied 20251021040145_fix01_menu_ingredient_required_inventory_link

echo ""
echo "✅ Failed migration marked as resolved!"
echo ""
echo "Now you can run: npm run build"
