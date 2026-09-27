import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Share2, Printer, Shield } from 'lucide-react';
import type { UsherProfile } from '../types';

interface MemberBadgeModalProps {
  member: UsherProfile | null;
  onClose: () => void;
}

export const MemberBadgeModal: React.FC<MemberBadgeModalProps> = ({ member, onClose }) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!member) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'primary_leader':
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200">PRIMARY LEADER</span>;
      case 'assistant_leader':
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">ASSISTANT LEADER</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">REGULAR USHER</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Printable Badge Body */}
        <div ref={badgeRef} className="p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <Shield className="h-4 w-4 text-slate-700" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-600">Usher Ministry Digital ID</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-2xs">
            {/* Member Avatar */}
            <div className="relative inline-block">
              <img
                src={member.avatar_url || 'https://via.placeholder.com/120'}
                alt={member.full_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm mx-auto"
              />
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-2.5">{member.full_name}</h3>
            
            <div className="mt-1.5 flex justify-center">
              {getRoleBadge(member.role)}
            </div>

            <p className="text-xs text-slate-500 mt-2 font-medium">{member.team_name}</p>
            {member.assigned_leader_name && (
              <p className="text-[11px] text-slate-400 mt-0.5">Assigned to: {member.assigned_leader_name}</p>
            )}

            {/* QR Code Container */}
            <div className="mt-4 p-3 bg-white rounded-lg inline-block border border-slate-200 shadow-2xs">
              <QRCodeSVG
                value={member.qr_identifier}
                size={150}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] font-mono text-slate-500 mt-2.5 tracking-wider">{member.qr_identifier}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Scan this badge at Sunday service check-in</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Badge
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(member.qr_identifier);
                alert('QR Code token copied to clipboard!');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              Copy Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
