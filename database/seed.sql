-- ==============================================================================
-- USHER QR ATTENDANCE SYSTEM - SEED DATA
-- Sample Primary Leaders, Assistant Leaders, Members, Sundays & Scans
-- ==============================================================================

-- 1. Insert Primary Leader
INSERT INTO public.profiles (id, email, full_name, phone_number, role, assigned_leader_id, team_name, qr_identifier, avatar_url, is_active)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'pastor.john@usherministry.org', 'Pastor Johnathan Davis', '+1-555-0101', 'primary_leader', NULL, 'Executive Usher Board', 'USHER-PL-001-JONATHAN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Assistant Leaders (assigned under Primary Leader)
INSERT INTO public.profiles (id, email, full_name, phone_number, role, assigned_leader_id, team_name, qr_identifier, avatar_url, is_active)
VALUES 
('b0000000-0000-0000-0000-000000000001', 'sarah.connor@usherministry.org', 'Sarah Jenkins', '+1-555-0102', 'assistant_leader', 'a0000000-0000-0000-0000-000000000001', 'North Wing & Sanctuary', 'USHER-AL-001-SARAH', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces', true),
('b0000000-0000-0000-0000-000000000002', 'marcus.vance@usherministry.org', 'Marcus Vance', '+1-555-0103', 'assistant_leader', 'a0000000-0000-0000-0000-000000000001', 'Balcony & Main Entrance', 'USHER-AL-002-MARCUS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Regular Members (Assigned to Assistant Leaders)
INSERT INTO public.profiles (id, email, full_name, phone_number, role, assigned_leader_id, team_name, qr_identifier, avatar_url, is_active)
VALUES 
-- Sarah's Team (North Wing)
('c0000000-0000-0000-0000-000000000001', 'david.kim@usherministry.org', 'David Kim', '+1-555-0201', 'regular_member', 'b0000000-0000-0000-0000-000000000001', 'North Wing & Sanctuary', 'USHER-RM-001-DAVID', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', true),
('c0000000-0000-0000-0000-000000000002', 'rachel.adams@usherministry.org', 'Rachel Adams', '+1-555-0202', 'regular_member', 'b0000000-0000-0000-0000-000000000001', 'North Wing & Sanctuary', 'USHER-RM-002-RACHEL', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces', true),
('c0000000-0000-0000-0000-000000000003', 'elena.rodriguez@usherministry.org', 'Elena Rodriguez', '+1-555-0203', 'regular_member', 'b0000000-0000-0000-0000-000000000001', 'North Wing & Sanctuary', 'USHER-RM-003-ELENA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces', true),

-- Marcus's Team (Balcony & Entrance)
('c0000000-0000-0000-0000-000000000004', 'michael.chen@usherministry.org', 'Michael Chen', '+1-555-0204', 'regular_member', 'b0000000-0000-0000-0000-000000000002', 'Balcony & Main Entrance', 'USHER-RM-004-MICHAEL', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces', true),
('c0000000-0000-0000-0000-000000000005', 'hannah.taylor@usherministry.org', 'Hannah Taylor', '+1-555-0205', 'regular_member', 'b0000000-0000-0000-0000-000000000002', 'Balcony & Main Entrance', 'USHER-RM-005-HANNAH', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces', true),
('c0000000-0000-0000-0000-000000000006', 'joshua.wright@usherministry.org', 'Joshua Wright', '+1-555-0206', 'regular_member', 'b0000000-0000-0000-0000-000000000002', 'Balcony & Main Entrance', 'USHER-RM-006-JOSHUA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Sunday Services Timeline (Past, Active, and Upcoming Sundays)
INSERT INTO public.sunday_services (id, service_date, service_title, shift, start_time, end_time, late_threshold_time, is_active, notes)
VALUES 
('s0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '14 days', 'Sunday Service - Faith & Fellowship', 'morning_1st', '08:00:00', '10:30:00', '08:15:00', false, 'Past Sunday service'),
('s0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '7 days', 'Sunday Service - Grace & Community', 'morning_1st', '08:00:00', '10:30:00', '08:15:00', false, 'Previous Sunday service'),
('s0000000-0000-0000-0000-000000000003', CURRENT_DATE, 'Sunday Morning Service - Live Duty', 'morning_1st', '08:00:00', '10:30:00', '08:15:00', true, 'Active service for today scans!'),
('s0000000-0000-0000-0000-000000000004', CURRENT_DATE + INTERVAL '7 days', 'Sunday Service - Youth & Family Emphasis', 'morning_1st', '08:00:00', '10:30:00', '08:15:00', false, 'Upcoming Sunday service')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Attendance Logs for Active Service
INSERT INTO public.attendance_logs (id, member_id, service_id, scanned_by_id, scanned_at, status, scan_method, remarks)
VALUES 
('l0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '35 minutes', 'present', 'qr_camera', 'On-time arrival for North Wing setup'),
('l0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 minutes', 'present', 'qr_camera', 'Sanctuary front aisle station'),
('l0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 minutes', 'late', 'qr_camera', 'Traffic delay reported')
ON CONFLICT (id) DO NOTHING;
