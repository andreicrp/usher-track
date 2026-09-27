import { useState } from 'react';
import { initialProfiles, initialSundayServices, initialAttendance } from './data/mockData';
import type { UsherProfile, SundayService, AttendanceRecord } from './types';
import { Navbar } from './components/Navbar';
import { LiveAttendanceFeed } from './components/LiveAttendanceFeed';
import { SundayTimelineView } from './components/SundayTimelineView';
import { MembersDirectory } from './components/MembersDirectory';
import { ScannerModal } from './components/ScannerModal';
import { MemberBadgeModal } from './components/MemberBadgeModal';

export function App() {
  const [profiles, setProfiles] = useState<UsherProfile[]>(initialProfiles);
  const [services] = useState<SundayService[]>(initialSundayServices);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [currentProfile, setCurrentProfile] = useState<UsherProfile>(initialProfiles[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'members' | 'badge'>('dashboard');

  // Modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [badgeMember, setBadgeMember] = useState<UsherProfile | null>(null);

  const activeService = services.find((s) => s.is_active) || services[2] || services[0];

  // Core Attendance Recording Engine - Strict Anti-Duplicate Guarantee
  const handleRecordAttendance = (qrIdentifier: string) => {
    const member = profiles.find(
      (p) => p.qr_identifier.toLowerCase() === qrIdentifier.toLowerCase()
    );

    if (!member) {
      return {
        success: false,
        message: `Unknown QR Code identifier "${qrIdentifier}". Member not found in directory.`,
      };
    }

    const existingLog = attendance.find(
      (a) => a.member_id === member.id && a.service_id === activeService.id
    );

    if (existingLog) {
      return {
        success: true,
        member,
        isDuplicate: true,
        message: `${member.full_name} is ALREADY marked as ${existingLog.status.toUpperCase()} at ${new Date(
          existingLog.scanned_at
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`,
      };
    }

    let isDup = false;
    const newLog: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      member_id: member.id,
      service_id: activeService.id,
      scanned_by_id: currentProfile.id,
      scanned_by_name: currentProfile.full_name,
      scanned_at: new Date().toISOString(),
      status: 'present',
      scan_method: 'qr_camera',
      remarks: 'Usher check-in verified',
    };

    setAttendance((prev) => {
      if (prev.some((a) => a.member_id === member.id && a.service_id === activeService.id)) {
        isDup = true;
        return prev;
      }
      return [newLog, ...prev];
    });

    if (isDup) {
      return {
        success: true,
        member,
        isDuplicate: true,
        message: `${member.full_name} is ALREADY checked in!`,
      };
    }

    return {
      success: true,
      member,
      isDuplicate: false,
      message: `${member.full_name} is marked PRESENT!`,
    };
  };

  const handleManualMark = (memberId: string, serviceId: string, status: 'present' | 'late') => {
    const member = profiles.find((p) => p.id === memberId);
    if (!member) return;

    const newLog: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      member_id: memberId,
      service_id: serviceId,
      scanned_by_id: currentProfile.id,
      scanned_by_name: currentProfile.full_name,
      scanned_at: new Date().toISOString(),
      status,
      scan_method: 'manual_override',
      remarks: `Manual check-in by ${currentProfile.full_name}`,
    };

    setAttendance((prev) => {
      if (prev.some((a) => a.member_id === memberId && a.service_id === serviceId)) {
        return prev;
      }
      return [newLog, ...prev];
    });
  };

  const handleAssignMember = (memberId: string, leaderId: string) => {
    const leader = profiles.find((p) => p.id === leaderId);
    setProfiles((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              assigned_leader_id: leaderId || null,
              assigned_leader_name: leader?.full_name || undefined,
            }
          : m
      )
    );
  };

  const handleToggleRole = (memberId: string, targetRole: 'assistant_leader' | 'regular_member') => {
    setProfiles((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              role: targetRole,
              qr_identifier: m.qr_identifier.replace(
                targetRole === 'assistant_leader' ? 'USHER-RM-' : 'USHER-AL-',
                targetRole === 'assistant_leader' ? 'USHER-AL-' : 'USHER-RM-'
              ),
            }
          : m
      )
    );
  };

  const handleAddMember = (newMemberData: Omit<UsherProfile, 'id' | 'created_at'>) => {
    const newProfile: UsherProfile = {
      ...newMemberData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newProfile]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-slate-200">
      {/* Navigation Bar */}
      <Navbar
        currentProfile={currentProfile}
        profiles={profiles}
        onSwitchProfile={setCurrentProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <LiveAttendanceFeed
            activeService={activeService}
            attendance={attendance}
            profiles={profiles}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'timeline' && (
          <SundayTimelineView
            services={services}
            attendance={attendance}
            profiles={profiles}
            activeService={activeService}
            onSelectService={() => {}}
            onOpenScanner={() => setIsScannerOpen(true)}
            onManualMarkPresent={handleManualMark}
          />
        )}

        {activeTab === 'members' && (
          <MembersDirectory
            profiles={profiles}
            onOpenBadge={(m) => setBadgeMember(m)}
            onAssignMember={handleAssignMember}
            onToggleRole={handleToggleRole}
            onAddMember={handleAddMember}
          />
        )}

        {activeTab === 'badge' && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-slate-900">Your Official Usher QR ID Badge</h1>
              <p className="text-xs text-slate-500 mt-1">
                Active Profile: <strong className="text-slate-800">{currentProfile.full_name}</strong> ({currentProfile.team_name})
              </p>
            </div>
            <button
              onClick={() => setBadgeMember(currentProfile)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Open Printable ID Badge
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        <p>Usher Ministry QR Attendance & Monitoring System • Light Mode Edition</p>
      </footer>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <ScannerModal
          isOpen={isScannerOpen}
          onClose={() => {
            try {
              document.querySelectorAll('video').forEach((v) => {
                const s = (v as HTMLVideoElement).srcObject as MediaStream;
                if (s) {
                  s.getTracks().forEach((t) => t.stop());
                  (v as HTMLVideoElement).srcObject = null;
                }
              });
            } catch (_) {}
            setIsScannerOpen(false);
          }}
          activeService={activeService}
          profiles={profiles}
          onRecordAttendance={handleRecordAttendance}
        />
      )}

      {/* Digital Member Badge Modal */}
      <MemberBadgeModal
        member={badgeMember || (activeTab === 'badge' ? currentProfile : null)}
        onClose={() => {
          setBadgeMember(null);
          if (activeTab === 'badge') setActiveTab('dashboard');
        }}
      />
    </div>
  );
}

export default App;
