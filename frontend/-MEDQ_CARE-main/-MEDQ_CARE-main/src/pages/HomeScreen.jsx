import React from 'react';
import {
  User,
  Stethoscope,
  Building2,
  Shield,
  ArrowRight,
  CalendarCheck,
  FileCheck2,
  Activity,
  HeartPulse,
  Clock,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import Badge from '../components/common/Badge';

const HomeScreen = ({ onNavigate, onDirectDemoLogin }) => {
  const roleCards = [
    {
      id: 'patient',
      roleKey: 'patient-auth',
      title: 'Patient Portal',
      subtitle: 'Bookings & Digital Records',
      color: 'from-blue-600 to-indigo-600',
      borderColor: 'hover:border-blue-500/60',
      badgeColor: 'patient',
      textColor: 'text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30',
      icon: <User className="w-8 h-8 text-blue-400" />,
      description:
        'Schedule doctor appointments, view digital prescriptions, download verified lab diagnostic reports, and manage your health vitals.',
      features: [
        'Real-time Doctor Slot Booking',
        'Download PDF Prescriptions',
        'Lab Reports & Biomarker History',
        'Emergency Medical Profile',
      ],
      actionLabel: 'Enter as Patient',
    },
    {
      id: 'doctor',
      roleKey: 'doctor-auth',
      title: 'Doctor Portal',
      subtitle: 'Clinical Queue & e-Prescriptions',
      color: 'from-emerald-600 to-teal-600',
      borderColor: 'hover:border-emerald-500/60',
      badgeColor: 'doctor',
      textColor: 'text-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
      icon: <Stethoscope className="w-8 h-8 text-emerald-400" />,
      description:
        'Manage live OPD queues, issue multi-medication digital prescriptions, inspect comprehensive patient health history, and control consultation schedules.',
      features: [
        'Live OPD Appointment Queue',
        'Digital Prescription Pad & Dosage Builder',
        'Patient Longitudinal Medical History',
        'Consultation Hours & Availability Manager',
      ],
      actionLabel: 'Enter as Doctor',
    },
    {
      id: 'reception',
      roleKey: 'reception-auth',
      title: 'Reception Desk',
      subtitle: 'Triage, Check-In & OPD Board',
      color: 'from-purple-600 to-violet-600',
      borderColor: 'hover:border-purple-500/60',
      badgeColor: 'reception',
      textColor: 'text-purple-400',
      buttonBg: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30',
      icon: <Building2 className="w-8 h-8 text-purple-400" />,
      description:
        'Handle walk-in patient triage, print OPD tokens, manage live patient check-ins, and monitor real-time physician room availability boards.',
      features: [
        'Fast Walk-in Patient Registration',
        '1-Click Patient Check-in & OPD Tokens',
        'Live Doctor Room Availability Board',
        'Patient Search & Billing Slips',
      ],
      actionLabel: 'Enter as Reception',
    },
    {
      id: 'admin',
      roleKey: 'admin-auth',
      title: 'Admin Dashboard',
      subtitle: 'Governance, Analytics & Staff',
      color: 'from-amber-600 to-orange-600',
      borderColor: 'hover:border-amber-500/60',
      badgeColor: 'admin',
      textColor: 'text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30',
      icon: <Shield className="w-8 h-8 text-amber-400" />,
      description:
        'Complete hospital platform governance, user credential management, physician credential onboarding, financial analytics, and system audit logs.',
      features: [
        'Staff & User Account Management',
        'Physician License Onboarding',
        'Revenue & Consultation KPI Analytics',
        'HIPAA Compliance Security Audit Logs',
      ],
      actionLabel: 'Enter as Admin',
    },
  ];

  const stats = [
    { label: 'Verified Physicians', value: '45+', icon: <Stethoscope className="w-5 h-5 text-emerald-400" /> },
    { label: 'Patients Treated', value: '18,500+', icon: <Users className="w-5 h-5 text-blue-400" /> },
    { label: 'Clinical Accuracy', value: '99.8%', icon: <Award className="w-5 h-5 text-purple-400" /> },
    { label: 'Emergency Response', value: '< 8 Mins', icon: <Clock className="w-5 h-5 text-amber-400" /> },
  ];

  const services = [
    {
      title: 'Specialist Cardiology',
      desc: 'Expert ECG, echocardiograms, lipid profiles, and cardiovascular therapy.',
      icon: <HeartPulse className="w-6 h-6 text-rose-400" />,
    },
    {
      title: 'OPD & General Medicine',
      desc: 'Daily outpatient consultations, chronic disease management, and triage.',
      icon: <Activity className="w-6 h-6 text-blue-400" />,
    },
    {
      title: 'Certified Diagnostics & Lab',
      desc: 'NABL accredited pathology, biochemistry, imaging, and instant digital reports.',
      icon: <FileCheck2 className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: 'Smart Telehealth & e-Rx',
      desc: 'Paperless digital prescriptions with dosage timing and QR-verified records.',
      icon: <CalendarCheck className="w-6 h-6 text-purple-400" />,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="text-blue-400 font-bold">✚</span>
          <span>Welcome to MedQ Care Healthcare Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none mb-6">
          Your Health, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
            Our Priority.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          The next-generation smart healthcare management ecosystem. Seamlessly uniting patients, clinical physicians, reception desks, and hospital administration in one unified cloud system.
        </p>

        {/* Quick Demo Login CTA Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('patient-auth')}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('services')}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 transition-all"
          >
            Explore Services
          </button>
        </div>

        {/* Divider */}
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mx-auto mt-12 rounded-full"></div>
      </section>

      {/* 4 Role Selection Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge variant="default" size="lg">
            Role-Based Portals
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Choose Your Access Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Select your role to access dedicated dashboards, tools, and clinical workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleCards.map((card) => (
            <div
              key={card.id}
              className={`relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900/80 border border-slate-800 ${card.borderColor} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl group`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <Badge variant={card.badgeColor}>{card.title}</Badge>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                <p className={`text-xs font-semibold ${card.textColor} mb-3`}>{card.subtitle}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">{card.description}</p>

                {/* Features List */}
                <div className="space-y-2 mb-6 border-t border-slate-800/80 pt-4">
                  {card.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onNavigate(card.roleKey)}
                  className={`w-full py-3 px-4 rounded-xl ${card.buttonBg} text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all`}
                >
                  <span>{card.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onDirectDemoLogin(card.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-800/70 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>1-Click Demo Login</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hospital Metrics / Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Services Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge variant="default" size="lg">
            Clinical Excellence
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Integrated Hospital Specialities
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Comprehensive medical services powered by real-time digitized hospital records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="p-3 rounded-2xl bg-slate-950 w-fit border border-slate-800">
                {srv.icon}
              </div>
              <h4 className="text-base font-bold text-white">{srv.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
