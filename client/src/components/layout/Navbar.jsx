import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  UserCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Building2,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="w-full select-none">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-200">
              Official Student Admissions & Verification Gateway
            </span>
            <span className="hidden sm:inline-block text-slate-400">• Academic Session 2026–27</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] sm:text-xs">
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit SSL Secured
            </span>
            <span className="font-semibold text-slate-300">NAAC A++ Accredited</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Institution Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                  CDOT UNIVERSITY
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 block">
                Student Services & Digital Identity
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              to="/signup"
              className={`hover:text-slate-900 transition-colors ${
                location.pathname === '/' || location.pathname === '/signup'
                  ? 'text-indigo-600 font-semibold'
                  : ''
              }`}
            >
              Admissions
            </Link>
            <a href="#verification-pipeline" className="hover:text-slate-900 transition-colors">
              Student Verification
            </a>
            <Link
              to="/dashboard"
              className={`hover:text-slate-900 transition-colors ${
                location.pathname === '/dashboard' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Academic Portal
            </Link>
            <a href="#security-standards" className="hover:text-slate-900 transition-colors">
              Security & Privacy
            </a>
          </nav>

          {/* User Profile / Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                >
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user?.fullName?.[0] || 'S'}
                  </div>
                  <span className="font-medium text-slate-800">{user?.fullName?.split(' ')[0] || 'Student'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={LogOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-700 hover:text-slate-950">
                    Student Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="font-semibold">
                    Student Signup <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
