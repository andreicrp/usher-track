import React from 'react';
import { QrCode, Calendar, Users, ScanLine, UserCheck, Activity, ChevronDown } from 'lucide-react';
import type { UsherProfile } from '../types';

interface NavbarProps {
  currentProfile: UsherProfile;
  profiles: UsherProfile[];
  onSwitchProfile: (profile: UsherProfile) => void;
  activeTab: 'dashboard' | 'timeline' | 'members' | 'badge';
  setActiveTab: (tab: 'dashboard' | 'timeline' | 'members' | 'badge') => void;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  profiles,
  onSwitchProfile,
  activeTab,
  setActiveTab,
  onOpenScanner,
}) => {
  const getRolePill = (role: string) => {
    switch (role) {
      case 'primary_leader':
        return <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-purple-50 text-purple-700 border border-purple-200">Primary Leader</span>;
      case 'assistant_leader':
        return <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-200">Assistant Leader</span>;
      default:
        return <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">Regular Usher</span>;
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs">
                <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900">UsherTrack</span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                  Sunday Ministry
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                Live Check-in
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Sunday Timeline
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  activeTab === 'members'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Usher Directory
              </button>
              <button
                onClick={() => setActiveTab('badge')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  activeTab === 'badge'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                My Digital Badge
              </button>
            </nav>

            {/* Right Action: Scan QR Button + User Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs active:scale-98 h-8 sm:h-auto"
              >
                <ScanLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[11px] sm:text-xs">Scan QR</span>
              </button>

              {/* Account Switcher Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-1 sm:px-2.5 sm:py-1.5 cursor-pointer transition text-left h-8 sm:h-auto">
                  <img
                    src={currentProfile.avatar_url || 'https://via.placeholder.com/40'}
                    alt={currentProfile.full_name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden lg:block">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentProfile.full_name}
                    </div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {currentProfile.role.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block z-50">
                  <div className="px-2.5 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Account</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto mt-1 space-y-0.5">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSwitchProfile(p)}
                        className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                          p.id === currentProfile.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                        }`}
                      >
                        <img src={p.avatar_url} alt={p.full_name} className="w-7 h-7 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">{p.full_name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{p.team_name}</p>
                        </div>
                        <div className="scale-90">{getRolePill(p.role)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on phones/tablets) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-2 px-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-md ${activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900' : ''}`}>
            <Activity className="h-4 w-4" />
          </div>
          <span>Live Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'timeline' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-md ${activeTab === 'timeline' ? 'bg-slate-100 text-slate-900' : ''}`}>
            <Calendar className="h-4 w-4" />
          </div>
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'members' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-md ${activeTab === 'members' ? 'bg-slate-100 text-slate-900' : ''}`}>
            <Users className="h-4 w-4" />
          </div>
          <span>Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('badge')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'badge' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-md ${activeTab === 'badge' ? 'bg-slate-100 text-slate-900' : ''}`}>
            <UserCheck className="h-4 w-4" />
          </div>
          <span>My Badge</span>
        </button>
      </nav>
    </>
  );
};
