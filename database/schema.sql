-- ==============================================================================
-- USHER QR ATTENDANCE SYSTEM - SUPABASE POSTGRESQL SCHEMA
-- Hierarchy: Primary Leader -> Assistant Leader -> Regular Member
-- Timeline: Sunday Services Tracking
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS FOR ROLES AND STATUSES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('primary_leader', 'assistant_leader', 'regular_member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'late', 'excused', 'absent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_shift AS ENUM ('morning_1st', 'morning_2nd', 'afternoon', 'evening', 'special_event');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES / USHER MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(50),
    role user_role NOT NULL DEFAULT 'regular_member',
    assigned_leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team_name VARCHAR(100) DEFAULT 'General Ushering',
    qr_identifier VARCHAR(100) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast QR lookup and leader hierarchy
CREATE INDEX IF NOT EXISTS idx_profiles_qr_identifier ON public.profiles(qr_identifier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_leader ON public.profiles(assigned_leader_id);

-- 3. SUNDAY SERVICES & EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.sunday_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_date DATE NOT NULL,
    service_title VARCHAR(150) NOT NULL DEFAULT 'Sunday Worship Service',
    shift service_shift NOT NULL DEFAULT 'morning_1st',
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '11:00:00',
    late_threshold_time TIME NOT NULL DEFAULT '08:15:00',
    is_active BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sunday_services_date ON public.sunday_services(service_date);
CREATE INDEX IF NOT EXISTS idx_sunday_services_is_active ON public.sunday_services(is_active);

-- 4. ATTENDANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.sunday_services(id) ON DELETE CASCADE,
    scanned_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status attendance_status NOT NULL DEFAULT 'present',
    scan_method VARCHAR(50) DEFAULT 'qr_camera', -- 'qr_camera', 'manual_override', 'nfc'
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: A member can only be recorded once per specific Sunday service
    CONSTRAINT uq_member_service UNIQUE (member_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_member ON public.attendance_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_service ON public.attendance_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scanned_at ON public.attendance_logs(scanned_at);

-- 5. FUNCTION & TRIGGER TO AUTO-UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 6. REALTIME REPLICATION (Supabase Realtime)
-- Enable realtime for live dashboard attendance stream
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sunday_services;
