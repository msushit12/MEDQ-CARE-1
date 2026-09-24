import React from 'react';
import { FileText, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

const TermsOfService = ({ onNavigate }) => {
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
          <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Terms of Service & Clinical Disclaimers</h1>
            <p className="text-xs text-slate-400">MedQ Care Hospital Informatics • Version 2.0</p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Nature of the Medical Platform</h2>
          <p className="leading-relaxed">
            MedQ Care is an enterprise hospital coordination and telemedicine workflow software. While our system enables verified medical doctors to issue legal digital prescriptions and review patient diagnostics, users experiencing life-threatening emergencies must immediately utilize the 24/7 Emergency Response button (1-800-MEDQ-911) or local emergency services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Medical Practitioner Responsibilities</h2>
          <p className="leading-relaxed">
            All onboarded physicians represent that they hold valid medical licenses and conform to standard-of-care guidelines when diagnosing or prescribing pharmaceuticals via the MedQ Care digital prescription pad.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Patient Electronic Consent</h2>
          <p className="leading-relaxed">
            By creating an account on the patient portal, you consent to secure digital communication, electronic appointment notifications, and the maintenance of encrypted electronic health records accessible to your treating clinical staff.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
