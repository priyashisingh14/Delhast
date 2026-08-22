import React from 'react';
import { BrandLogo } from '../common/BrandLogo';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-900 relative selection:bg-indigo-500 selection:text-white">
      {/* Top Mobile Brand Bar */}
      <header className="lg:hidden p-4 sm:p-5 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <BrandLogo size="md" />
      </header>

      {/* Main Two-Column Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
          {/* LEFT SIDE: Minimalist Brand & Headline */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
            <BrandLogo size="lg" />

            <div className="space-y-4 pt-2">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Delhivery <br />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                  Your Way !
                </span>
              </h1>
            </div>
          </div>

          {/* RIGHT SIDE: Authentication Form Card */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Clean Footer */}
      <footer className="py-4 border-t border-slate-200/80 bg-white/50 backdrop-blur-xs text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Delhast. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-700 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
