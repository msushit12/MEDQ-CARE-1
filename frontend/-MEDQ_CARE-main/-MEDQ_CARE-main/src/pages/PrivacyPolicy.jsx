import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';
import Badge from '../components/common/Badge';

const PrivacyPolicy = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur space-y-6 text-sm text-slate-300">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Privacy Policy & Health Data Safety</h1>
            <p className="text-xs text-slate-400">Google Play Store & HIPAA Compliance Standard • Effective Date: January 1, 2026</p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Healthcare Data Collection Disclosure</h2>
          <p className="leading-relaxed">
            MedQ Care collects and processes personal health information (PHI), including patient demographic details, emergency contacts, medical consultation records, prescription history, and uploaded laboratory diagnostic reports strictly for the purpose of clinical care coordination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Role-Based Access Control (RBAC) & Security</h2>
          <p className="leading-relaxed">
            All stored electronic medical records are guarded with JWT-based encryption and strict role isolation. Patients access only their own medical chart; doctors view patients in their assigned clinical queue; receptionists access scheduling and check-in tokens without full diagnostic history; and hospital administrators govern platform infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Device Permissions Justification</h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>CAMERA:</strong> Required only when a patient or doctor captures a physical prescription or diagnostic report image for digital attachment.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>READ_MEDIA_IMAGES / STORAGE:</strong> Required solely to upload verified PDF lab reports and download printable prescription slips.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>INTERNET:</strong> Essential for secure TLS 1.3 encrypted API communication between the cross-platform application and MedQ Care Cloud Gateways.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Data Retention & Deletion Rights</h2>
          <p className="leading-relaxed">
            Users retain full rights to request an encrypted export of their complete health dossier or permanently delete their account in accordance with GDPR, HIPAA, and Play Store User Data Safety guidelines.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
