import { createClient } from '@supabase/supabase-js';

declare const process: {
  env?: {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  };
};

// Replace with your actual Supabase URL & Public Anon Key
const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL) || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Scan verification helper
 * Verifies QR token against Supabase or local offline storage
 */
export async function verifyAndRecordAttendance({
  qrIdentifier,
  serviceId,
  scannedById,
}: {
  qrIdentifier: string;
  serviceId: string;
  scannedById: string;
}) {
  // 1. Look up member by QR code identifier
  const { data: member, error: memberError } = await supabase
    .from('profiles')
    .select('*')
    .eq('qr_identifier', qrIdentifier)
    .single();

  if (memberError || !member) {
    throw new Error('Invalid QR Code. Usher member not found.');
  }

  // 2. Check if already scanned for this Sunday service
  const { data: existingLog } = await supabase
    .from('attendance_logs')
    .select('id, scanned_at, status')
    .eq('member_id', member.id)
    .eq('service_id', serviceId)
    .maybeSingle();

  if (existingLog) {
    return {
      alreadyRecorded: true,
      member,
      log: existingLog,
      message: `${member.full_name} is ALREADY marked as ${existingLog.status.toUpperCase()}!`,
    };
  }

  // 3. Record attendance
  const { data: newLog, error: logError } = await supabase
    .from('attendance_logs')
    .insert({
      member_id: member.id,
      service_id: serviceId,
      scanned_by_id: scannedById,
      status: 'present',
      scan_method: 'qr_camera',
    })
    .select()
    .single();

  if (logError) {
    throw new Error(`Failed to record attendance: ${logError.message}`);
  }

  return {
    alreadyRecorded: false,
    member,
    log: newLog,
    message: `Attendance Confirmed: ${member.full_name} is PRESENT!`,
  };
}
