import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { BrandLogo } from '../common/BrandLogo';
import { LogOut, ChevronDown } from 'lucide-react';

export const AppNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  // Extract initials (e.g. "Priyashi Singh" -> "PS")
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand Logo */}
          <Link to="/dashboard" className="flex items-center">
            <BrandLogo size="md" />
          </Link>

          {/* Right User Profile & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Pill Dropdown */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                {getInitials(user?.fullName)}
              </div>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                {user?.fullName || 'Student'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/60 text-rose-600 text-xs font-semibold transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
