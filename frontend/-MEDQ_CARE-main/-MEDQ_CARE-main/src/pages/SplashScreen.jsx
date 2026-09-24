import React, { useEffect, useState } from 'react';
import { Heart, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onFinish(), 400);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 px-6 py-12 select-none overflow-hidden">
      {/* Background Animated Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Top Brand Pill */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-medium z-10 animate-fade-in">
        <Activity className="w-3.5 h-3.5 animate-pulse text-blue-400" />
        <span>Enterprise Healthcare Systems v2.4</span>
      </div>

      {/* Center Branding Animation */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <div className="relative mb-8">
          {/* Pulsing Outer Rings */}
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-75"></div>
          <div className="absolute -inset-4 rounded-full bg-blue-600/10 animate-pulse-slow"></div>

          {/* Icon Box */}
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-400 p-1 shadow-2xl shadow-blue-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Heart className="w-14 h-14 text-blue-500 fill-blue-500/30 animate-bounce" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
          Med<span className="text-blue-500">Q</span> Care
        </h1>
        <p className="text-base text-slate-400 font-medium max-w-sm">
          Your Health, Our Priority
        </p>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-slate-900 rounded-full mt-10 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2 font-mono">
          Loading Clinical Data Modules... {progress}%
        </p>
      </div>

      {/* Bottom Footer & Skip */}
      <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
        <button
          onClick={onFinish}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
        >
          <span>Skip Animation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Google Play Store Ready & HIPAA Certified</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
