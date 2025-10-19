#!/bin/bash
# Script to fix failed migration in production database
# Run this with production database credentials

echo "🔧 Fixing failed migration in production database..."
echo ""
echo "⚠️  WARNING: This will mark the failed migration as resolved."
echo "⚠️  Make sure you understand what this does before proceeding!"
echo ""
echo "Options:"
echo "1. Mark migration as resolved (if changes were actually applied)"
echo "2. Rollback migration and re-apply (if changes were not applied)"
echo "3. Check migration status"
echo ""
read -p "Choose option (1/2/3): " option

case $option in
  1)
    echo "Marking migration as resolved..."
    npx prisma migrate resolve --applied 20251019150022_add_production_to_distribution_schedule
    ;;
  2)
    echo "Rolling back failed migration..."
    npx prisma migrate resolve --rolled-back 20251019150022_add_production_to_distribution_schedule
    echo "Now you can re-deploy to apply the migration again"
    ;;
  3)
    echo "Checking migration status..."
    npx prisma migrate status
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac
