#!/bin/bash

###############################################################################
# Production Database Backup Script
# 
# Creates timestamped backup of production database
# Usage: ./scripts/database/backup-production.sh
###############################################################################

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-bagizi_db}"
DB_USER="${DB_USER:-bagizi_user}"
BACKUP_DIR="backups/phase1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/bagizi_production_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🗄️  Starting production database backup..."
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"

# Create backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -b -v -f "$BACKUP_FILE" "$DB_NAME"

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup successful!"
    echo "File: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"
    
    # Keep only last 30 days of backups
    find "$BACKUP_DIR" -name "bagizi_production_*.sql" -type f -mtime +30 -delete
    echo "📦 Cleaned up old backups (>30 days)"
else
    echo "❌ Backup failed!"
    exit 1
fi
