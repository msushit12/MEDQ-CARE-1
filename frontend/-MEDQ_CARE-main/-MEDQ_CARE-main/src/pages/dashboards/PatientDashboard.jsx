import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Calendar,
  FileText,
  Activity,
  User,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Pill,
  Download,
  Upload,
  Heart,
  Droplet,
  Shield,
  Phone,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

const PatientDashboard = ({ onNavigate }) => {
  const { user, updateLocalUser } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, book, prescriptions, reports, profile
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Modals
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [uploadReportModal, setUploadReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    category: 'Blood Test',
    labName: 'MedQ Central Diagnostics Lab',
    summary: 'Normal findings across evaluated parameters.',
  });

  // Booking Form State
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    reason: '',
    symptoms: '',
  });

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.patientDetails?.bloodGroup || 'O+',
    allergies: (user?.patientDetails?.allergies || []).join(', '),
    medicalHistory: (user?.patientDetails?.medicalHistory || []).join(', '),
    emergencyContactName: user?.patientDetails?.emergencyContact?.name || '',
    emergencyContactPhone: user?.patientDetails?.emergencyContact?.phone || '',
  });

  // Fetch Patient Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes, rxRes, repRes, docRes] = await Promise.allSettled([
        api.get('/patient/appointments'),
        api.get('/patient/prescriptions'),
        api.get('/patient/reports'),
        api.get('/appointments/doctors'),
      ]);

      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data?.appointments || []);
      if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value.data?.prescriptions || []);
      if (repRes.status === 'fulfilled') setReports(repRes.value.data?.reports || []);
      if (docRes.status === 'fulfilled') {
        const docs = docRes.value.data?.doctors || [];
        setDoctors(docs);
        if (docs.length > 0 && !bookingData.doctorId) {
          setBookingData((prev) => ({ ...prev, doctorId: docs[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error loading patient data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Appointment Booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingData.doctorId || !bookingData.appointmentDate || !bookingData.timeSlot || !bookingData.reason) {
      setAlertInfo({ type: 'error', message: 'Please complete all required appointment fields.' });
      return;
    }

    try {
      const payload = {
        doctorId: bookingData.doctorId,
        appointmentDate: bookingData.appointmentDate,
        timeSlot: bookingData.timeSlot,
        reason: bookingData.reason,
        symptoms: bookingData.symptoms ? bookingData.symptoms.split(',').map((s) => s.trim()) : [],
      };

      const res = await api.post('/patient/appointments/book', payload);
      setAlertInfo({ type: 'success', message: res.data?.message || 'Appointment booked successfully!' });
      setBookingData({
        doctorId: doctors[0]?._id || '',
        appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        reason: '',
        symptoms: '',
      });
      setActiveTab('appointments');
      fetchData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to book appointment' });
    }
  };

  // Handle Cancel Appointment
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/patient/appointments/${id}/cancel`);
      setAlertInfo({ type: 'info', message: 'Appointment has been cancelled.' });
      fetchData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to cancel appointment.' });
    }
  };

  // Handle Upload Report
  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportForm.title) return;
    try {
      await api.post('/patient/reports', reportForm);
      setUploadReportModal(false);
      setAlertInfo({ type: 'success', message: 'Medical document uploaded to your health record.' });
      setReportForm({
        title: '',
        category: 'Blood Test',
        labName: 'MedQ Central Diagnostics Lab',
        summary: 'Normal findings across evaluated parameters.',
      });
      fetchData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to upload report.' });
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/patient/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        patientDetails: {
          bloodGroup: profileForm.bloodGroup,
          allergies: profileForm.allergies.split(',').map((s) => s.trim()),
          medicalHistory: profileForm.medicalHistory.split(',').map((s) => s.trim()),
          emergencyContact: {
            name: profileForm.emergencyContactName,
            phone: profileForm.emergencyContactPhone,
          },
        },
      });
      if (res.data?.user) updateLocalUser(res.data.user);
      setAlertInfo({ type: 'success', message: 'Health profile vitals updated successfully.' });
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to update health profile.' });
    }
  };

  const upcomingApts = appointments.filter((a) => a.status === 'confirmed' || a.status === 'in-consultation');
  const pastApts = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 backdrop-blur shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-2xl shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Welcome, {user?.name || 'Patient'}
              </h1>
              <Badge variant="patient">Verified Patient</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              MedQ ID: <code className="text-blue-400 font-mono">MEDQ-PT-{user?._id?.slice(-5) || '99201'}</code> • Blood Group: <strong className="text-white">{user?.patientDetails?.bloodGroup || 'O+'}</strong>
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('book')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book Doctor Appointment</span>
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('appointments')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Upcoming Visits</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{upcomingApts.length}</div>
          <p className="text-[11px] text-blue-400">Scheduled Consultations</p>
        </div>

        <div
          onClick={() => setActiveTab('prescriptions')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Active Prescriptions</span>
            <Pill className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{prescriptions.length}</div>
          <p className="text-[11px] text-emerald-400">Digital Rx Available</p>
        </div>

        <div
          onClick={() => setActiveTab('reports')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Lab Reports</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{reports.length}</div>
          <p className="text-[11px] text-purple-400">Verified Pathology & Scans</p>
        </div>

        <div
          onClick={() => setActiveTab('profile')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Health Vitals</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">100%</div>
          <p className="text-[11px] text-slate-400">Profile Complete</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>My Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'book'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Book Appointment</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'prescriptions'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Digital Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Medical Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Health Profile & Vitals</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS LIST */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Upcoming Section */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Upcoming Consultations</span>
            </h3>

            {upcomingApts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No upcoming appointments scheduled.</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Schedule Your Visit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingApts.map((apt) => (
                  <div
                    key={apt._id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-blue-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={apt.status === 'in-consultation' ? 'warning' : 'success'}>
                        {apt.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono font-bold bg-blue-950/60 text-blue-400 px-2.5 py-1 rounded-lg border border-blue-800/40">
                        Token: {apt.tokenNumber}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{apt.doctorName}</h4>
                      <p className="text-xs text-slate-400">{apt.specialization} • Room: {apt.roomNumber}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-850 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Date</span>
                        <span className="text-slate-200 font-semibold">
                          {new Date(apt.appointmentDate).toDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Time Slot</span>
                        <span className="text-slate-200 font-semibold">{apt.timeSlot}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400">
                      <strong className="text-slate-300">Reason:</strong> {apt.reason}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-bold">Fee: ${apt.consultationFee || 500} (Paid)</span>
                      <button
                        onClick={() => handleCancelAppointment(apt._id)}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Cancel Visit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Consultations */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Consultation History ({pastApts.length})</span>
            </h3>

            {pastApts.length === 0 ? (
              <p className="text-xs text-slate-500">No past appointments recorded.</p>
            ) : (
              <div className="divide-y divide-slate-850">
                {pastApts.map((apt) => (
                  <div key={apt._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{apt.doctorName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(apt.appointmentDate).toDateString()} • {apt.specialization} • Reason: {apt.reason}
                      </p>
                    </div>
                    <Badge variant={apt.status === 'completed' ? 'success' : 'danger'}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOOK NEW APPOINTMENT */}
      {activeTab === 'book' && (
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur max-w-3xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Book Specialist Consultation</h3>
              <p className="text-xs text-slate-400">Select physician, date, and preferred OPD timing slot</p>
            </div>
          </div>

          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Physician / Department
              </label>
              <select
                value={bookingData.doctorId}
                onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.specialization} (${doc.consultationFee || 500})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Available Time Slot
                </label>
                <select
                  value={bookingData.timeSlot}
                  onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="09:00 AM">09:00 AM (Morning Slot)</option>
                  <option value="10:00 AM">10:00 AM (Morning Slot)</option>
                  <option value="11:30 AM">11:30 AM (Late Morning)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                  <option value="03:30 PM">03:30 PM (Evening Slot)</option>
                  <option value="04:30 PM">04:30 PM (Evening Slot)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chief Complaint / Reason for Visit
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chest pain follow-up, seasonal cough, diabetic routine review"
                value={bookingData.reason}
                onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Symptoms (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Palpitations, Shortness of Breath, Headache"
                value={bookingData.symptoms}
                onChange={(e) => setBookingData({ ...bookingData, symptoms: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300 flex items-center justify-between">
              <div>
                <p className="font-semibold">Consultation Fee Coverage</p>
                <p className="text-[11px] text-blue-400">Included under MedQ Smart Insurance / Pre-paid OPD</p>
              </div>
              <span className="text-base font-black text-white">$500 - $750</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>Confirm & Generate OPD Token</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              <span>Digital e-Prescriptions ({prescriptions.length})</span>
            </h3>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
              <Pill className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No prescriptions issued yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Date: {new Date(rx.date || rx.createdAt).toDateString()}
                    </span>
                    <Badge variant="doctor">{rx.doctorSpecialization || 'Physician'}</Badge>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{rx.doctorName}</h4>
                    <p className="text-xs text-emerald-400 font-semibold">Diagnosis: {rx.diagnosis}</p>
                  </div>

                  {/* Medicines List */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-850">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Prescribed Medications
                    </p>
                    {rx.medicines?.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                        <span className="font-semibold text-slate-200">{m.name}</span>
                        <span className="text-[11px] text-slate-400">{m.dosage} • {m.frequency} ({m.duration})</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Advice:</strong> {rx.advice || 'Follow medication schedule carefully.'}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">License: {rx.doctorLicense || 'MD-MED-84920'}</span>
                    <button
                      onClick={() => setSelectedPrescription(rx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print Slip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEDICAL REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Lab Reports & Diagnostic Scans ({reports.length})</span>
            </h3>
            <button
              onClick={() => setUploadReportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep) => (
              <div
                key={rep._id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="info">{rep.category}</Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(rep.reportDate || rep.createdAt).toDateString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{rep.title}</h4>
                  <p className="text-xs text-slate-400">{rep.labName}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200 mb-1">Clinical Summary:</p>
                  <p>{rep.summary}</p>
                </div>

                {rep.metrics && rep.metrics.length > 0 && (
                  <div className="space-y-1">
                    {rep.metrics.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-850">
                        <span className="text-slate-300">{m.parameter}</span>
                        <span className="font-mono text-emerald-400 font-semibold">{m.value} {m.unit}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{rep.fileName} ({rep.fileSize || '1.2 MB'})</span>
                  <a
                    href={rep.fileUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HEALTH PROFILE & VITALS */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur max-w-3xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Health Profile & Emergency Vitals</h3>
              <p className="text-xs text-slate-400">Maintained for doctors and ER triage teams</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  value={profileForm.allergies}
                  onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chronic Medical History & Pre-existing Conditions
              </label>
              <textarea
                rows={2}
                value={profileForm.medicalHistory}
                onChange={(e) => setProfileForm({ ...profileForm, medicalHistory: e.target.value })}
                placeholder="e.g. Hypertension diagnosed 2022, Type 2 Diabetes, Mild Asthma"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Emergency Contact Person
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Contact Name & Relation</label>
                  <input
                    type="text"
                    value={profileForm.emergencyContactName}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                    placeholder="e.g. Robert Jenkins (Spouse)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={profileForm.emergencyContactPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                    placeholder="+1 (555) 876-5432"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
            >
              Save Health Record Updates
            </button>
          </form>
        </div>
      )}

      {/* MODAL: PRESCRIPTION PRINT SLIP */}
      {selectedPrescription && (
        <Modal
          isOpen={!!selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          title="MedQ Care Digital Prescription Slip"
          subtitle={`Rx ID: ${selectedPrescription._id} • Issued: ${new Date(selectedPrescription.date || selectedPrescription.createdAt).toDateString()}`}
        >
          <div className="space-y-6 text-slate-100 print:text-black">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">{selectedPrescription.doctorName}</h3>
                <p className="text-xs text-emerald-400 font-semibold">{selectedPrescription.doctorSpecialization}</p>
                <p className="text-[11px] text-slate-400">License: {selectedPrescription.doctorLicense}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-400">MedQ Care Hospital</div>
                <div className="text-[11px] text-slate-400">OPD & Telehealth Wing</div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient Name</span>
                <span className="font-bold text-white">{selectedPrescription.patientName || user?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Diagnosis</span>
                <span className="font-bold text-emerald-400">{selectedPrescription.diagnosis}</span>
              </div>
            </div>

            {/* Medicines */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Prescribed Dosages (Rx)
              </h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                {selectedPrescription.medicines?.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{idx + 1}. {m.name}</p>
                      <p className="text-[11px] text-slate-400">{m.instructions}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">{m.dosage}</p>
                      <p className="text-[10px] text-slate-400">{m.frequency} • {m.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs">
              <p className="font-bold text-slate-300 mb-1">Doctor Advice & Recommendations:</p>
              <p className="text-slate-400">{selectedPrescription.advice}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: UPLOAD LAB REPORT */}
      {uploadReportModal && (
        <Modal
          isOpen={uploadReportModal}
          onClose={() => setUploadReportModal(false)}
          title="Upload Medical Record / Lab Report"
          subtitle="Add external pathology, imaging or doctor summary to your health record"
        >
          <form onSubmit={handleUploadReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Report Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Full Lipid Profile 2026"
                value={reportForm.title}
                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Blood Test">Blood Test</option>
                  <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                  <option value="MRI / CT Scan">MRI / CT Scan</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Cardiology / ECG">Cardiology / ECG</option>
                  <option value="General Lab">General Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Diagnostic Center</label>
                <input
                  type="text"
                  value={reportForm.labName}
                  onChange={(e) => setReportForm({ ...reportForm, labName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Doctor Remarks / Summary</label>
              <textarea
                rows={2}
                value={reportForm.summary}
                onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUploadReportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
              >
                Save to Health Vault
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PatientDashboard;
