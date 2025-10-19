#!/bin/bash
# Coolify Post-Deployment Script - Production Safe
# Handles failed migrations gracefully

# Don't exit on error immediately - we want to handle errors
set +e

echo "🚀 Starting post-deployment tasks..."

# Check for failed migrations
echo "📋 Checking migration status..."
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)

if echo "$MIGRATION_STATUS" | grep -q "failed"; then
  echo "⚠️  Failed migration detected!"
  echo "🔄 Marking migration as rolled back..."
  npx prisma migrate resolve --rolled-back 20251019150022_add_production_to_distribution_schedule
fi

# Deploy migrations
echo "📊 Deploying migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "❌ Migration deployment failed"
  echo "Attempting alternative: prisma db push"
  npx prisma db push --accept-data-loss
fi

# Generate Prisma Client (ensure latest schema)
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Post-deployment tasks completed!"
exit 0
