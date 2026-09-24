import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Pill,
  FileText,
  Calendar,
  DollarSign,
  Search,
  Activity,
  Printer,
  Trash2,
  Power,
  Sparkles,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

const DoctorDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('queue'); // queue, prescribe, history, availability
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  // Doctor Data
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayQueue: 0,
    completedToday: 0,
    inConsultation: 0,
    pendingToday: 0,
    totalEarnings: 0,
  });

  // Prescription Pad Modal & Form State
  const [prescribeModal, setPrescribeModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: 'Acute Bronchitis & Pharyngitis',
    advice: 'Drink warm water with ginger & honey. Avoid cold exposures. Rest for 3 days.',
    followUpDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    testsRecommended: 'Complete Blood Count (CBC), Chest X-Ray (PA View)',
    medicines: [
      {
        name: 'Amoxicillin + Clavulanic Acid 625mg',
        dosage: '1 Tablet',
        frequency: '1-0-1 (After Food)',
        duration: '5 Days',
        instructions: 'Take after meals with water',
      },
      {
        name: 'Paracetamol 650mg (Dolo)',
        dosage: '1 Tablet',
        frequency: 'SOS (When Fever > 100°F)',
        duration: '3 Days',
        instructions: 'Take when fever or severe headache occurs',
      },
    ],
  });

  // Patient History Lookup State
  const [searchPatientId, setSearchPatientId] = useState('user_patient_1');
  const [patientHistoryData, setPatientHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Availability & Settings State
  const [isOnDuty, setIsOnDuty] = useState(user?.doctorDetails?.isOnDuty !== false);
  const [consultationFee, setConsultationFee] = useState(user?.doctorDetails?.consultationFee || 750);
  const [roomNumber, setRoomNumber] = useState(user?.doctorDetails?.roomNumber || 'OPD-304');

  // Load Doctor Data
  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [aptRes, statsRes] = await Promise.allSettled([
        api.get('/doctor/appointments'),
        api.get('/doctor/stats'),
      ]);

      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data?.appointments || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.stats || {});
    } catch (err) {
      console.error('Error fetching doctor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  // Update Status
  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/doctor/appointments/${appointmentId}/status`, { status });
      setAlertInfo({ type: 'success', message: `Consultation status changed to '${status}'.` });
      fetchDoctorData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to update appointment status.' });
    }
  };

  // Open Prescription Pad for an appointment
  const openPrescribePad = (apt) => {
    setSelectedAppointment(apt);
    setPrescribeModal(true);
  };

  // Add Medicine Row
  const handleAddMedicineRow = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: [
        ...prescriptionForm.medicines,
        {
          name: '',
          dosage: '1 Tablet',
          frequency: '1-0-1',
          duration: '5 Days',
          instructions: 'Take after meals',
        },
      ],
    });
  };

  // Remove Medicine Row
  const handleRemoveMedicineRow = (index) => {
    const updated = [...prescriptionForm.medicines];
    updated.splice(index, 1);
    setPrescriptionForm({ ...prescriptionForm, medicines: updated });
  };

  // Handle Medicine Field Change
  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptionForm.medicines];
    updated[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medicines: updated });
  };

  // Submit Digital Prescription
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const payload = {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        diagnosis: prescriptionForm.diagnosis,
        medicines: prescriptionForm.medicines,
        advice: prescriptionForm.advice,
        followUpDate: prescriptionForm.followUpDate,
        testsRecommended: prescriptionForm.testsRecommended
          ? prescriptionForm.testsRecommended.split(',').map((s) => s.trim())
          : [],
      };

      await api.post('/doctor/prescriptions', payload);
      setPrescribeModal(false);
      setAlertInfo({
        type: 'success',
        message: `Prescription successfully generated for ${selectedAppointment.patientName}!`,
      });
      fetchDoctorData();
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to submit prescription' });
    }
  };

  // Search Patient History
  const handleSearchPatientHistory = async () => {
    if (!searchPatientId) return;
    setHistoryLoading(true);
    try {
      const res = await api.get(`/doctor/patient-history/${searchPatientId}`);
      setPatientHistoryData(res.data);
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Could not locate health history for this patient ID.' });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Update Availability Settings
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      await api.put('/doctor/availability', {
        isOnDuty,
        consultationFee: Number(consultationFee),
        roomNumber,
      });
      setAlertInfo({ type: 'success', message: 'Doctor clinical schedule & duty status saved.' });
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to update availability settings.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 backdrop-blur shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-inner">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name || 'Dr. Physician'}
              </h1>
              <Badge variant="doctor">{user?.doctorDetails?.specialization || 'Cardiologist'}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              License: <code className="text-emerald-400 font-mono">{user?.doctorDetails?.licenseNumber || 'MD-MED-84920'}</code> • Room: <strong className="text-white">{roomNumber}</strong> • Status: {isOnDuty ? <span className="text-emerald-400 font-bold">ON DUTY</span> : <span className="text-rose-400 font-bold">OFF DUTY</span>}
            </p>
          </div>
        </div>

        {/* Duty Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isOnDuty
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnDuty ? 'On Duty (Active OPD)' : 'Off Duty'}</span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Today's OPD Queue</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.todayQueue || appointments.length}</div>
          <p className="text-[11px] text-emerald-400">Checked-in Patients</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">In Consultation</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {appointments.filter((a) => a.status === 'in-consultation').length}
          </div>
          <p className="text-[11px] text-amber-400">Currently in Room</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {appointments.filter((a) => a.status === 'completed').length}
          </div>
          <p className="text-[11px] text-blue-400">Prescriptions Generated</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Consultation Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${stats.totalEarnings || appointments.length * consultationFee}
          </div>
          <p className="text-[11px] text-slate-400">Direct OPD Settlement</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'queue'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Live OPD Queue ({appointments.length})</span>
        </button>

        <button
          onClick={() => {
            if (appointments.length > 0) setSelectedAppointment(appointments[0]);
            setActiveTab('prescribe');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'prescribe'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>e-Prescription Pad</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            handleSearchPatientHistory();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Patient Medical Records</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'availability'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Schedule & Fees Manager</span>
        </button>
      </div>

      {/* TAB 1: LIVE OPD QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Assigned OPD Patient List</span>
            </h3>
            <span className="text-xs text-slate-400">Real-time status updates</span>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No appointments scheduled for your OPD room today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-800/40">
                        {apt.tokenNumber}
                      </span>
                      <h4 className="text-base font-bold text-white">{apt.patientName}</h4>
                      <Badge
                        variant={
                          apt.status === 'in-consultation'
                            ? 'warning'
                            : apt.status === 'completed'
                            ? 'success'
                            : 'doctor'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400">
                      Time Slot: <strong className="text-slate-200">{apt.timeSlot}</strong> • Date: {new Date(apt.appointmentDate).toDateString()} • Phone: {apt.patientPhone || 'N/A'}
                    </p>

                    <p className="text-xs text-slate-300">
                      <strong className="text-slate-400">Chief Complaint:</strong> {apt.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {apt.status !== 'completed' && apt.status !== 'in-consultation' && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'in-consultation')}
                        className="px-3 py-1.5 rounded-xl bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white text-xs font-bold border border-amber-500/30 transition-all"
                      >
                        Call Patient In
                      </button>
                    )}

                    <button
                      onClick={() => openPrescribePad(apt)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Prescribe Treatment</span>
                    </button>

                    {apt.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'completed')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold border border-blue-500/30 transition-all"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL PRESCRIPTION PAD */}
      {activeTab === 'prescribe' && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur max-w-4xl mx-auto shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Digital Prescription Pad</h3>
                <p className="text-xs text-slate-400">Issue validated dosages, instructions & diagnostic tests</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitPrescription} className="space-y-5">
            {/* Patient Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Patient Appointment
              </label>
              <select
                value={selectedAppointment?._id || ''}
                onChange={(e) => {
                  const apt = appointments.find((a) => a._id === e.target.value);
                  setSelectedAppointment(apt || appointments[0]);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {appointments.map((apt) => (
                  <option key={apt._id} value={apt._id}>
                    {apt.patientName} — Token: {apt.tokenNumber} ({apt.reason})
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Diagnosis
              </label>
              <input
                type="text"
                required
                value={prescriptionForm.diagnosis}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                placeholder="e.g. Acute Pharyngitis, Type 2 Diabetes Review"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Multi-Medicine Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Prescribed Medicines & Dosages
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication Row</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {prescriptionForm.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        required
                        placeholder="Medicine Name (e.g. Amoxicillin 625mg)"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Dosage (1 Tab)"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Timing (1-0-1)"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Duration & Instructions"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      {prescriptionForm.medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tests & Advice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lab Tests Advised
                </label>
                <input
                  type="text"
                  value={prescriptionForm.testsRecommended}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, testsRecommended: e.target.value })}
                  placeholder="e.g. CBC, Lipid Profile, Chest X-Ray"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={prescriptionForm.followUpDate}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Advice & Dietary Instructions
              </label>
              <textarea
                rows={2}
                value={prescriptionForm.advice}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, advice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Issue Official e-Prescription & Complete Consultation</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PATIENT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Longitudinal Patient Health Records</span>
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchPatientId}
                onChange={(e) => setSearchPatientId(e.target.value)}
                placeholder="Enter Patient ID (e.g. user_patient_1)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                onClick={handleSearchPatientHistory}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Search
              </button>
            </div>
          </div>

          {patientHistoryData && patientHistoryData.patient ? (
            <div className="space-y-6">
              {/* Patient Vitals Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block">Patient Name</span>
                  <span className="text-sm font-bold text-white">{patientHistoryData.patient.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Blood Group</span>
                  <span className="text-sm font-bold text-rose-400">
                    {patientHistoryData.patient.patientDetails?.bloodGroup || 'O+'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Allergies</span>
                  <span className="text-xs font-medium text-amber-300">
                    {(patientHistoryData.patient.patientDetails?.allergies || []).join(', ') || 'None Reported'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Chronic Conditions</span>
                  <span className="text-xs font-medium text-slate-300">
                    {(patientHistoryData.patient.patientDetails?.medicalHistory || []).join(', ') || 'None Reported'}
                  </span>
                </div>
              </div>

              {/* History Tabs / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Past Consultations */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Past Consultations
                  </h4>
                  <div className="divide-y divide-slate-850 space-y-2">
                    {patientHistoryData.history?.appointments?.map((apt) => (
                      <div key={apt._id} className="pt-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{apt.reason}</span>
                          <Badge variant="default">{new Date(apt.appointmentDate).toDateString()}</Badge>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Doctor: {apt.doctorName}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lab Reports */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Recent Diagnostic Lab Reports
                  </h4>
                  <div className="divide-y divide-slate-850 space-y-2">
                    {patientHistoryData.history?.reports?.map((rep) => (
                      <div key={rep._id} className="pt-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{rep.title}</span>
                          <span className="text-purple-400 font-mono text-[10px]">{rep.category}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{rep.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Enter patient identifier to view medical history timeline.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AVAILABILITY & FEES */}
      {activeTab === 'availability' && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur max-w-2xl mx-auto shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">OPD Availability & Consultation Settings</h3>
              <p className="text-xs text-slate-400">Configure your hospital room and fee rates</p>
            </div>
          </div>

          <form onSubmit={handleSaveAvailability} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Live OPD Duty Status</h4>
                <p className="text-xs text-slate-400">Enables reception desk to assign incoming walk-in patients</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOnDuty(!isOnDuty)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isOnDuty ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Consultation Fee ($ / ₹)
                </label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned OPD Room
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
            >
              Save Schedule Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
