import React from 'react';
import { Users, CheckCircle2, ScanLine } from 'lucide-react';
import type { SundayService, AttendanceRecord, UsherProfile } from '../types';

interface LiveAttendanceFeedProps {
  activeService: SundayService;
  attendance: AttendanceRecord[];
  profiles: UsherProfile[];
  onOpenScanner: () => void;
}

export const LiveAttendanceFeed: React.FC<LiveAttendanceFeedProps> = ({
  activeService,
  attendance,
  profiles,
  onOpenScanner,
}) => {
  // Deduplicate logs strictly per member for this Sunday service
  const currentLogs = Array.from(
    attendance
      .filter((a) => a.service_id === activeService.id)
      .reduce((map, item) => {
        if (!map.has(item.member_id)) {
          map.set(item.member_id, item);
        }
        return map;
      }, new Map<string, AttendanceRecord>())
      .values()
  );
  const presentCount = currentLogs.length;
  const totalCount = profiles.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const teams = Array.from(new Set(profiles.map((p) => p.team_name)));

  return (
    <div className="space-y-6">
      {/* Active Service Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Today's Check-in Service
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">{activeService.service_title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Service Hours: {activeService.start_time} - {activeService.end_time}
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <ScanLine className="h-4 w-4" />
            <span>Launch Scanner</span>
          </button>
        </div>

        {/* 3 Clean Key Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-lg">
            <p className="text-xs font-medium text-slate-500">Ushers Present</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-900">{presentCount}</span>
              <span className="text-xs text-slate-500">/ {totalCount} total</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-lg">
            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Attendance Rate
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-emerald-700">{attendanceRate}%</span>
              <span className="text-xs text-slate-500">
                ({presentCount} of {totalCount})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Confirmed usher check-ins</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-lg">
            <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-500" /> Pending Scans
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-800">
                {Math.max(0, totalCount - presentCount)}
              </span>
              <span className="text-xs text-slate-500">remaining</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Expected at entrance</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Stream & Team Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Stream (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Scans Stream</h2>
            <span className="text-xs text-slate-400 font-medium">{currentLogs.length} logs recorded</span>
          </div>

          {currentLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ScanLine className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No ushers recorded yet for this service</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click 'Launch Scanner' to begin check-in</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentLogs.map((log) => {
                const member = profiles.find((p) => p.id === log.member_id);
                if (!member) return null;

                return (
                  <div
                    key={log.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-lg transition"
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

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        PRESENT
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Progress Column (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 mb-3">
            Team Section Attendance
          </h2>

          <div className="space-y-3.5">
            {teams.map((teamName) => {
              const teamMembers = profiles.filter((p) => p.team_name === teamName);
              const teamPresent = currentLogs.filter((log) =>
                teamMembers.some((m) => m.id === log.member_id)
              ).length;
              const teamPercent =
                teamMembers.length > 0 ? Math.round((teamPresent / teamMembers.length) * 100) : 0;

              return (
                <div key={teamName} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 truncate pr-2">{teamName}</span>
                    <span className="text-slate-600 font-semibold">
                      {teamPresent}/{teamMembers.length} ({teamPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all duration-300"
                      style={{ width: `${teamPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
