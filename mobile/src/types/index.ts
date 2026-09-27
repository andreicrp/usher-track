export type UserRole = 'primary_leader' | 'assistant_leader' | 'regular_member';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

export type ServiceShift = 'morning_1st' | 'morning_2nd' | 'afternoon' | 'evening' | 'special_event';

export interface UsherProfile {
  id: string;
  email?: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  assigned_leader_id?: string | null;
  assigned_leader_name?: string;
  team_name: string;
  qr_identifier: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface SundayService {
  id: string;
  service_date: string;
  service_title: string;
  shift: ServiceShift;
  start_time: string;
  end_time: string;
  late_threshold_time: string;
  is_active: boolean;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  service_id: string;
  scanned_by_id?: string;
  scanned_at: string;
  status: AttendanceStatus;
  scan_method: string;
  remarks?: string;
  member?: UsherProfile;
  service?: SundayService;
}
