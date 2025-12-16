-- =====================================================
-- STUFFBI DATABASE SETUP SCRIPT
-- Run this to completely recreate the database schema
-- WARNING: This will DELETE all existing data!
-- =====================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- BUNDLES TABLE (with sync support)
-- =====================================================
CREATE TABLE bundles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(36) UNIQUE,  -- For mobile app UUID mapping
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for sync queries
CREATE INDEX idx_bundles_client_id ON bundles(client_id);
CREATE INDEX idx_bundles_user_id ON bundles(user_id);
CREATE INDEX idx_bundles_updated_at ON bundles(updated_at);

-- =====================================================
-- ITEMS TABLE (with sync support)
-- =====================================================
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(36) UNIQUE,  -- For mobile app UUID mapping
    name VARCHAR(255) NOT NULL,
    subtitle TEXT,
    bundle_id INTEGER REFERENCES bundles(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for sync queries
CREATE INDEX idx_items_client_id ON items(client_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_bundle_id ON items(bundle_id);
CREATE INDEX idx_items_updated_at ON items(updated_at);

-- =====================================================
-- ACTIVITY LOG TABLE (with sync support)
-- =====================================================
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(36) UNIQUE,  -- For mobile app UUID mapping
    entity_type VARCHAR(50),  -- 'item', 'bundle'
    entity_id INTEGER,
    action VARCHAR(50),  -- 'create', 'update', 'delete'
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for sync queries
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_client_id ON activity_log(client_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- =====================================================
-- VERIFY SETUP
-- =====================================================
SELECT 'Database schema created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- =====================================================
-- TO SEED TEST USER, RUN:
-- cd Stuffbi-webapp-backend
-- node scripts/seedUser.js
-- =====================================================

