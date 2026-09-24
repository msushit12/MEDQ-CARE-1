import React from 'react';
import { Sparkles, User, Stethoscope, Building2, Shield, ArrowRight } from 'lucide-react';

const DemoCredentialsBar = ({ onSelectRole, activeRole, onDirectLogin, isLoading }) => {
  const roles = [
    {
      id: 'patient',
      title: 'Patient Demo',
      email: 'patient@medqcare.com',
      badge: 'Sarah J. (Patient)',
      color: 'border-blue-500/40 hover:border-blue-500 bg-blue-500/10 text-blue-300',
      activeColor: 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/30',
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      id: 'doctor',
      title: 'Doctor Demo',
      email: 'doctor@medqcare.com',
      badge: 'Dr. Chen (Cardiology)',
      color: 'border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/10 text-emerald-300',
      activeColor: 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
    },
    {
      id: 'reception',
      title: 'Reception Demo',
      email: 'reception@medqcare.com',
      badge: 'Elena R. (Triage)',
      color: 'border-purple-500/40 hover:border-purple-500 bg-purple-500/10 text-purple-300',
      activeColor: 'border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-600/30',
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'admin',
      title: 'Admin Demo',
      email: 'admin@medqcare.com',
      badge: 'Admin Chief',
      color: 'border-amber-500/40 hover:border-amber-500 bg-amber-500/10 text-amber-300',
      activeColor: 'border-amber-500 bg-amber-600 text-white shadow-lg shadow-amber-600/30',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Quick 1-Click Demo Accounts</span>
        </div>
        <span className="text-[11px] text-slate-400">Password for all: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">MedQ@2026</code></span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {roles.map((r) => {
          const isActive = activeRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              disabled={isLoading}
              onClick={() => onDirectLogin ? onDirectLogin(r.id) : onSelectRole(r.id)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                isActive ? r.activeColor : r.color
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {r.icon}
                  <span>{r.title}</span>
                </div>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </div>
              <span className={`text-[10px] truncate max-w-full font-medium ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                {r.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoCredentialsBar;
