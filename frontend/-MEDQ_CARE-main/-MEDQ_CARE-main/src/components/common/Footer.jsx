import React from 'react';
import { Heart, ShieldCheck, Download, Smartphone, Lock, Activity } from 'lucide-react';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Med<span className="text-blue-500">Q</span> Care
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise smart healthcare management platform connecting patients, specialized physicians, triage reception desks, and hospital administration with end-to-end security.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant & ISO 27001 Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('patient-auth')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Patient Booking & Health Records
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctor-auth')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Doctor Consultation & Prescription Pad
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reception-auth')}
                  className="hover:text-purple-400 transition-colors"
                >
                  Reception Check-in & OPD Triage Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin-auth')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Admin Master Control & Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legal & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy (Health Data Disclosure)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service & Clinical Disclaimers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Google Play Data Safety Form
                </button>
              </li>
              <li>
                <span className="text-slate-500">Android SDK 34+ Architecture</span>
              </li>
            </ul>
          </div>

          {/* Mobile App Deployment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Play Store Readiness
            </h4>
            <p className="text-xs text-slate-400">
              Cross-platform progressive app ready for Google Play Store AAB generation with Capacitor runtime.
            </p>
            <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <Smartphone className="w-6 h-6 text-blue-400 shrink-0" />
              <div className="text-[11px]">
                <p className="font-semibold text-white">Target API 34 (Android 14+)</p>
                <p className="text-slate-400">Package: com.medqcare.app</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 <strong className="text-slate-300">MedQ Care</strong> | Smart Healthcare Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">
              Terms
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
