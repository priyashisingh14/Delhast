import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  User,
  Hash,
  Phone,
  Mail,
  Sparkles,
  LogOut
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/useAuthStore';

export const WelcomePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const studentName = user?.fullName || 'Student';
  const regNo = user?.registrationNumber || 'N/A';
  const phone = user?.phone || 'N/A';
  const email = user?.email || 'N/A';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 relative selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="md" />

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Celebratory Welcome View */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center">
        <Card elevated={true} className="w-full text-center p-8 sm:p-10 space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Light Halo */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Check Badge */}
          <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          {/* Bold Welcome Header */}
          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Identity Verified & Account Created
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {studentName} !
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your Delhast account is active and verified.
            </p>
          </div>

          {/* Digital Credential Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Delhast Verified Credential
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Full Name</span>
                  <span className="font-bold text-slate-900">{studentName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Roll / Reg No</span>
                  <span className="font-mono font-bold text-indigo-700">{regNo}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Mobile</span>
                  <span className="font-semibold text-slate-900">🇮🇳 {phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-400 block">Gmail</span>
                  <span className="font-semibold text-slate-900 truncate block">{email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3 relative z-10">
            <Link to="/dashboard" className="block">
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-sm shadow-indigo-600/20 font-bold"
              >
                Go to Security Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Delhast. All rights reserved.
      </footer>
    </div>
  );
};
