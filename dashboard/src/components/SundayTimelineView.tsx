import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  UserX,
  ScanLine,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import type { SundayService, AttendanceRecord, UsherProfile } from '../types';
import { getSundaysForMonth } from '../utils/sundayCalendar';

interface SundayTimelineViewProps {
  services: SundayService[];
  attendance: AttendanceRecord[];
  profiles: UsherProfile[];
  onSelectService: (service: SundayService) => void;
  activeService: SundayService;
  onOpenScanner: () => void;
  onManualMarkPresent: (memberId: string, serviceId: string, status: 'present') => void;
}

export const SundayTimelineView: React.FC<SundayTimelineViewProps> = ({
  services: initialServices,
  attendance,
  profiles,
  activeService,
  onOpenScanner,
  onManualMarkPresent,
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedServiceId, setSelectedServiceId] = useState<string>(activeService.id);
  const [filterTeam, setFilterTeam] = useState<string>('all');

  // Dynamically generate all Sundays for the selected Year & Month
  const monthSundays = useMemo(() => {
    return getSundaysForMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Combine initial services with generated month sundays
  const allAvailableServices = useMemo(() => {
    const map = new Map<string, SundayService>();
    initialServices.forEach((s) => map.set(s.id, s));
    monthSundays.forEach((s) => {
      if (!map.has(s.id)) {
        map.set(s.id, s);
      }
    });
    return Array.from(map.values());
  }, [initialServices, monthSundays]);

  // Find currently selected Sunday service
  const selectedService = useMemo(() => {
    return (
      allAvailableServices.find((s) => s.id === selectedServiceId) ||
      monthSundays[0] ||
      activeService
    );
  }, [allAvailableServices, selectedServiceId, monthSundays, activeService]);

  const currentServiceLogs = attendance.filter((a) => a.service_id === selectedService.id);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedServiceId(activeService.id);
  };

  // Filter roster by team
  const filteredProfiles = profiles.filter((p) => {
    if (filterTeam === 'all') return true;
    return p.team_name === filterTeam;
  });

  const totalMembersCount = filteredProfiles.length;
  const presentLogs = currentServiceLogs.filter((log) =>
    filteredProfiles.some((p) => p.id === log.member_id)
  );
  const presentCount = presentLogs.length;
  const absentCount = Math.max(0, totalMembersCount - presentCount);
  const attendanceRate = totalMembersCount > 0 ? Math.round((presentCount / totalMembersCount) * 100) : 0;

  const teams = Array.from(new Set(profiles.map((p) => p.team_name)));

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-slate-700" />
            Endless Sunday Service Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Navigate through any Sunday of the year to inspect usher attendance records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Jump to Today</span>
          </button>
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <ScanLine className="h-4 w-4" />
            <span>Launch Scanner</span>
          </button>
        </div>
      </div>

      {/* Endless Sunday Calendar Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        {/* Month / Year Navigator Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{monthName}</span>
              <span className="text-slate-400">{currentYear}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">({monthSundays.length} Sundays)</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sundays Grid for the Selected Month */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-3.5">
          {monthSundays.map((service) => {
            const isSelected = service.id === selectedService.id;
            const serviceLogs = attendance.filter((a) => a.service_id === service.id);
            const rate = profiles.length > 0 ? Math.round((serviceLogs.length / profiles.length) * 100) : 0;

            const serviceDateObj = new Date(service.service_date);
            const isToday = service.is_active || service.service_date === new Date().toISOString().split('T')[0];

            return (
              <button
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`text-left p-3 rounded-xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {isToday && (
                  <span
                    className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-900'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    TODAY
                  </span>
                )}

                <div className={`text-[11px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {serviceDateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>

                <p className={`text-xs font-semibold mt-1 truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {service.service_title}
                </p>

                <div
                  className={`mt-2.5 pt-1.5 border-t text-[11px] flex justify-between ${
                    isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <span>{serviceLogs.length} Checked-in</span>
                  <span className="font-semibold">{rate}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Sunday Metrics (3-Card Clean Layout - No Late Scans) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-500">Present Ushers</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900">{presentCount}</span>
            <span className="text-xs text-slate-500">/ {totalMembersCount} total</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Attendance Rate
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-emerald-700">{attendanceRate}%</span>
            <span className="text-xs text-slate-500">
              ({presentCount} of {totalMembersCount})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Confirmed usher check-ins</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <UserX className="h-3.5 w-3.5 text-slate-400" /> Pending / Absent
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-800">{absentCount}</span>
            <span className="text-xs text-slate-500">ushers</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting QR scan</p>
        </div>
      </div>

      {/* Roster & Attendance Status Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-600">Filter Team:</span>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="all">All Teams ({profiles.length})</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Roster for {selectedService.service_title} ({selectedService.service_date})
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredProfiles.map((member) => {
            const log = currentServiceLogs.find((l) => l.member_id === member.id);
            const isPresent = !!log;

            return (
              <div
                key={member.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{member.full_name}</span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          member.role === 'primary_leader'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : member.role === 'assistant_leader'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {member.team_name} {member.assigned_leader_name && `• Lead: ${member.assigned_leader_name}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isPresent ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        PRESENT
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Scanned at {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 italic">Not checked in</span>
                      <button
                        onClick={() => onManualMarkPresent(member.id, selectedService.id, 'present')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition cursor-pointer"
                      >
                        Mark Present
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
