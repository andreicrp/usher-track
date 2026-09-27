import type { SundayService } from '../types';

/**
 * Generate all Sundays for a given year and month (0-indexed month)
 */
export function getSundaysForMonth(year: number, month: number): SundayService[] {
  const sundays: SundayService[] = [];
  const date = new Date(year, month, 1);
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Find first Sunday of the month
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }

  // Collect all Sundays in the month
  while (date.getMonth() === month) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const serviceDateStr = `${y}-${m}-${d}`;
    const isToday = serviceDateStr === todayFormatted;

    sundays.push({
      id: `sun-dyn-${serviceDateStr}`,
      service_date: serviceDateStr,
      service_title: `Sunday Service • ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      shift: 'morning_1st',
      start_time: '08:00',
      end_time: '10:30',
      late_threshold_time: '08:15',
      is_active: isToday,
      notes: isToday ? "Today's active duty service" : 'Scheduled Sunday Worship',
    });

    // Move to next Sunday
    date.setDate(date.getDate() + 7);
  }

  return sundays;
}

/**
 * Generate an endless array of Sundays (e.g. 52 weeks past and 52 weeks future)
 */
export function generateEndlessSundays(baseDate: Date = new Date(), pastWeeks = 26, futureWeeks = 26): SundayService[] {
  const sundays: SundayService[] = [];
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Find current/most recent Sunday
  const currentSunday = new Date(baseDate);
  currentSunday.setDate(currentSunday.getDate() - currentSunday.getDay());

  // Generate backwards
  for (let i = pastWeeks; i >= 1; i--) {
    const d = new Date(currentSunday);
    d.setDate(d.getDate() - i * 7);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    sundays.push({
      id: `sun-dyn-${dateStr}`,
      service_date: dateStr,
      service_title: `Sunday Worship • ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      shift: 'morning_1st',
      start_time: '08:00',
      end_time: '10:30',
      late_threshold_time: '08:15',
      is_active: dateStr === todayFormatted,
      notes: 'Past Sunday service log',
    });
  }

  // Add current Sunday
  const currDateStr = `${currentSunday.getFullYear()}-${String(currentSunday.getMonth() + 1).padStart(2, '0')}-${String(currentSunday.getDate()).padStart(2, '0')}`;
  sundays.push({
    id: `sun-dyn-${currDateStr}`,
    service_date: currDateStr,
    service_title: `Sunday Worship Service • Today`,
    shift: 'morning_1st',
    start_time: '08:00',
    end_time: '10:30',
    late_threshold_time: '08:15',
    is_active: true,
    notes: "Active Sunday service check-in",
  });

  // Generate future Sundays
  for (let i = 1; i <= futureWeeks; i++) {
    const d = new Date(currentSunday);
    d.setDate(d.getDate() + i * 7);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    sundays.push({
      id: `sun-dyn-${dateStr}`,
      service_date: dateStr,
      service_title: `Sunday Worship • ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      shift: 'morning_1st',
      start_time: '08:00',
      end_time: '10:30',
      late_threshold_time: '08:15',
      is_active: false,
      notes: 'Upcoming scheduled service',
    });
  }

  return sundays;
}
