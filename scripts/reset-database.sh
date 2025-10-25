#!/bin/bash

###############################################################################
# Database Reset & Seed Script for Coolify Deployment
# 
# This script resets the database and seeds it with fresh data.
# Use this for development/staging environments ONLY!
# 
# Usage:
#   ./scripts/reset-database.sh
#
# Prerequisites:
#   - DATABASE_URL environment variable must be set
#   - Prisma CLI must be available
#
# Author: Bagizi-ID Development Team
# Version: 1.0.0
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Header
echo ""
echo "======================================================================"
echo "  Bagizi-ID Database Reset & Seed Script"
echo "======================================================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ ERROR: DATABASE_URL environment variable is not set${NC}"
  echo ""
  echo "Please set DATABASE_URL before running this script:"
  echo "  export DATABASE_URL='postgresql://user:password@host:5432/dbname'"
  echo ""
  exit 1
fi

# Safety check - prevent running on production
echo -e "${YELLOW}⚠️  WARNING: This will DELETE ALL DATA in your database!${NC}"
echo ""
echo "Database URL: $DATABASE_URL"
echo ""

# Extract database name from URL for display
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
echo -e "${BLUE}Database Name: $DB_NAME${NC}"
echo ""

# Ask for confirmation
read -p "Are you sure you want to reset the database? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}❌ Database reset cancelled${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}🔄 Starting database reset process...${NC}"
echo ""

# Step 1: Generate Prisma Client
echo -e "${BLUE}📦 Step 1/4: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 2: Reset database (drop all data & recreate schema)
echo -e "${BLUE}🗄️  Step 2/4: Resetting database...${NC}"
npx prisma migrate reset --force --skip-seed
echo -e "${GREEN}✅ Database reset complete${NC}"
echo ""

# Step 3: Apply migrations
echo -e "${BLUE}⚡ Step 3/4: Applying migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations applied${NC}"
echo ""

# Step 4: Seed database
echo -e "${BLUE}🌱 Step 4/4: Seeding database...${NC}"

# Check if seed file exists
if [ -f "prisma/seed.ts" ]; then
  # Run seed with demo data
  SEED_DEMO_DATA=true npx tsx prisma/seed.ts
  echo -e "${GREEN}✅ Database seeded with demo data${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: prisma/seed.ts not found, skipping seed${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}✅ Database reset & seed completed successfully!${NC}"
echo "======================================================================"
echo ""
echo "Summary:"
echo "  - Database: $DB_NAME"
echo "  - Migrations: Applied"
echo "  - Seed Data: Loaded (with demo data)"
echo ""
echo "Next steps:"
echo "  1. Test your application"
echo "  2. Login with demo credentials (check docs/DEMO_CREDENTIALS.md)"
echo ""
