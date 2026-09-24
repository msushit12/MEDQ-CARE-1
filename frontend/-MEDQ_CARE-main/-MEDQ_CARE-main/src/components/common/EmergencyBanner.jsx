import React from 'react';
import { PhoneCall, AlertCircle, ShieldAlert } from 'lucide-react';

const EmergencyBanner = ({ onCallNow }) => {
  return (
    <div className="w-full bg-gradient-to-r from-red-950/80 via-rose-900/60 to-red-950/80 border-y border-red-500/30 px-4 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-200">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>24/7 MedQ Trauma & Emergency Response:</span>
            <span className="text-white font-mono bg-red-900/80 px-2 py-0.5 rounded border border-red-700/50">
              1-800-MEDQ-911
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-red-300/80 hidden md:inline">
            Ambulance Dispatch • ER Triage • On-Call Trauma Surgeon
          </span>
          <a
            href="tel:18006337911"
            onClick={onCallNow}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-red-600/30 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency Dial</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
