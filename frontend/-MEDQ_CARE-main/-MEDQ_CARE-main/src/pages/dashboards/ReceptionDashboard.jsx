import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Stethoscope,
  Printer,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Phone,
  Sparkles,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

const ReceptionDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('desk'); // desk, walkin, doctor-board, search-patients
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  // Data
  const [appointments, setAppointments] = useState([]);
  const [doctorBoard, setDoctorBoard] = useState([]);
  const [receptionStats, setReceptionStats] = useState({
    totalToday: 0,
    checkedIn: 0,
    pendingCheckIn: 0,
    inConsultation: 0,
    completedToday: 0,
    totalDoctorsOnDuty: 0,
  });

  // Walk-in Form State
  const [walkInData, setWalkInData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    reason: 'Walk-in General Consultation',
  });

  // Patient Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Selected OPD Slip for Print
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Fetch Reception Desk Data
  const fetchReceptionData = async () => {
    setLoading(true);
    try {
      const [aptRes, docRes, statsRes] = await Promise.allSettled([
        api.get('/reception/appointments/all'),
        api.get('/reception/doctor-availability'),
        api.get('/reception/stats'),
      ]);

      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data?.appointments || []);
      if (docRes.status === 'fulfilled') {
        const docs = docRes.value.data?.doctors || [];
        setDoctorBoard(docs);
        if (docs.length > 0 && !walkInData.doctorId) {
          setWalkInData((prev) => ({ ...prev, doctorId: docs[0]._id }));
        }
      }
      if (statsRes.status === 'fulfilled') setReceptionStats(statsRes.value.data?.stats || {});
    } catch (err) {
      console.error('Error fetching reception data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionData();
  }, []);

  // Handle 1-Click Patient Check-in
  const handleCheckIn = async (appointmentId) => {
    try {
      const res = await api.put(`/reception/patient-checkin/${appointmentId}`);
      setAlertInfo({
        type: 'success',
        message: res.data?.message || 'Patient successfully checked-in. OPD Token generated.',
      });
      fetchReceptionData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to complete check-in.' });
    }
  };

  // Handle Walk-in Booking
  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    if (!walkInData.patientName || !walkInData.doctorId || !walkInData.reason) {
      setAlertInfo({ type: 'error', message: 'Patient Name, Doctor, and Reason are required.' });
      return;
    }

    try {
      const res = await api.post('/reception/appointments/create', walkInData);
      setAlertInfo({
        type: 'success',
        message: res.data?.message || 'Walk-in patient registered and checked-in successfully!',
      });
      setWalkInData({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        doctorId: doctorBoard[0]?._id || '',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        reason: 'Walk-in General Consultation',
      });
      setActiveTab('desk');
      fetchReceptionData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to create walk-in appointment.' });
    }
  };

  // Search Registered Patients
  const handleSearchPatients = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await api.get(`/reception/search-patients?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data?.patients || []);
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to search patients.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 backdrop-blur shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-2xl shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name || 'Elena Rostova'}
              </h1>
              <Badge variant="reception">Main Triage Desk</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Department: <strong className="text-white">{user?.receptionDetails?.department || 'Registration Desk'}</strong> • Shift: {user?.receptionDetails?.shiftTiming || 'Morning'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('walkin')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Walk-in Patient</span>
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
            <span className="text-xs text-slate-400 font-semibold">Total Today</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{receptionStats.totalToday || appointments.length}</div>
          <p className="text-[11px] text-purple-400">Scheduled OPD Visits</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Checked-In</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {appointments.filter((a) => a.isCheckedIn).length}
          </div>
          <p className="text-[11px] text-emerald-400">Tokens Active in Waiting Hall</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Doctors On Duty</span>
            <Stethoscope className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {doctorBoard.filter((d) => d.isOnDuty).length}
          </div>
          <p className="text-[11px] text-blue-400">Active Consultation Rooms</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Completed Consults</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {appointments.filter((a) => a.status === 'completed').length}
          </div>
          <p className="text-[11px] text-slate-400">Discharged Today</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('desk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'desk'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>OPD Check-in Desk ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('walkin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'walkin'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Walk-In Registration</span>
        </button>

        <button
          onClick={() => setActiveTab('doctor-board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'doctor-board'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Live Board ({doctorBoard.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('search-patients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'search-patients'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Patient Records</span>
        </button>
      </div>

      {/* TAB 1: OPD CHECK-IN DESK */}
      {activeTab === 'desk' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Today's Patient Triage & Check-In Desk</span>
            </h3>
            <span className="text-xs text-slate-400">Click to confirm patient arrival</span>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-purple-950/60 text-purple-400 px-2.5 py-0.5 rounded-md border border-purple-800/40">
                      {apt.tokenNumber}
                    </span>
                    <h4 className="text-base font-bold text-white">{apt.patientName}</h4>
                    {apt.isCheckedIn ? (
                      <Badge variant="success">Checked-In</Badge>
                    ) : (
                      <Badge variant="warning">Awaiting Arrival</Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Physician: <strong className="text-slate-200">{apt.doctorName}</strong> ({apt.roomNumber}) • Time: {apt.timeSlot} • Phone: {apt.patientPhone || 'N/A'}
                  </p>

                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-400">Reason:</strong> {apt.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!apt.isCheckedIn && (
                    <button
                      onClick={() => handleCheckIn(apt._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check In Patient</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedSlip(apt)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print OPD Slip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WALK-IN REGISTRATION */}
      {activeTab === 'walkin' && (
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur max-w-3xl mx-auto shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Walk-in Patient OPD Registration</h3>
              <p className="text-xs text-slate-400">Instantly generate OPD token & assign on-duty doctor</p>
            </div>
          </div>

          <form onSubmit={handleWalkInBooking} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={walkInData.patientName}
                  onChange={(e) => setWalkInData({ ...walkInData, patientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={walkInData.patientPhone}
                  onChange={(e) => setWalkInData({ ...walkInData, patientPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Doctor & OPD Room
              </label>
              <select
                value={walkInData.doctorId}
                onChange={(e) => setWalkInData({ ...walkInData, doctorId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {doctorBoard.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization}) — Room: {doc.roomNumber} {doc.isOnDuty ? '• On Duty' : '• Off Duty'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={walkInData.appointmentDate}
                  onChange={(e) => setWalkInData({ ...walkInData, appointmentDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Time Slot
                </label>
                <select
                  value={walkInData.timeSlot}
                  onChange={(e) => setWalkInData({ ...walkInData, timeSlot: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM (Immediate)</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Triage Notes / Symptoms
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acute abdominal pain, fever review"
                value={walkInData.reason}
                onChange={(e) => setWalkInData({ ...walkInData, reason: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient & Print OPD Token</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: DOCTOR AVAILABILITY LIVE BOARD */}
      {activeTab === 'doctor-board' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-purple-400" />
              <span>Live Physician Room & Duty Board</span>
            </h3>
            <span className="text-xs text-slate-400">Updates dynamically</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorBoard.map((doc) => (
              <div
                key={doc._id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                    {doc.roomNumber}
                  </span>
                  <Badge variant={doc.isOnDuty ? 'success' : 'danger'}>
                    {doc.isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{doc.name}</h4>
                  <p className="text-xs text-purple-400 font-medium">{doc.specialization}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Queue</span>
                    <span className="text-slate-200 font-bold">{doc.activeQueueCount || 0} Patients</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Consult Fee</span>
                    <span className="text-emerald-400 font-bold">${doc.consultationFee || 500}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SEARCH PATIENT RECORDS */}
      {activeTab === 'search-patients' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-6">
          <form onSubmit={handleSearchPatients} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered patients by name, email, or phone..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
            >
              Search
            </button>
          </form>

          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((p) => (
                <div
                  key={p._id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-slate-400">{p.email} • {p.phone || 'No phone'} • Blood: {p.patientDetails?.bloodGroup || 'O+'}</p>
                  </div>
                  <Badge variant="patient">Registered</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Type patient name or phone to retrieve registered record.
            </div>
          )}
        </div>
      )}

      {/* PRINT OPD SLIP MODAL */}
      {selectedSlip && (
        <Modal
          isOpen={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          title="MedQ Hospital OPD Registration Slip"
          subtitle={`Token: ${selectedSlip.tokenNumber} • Date: ${new Date(selectedSlip.appointmentDate).toDateString()}`}
        >
          <div className="space-y-5 text-xs text-slate-200">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white">MedQ Central Hospital</span>
                <span className="text-purple-400 font-mono font-bold">OPD PASS</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient Name</span>
                  <span className="font-bold text-white text-sm">{selectedSlip.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Token No.</span>
                  <span className="font-mono text-purple-400 font-black text-sm">{selectedSlip.tokenNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Doctor</span>
                  <span className="font-semibold text-white">{selectedSlip.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultation Room</span>
                  <span className="font-semibold text-emerald-400">{selectedSlip.roomNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                Print Slip
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReceptionDashboard;
