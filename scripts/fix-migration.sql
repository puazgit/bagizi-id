-- Fix failed migration in production database
-- Run this SQL in your production PostgreSQL database

-- Check current migration status
SELECT * FROM "_prisma_migrations" 
ORDER BY finished_at DESC 
LIMIT 5;

-- Mark failed migration as rolled back
UPDATE "_prisma_migrations" 
SET finished_at = NOW(), 
    applied_steps_count = 0
WHERE migration_name = '20251019150022_add_production_to_distribution_schedule'
AND started_at IS NOT NULL 
AND finished_at IS NULL;

-- Verify the fix
SELECT migration_name, started_at, finished_at, applied_steps_count
FROM "_prisma_migrations"
WHERE migration_name = '20251019150022_add_production_to_distribution_schedule';

-- After this, re-deploy in Coolify to apply the migration properly
