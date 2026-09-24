const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');
const { store } = require('../models/dataStore');
const mongoose = require('mongoose');

// @desc    Get doctor's appointments queue
// @route   GET /api/doctor/appointments
// @access  Private (Doctor only)
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    let appointments = [];

    if (mongoose.connection.readyState === 1) {
      appointments = await Appointment.find({ doctorId }).sort({ appointmentDate: 1 });
    } else {
      appointments = store.appointments
        .filter((a) => a.doctorId.toString() === doctorId.toString())
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (confirmed, in-consultation, completed, cancelled)
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.user._id;

    const allowedStatuses = ['pending', 'confirmed', 'in-consultation', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    let updatedAppointment;
    if (mongoose.connection.readyState === 1) {
      const apt = await Appointment.findOne({ _id: id, doctorId });
      if (!apt) {
        return res.status(404).json({ success: false, message: 'Appointment not found for this doctor.' });
      }
      apt.status = status;
      if (notes) apt.notes = notes;
      await apt.save();
      updatedAppointment = apt;
    } else {
      const apt = store.appointments.find((a) => a._id.toString() === id.toString() && a.doctorId.toString() === doctorId.toString());
      if (!apt) {
        return res.status(404).json({ success: false, message: 'Appointment not found for this doctor.' });
      }
      apt.status = status;
      if (notes) apt.notes = notes;
      updatedAppointment = apt;
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'UPDATE_APPOINTMENT_STATUS',
      user: req.user.name,
      role: req.user.role,
      details: `Appointment ${id} status updated to '${status}'.`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Appointment status updated to '${status}'.`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create prescription for an appointment
// @route   POST /api/doctor/prescriptions
// @access  Private (Doctor only)
const createPrescription = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const {
      appointmentId,
      patientId,
      patientName,
      diagnosis,
      medicines,
      testsRecommended,
      advice,
      followUpDate,
    } = req.body;

    if (!appointmentId || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, diagnosis, and at least one medicine entry are required.',
      });
    }

    let newPrescription;
    if (mongoose.connection.readyState === 1) {
      newPrescription = await Prescription.create({
        appointmentId,
        patientId,
        patientName: patientName || 'Sarah Jenkins',
        doctorId,
        doctorName: req.user.name,
        doctorSpecialization: req.user.doctorDetails?.specialization || 'Consultant Specialist',
        doctorLicense: req.user.doctorDetails?.licenseNumber || 'MD-MED-84920',
        diagnosis,
        medicines,
        testsRecommended: testsRecommended || [],
        advice: advice || 'Follow prescribed routine and maintain hydration.',
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        date: new Date(),
      });

      // Mark appointment as completed
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    } else {
      newPrescription = {
        _id: `rx_${Date.now()}`,
        appointmentId,
        patientId: patientId || 'user_patient_1',
        patientName: patientName || 'Sarah Jenkins',
        doctorId: doctorId.toString(),
        doctorName: req.user.name,
        doctorSpecialization: req.user.doctorDetails?.specialization || 'Consultant Specialist',
        doctorLicense: req.user.doctorDetails?.licenseNumber || 'MD-MED-84920',
        diagnosis,
        medicines,
        testsRecommended: testsRecommended || [],
        advice: advice || 'Follow prescribed routine and maintain hydration.',
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        date: new Date(),
        createdAt: new Date(),
      };
      store.prescriptions.unshift(newPrescription);

      const apt = store.appointments.find((a) => a._id.toString() === appointmentId.toString());
      if (apt) apt.status = 'completed';
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'CREATE_PRESCRIPTION',
      user: req.user.name,
      role: req.user.role,
      details: `Prescription issued for patient ${patientName || 'Sarah Jenkins'} (Diagnosis: ${diagnosis}).`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Prescription generated successfully and linked to patient health record.',
      prescription: newPrescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient comprehensive medical history
// @route   GET /api/doctor/patient-history/:patientId
// @access  Private (Doctor only)
const getPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    let patient = null;
    let appointments = [];
    let prescriptions = [];
    let reports = [];

    if (mongoose.connection.readyState === 1) {
      patient = await User.findById(patientId).select('-password');
      appointments = await Appointment.find({ patientId }).sort({ appointmentDate: -1 });
      prescriptions = await Prescription.find({ patientId }).sort({ date: -1 });
      reports = await MedicalReport.find({ patientId }).sort({ reportDate: -1 });
    } else {
      patient = store.users.find((u) => u._id.toString() === patientId.toString() && u.role === 'patient');
      appointments = store.appointments.filter((a) => a.patientId.toString() === patientId.toString());
      prescriptions = store.prescriptions.filter((p) => p.patientId.toString() === patientId.toString());
      reports = store.reports.filter((r) => r.patientId.toString() === patientId.toString());
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.status(200).json({
      success: true,
      patient,
      history: {
        appointments,
        prescriptions,
        reports,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor availability & schedule
// @route   PUT /api/doctor/availability
// @access  Private (Doctor only)
const updateAvailability = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { availability, consultationFee, roomNumber, isOnDuty } = req.body;

    let updatedUser;
    if (mongoose.connection.readyState === 1) {
      const updateFields = {};
      if (availability) updateFields['doctorDetails.availability'] = availability;
      if (consultationFee) updateFields['doctorDetails.consultationFee'] = consultationFee;
      if (roomNumber) updateFields['doctorDetails.roomNumber'] = roomNumber;
      if (isOnDuty !== undefined) updateFields['doctorDetails.isOnDuty'] = isOnDuty;

      updatedUser = await User.findByIdAndUpdate(doctorId, { $set: updateFields }, { new: true }).select('-password');
    } else {
      const user = store.users.find((u) => u._id.toString() === doctorId.toString());
      if (!user) return res.status(404).json({ success: false, message: 'Doctor not found.' });

      if (availability) user.doctorDetails.availability = availability;
      if (consultationFee) user.doctorDetails.consultationFee = consultationFee;
      if (roomNumber) user.doctorDetails.roomNumber = roomNumber;
      if (isOnDuty !== undefined) user.doctorDetails.isOnDuty = isOnDuty;

      const { password, ...userWithoutPass } = user;
      updatedUser = userWithoutPass;
    }

    res.status(200).json({
      success: true,
      message: 'Doctor schedule and availability updated.',
      doctor: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor portal statistics
// @route   GET /api/doctor/stats
// @access  Private (Doctor only)
const getDoctorStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    let appointments = [];

    if (mongoose.connection.readyState === 1) {
      appointments = await Appointment.find({ doctorId });
    } else {
      appointments = store.appointments.filter((a) => a.doctorId.toString() === doctorId.toString());
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter((a) => new Date(a.appointmentDate).toISOString().split('T')[0] === todayStr);

    const stats = {
      totalAppointments: appointments.length,
      todayQueue: todayAppointments.length,
      completedToday: todayAppointments.filter((a) => a.status === 'completed').length,
      inConsultation: todayAppointments.filter((a) => a.status === 'in-consultation').length,
      pendingToday: todayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length,
      totalEarnings: appointments.filter((a) => a.status === 'completed').reduce((acc, a) => acc + (a.consultationFee || 500), 0),
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription,
  getPatientHistory,
  updateAvailability,
  getDoctorStats,
};
