-- PostgreSQL Migration: Seed Application Users
-- This script adds application-level users to the users table
-- These are NOT database roles, but application users stored in the users table

-- ============================================================
-- IMPORTANT: Password Hashing
-- ============================================================
-- The passwords below are bcrypt hashed. In production, use proper password hashing.
-- The example passwords hash to 'password123' (DO NOT USE IN PRODUCTION!)
-- Generate new hashes using: bcrypt.hashSync('your_password', 10)

-- ============================================================
-- 1. INSERT DEFAULT ADMIN USER
-- ============================================================

-- Default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Hash generated with bcrypt salt rounds = 10
INSERT INTO users (id, username, email, password, role, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@netops.local',
    '$2a$10$rQZ8K5Y5Y5Y5Y5Y5Y5Y5YOeVZvZvZvZvZvZvZvZvZvZvZvZvZvZvZ', -- REPLACE WITH REAL HASH
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- 2. INSERT DEFAULT REGULAR USERS
-- ============================================================

-- Default operator user (password: operator123 - CHANGE IN PRODUCTION!)
INSERT INTO users (id, username, email, password, role, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'operator',
    'operator@netops.local',
    '$2a$10$rQZ8K5Y5Y5Y5Y5Y5Y5Y5YOeVZvZvZvZvZvZvZvZvZvZvZvZvZvZvZ', -- REPLACE WITH REAL HASH
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- Default viewer user (password: viewer123 - CHANGE IN PRODUCTION!)
INSERT INTO users (id, username, email, password, role, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'viewer',
    'viewer@netops.local',
    '$2a$10$rQZ8K5Y5Y5Y5Y5Y5Y5Y5YOeVZvZvZvZvZvZvZvZvZvZvZvZvZvZvZ', -- REPLACE WITH REAL HASH
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- 3. QUERIES TO ADD USERS WITH SPECIFIC ROLES
-- ============================================================

-- Template: Add new admin user
-- INSERT INTO users (username, email, password, role)
-- VALUES ('new_admin', 'new_admin@example.com', '<bcrypt_hash>', 'admin');

-- Template: Add new regular user
-- INSERT INTO users (username, email, password, role)
-- VALUES ('new_user', 'new_user@example.com', '<bcrypt_hash>', 'user');

-- ============================================================
-- 4. BULK INSERT USERS (Example)
-- ============================================================

-- Uncomment and modify for bulk user creation
/*
INSERT INTO users (username, email, password, role) VALUES
    ('user1', 'user1@example.com', '<bcrypt_hash>', 'user'),
    ('user2', 'user2@example.com', '<bcrypt_hash>', 'user'),
    ('user3', 'user3@example.com', '<bcrypt_hash>', 'admin')
ON CONFLICT (username) DO NOTHING;
*/

-- ============================================================
-- 5. UPDATE USER ROLES
-- ============================================================

-- Promote user to admin
-- UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP
-- WHERE username = 'existing_user';

-- Demote admin to regular user
-- UPDATE users SET role = 'user', updated_at = CURRENT_TIMESTAMP
-- WHERE username = 'existing_admin';

-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================

-- List all users with their roles
-- SELECT id, username, email, role, created_at FROM users ORDER BY role, username;

-- Count users by role
-- SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Find all admin users
-- SELECT username, email, created_at FROM users WHERE role = 'admin';
