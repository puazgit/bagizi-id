#!/bin/bash
# Minimal Coolify Post-Deployment Script
# Use this if the main script fails

echo "Starting minimal post-deployment..."

# Resolve any failed migrations first
npx prisma migrate resolve --rolled-back 20251019150022_add_production_to_distribution_schedule 2>/dev/null || true

# Deploy migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

echo "Deployment completed!"
