import React from 'react';
import { GraduationCap, CheckCircle2, Hash, QrCode, ShieldCheck, Sparkles } from 'lucide-react';

export const StudentIDCard = ({
  fullName = 'Priyashi Singh',
  registrationNumber = '23CSE101',
  program = 'B.Tech - Computer Science & Engineering',
  session = '2023–2027',
  validity = 'Valid Upto 2027',
  status = 'Active Student',
  className = ''
}) => {
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`relative group w-full ${className}`}>
      {/* Physical Smart Card Body */}
      <div className="digital-id-card rounded-2xl p-6 text-white overflow-hidden relative border border-slate-700/80 transition-all duration-300">
        {/* Subtle Top Holographic Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-600" />
        
        {/* Card Header: Institutional Authority */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300 block">
                CDOT University
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Official Student Identity Smart Card
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Student
          </span>
        </div>

        {/* Card Body: Photo Avatar + Identity Details */}
        <div className="my-5 flex items-center gap-4">
          <div className="w-18 h-18 rounded-xl bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-bold text-2xl text-indigo-300 shadow-inner shrink-0 relative overflow-hidden">
            {/* Holographic sheen overlay */}
            <div className="absolute inset-0 hologram-strip opacity-30 pointer-events-none" />
            <span>{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Student Full Name
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight truncate">
              {fullName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono mt-0.5">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold tracking-wider">{registrationNumber}</span>
            </div>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Academic Program
            </span>
            <span className="font-semibold text-slate-200 truncate block">
              {program}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Academic Session
            </span>
            <span className="font-semibold text-slate-200 block">
              {session} ({validity})
            </span>
          </div>
        </div>

        {/* Card Footer: Digital Gate Pass & QR Code */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-slate-300" />
            <span className="text-[11px] font-medium text-slate-300">Digital Gate Pass & Library Access</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-slate-400">
            UID-{registrationNumber}
          </span>
        </div>
      </div>
    </div>
  );
};
