-- PostgreSQL Migration: Database Roles and Permissions
-- This script creates database-level roles for access control
-- Run as superuser (postgres) or a user with CREATEROLE privilege

-- ============================================================
-- 1. DATABASE ROLES (PostgreSQL Server-Level)
-- ============================================================

-- Application Role: Main application user with full access to application tables
-- This role is used by the application to connect to the database
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'netops_app') THEN
        CREATE ROLE netops_app WITH
            LOGIN
            PASSWORD 'CHANGE_ME_IN_PRODUCTION'
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            INHERIT
            CONNECTION LIMIT 50;
        RAISE NOTICE 'Created role: netops_app';
    ELSE
        RAISE NOTICE 'Role netops_app already exists';
    END IF;
END
$$;

-- Read-Only Role: For reporting and monitoring tools
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'netops_readonly') THEN
        CREATE ROLE netops_readonly WITH
            LOGIN
            PASSWORD 'CHANGE_ME_IN_PRODUCTION'
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            INHERIT
            CONNECTION LIMIT 20;
        RAISE NOTICE 'Created role: netops_readonly';
    ELSE
        RAISE NOTICE 'Role netops_readonly already exists';
    END IF;
END
$$;

-- Admin Role: For database administration tasks
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'netops_admin') THEN
        CREATE ROLE netops_admin WITH
            LOGIN
            PASSWORD 'CHANGE_ME_IN_PRODUCTION'
            NOSUPERUSER
            CREATEDB
            CREATEROLE
            INHERIT
            CONNECTION LIMIT 10;
        RAISE NOTICE 'Created role: netops_admin';
    ELSE
        RAISE NOTICE 'Role netops_admin already exists';
    END IF;
END
$$;

-- Monitoring Role: For DataDog, Prometheus, or other monitoring tools
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'netops_monitoring') THEN
        CREATE ROLE netops_monitoring WITH
            LOGIN
            PASSWORD 'CHANGE_ME_IN_PRODUCTION'
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            INHERIT
            CONNECTION LIMIT 5;
        RAISE NOTICE 'Created role: netops_monitoring';
    ELSE
        RAISE NOTICE 'Role netops_monitoring already exists';
    END IF;
END
$$;

-- Replication Role: For database replication (standby servers)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'netops_replication') THEN
        CREATE ROLE netops_replication WITH
            LOGIN
            PASSWORD 'CHANGE_ME_IN_PRODUCTION'
            REPLICATION
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            CONNECTION LIMIT 5;
        RAISE NOTICE 'Created role: netops_replication';
    ELSE
        RAISE NOTICE 'Role netops_replication already exists';
    END IF;
END
$$;

-- ============================================================
-- 2. GRANT PERMISSIONS TO ROLES
-- ============================================================

-- Grant schema usage to all application roles
GRANT USAGE ON SCHEMA public TO netops_app, netops_readonly, netops_admin, netops_monitoring;

-- netops_app: Full CRUD access to all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO netops_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO netops_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO netops_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO netops_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO netops_app;

-- netops_readonly: Read-only access to all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO netops_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO netops_readonly;

-- netops_admin: Full access including DDL
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO netops_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO netops_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO netops_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO netops_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO netops_admin;

-- netops_monitoring: Read-only access to pg_stat tables and application tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO netops_monitoring;
GRANT pg_monitor TO netops_monitoring;  -- Built-in monitoring role (PostgreSQL 10+)

-- ============================================================
-- 3. ROW-LEVEL SECURITY (Optional - for multi-tenant scenarios)
-- ============================================================

-- Uncomment the following if you need row-level security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON ROLE netops_app IS 'Application service account - full CRUD access';
COMMENT ON ROLE netops_readonly IS 'Read-only access for reporting and analytics';
COMMENT ON ROLE netops_admin IS 'Database administrator with DDL privileges';
COMMENT ON ROLE netops_monitoring IS 'Monitoring tools access (DataDog, Prometheus, etc.)';
COMMENT ON ROLE netops_replication IS 'Replication role for standby database servers';

-- ============================================================
-- 5. VERIFICATION QUERIES
-- ============================================================

-- List all created roles
-- SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication
-- FROM pg_roles
-- WHERE rolname LIKE 'netops_%';

-- Check role memberships
-- SELECT r.rolname as role, m.rolname as member
-- FROM pg_roles r
-- JOIN pg_auth_members am ON r.oid = am.roleid
-- JOIN pg_roles m ON am.member = m.oid
-- WHERE r.rolname LIKE 'netops_%';
