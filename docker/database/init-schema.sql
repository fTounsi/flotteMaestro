-- ============================================================================
-- FLOTTEMAESTRO - PRODUCTION POSTGRESQL / POSTGIS DATABASE SCHEMA
-- ============================================================================
-- Compatible with PostgreSQL 15+, PostGIS 3+, and TimescaleDB
-- Multi-tenant Fleet Management, GPS Telemetry, Invoicing & IoT Telematics
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable PostGIS if available on the server for geospatial calculations
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ----------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ----------------------------------------------------------------------------
-- 2. CORE & MULTI-TENANCY
-- ----------------------------------------------------------------------------

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY, -- 'basic', 'professional', 'enterprise'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_month_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vehicle_limit INT NOT NULL DEFAULT 10,
    user_limit INT NOT NULL DEFAULT 5,
    tracker_limit INT NOT NULL DEFAULT 10,
    fleet_limit INT NOT NULL DEFAULT 3,
    history_retention_days INT NOT NULL DEFAULT 90,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(255),
    types TEXT[] NOT NULL DEFAULT ARRAY['Transport company'], -- 'Rental agency', 'Transport company', etc.
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Morocco',
    city VARCHAR(100) DEFAULT 'Casablanca',
    timezone VARCHAR(50) DEFAULT 'Africa/Casablanca',
    locale VARCHAR(10) DEFAULT 'fr', -- 'en', 'fr', 'ar'
    logo_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'pending'
    plan_id VARCHAR(50) REFERENCES subscription_plans(id) ON UPDATE CASCADE DEFAULT 'professional',
    
    -- Subscription details
    subscription_start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year'),
    
    -- Feature Modules Flags
    module_car_rental BOOLEAN NOT NULL DEFAULT TRUE,
    module_fuel_intelligence BOOLEAN NOT NULL DEFAULT TRUE,
    module_cold_chain BOOLEAN NOT NULL DEFAULT TRUE,
    module_live_sharing BOOLEAN NOT NULL DEFAULT TRUE,
    module_predictive_maintenance BOOLEAN NOT NULL DEFAULT TRUE,
    module_billing BOOLEAN NOT NULL DEFAULT TRUE,
    
    custom_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'fleet_manager', -- 'super_admin', 'support_admin', 'org_owner', 'org_admin', 'fleet_manager', 'driver', 'viewer'
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    avatar_url TEXT,
    demo_pin VARCHAR(10),
    department VARCHAR(100),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    assigned_vehicle_ids JSONB DEFAULT '[]'::jsonb,
    custom_permissions JSONB DEFAULT '[]'::jsonb,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_email UNIQUE (email)
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Sessions & JWT Token Refresh
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(50),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);

-- API Keys for external integrations / mobile clients
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    key_name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['read:vehicles', 'read:positions'],
    rate_limit_per_min INT DEFAULT 120,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);

-- ----------------------------------------------------------------------------
-- 3. FLEET ASSETS & TELEMATICS HARDWARE
-- ----------------------------------------------------------------------------

-- Fleets (Sub-groups inside an organization)
CREATE TABLE IF NOT EXISTS fleets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#10b981',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fleets_org ON fleets(organization_id);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    license_number VARCHAR(100) NOT NULL,
    license_category VARCHAR(20) DEFAULT 'B',
    license_expiry TIMESTAMPTZ,
    avatar_url TEXT,
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'on_leave', 'inactive'
    eco_driving_score INT DEFAULT 85,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_org ON drivers(organization_id);

-- GPS Hardware Trackers
CREATE TABLE IF NOT EXISTS trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    protocol VARCHAR(50) NOT NULL, -- 'teltonika', 'coban', 'concox', 'queclink', 'ruptela', 'suntech', 'obd2'
    device_identifier VARCHAR(100) NOT NULL, -- IMEI or Hardware ID
    imei VARCHAR(50) NOT NULL,
    sim_phone_number VARCHAR(50),
    sim_iccid VARCHAR(50),
    model VARCHAR(100) NOT NULL DEFAULT 'Teltonika FMB920',
    manufacturer VARCHAR(100) DEFAULT 'Teltonika',
    firmware_version VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'offline', 'unassigned', 'deactivated'
    last_seen_at TIMESTAMPTZ,
    last_latitude DOUBLE PRECISION,
    last_longitude DOUBLE PRECISION,
    last_speed DOUBLE PRECISION DEFAULT 0.0,
    battery INT DEFAULT 100,
    external_voltage DOUBLE PRECISION DEFAULT 12.6,
    installed_at TIMESTAMPTZ,
    report_interval_sec INT DEFAULT 10,
    overspeed_threshold_kmh INT DEFAULT 120,
    idle_threshold_minutes INT DEFAULT 15,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tracker_imei UNIQUE (imei)
);

CREATE INDEX idx_trackers_org ON trackers(organization_id);
CREATE INDEX idx_trackers_imei ON trackers(imei);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    fleet_id UUID REFERENCES fleets(id) ON DELETE SET NULL,
    tracker_id UUID REFERENCES trackers(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    model_year INT NOT NULL DEFAULT 2024,
    vehicle_type VARCHAR(50) NOT NULL DEFAULT 'sedan', -- 'truck', 'van', 'sedan', 'suv', 'bus', 'motorcycle', 'reefer'
    body_type VARCHAR(50) DEFAULT 'Sedan',
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'diesel', -- 'diesel', 'gasoline', 'electric', 'hybrid'
    engine_info VARCHAR(100) DEFAULT '2.0L TDI',
    color VARCHAR(50) DEFAULT 'Silver',
    license_plate VARCHAR(50) NOT NULL,
    vin VARCHAR(100),
    odometer NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fuel_level_percent INT DEFAULT 85,
    fuel_tank_capacity_liters NUMERIC(8, 2) DEFAULT 60.00,
    status VARCHAR(30) NOT NULL DEFAULT 'stopped', -- 'moving', 'idle', 'stopped', 'offline'
    image_url TEXT,
    icon_type VARCHAR(50) DEFAULT 'sedan',
    daily_distance_km NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Reefer / Cold Chain Telemetry
    temperature_celsius NUMERIC(5, 2),
    temperature_zone_a NUMERIC(5, 2),
    temperature_zone_b NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    reefer_door_open BOOLEAN DEFAULT FALSE,
    
    -- Remote Immobilizer Relay state
    relay_cutoff_active BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Rental Configuration attributes (if Car Rental module enabled)
    is_rented BOOLEAN DEFAULT FALSE,
    rental_status VARCHAR(50) DEFAULT 'available', -- 'available', 'rented', 'reserved', 'maintenance', 'immobilized'
    rental_renter_name VARCHAR(150),
    rental_renter_phone VARCHAR(50),
    rental_contract_number VARCHAR(100),
    rental_daily_rate_mad NUMERIC(10, 2) DEFAULT 450.00,
    rental_daily_rate_usd NUMERIC(10, 2) DEFAULT 45.00,
    rental_category VARCHAR(100) DEFAULT 'Economy Sedan',
    rental_transmission VARCHAR(30) DEFAULT 'Manual',
    
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_license_plate_per_org UNIQUE (organization_id, license_plate)
);

CREATE INDEX idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_tracker ON vehicles(tracker_id);

CREATE TRIGGER set_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Remote Tracker Commands Log (SMS / GPRS / Immobilizer / Reboot)
CREATE TABLE IF NOT EXISTS tracker_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tracker_id UUID NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    command_type VARCHAR(50) NOT NULL, -- 'engine_stop', 'engine_resume', 'set_interval', 'reboot', 'custom'
    raw_command TEXT NOT NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'gprs', -- 'gprs', 'sms'
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'acknowledged', 'failed', 'timeout'
    response_payload TEXT,
    sent_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commands_tracker ON tracker_commands(tracker_id);
CREATE INDEX idx_commands_status ON tracker_commands(status);

-- ----------------------------------------------------------------------------
-- 4. TELEMETRY, TIME-SERIES POSITIONS & TRIPS
-- ----------------------------------------------------------------------------

-- GPS Positions (High-frequency telemetry stream)
CREATE TABLE IF NOT EXISTS gps_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    tracker_id UUID REFERENCES trackers(id) ON DELETE SET NULL,
    
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION DEFAULT 0.0,
    speed DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- km/h
    heading DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- 0 to 360
    accuracy DOUBLE PRECISION DEFAULT 5.0, -- meters
    
    ignition BOOLEAN NOT NULL DEFAULT FALSE,
    motion BOOLEAN NOT NULL DEFAULT FALSE,
    battery INT DEFAULT 100, -- 0-100%
    external_voltage DOUBLE PRECISION DEFAULT 12.6, -- Volts
    odometer NUMERIC(12, 2) DEFAULT 0.00, -- km
    satellites INT DEFAULT 12,
    protocol VARCHAR(50) DEFAULT 'teltonika',
    address TEXT,
    
    -- Additional Sensors / CAN-bus / OBD-II
    fuel_level_percent INT,
    fuel_consumption_rate NUMERIC(6, 2),
    engine_rpm INT,
    coolant_temp_celsius INT,
    cargo_temp_a NUMERIC(5, 2),
    cargo_temp_b NUMERIC(5, 2),
    door_status BOOLEAN,
    
    raw_attributes JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Note: In TimescaleDB production, you can execute:
-- SELECT create_hypertable('gps_positions', 'recorded_at', if_not_exists => TRUE);

CREATE INDEX idx_positions_vehicle_time ON gps_positions(vehicle_id, recorded_at DESC);
CREATE INDEX idx_positions_org_time ON gps_positions(organization_id, recorded_at DESC);
CREATE INDEX idx_positions_recorded_at ON gps_positions(recorded_at DESC);

-- Trips (Aggregated segments from Ignition ON to Ignition OFF)
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 0,
    distance_km NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_speed_kmh NUMERIC(6, 2) DEFAULT 0.00,
    avg_speed_kmh NUMERIC(6, 2) DEFAULT 0.00,
    
    start_address TEXT,
    end_address TEXT,
    start_latitude DOUBLE PRECISION NOT NULL,
    start_longitude DOUBLE PRECISION NOT NULL,
    end_latitude DOUBLE PRECISION NOT NULL,
    end_longitude DOUBLE PRECISION NOT NULL,
    
    waypoints JSONB DEFAULT '[]'::jsonb, -- Array of [{lat, lng, speed, time}]
    stops_count INT DEFAULT 0,
    idle_duration_minutes INT DEFAULT 0,
    fuel_consumed_liters NUMERIC(8, 2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_vehicle ON trips(vehicle_id, start_time DESC);
CREATE INDEX idx_trips_org ON trips(organization_id, start_time DESC);

-- Fleet Stops & Idle Events
CREATE TABLE IF NOT EXISTS fleet_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 0,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    is_idle BOOLEAN NOT NULL DEFAULT FALSE -- Engine on but stopped
);

CREATE INDEX idx_stops_vehicle ON fleet_stops(vehicle_id, start_time DESC);

-- ----------------------------------------------------------------------------
-- 5. GEOFENCING & ALERT RULES ENGINE
-- ----------------------------------------------------------------------------

-- Geofences
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'circle', -- 'circle', 'polygon'
    color VARCHAR(30) NOT NULL DEFAULT '#10b981',
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Circle definition
    center_latitude DOUBLE PRECISION,
    center_longitude DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION,
    
    -- Polygon definition
    coordinates JSONB, -- Array of [[lat, lng], [lat, lng], ...]
    
    speed_limit_kmh INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geofences_org ON geofences(organization_id);

-- Alert Rules Definition
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL DEFAULT 'all', -- 'all' or specific UUID
    type VARCHAR(50) NOT NULL, -- 'overspeed', 'geofence_enter', 'geofence_exit', 'ignition_on', 'ignition_off', 'excessive_idle', 'low_battery', 'low_voltage', 'sos_button'
    trigger_value VARCHAR(100), -- e.g. "120" km/h, or geofenceId
    unit VARCHAR(20) DEFAULT 'km/h',
    severity VARCHAR(30) NOT NULL DEFAULT 'warning', -- 'critical', 'warning', 'info'
    channels TEXT[] DEFAULT ARRAY['sound', 'notification'], -- 'sound', 'notification', 'email', 'relay_cut'
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(100),
    created_by_role VARCHAR(50),
    trigger_count INT NOT NULL DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_rules_org ON alert_rules(organization_id);

-- Generated Incidents / Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    vehicle_name VARCHAR(150) NOT NULL,
    tracker_id UUID REFERENCES trackers(id) ON DELETE SET NULL,
    
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'warning', -- 'critical', 'warning', 'info'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    speed DOUBLE PRECISION,
    
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    triage_status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'acknowledged', 'resolved'
    acknowledged_by VARCHAR(150),
    acknowledged_at TIMESTAMPTZ,
    assigned_to VARCHAR(150),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    
    trigger_value VARCHAR(100),
    threshold_value VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_org ON alerts(organization_id, created_at DESC);
CREATE INDEX idx_alerts_vehicle ON alerts(vehicle_id, created_at DESC);
CREATE INDEX idx_alerts_triage ON alerts(triage_status);

-- ----------------------------------------------------------------------------
-- 6. SPECIALIZED MODULE 1: CAR RENTAL & SECURITY
-- ----------------------------------------------------------------------------

-- Rental Customer Profiles & Blacklist
CREATE TABLE IF NOT EXISTS rental_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    cin_or_passport VARCHAR(100) NOT NULL,
    driver_license_number VARCHAR(100) NOT NULL,
    license_issue_date DATE,
    rating_score NUMERIC(3, 1) DEFAULT 5.0,
    total_rentals_count INT DEFAULT 0,
    total_spent_usd NUMERIC(12, 2) DEFAULT 0.00,
    status_tag VARCHAR(30) DEFAULT 'regular', -- 'vip', 'regular', 'warning', 'blacklisted'
    last_rental_date DATE,
    incident_history_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rental_customers_org ON rental_customers(organization_id);
CREATE INDEX idx_rental_customers_cin ON rental_customers(cin_or_passport);

-- Rental Contracts
CREATE TABLE IF NOT EXISTS rental_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES rental_customers(id) ON DELETE SET NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    contract_number VARCHAR(100) NOT NULL,
    vehicle_plate VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    
    renter_name VARCHAR(150) NOT NULL,
    renter_phone VARCHAR(50) NOT NULL,
    renter_email VARCHAR(255),
    renter_passport_or_cin VARCHAR(100) NOT NULL,
    driver_license_number VARCHAR(100) NOT NULL,
    
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    actual_return_date TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'overdue', 'reserved', 'cancelled'
    
    daily_rate_usd NUMERIC(10, 2) NOT NULL DEFAULT 45.00,
    daily_mileage_allowance_km INT DEFAULT 250,
    start_odometer NUMERIC(12, 2) NOT NULL,
    current_odometer NUMERIC(12, 2) NOT NULL,
    start_fuel_percent INT NOT NULL DEFAULT 100,
    current_fuel_percent INT NOT NULL DEFAULT 100,
    
    deposit_amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    deposit_status VARCHAR(30) NOT NULL DEFAULT 'held', -- 'held', 'refunded', 'partially_retained'
    excess_mileage_rate_per_km_usd NUMERIC(6, 2) DEFAULT 0.35,
    authorized_zones TEXT[] DEFAULT ARRAY['Morocco Zone Nord', 'Casablanca Grand'],
    unauthorized_border_warning BOOLEAN DEFAULT TRUE,
    
    damage_marks JSONB DEFAULT '[]'::jsonb,
    digital_signature_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_contract_number UNIQUE (organization_id, contract_number)
);

CREATE INDEX idx_rental_contracts_org ON rental_contracts(organization_id);
CREATE INDEX idx_rental_contracts_vehicle ON rental_contracts(vehicle_id);

-- Rental Reservations
CREATE TABLE IF NOT EXISTS rental_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    reservation_number VARCHAR(100) NOT NULL,
    vehicle_plate VARCHAR(50),
    vehicle_model VARCHAR(100),
    category VARCHAR(100) NOT NULL DEFAULT 'Economy Sedan',
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    customer_cin_or_passport VARCHAR(100),
    pickup_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ NOT NULL,
    days_count INT NOT NULL DEFAULT 3,
    daily_rate_usd NUMERIC(10, 2) NOT NULL DEFAULT 45.00,
    total_estimated_usd NUMERIC(10, 2) NOT NULL DEFAULT 135.00,
    deposit_amount_usd NUMERIC(10, 2) DEFAULT 300.00,
    payment_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'deposit_paid', 'fully_paid'
    status VARCHAR(30) DEFAULT 'confirmed', -- 'confirmed', 'pending', 'converted', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_org ON rental_reservations(organization_id);

-- Relay Immobilizer Command Audit Log
CREATE TABLE IF NOT EXISTS relay_command_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    contract_number VARCHAR(100),
    renter_name VARCHAR(150),
    action VARCHAR(30) NOT NULL, -- 'cut_off', 'restore'
    status VARCHAR(30) NOT NULL DEFAULT 'executed', -- 'executed', 'pending_ack', 'failed', 'cancelled'
    speed_kmh_at_execution NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    safety_check_passed BOOLEAN NOT NULL DEFAULT TRUE,
    reason VARCHAR(50) NOT NULL, -- 'theft_suspected', 'overdue_nonpayment', 'unauthorized_zone_exit', 'curfew_violation', 'customer_emergency', 'maintenance_test', 'manual_operator'
    protocol_command TEXT NOT NULL,
    operator_name VARCHAR(150) NOT NULL,
    operator_role VARCHAR(50) NOT NULL,
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_relay_logs_vehicle ON relay_command_logs(vehicle_id);

-- ----------------------------------------------------------------------------
-- 7. SPECIALIZED MODULE 2: AI FUEL INTELLIGENCE & ANTI-THEFT
-- ----------------------------------------------------------------------------

-- Fuel Drop & Siphon Incidents
CREATE TABLE IF NOT EXISTS fuel_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'siphon_theft', 'abnormal_loss', 'rapid_drain', 'unauthorized_refuel'
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    volume_liters NUMERIC(8, 2) NOT NULL,
    estimated_cost_usd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed_theft', -- 'confirmed_theft', 'under_investigation', 'false_positive', 'resolved'
    engine_status VARCHAR(20) DEFAULT 'off', -- 'off', 'idle', 'on'
    initial_percent INT NOT NULL,
    final_percent INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fuel_incidents_org ON fuel_incidents(organization_id, created_at DESC);

-- Legitimate Refuel Records
CREATE TABLE IF NOT EXISTS refuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    location_name VARCHAR(255),
    liters_added NUMERIC(8, 2) NOT NULL,
    cost_usd NUMERIC(10, 2) NOT NULL,
    odometer NUMERIC(12, 2) NOT NULL,
    fuel_percent_before INT NOT NULL,
    fuel_percent_after INT NOT NULL,
    station_name VARCHAR(150),
    receipt_number VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refuel_vehicle ON refuel_records(vehicle_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 8. SPECIALIZED MODULE 3: COLD-CHAIN & REEFER TEMPERATURE TELEMETRY
-- ----------------------------------------------------------------------------

-- Temperature Excursions
CREATE TABLE IF NOT EXISTS cold_chain_excursions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    compartment VARCHAR(100) NOT NULL, -- 'Chilled (Compartment A)', 'Deep Freeze (Compartment B)'
    recorded_temp_celsius NUMERIC(5, 2) NOT NULL,
    min_allowed_celsius NUMERIC(5, 2) NOT NULL,
    max_allowed_celsius NUMERIC(5, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 15,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255),
    cargo_description VARCHAR(200),
    severity VARCHAR(30) NOT NULL DEFAULT 'critical', -- 'warning', 'critical'
    door_was_open BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cold_chain_org ON cold_chain_excursions(organization_id);

-- HACCP Compliance Certificates
CREATE TABLE IF NOT EXISTS haccp_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    client_consignee VARCHAR(150) NOT NULL,
    cargo_type VARCHAR(100) NOT NULL,
    min_recorded_celsius NUMERIC(5, 2) NOT NULL,
    max_recorded_celsius NUMERIC(5, 2) NOT NULL,
    avg_recorded_celsius NUMERIC(5, 2) NOT NULL,
    compliance_status VARCHAR(50) NOT NULL DEFAULT '100% Compliant', -- '100% Compliant', 'Minor Excursion', 'Breached'
    inspector_name VARCHAR(150) NOT NULL,
    pdf_download_url TEXT,
    generated_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. SPECIALIZED MODULE 4: CLIENT LIVE TRACKING & E-POD
-- ----------------------------------------------------------------------------

-- Shareable Live Tracking Links (Secure Tokenized URL)
CREATE TABLE IF NOT EXISTS shareable_live_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(50),
    destination_address TEXT NOT NULL,
    destination_latitude DOUBLE PRECISION NOT NULL,
    destination_longitude DOUBLE PRECISION NOT NULL,
    unique_token VARCHAR(100) NOT NULL,
    pin_code VARCHAR(10),
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'delivered', 'expired'
    eta_minutes INT DEFAULT 45,
    remaining_distance_km NUMERIC(8, 2) DEFAULT 12.5,
    order_reference VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tracking_token UNIQUE (unique_token)
);

CREATE INDEX idx_live_links_token ON shareable_live_links(unique_token);

-- Electronic Proof of Delivery (E-POD)
CREATE TABLE IF NOT EXISTS delivery_pods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(100) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    delivery_address TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'delivered', -- 'delivered', 'partially_delivered', 'refused', 'pending'
    delivered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    recipient_signature_name VARCHAR(150),
    signature_data_url TEXT,
    photo_proof_url TEXT,
    driver_notes TEXT,
    geo_verified_latitude DOUBLE PRECISION,
    geo_verified_longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 10. SPECIALIZED MODULE 5: PREDICTIVE MAINTENANCE & OBD-II
-- ----------------------------------------------------------------------------

-- Maintenance Service Intervals
CREATE TABLE IF NOT EXISTS maintenance_intervals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100),
    service_type VARCHAR(50) NOT NULL, -- 'engine_oil', 'brake_pads', 'tires', 'timing_belt', 'air_filter', 'technical_inspection', 'spark_plugs', 'transmission_fluid', 'battery_coolant', 'general_overhaul', 'other'
    title VARCHAR(150) NOT NULL,
    interval_km INT NOT NULL DEFAULT 10000,
    interval_days INT NOT NULL DEFAULT 180,
    last_done_odometer NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    last_done_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_due_odometer NUMERIC(12, 2) NOT NULL,
    next_due_date TIMESTAMPTZ NOT NULL,
    remaining_km NUMERIC(12, 2) NOT NULL,
    remaining_days INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'good', -- 'good', 'due_soon', 'overdue'
    estimated_cost_usd NUMERIC(10, 2) DEFAULT 120.00,
    preferred_workshop VARCHAR(150),
    email_alerts_enabled BOOLEAN DEFAULT TRUE,
    alert_threshold_km INT DEFAULT 1000,
    alert_threshold_days INT DEFAULT 14,
    last_alert_sent_at TIMESTAMPTZ,
    alert_recipient_emails TEXT[] DEFAULT ARRAY[]::text[],
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_vehicle ON maintenance_intervals(vehicle_id);

-- DTC Diagnostic Trouble Codes (OBD-II CAN-Bus Engine Faults)
CREATE TABLE IF NOT EXISTS dtc_diagnostic_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    code VARCHAR(30) NOT NULL, -- e.g. 'P0420', 'P0300'
    system VARCHAR(50) NOT NULL DEFAULT 'Powertrain', -- 'Powertrain', 'Braking', 'Emission', 'Transmission', 'Body'
    severity VARCHAR(30) NOT NULL DEFAULT 'moderate', -- 'minor', 'moderate', 'critical'
    description TEXT NOT NULL,
    possible_causes JSONB DEFAULT '[]'::jsonb,
    recommended_action TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'active' -- 'active', 'cleared'
);

CREATE INDEX idx_dtc_vehicle ON dtc_diagnostic_codes(vehicle_id, status);

-- Workshop Service Work Orders & Invoices
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    service_center VARCHAR(150) NOT NULL,
    technician_name VARCHAR(150),
    description TEXT NOT NULL,
    cost_parts_usd NUMERIC(10, 2) DEFAULT 0.00,
    cost_labor_usd NUMERIC(10, 2) DEFAULT 0.00,
    total_cost_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    invoice_number VARCHAR(100),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_parts TEXT[] DEFAULT ARRAY[]::text[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. SPECIALIZED MODULE 6: FLEET INVOICING & SERVICE BILLING
-- ----------------------------------------------------------------------------

-- Client Profiles for Invoicing
CREATE TABLE IF NOT EXISTS billing_client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    ice_or_tax_id VARCHAR(100) NOT NULL, -- Moroccan ICE / European VAT ID
    contact_person VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Morocco',
    contracted_vehicles INT NOT NULL DEFAULT 10,
    active_vehicles INT NOT NULL DEFAULT 10,
    billing_plan VARCHAR(100) DEFAULT 'Enterprise Fleet Telematics Pro',
    default_currency VARCHAR(10) NOT NULL DEFAULT 'MAD', -- 'USD', 'MAD', 'EUR'
    base_rate_per_vehicle NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    active_addon_ids TEXT[] DEFAULT ARRAY['relay_immobilizer', 'fuel_intelligence'],
    last_invoiced_date DATE,
    total_invoiced_to_date NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_clients_org ON billing_client_profiles(organization_id);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES billing_client_profiles(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(100) NOT NULL,
    organization_name VARCHAR(200) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    client_legal_name VARCHAR(255) NOT NULL,
    client_address TEXT NOT NULL,
    client_city VARCHAR(100) NOT NULL,
    client_country VARCHAR(100) NOT NULL DEFAULT 'Morocco',
    client_ice_or_tax_id VARCHAR(100) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'draft', 'pending', 'paid', 'overdue', 'cancelled'
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD', -- 'USD', 'MAD', 'EUR'
    vehicle_count INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 20.00, -- 20% TVA / VAT
    tax_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(100),
    bank_name VARCHAR(150) DEFAULT 'Attijariwafa Bank',
    bank_rib_or_iban VARCHAR(100) DEFAULT '007 780 0001234567890123 45',
    bank_swift_bic VARCHAR(50) DEFAULT 'BCMAMAMC',
    notes TEXT,
    terms_and_conditions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_invoice_number UNIQUE (organization_id, invoice_number)
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'vehicle_base', 'sim_cellular_data', 'high_freq_telemetry', 'relay_immobilizer', 'fuel_intelligence', 'cold_chain', 'live_sharing', 'predictive_maintenance', 'api_gateway', 'hardware_installation', 'custom'
    description TEXT NOT NULL,
    vehicle_count INT,
    usage_metric VARCHAR(150),
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_items_invoice ON invoice_line_items(invoice_id);

-- ----------------------------------------------------------------------------
-- 12. AUDIT LOGGING & REPORTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fleet_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'trips', 'mileage', 'alerts', 'geofence', 'fuel_efficiency'
    format VARCHAR(20) NOT NULL DEFAULT 'pdf', -- 'pdf', 'xlsx', 'csv'
    date_range_start TIMESTAMPTZ NOT NULL,
    date_range_end TIMESTAMPTZ NOT NULL,
    vehicle_ids JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'ready', -- 'ready', 'generating', 'failed'
    file_size_mb NUMERIC(6, 2),
    file_url TEXT,
    record_count INT DEFAULT 0,
    summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_org ON fleet_reports(organization_id);

-- System Audit Log
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_org ON system_audit_logs(organization_id, created_at DESC);

-- ============================================================================
-- 13. SEED INITIAL REFERENCE DATA
-- ============================================================================

-- Subscription Plans Seed
INSERT INTO subscription_plans (id, name, description, price_per_month_usd, vehicle_limit, user_limit, tracker_limit, fleet_limit, history_retention_days, features)
VALUES 
('basic', 'Starter Fleet', 'Essential GPS tracking for small local delivery companies', 49.00, 10, 3, 10, 2, 30, '["Live GPS Tracking", "Basic Geofences", "Email Alerts", "Mobile App"]'::jsonb),
('professional', 'Professional Fleet', 'Complete fleet telematics with OBD-II, fuel intelligence & maintenance', 149.00, 50, 15, 50, 10, 180, '["Everything in Basic", "AI Fuel Intelligence", "Reefer Cold Chain", "Remote Relay Immobilizer", "PDF Invoicing Engine", "REST API Access"]'::jsonb),
('enterprise', 'Enterprise Global', 'Unlimited multi-tenant fleet telematics with custom integrations & SLA', 399.00, 500, 100, 500, 50, 365, '["Everything in Pro", "Unlimited Vehicles", "Custom Domain SSL", "Dedicated Traccar Ingestion", "24/7 SLA Support", "Raw TimescaleDB Export"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Default Master Organization Seed
INSERT INTO organizations (
    id, name, legal_name, types, email, phone, country, city, timezone, locale, status, plan_id,
    module_car_rental, module_fuel_intelligence, module_cold_chain, module_live_sharing, module_predictive_maintenance, module_billing
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Atlas Logistics & Car Rental SA',
    'Atlas Logistics Morocco SA',
    ARRAY['Transport company', 'Rental agency'],
    'contact@atlaslogistics.ma',
    '+212 5 22 45 67 89',
    'Morocco',
    'Casablanca',
    'Africa/Casablanca',
    'fr',
    'active',
    'enterprise',
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;

-- Default Super Admin User (Password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO users (
    id, organization_id, name, email, password_hash, phone, role, status, department, demo_pin
) VALUES (
    'u0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Directeur Général (Admin)',
    'admin@flottemaestro.com',
    '$2a$12$e8Y5M53z0U5YxI6/YqfG1eXgS9B/yYfJjPq6z4bA6kQ7vN3lM8.re',
    '+212 6 61 00 11 22',
    'super_admin',
    'active',
    'Executive Management',
    '1234'
) ON CONFLICT (email) DO NOTHING;

-- Default Fleet
INSERT INTO fleets (id, organization_id, name, description, color)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'North Regional Distribution Fleet',
    'Reefer and heavy trucks covering Tanger-Casablanca corridor',
    '#10b981'
) ON CONFLICT (id) DO NOTHING;
