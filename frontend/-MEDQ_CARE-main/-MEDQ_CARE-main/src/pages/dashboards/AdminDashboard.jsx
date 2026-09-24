import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  Stethoscope,
  TrendingUp,
  Activity,
  FileCheck,
  DollarSign,
  Plus,
  Trash2,
  Lock,
  Search,
  Settings,
  Bell,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

const AdminDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users, onboard-doctor, analytics, audit-logs, settings
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  // Data
  const [usersList, setUsersList] = useState([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // Doctor Onboarding Form State
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: 'MedQ@2026',
    phone: '',
    specialization: 'Cardiologist & Internal Medicine',
    licenseNumber: '',
    experience: 8,
    qualification: 'MD, FACC',
    consultationFee: 750,
    roomNumber: 'OPD-205',
  });

  // Fetch Admin Data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, analyticsRes, logsRes] = await Promise.allSettled([
        api.get(`/admin/users?role=${selectedRoleFilter}&query=${encodeURIComponent(userSearchQuery)}`),
        api.get('/admin/reports/analytics'),
        api.get('/admin/audit-logs'),
      ]);

      if (usersRes.status === 'fulfilled') setUsersList(usersRes.value.data?.users || []);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data?.analytics || null);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.data?.logs || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [selectedRoleFilter]);

  // Handle User Status Toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setAlertInfo({ type: 'success', message: `User status changed to '${newStatus}'.` });
      fetchAdminData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to update user status.' });
    }
  };

  // Handle User Delete
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently remove this user account?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setAlertInfo({ type: 'info', message: 'User account removed from platform.' });
      fetchAdminData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to delete user.' });
    }
  };

  // Handle Doctor Onboarding Submit
  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.name || !doctorForm.email || !doctorForm.licenseNumber) {
      setAlertInfo({ type: 'error', message: 'Name, email, and medical license number are required.' });
      return;
    }

    try {
      const res = await api.post('/admin/doctor/create', doctorForm);
      setAlertInfo({
        type: 'success',
        message: res.data?.message || 'Physician onboarded successfully!',
      });
      setDoctorForm({
        name: '',
        email: '',
        password: 'MedQ@2026',
        phone: '',
        specialization: 'General Medicine',
        licenseNumber: '',
        experience: 5,
        qualification: 'MBBS, MD',
        consultationFee: 500,
        roomNumber: 'OPD-105',
      });
      setActiveTab('users');
      fetchAdminData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to onboard doctor' });
    }
  };

  const summary = analytics?.summary || {
    totalUsers: usersList.length,
    doctorCount: usersList.filter((u) => u.role === 'doctor').length,
    totalAppointments: 168,
    totalRevenue: 84000,
    systemUptime: '99.98%',
    securityScore: 'A+ (HIPAA & FHIR Ready)',
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/30 backdrop-blur shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-2xl shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Admin Control Center
              </h1>
              <Badge variant="admin">SuperAdmin</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Logged in as: <strong className="text-white">{user?.name || 'Administrator Chief'}</strong> • Security Clearance: <span className="text-amber-400 font-bold">LEVEL-5 ROOT</span>
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('onboard-doctor')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Physician</span>
          </button>
        </div>
      </div>

      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
        />
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Accounts</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.totalUsers}</div>
          <p className="text-[11px] text-amber-400">Patients, Doctors, Staff</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">${summary.totalRevenue}</div>
          <p className="text-[11px] text-emerald-400">Consultation Settlements</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Consultations</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.totalAppointments}</div>
          <p className="text-[11px] text-blue-400">Completed OPD Cycles</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Security Health</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">99.98%</div>
          <p className="text-[11px] text-purple-400">HIPAA Compliant</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User & Staff Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('onboard-doctor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'onboard-doctor'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Doctor Onboarding</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Platform Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('audit-logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'audit-logs'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Audit & Security Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Platform User Directory</span>
            </h3>

            {/* Role Filter & Search */}
            <div className="flex items-center gap-2">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="reception">Reception</option>
                <option value="admin">Administrators</option>
              </select>

              <input
                type="text"
                placeholder="Search user..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAdminData()}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white text-sm">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={u.role}>{u.role}</Badge>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {u.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(u._id, u.status || 'active')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR ONBOARDING */}
      {activeTab === 'onboard-doctor' && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur max-w-3xl mx-auto shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Physician Clinical Credentialing</h3>
              <p className="text-xs text-slate-400">Onboard verified medical practitioners to hospital network</p>
            </div>
          </div>

          <form onSubmit={handleOnboardDoctor} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Doctor Name (with Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Vance"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="arthur.vance@medqcare.com"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Medical License Registration No.
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MCI-STATE-99410"
                  value={doctorForm.licenseNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinical Specialization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neurology & Spine"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Experience (Yrs)
                </label>
                <input
                  type="number"
                  value={doctorForm.experience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fee ($ / ₹)
                </label>
                <input
                  type="number"
                  value={doctorForm.consultationFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  OPD Room
                </label>
                <input
                  type="text"
                  value={doctorForm.roomNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, roomNumber: e.target.value })}
                  placeholder="OPD-205"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Temporary Account Password
              </label>
              <input
                type="text"
                value={doctorForm.password}
                onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Verify Credentials & Authorize Physician</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PLATFORM ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Department Workload Breakdown</span>
              </h3>
              <div className="space-y-3">
                {analytics?.departmentDistribution?.map((dept, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{dept.name}</span>
                      <span className="text-slate-400">{dept.consultations} Consults ({dept.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                )) || (
                  <p className="text-xs text-slate-500">Loading workload metrics...</p>
                )}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Monthly Appointment Growth</span>
              </h3>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {analytics?.appointmentTrends?.slice(-4).map((trend, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-850 text-center">
                    <div className="text-xs font-bold text-slate-400">{trend.month}</div>
                    <div className="text-lg font-black text-white mt-1">{trend.count}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">${trend.revenue}</div>
                  </div>
                )) || <p className="text-xs text-slate-500">Loading trends...</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit-logs' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Platform Security Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-400">HIPAA Compliant Log Stream</span>
          </div>

          <div className="divide-y divide-slate-850">
            {auditLogs.map((log) => (
              <div key={log._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      {log.action}
                    </span>
                    <span className="font-semibold text-white">{log.user}</span>
                    <Badge variant={log.role}>{log.role}</Badge>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  <div className="text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
