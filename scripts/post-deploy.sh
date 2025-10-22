#!/bin/bash

# Post-Deploy Hook for Coolify
# This script runs after successful deployment

echo "🚀 Running post-deployment tasks..."

# 1. Run migrations
echo "1️⃣ Applying database migrations..."
npm run db:migrate:deploy

# 2. Check if database needs seeding
echo "2️⃣ Checking database seed status..."
npm run db:seed:production

# 3. Clear application cache (if needed)
# echo "3️⃣ Clearing cache..."
# Add cache clearing commands here

echo "✅ Post-deployment tasks completed!"
