import React from 'react';
import { ShieldCheck, Lock, Award, GraduationCap, Mail, Phone, ExternalLink, HelpCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 transition-all">
      {/* 4-Column University Department Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* University */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              University
            </h4>
            <ul className="text-xs space-y-2 text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">About CDOT University</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Admissions 2026–27</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Academic Programs</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Campus Facilities</a></li>
            </ul>
          </div>

          {/* Student Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Student Services
            </h4>
            <ul className="text-xs space-y-2 text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Student Portal</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Identity Verification</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">IT Help Desk</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Academic Services</a></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Security & Privacy
            </h4>
            <ul className="text-xs space-y-2 text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Data Protection & FERPA</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Platform Security Architecture</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Terms of Verification</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Contact & Support
            </h4>
            <div className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
              <p>Main Campus: Knowledge Park III, Institutional Area, Greater Noida, NCR 201306.</p>
              <p className="flex items-center gap-1.5 pt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Registrar: +91 (011) 2980-4400
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> it.helpdesk@cdot.edu.in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Institutional Copyright Bar */}
      <div className="border-t border-slate-100 bg-slate-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Document Intelligence OCR
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Lock className="w-4 h-4 text-indigo-600" />
              256-Bit Cryptographic Security
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>© 2026 CDOT University. All Rights Reserved.</span>
            <span>•</span>
            <span className="font-medium text-slate-700">Secure Student Identity Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
