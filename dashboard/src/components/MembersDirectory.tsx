import React, { useState } from 'react';
import {
  Users,
  QrCode,
  Crown,
  UserPlus,
  Search,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { UsherProfile, UserRole } from '../types';

interface MembersDirectoryProps {
  profiles: UsherProfile[];
  onOpenBadge: (member: UsherProfile) => void;
  onAssignMember: (memberId: string, leaderId: string) => void;
  onToggleRole: (memberId: string, targetRole: 'assistant_leader' | 'regular_member') => void;
  onAddMember: (newMember: Omit<UsherProfile, 'id' | 'created_at'>) => void;
}

export const MembersDirectory: React.FC<MembersDirectoryProps> = ({
  profiles,
  onOpenBadge,
  onAssignMember,
  onToggleRole,
  onAddMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'assistant_leader' | 'regular_member'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('regular_member');
  const [newTeam, setNewTeam] = useState('Sanctuary Ushering');
  const [handledByLeaderId, setHandledByLeaderId] = useState('');
  const [expandedLeaders, setExpandedLeaders] = useState<Record<string, boolean>>({
    'usr-002': true,
    'usr-003': true,
  });

  const primaryLeader = profiles.find((p) => p.role === 'primary_leader') || profiles[0];
  const allCellMembers = profiles.filter((p) => p.id !== primaryLeader?.id);
  const assistantLeaders = allCellMembers.filter((p) => p.role === 'assistant_leader');
  const regularMembers = allCellMembers.filter((p) => p.role === 'regular_member');

  const toggleLeaderExpand = (leaderId: string) => {
    setExpandedLeaders((prev) => ({
      ...prev,
      [leaderId]: prev[leaderId] === undefined ? false : !prev[leaderId],
    }));
  };

  const filteredMembers = allCellMembers.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.qr_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    const assignedLeader = profiles.find((p) => p.id === handledByLeaderId);
    const identifier = `USHER-${newRole === 'assistant_leader' ? 'AL' : 'RM'}-${Math.floor(100 + Math.random() * 900)}-${newFullName.split(' ')[0].toUpperCase()}`;

    onAddMember({
      full_name: newFullName.trim(),
      email: newEmail.trim() || undefined,
      phone_number: newPhone.trim() || undefined,
      role: newRole,
      team_name: newTeam,
      assigned_leader_id: handledByLeaderId || primaryLeader.id,
      assigned_leader_name: assignedLeader?.full_name || primaryLeader.full_name,
      qr_identifier: identifier,
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 10000)}?w=200&h=200&fit=crop&crop=faces`,
      is_active: true,
    });

    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            Cell Members Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            All members belong to <strong className="text-slate-800">{primaryLeader.full_name}'s</strong> Cell • Promote members as Assistant Leaders
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Cell Member</span>
        </button>
      </div>

      {/* Primary Leader Card */}
      {primaryLeader && (
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={primaryLeader.avatar_url}
                alt={primaryLeader.full_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-300 shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 bg-purple-700 text-white rounded-full p-1 shadow-2xs">
                <Crown className="h-3.5 w-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">{primaryLeader.full_name}</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Primary Leader (Head of Cell)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Leader of all <strong className="text-slate-900">{allCellMembers.length} cell members</strong> • Appoints assistant leaders to assist with members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenBadge(primaryLeader)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>Leader ID Badge</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Cell Members</p>
            <p className="text-base font-bold text-slate-900">{allCellMembers.length} Ushers</p>
          </div>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-blue-700 font-medium">Assigned Assistant Leaders</p>
            <p className="text-base font-bold text-slate-900">{assistantLeaders.length} Assigned</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Regular Cell Members</p>
            <p className="text-base font-bold text-slate-900">{regularMembers.length} Ushers</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Members ({allCellMembers.length})
          </button>
          <button
            onClick={() => setRoleFilter('assistant_leader')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              roleFilter === 'assistant_leader' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assistant Leaders ({assistantLeaders.length})
          </button>
          <button
            onClick={() => setRoleFilter('regular_member')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              roleFilter === 'regular_member' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regular Members ({regularMembers.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE 1: ASSISTANT LEADERS VIEW (SHOWS EACH ASSISTANT LEADER & ITS MEMBERS) */}
      {/* ========================================================================= */}
      {roleFilter === 'assistant_leader' ? (
        <div className="space-y-4">
          {assistantLeaders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
              No Assistant Leaders assigned yet. Switch to "All Members" and click "Assign as Assistant" on any member.
            </div>
          ) : (
            assistantLeaders.map((leader) => {
              const membersUnderLeader = allCellMembers.filter(
                (m) => m.assigned_leader_id === leader.id && m.id !== leader.id
              );
              const isExpanded = expandedLeaders[leader.id] ?? true;

              return (
                <div
                  key={leader.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition"
                >
                  {/* Assistant Leader Header */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={leader.avatar_url}
                          alt={leader.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shrink-0"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-2xs">
                          <Shield className="h-3 w-3" />
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{leader.full_name}</h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Assistant Leader
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Assigned to help oversee <strong className="text-slate-800">{membersUnderLeader.length} cell members</strong> • {leader.team_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggleRole(leader.id, 'regular_member')}
                        title="Revert role back to regular cell member"
                        className="text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <ArrowDownLeft className="h-3.5 w-3.5 inline mr-1" />
                        <span>Revert Role</span>
                      </button>

                      <button
                        onClick={() => onOpenBadge(leader)}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        <QrCode className="h-3.5 w-3.5 text-slate-500" />
                        <span>ID Badge</span>
                      </button>

                      <button
                        onClick={() => toggleLeaderExpand(leader.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer ml-1"
                        title={isExpanded ? 'Collapse Members' : 'Expand Members'}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Members Handled By This Assistant Leader */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>Members Assisted by {leader.full_name.split(' ')[0]} ({membersUnderLeader.length})</span>
                        </h4>
                      </div>

                      {membersUnderLeader.length === 0 ? (
                        <div className="py-6 px-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center text-xs text-slate-400">
                          No members currently assigned to {leader.full_name}.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {membersUnderLeader.map((member) => (
                            <div
                              key={member.id}
                              className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={member.avatar_url}
                                  alt={member.full_name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{member.full_name}</p>
                                  <p className="text-[10px] font-mono text-slate-400 truncate">{member.qr_identifier}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{member.team_name}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Re-assign select */}
                                <select
                                  value={member.assigned_leader_id || ''}
                                  onChange={(e) => onAssignMember(member.id, e.target.value)}
                                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                                  title="Reassign overseer"
                                >
                                  <option value={primaryLeader.id}>Direct ({primaryLeader.full_name.split(' ')[0]})</option>
                                  {assistantLeaders.map((al) => (
                                    <option key={al.id} value={al.id}>
                                      {al.full_name.split(' ')[0]} (Asst Lead)
                                    </option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => onOpenBadge(member)}
                                  className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 transition cursor-pointer"
                                  title="ID Badge"
                                >
                                  <QrCode className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE 2: ALL MEMBERS / REGULAR MEMBERS TABLE VIEW                          */
        /* ========================================================================= */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div className="col-span-4">Cell Member</div>
            <div className="col-span-3">Assigned Role</div>
            <div className="col-span-3">Assisted By</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No members found matching your search.
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isAssistantLeader = member.role === 'assistant_leader';
                const membersHandledCount = allCellMembers.filter(
                  (m) => m.assigned_leader_id === member.id && m.id !== member.id
                ).length;

                return (
                  <div
                    key={member.id}
                    className="p-4 md:px-5 md:py-3.5 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center hover:bg-slate-50/70 transition"
                  >
                    {/* Column 1: Member Info */}
                    <div className="md:col-span-4 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        {isAssistantLeader && (
                          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-2xs">
                            <Shield className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{member.full_name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
                          <span className="text-slate-500 font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {member.qr_identifier}
                          </span>
                          <span>•</span>
                          <span>{member.team_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Role in Cell */}
                    <div className="md:col-span-3 flex items-center">
                      {isAssistantLeader ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          <Shield className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>Assistant Leader</span>
                          <span className="text-[10px] text-blue-500 font-normal">({membersHandledCount} members)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Cell Member</span>
                        </span>
                      )}
                    </div>

                    {/* Column 3: Assisted / Handled By */}
                    <div className="md:col-span-3">
                      {isAssistantLeader ? (
                        <span className="text-xs text-slate-500 font-medium">
                          Appointed by <strong className="text-slate-800">{primaryLeader.full_name.split(' ')[0]}</strong>
                        </span>
                      ) : (
                        <div className="relative flex items-center max-w-[210px] w-full">
                          <select
                            value={member.assigned_leader_id || primaryLeader.id}
                            onChange={(e) => onAssignMember(member.id, e.target.value)}
                            className="bg-slate-50 hover:bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-slate-400 cursor-pointer w-full transition"
                          >
                            <option value={primaryLeader.id}>
                              {primaryLeader.full_name} (Direct Lead)
                            </option>
                            {assistantLeaders.map((al) => (
                              <option key={al.id} value={al.id}>
                                {al.full_name} (Assistant Lead)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Column 4: Actions */}
                    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {isAssistantLeader ? (
                        <button
                          onClick={() => onToggleRole(member.id, 'regular_member')}
                          title="Revert to regular cell member"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-lg transition cursor-pointer"
                        >
                          <ArrowDownLeft className="h-3 w-3" />
                          <span>Revert</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleRole(member.id, 'assistant_leader')}
                          title="Assign this member as an Assistant Leader"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          <span>Make Lead</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenBadge(member)}
                        className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-2xs transition cursor-pointer shrink-0"
                      >
                        <QrCode className="h-3.5 w-3.5 text-slate-500" />
                        <span>Badge</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Usher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Add New Cell Member</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Member will be added to {primaryLeader.full_name}'s cell group
            </p>

            <form onSubmit={handleCreateMember} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gabriel Santos"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Email Address (Optional)</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. gabriel@usherministry.org"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Phone Number (Optional)</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 707-0010"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Cell Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  >
                    <option value="regular_member">Cell Member</option>
                    <option value="assistant_leader">Assistant Leader</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Assisted By</label>
                  <select
                    value={handledByLeaderId}
                    onChange={(e) => setHandledByLeaderId(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  >
                    <option value={primaryLeader.id}>{primaryLeader.full_name} (Direct)</option>
                    {assistantLeaders.map((al) => (
                      <option key={al.id} value={al.id}>
                        {al.full_name} (Assistant)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Ministry Section</label>
                <input
                  type="text"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
