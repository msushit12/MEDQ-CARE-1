import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  User,
  LogOut,
  Shield,
  Stethoscope,
  Building2,
  Lock,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Home,
  HelpCircle,
  FileText,
} from 'lucide-react';
import Badge from './Badge';

const Header = ({ onNavigate, currentScreen }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const roleConfigs = {
    patient: {
      name: 'Patient Portal',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      icon: <User className="w-4 h-4 text-blue-400" />,
      badgeVariant: 'patient',
    },
    doctor: {
      name: 'Doctor Portal',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: <Stethoscope className="w-4 h-4 text-emerald-400" />,
      badgeVariant: 'doctor',
    },
    reception: {
      name: 'Reception Desk',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: <Building2 className="w-4 h-4 text-purple-400" />,
      badgeVariant: 'reception',
    },
    admin: {
      name: 'Admin Control',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: <Shield className="w-4 h-4 text-amber-400" />,
      badgeVariant: 'admin',
    },
  };

  const currentRoleConfig = role ? roleConfigs[role] : null;

  const handleNav = (screen) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Wordmark */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 p-0.5 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 fill-blue-500/20 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Med<span className="text-blue-500">Q</span> Care
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Smart Health
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Your Health, Our Priority
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentScreen === 'home'
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('services')}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
            >
              Services & OPD
            </button>
            <button
              onClick={() => handleNav('doctors')}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
            >
              Physicians
            </button>
            <button
              onClick={() => handleNav('about')}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
            >
              About Platform
            </button>
          </nav>

          {/* User / Role Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      {role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-slide-up">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2">
                        {currentRoleConfig && (
                          <Badge variant={currentRoleConfig.badgeVariant}>
                            {currentRoleConfig.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => handleNav(`dashboard-${role}`)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-400" />
                        <span>Go to Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNav('privacy')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Privacy & Compliance</span>
                      </button>
                    </div>

                    <div className="p-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          handleNav('home');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('patient-auth')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all"
                >
                  Portal Login
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-slide-up">
          <button
            onClick={() => handleNav('home')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl"
          >
            <Home className="w-4 h-4 text-blue-400" />
            Home
          </button>
          <button
            onClick={() => handleNav('services')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            Hospital Services & OPD
          </button>
          <button
            onClick={() => handleNav('doctors')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl"
          >
            <Stethoscope className="w-4 h-4 text-purple-400" />
            Physicians Directory
          </button>
          <button
            onClick={() => handleNav('privacy')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            Privacy & Data Safety
          </button>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNav('patient-auth')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-center"
              >
                Patient Login
              </button>
              <button
                onClick={() => handleNav('doctor-auth')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-center"
              >
                Doctor Login
              </button>
              <button
                onClick={() => handleNav('reception-auth')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-center"
              >
                Reception Desk
              </button>
              <button
                onClick={() => handleNav('admin-auth')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-center"
              >
                Admin Control
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
