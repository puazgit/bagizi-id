-- Bagizi-ID SaaS Platform Database Initialization
-- Created: October 13, 2025

-- Create additional databases for testing and development
CREATE DATABASE bagizi_test;
CREATE DATABASE bagizi_shadow;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE bagizi_db TO bagizi_user;
GRANT ALL PRIVILEGES ON DATABASE bagizi_test TO bagizi_user;
GRANT ALL PRIVILEGES ON DATABASE bagizi_shadow TO bagizi_user;

-- Enable required extensions
\c bagizi_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c bagizi_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c bagizi_shadow;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create indexes for common queries (will be applied after Prisma migration)
-- These are optimizations for Indonesian regional data

-- Log initialization
INSERT INTO bagizi_db.public.system_logs (message, created_at) 
VALUES ('Bagizi-ID Database initialized successfully', NOW())
ON CONFLICT DO NOTHING;