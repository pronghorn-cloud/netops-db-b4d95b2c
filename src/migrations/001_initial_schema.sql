-- PostgreSQL Migration: Initial Schema
-- Created for NetOps API Migration from MongoDB to PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) UNIQUE NOT NULL CHECK (LENGTH(username) >= 3),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sites Table
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    address VARCHAR(300),
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Containers Table
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'rack' CHECK (type IN ('rack', 'cabinet', 'closet', 'room', 'other')),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    location VARCHAR(200),
    capacity INTEGER DEFAULT 0 CHECK (capacity >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (type IN ('switch', 'router', 'firewall', 'server', 'access-point', 'other')),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    ip_address VARCHAR(15),
    mac_address VARCHAR(17),
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_ip_address CHECK (ip_address ~* '^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$' OR ip_address IS NULL),
    CONSTRAINT valid_mac_address CHECK (mac_address ~* '^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$' OR mac_address IS NULL)
);

-- Indexes for Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Indexes for Sites
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);
CREATE INDEX IF NOT EXISTS idx_sites_location ON sites(location);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at DESC);

-- Full-text search index for Sites
CREATE INDEX IF NOT EXISTS idx_sites_search ON sites USING gin(to_tsvector('english', name || ' ' || location));

-- Indexes for Containers
CREATE INDEX IF NOT EXISTS idx_containers_site_id ON containers(site_id);
CREATE INDEX IF NOT EXISTS idx_containers_status ON containers(status);
CREATE INDEX IF NOT EXISTS idx_containers_site_status ON containers(site_id, status);
CREATE INDEX IF NOT EXISTS idx_containers_created_at ON containers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_containers_name ON containers(name);

-- Indexes for Devices
CREATE INDEX IF NOT EXISTS idx_devices_container_id ON devices(container_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);
CREATE INDEX IF NOT EXISTS idx_devices_container_status ON devices(container_id, status);
CREATE INDEX IF NOT EXISTS idx_devices_type_status ON devices(type, status);
CREATE INDEX IF NOT EXISTS idx_devices_ip_address ON devices(ip_address);
CREATE INDEX IF NOT EXISTS idx_devices_serial_number ON devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at DESC);

-- Full-text search index for Devices
CREATE INDEX IF NOT EXISTS idx_devices_search ON devices USING gin(to_tsvector('english', name || ' ' || COALESCE(manufacturer, '') || ' ' || COALESCE(model, '')));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON containers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'Application users with authentication credentials';
COMMENT ON TABLE sites IS 'Physical sites/locations containing containers';
COMMENT ON TABLE containers IS 'Containers (racks, cabinets, etc.) within sites';
COMMENT ON TABLE devices IS 'Network devices within containers';
