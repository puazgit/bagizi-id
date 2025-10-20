#!/bin/bash

###############################################################################
# Setup Staging Database from Production Backup
# 
# Usage: ./scripts/database/setup-staging.sh [backup_file]
###############################################################################

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
STAGING_DB="${STAGING_DB:-bagizi_staging}"
DB_USER="${DB_USER:-bagizi_user}"
BACKUP_FILE="${1:-backups/phase1/latest.sql}"

echo "🗄️  Setting up staging database from backup..."

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    echo "Usage: $0 [backup_file]"
    exit 1
fi

echo "Backup file: $BACKUP_FILE"
echo "Staging database: $STAGING_DB"

# Drop existing staging database if exists
echo "Dropping existing staging database (if exists)..."
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --if-exists "$STAGING_DB"

# Create new staging database
echo "Creating staging database..."
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$STAGING_DB"

# Restore backup
echo "Restoring backup to staging..."
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$STAGING_DB" -v "$BACKUP_FILE"

echo "✅ Staging database setup complete!"
echo ""
echo "Verify with:"
echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER $STAGING_DB -c '\\dt'"
