import api from './api';

export const authService = {
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      if (response.data?.token) {
        localStorage.setItem('medq_token', response.data.token);
        localStorage.setItem('medq_user', JSON.stringify(response.data.user));
        localStorage.setItem('medq_role', response.data.role);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to connect to backend server' };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data?.token) {
        localStorage.setItem('medq_token', response.data.token);
        localStorage.setItem('medq_user', JSON.stringify(response.data.user));
        localStorage.setItem('medq_role', response.data.role);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user profile' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to process password reset' };
    }
  },

  getDemoCredentials: async () => {
    try {
      const response = await api.get('/auth/demo-credentials');
      return response.data.credentials;
    } catch (error) {
      // Fallback demo credentials
      return [
        {
          role: 'patient',
          label: 'Patient Portal',
          email: 'patient@medqcare.com',
          password: 'MedQ@2026',
          name: 'Sarah Jenkins',
          badge: 'Verified Patient',
          color: '#2563EB',
        },
        {
          role: 'doctor',
          label: 'Doctor Portal',
          email: 'doctor@medqcare.com',
          password: 'MedQ@2026',
          name: 'Dr. Michael Chen',
          badge: 'Cardiologist',
          color: '#059669',
        },
        {
          role: 'reception',
          label: 'Reception Desk',
          email: 'reception@medqcare.com',
          password: 'MedQ@2026',
          name: 'Elena Rostova',
          badge: 'Head Receptionist',
          color: '#7C3AED',
        },
        {
          role: 'admin',
          label: 'Admin Control Center',
          email: 'admin@medqcare.com',
          password: 'MedQ@2026',
          name: 'Administrator Chief',
          badge: 'SuperAdmin',
          color: '#EA580C',
        },
      ];
    }
  },

  logout: () => {
    localStorage.removeItem('medq_token');
    localStorage.removeItem('medq_user');
    localStorage.removeItem('medq_role');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('medq_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getCurrentRole: () => {
    return localStorage.getItem('medq_role') || null;
  },

  getToken: () => {
    return localStorage.getItem('medq_token') || null;
  },
};
