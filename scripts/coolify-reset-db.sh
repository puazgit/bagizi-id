#!/bin/bash

###############################################################################
# Coolify Database Reset - Quick Script
# 
# Run this directly in Coolify terminal/SSH
# This is a simplified version without interactive prompts
#
# Usage in Coolify:
#   cd /app
#   bash scripts/coolify-reset-db.sh
#
# Author: Bagizi-ID Development Team
###############################################################################

set -e

echo "🔄 Coolify Database Reset & Seed"
echo "=================================="
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Reset database
echo "🗄️  Resetting database..."
npx prisma migrate reset --force --skip-seed

# Apply migrations
echo "⚡ Applying migrations..."
npx prisma migrate deploy

# Seed database with demo data
echo "🌱 Seeding database..."
SEED_DEMO_DATA=true npx tsx prisma/seed.ts

echo ""
echo "✅ Database reset complete!"
echo ""
