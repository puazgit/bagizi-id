#!/bin/bash
# Coolify Post-Deployment Script - Production Safe
# Handles failed migrations gracefully

set -e

echo "🚀 Starting post-deployment tasks..."

# Function to check migration status
check_migration_status() {
  npx prisma migrate status 2>&1 || echo "error"
}

# Check for failed migrations
echo "📋 Checking migration status..."
MIGRATION_STATUS=$(check_migration_status)

if echo "$MIGRATION_STATUS" | grep -q "failed"; then
  echo "⚠️  Failed migration detected!"
  echo "Migration name: 20251019150022_add_production_to_distribution_schedule"
  
  # Mark as rolled back so we can retry
  echo "🔄 Marking migration as rolled back..."
  npx prisma migrate resolve --rolled-back 20251019150022_add_production_to_distribution_schedule || {
    echo "❌ Failed to resolve migration"
    exit 1
  }
fi

# Deploy migrations
echo "📊 Deploying migrations..."
npx prisma migrate deploy || {
  echo "❌ Migration deployment failed"
  exit 1
}

# Generate Prisma Client (ensure latest schema)
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Post-deployment tasks completed successfully!"
echo "ℹ️  Note: Database seeding skipped in production"
