import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getCurrentUser();
      const storedRole = authService.getCurrentRole();

      if (storedToken && storedUser && storedRole) {
        setToken(storedToken);
        setUser(storedUser);
        setRole(storedRole);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, roleType) => {
    const data = await authService.login(email, password, roleType);
    setUser(data.user);
    setRole(data.role);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setRole(data.role);
    setToken(data.token);
    return data;
  };

  const quickDemoLogin = async (targetRole) => {
    const demoAccounts = {
      patient: { email: 'patient@medqcare.com', password: 'MedQ@2026' },
      doctor: { email: 'doctor@medqcare.com', password: 'MedQ@2026' },
      reception: { email: 'reception@medqcare.com', password: 'MedQ@2026' },
      admin: { email: 'admin@medqcare.com', password: 'MedQ@2026' },
    };

    const target = demoAccounts[targetRole];
    if (target) {
      return await login(target.email, target.password, targetRole);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('medq_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        quickDemoLogin,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
