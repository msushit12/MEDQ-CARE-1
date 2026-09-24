import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import EmergencyBanner from './components/common/EmergencyBanner';
import SplashScreen from './pages/SplashScreen';
import HomeScreen from './pages/HomeScreen';
import PatientAuthScreen from './pages/auth/PatientAuthScreen';
import DoctorAuthScreen from './pages/auth/DoctorAuthScreen';
import ReceptionAuthScreen from './pages/auth/ReceptionAuthScreen';
import AdminAuthScreen from './pages/auth/AdminAuthScreen';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import ReceptionDashboard from './pages/dashboards/ReceptionDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function MainApp() {
  const { user, role, isAuthenticated, quickDemoLogin } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');

  // Handle navigation
  const navigateTo = (screen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentScreen(screen);
  };

  // If user logs in successfully, navigate directly to their role dashboard
  const handleLoginSuccess = (userRole) => {
    navigateTo(`dashboard-${userRole}`);
  };

  // 1-Click Demo Login directly from Home Screen
  const handleDirectDemoLogin = async (targetRole) => {
    try {
      await quickDemoLogin(targetRole);
      navigateTo(`dashboard-${targetRole}`);
    } catch (e) {
      navigateTo(`${targetRole}-auth`);
    }
  };

  // Show Splash Screen on initial app launch
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 24/7 Emergency Response Bar */}
      <EmergencyBanner onCallNow={() => {}} />

      {/* Top Navigation */}
      <Header onNavigate={navigateTo} currentScreen={currentScreen} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={navigateTo}
            onDirectDemoLogin={handleDirectDemoLogin}
          />
        )}

        {currentScreen === 'services' && (
          <HomeScreen
            onNavigate={navigateTo}
            onDirectDemoLogin={handleDirectDemoLogin}
          />
        )}

        {currentScreen === 'doctors' && (
          <HomeScreen
            onNavigate={navigateTo}
            onDirectDemoLogin={handleDirectDemoLogin}
          />
        )}

        {currentScreen === 'about' && (
          <HomeScreen
            onNavigate={navigateTo}
            onDirectDemoLogin={handleDirectDemoLogin}
          />
        )}

        {/* 4 Role-Specific Auth Screens */}
        {currentScreen === 'patient-auth' && (
          <PatientAuthScreen
            onNavigate={navigateTo}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentScreen === 'doctor-auth' && (
          <DoctorAuthScreen
            onNavigate={navigateTo}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentScreen === 'reception-auth' && (
          <ReceptionAuthScreen
            onNavigate={navigateTo}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentScreen === 'admin-auth' && (
          <AdminAuthScreen
            onNavigate={navigateTo}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* 4 Role Dashboards (Guarded) */}
        {currentScreen === 'dashboard-patient' && (
          <PatientDashboard onNavigate={navigateTo} />
        )}

        {currentScreen === 'dashboard-doctor' && (
          <DoctorDashboard onNavigate={navigateTo} />
        )}

        {currentScreen === 'dashboard-reception' && (
          <ReceptionDashboard onNavigate={navigateTo} />
        )}

        {currentScreen === 'dashboard-admin' && (
          <AdminDashboard onNavigate={navigateTo} />
        )}

        {/* Legal Pages */}
        {currentScreen === 'privacy' && (
          <PrivacyPolicy onNavigate={navigateTo} />
        )}

        {currentScreen === 'terms' && (
          <TermsOfService onNavigate={navigateTo} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
