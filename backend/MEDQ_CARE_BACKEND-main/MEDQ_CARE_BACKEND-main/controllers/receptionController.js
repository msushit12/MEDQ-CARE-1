const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { store } = require('../models/dataStore');
const mongoose = require('mongoose');

// @desc    Get all appointments (with optional filters)
// @route   GET /api/reception/appointments/all
// @access  Private (Reception & Admin)
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, date } = req.query;
    let appointments = [];

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status) query.status = status;
      if (doctorId) query.doctorId = doctorId;
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.appointmentDate = { $gte: start, $lte: end };
      }
      appointments = await Appointment.find(query).sort({ appointmentDate: -1 });
    } else {
      appointments = [...store.appointments];
      if (status) {
        appointments = appointments.filter((a) => a.status === status);
      }
      if (doctorId) {
        appointments = appointments.filter((a) => a.doctorId.toString() === doctorId.toString());
      }
      if (date) {
        const targetDateStr = new Date(date).toISOString().split('T')[0];
        appointments = appointments.filter((a) => new Date(a.appointmentDate).toISOString().split('T')[0] === targetDateStr);
      }
      appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
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

// @desc    Create appointment (Walk-in or phone booking)
// @route   POST /api/reception/appointments/create
// @access  Private (Reception & Admin)
const createAppointment = async (req, res, next) => {
  try {
    const {
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      symptoms,
      isPaid = true,
    } = req.body;

    if (!patientName || !doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, doctor, date, time slot, and reason are required.',
      });
    }

    // Find Doctor
    let doctor = null;
    if (mongoose.connection.readyState === 1) {
      doctor = await User.findById(doctorId);
    } else {
      doctor = store.users.find((u) => u._id.toString() === doctorId.toString() && u.role === 'doctor');
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Check or find existing patient
    let patient = null;
    if (patientEmail) {
      if (mongoose.connection.readyState === 1) {
        patient = await User.findOne({ email: patientEmail.toLowerCase().trim() });
      } else {
        patient = store.users.find((u) => u.email.toLowerCase() === patientEmail.toLowerCase().trim());
      }
    }

    const patientId = patient ? patient._id : `walkin_${Date.now()}`;
    const tokenPrefix = doctor.doctorDetails?.specialization?.slice(0, 3).toUpperCase() || 'OPD';
    const randomTokenNum = Math.floor(10 + Math.random() * 90);
    const tokenNumber = `${tokenPrefix}-${randomTokenNum}`;

    let newAppointment;
    if (mongoose.connection.readyState === 1) {
      newAppointment = await Appointment.create({
        patientId,
        patientName,
        patientPhone: patientPhone || '',
        doctorId: doctor._id,
        doctorName: doctor.name,
        specialization: doctor.doctorDetails?.specialization || 'General Physician',
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        status: 'confirmed',
        reason,
        symptoms: symptoms || [],
        tokenNumber,
        roomNumber: doctor.doctorDetails?.roomNumber || 'OPD-101',
        consultationFee: doctor.doctorDetails?.consultationFee || 500,
        isPaid,
        isCheckedIn: true,
        checkedInAt: new Date(),
        createdBy: 'reception',
      });
    } else {
      newAppointment = {
        _id: `apt_${Date.now()}`,
        patientId: patientId.toString(),
        patientName,
        patientPhone: patientPhone || '',
        doctorId: doctor._id.toString(),
        doctorName: doctor.name,
        specialization: doctor.doctorDetails?.specialization || 'General Physician',
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        status: 'confirmed',
        reason,
        symptoms: symptoms || [],
        tokenNumber,
        roomNumber: doctor.doctorDetails?.roomNumber || 'OPD-101',
        consultationFee: doctor.doctorDetails?.consultationFee || 500,
        isPaid,
        isCheckedIn: true,
        checkedInAt: new Date(),
        createdBy: 'reception',
        createdAt: new Date(),
      };
      store.appointments.unshift(newAppointment);
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'RECEPTION_BOOKING',
      user: req.user.name,
      role: req.user.role,
      details: `Walk-in appointment generated for ${patientName} with ${doctor.name} (Token: ${tokenNumber}).`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Walk-in appointment registered successfully! OPD Token: ${tokenNumber}`,
      appointment: newAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Patient check-in & token activation
// @route   PUT /api/reception/patient-checkin/:id
// @access  Private (Reception & Admin)
const patientCheckIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    let appointment = null;

    if (mongoose.connection.readyState === 1) {
      appointment = await Appointment.findById(id);
      if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

      appointment.isCheckedIn = true;
      appointment.checkedInAt = new Date();
      if (appointment.status === 'pending') appointment.status = 'confirmed';
      await appointment.save();
    } else {
      appointment = store.appointments.find((a) => a._id.toString() === id.toString());
      if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

      appointment.isCheckedIn = true;
      appointment.checkedInAt = new Date();
      if (appointment.status === 'pending') appointment.status = 'confirmed';
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'PATIENT_CHECKIN',
      user: req.user.name,
      role: req.user.role,
      details: `Patient ${appointment.patientName} checked in for ${appointment.doctorName}.`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Patient ${appointment.patientName} checked in. Token: ${appointment.tokenNumber}`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live doctor availability board
// @route   GET /api/reception/doctor-availability
// @access  Private (Reception, Admin, Patient)
const getDoctorAvailability = async (req, res, next) => {
  try {
    let doctors = [];

    if (mongoose.connection.readyState === 1) {
      doctors = await User.find({ role: 'doctor' }).select('-password');
    } else {
      doctors = store.users.filter((u) => u.role === 'doctor');
    }

    // Attach active queue count to each doctor
    const doctorBoard = doctors.map((doc) => {
      const activeQueueCount = store.appointments.filter(
        (a) =>
          a.doctorId.toString() === doc._id.toString() &&
          (a.status === 'confirmed' || a.status === 'in-consultation') &&
          a.isCheckedIn === true
      ).length;

      return {
        _id: doc._id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        specialization: doc.doctorDetails?.specialization || 'General Medicine',
        roomNumber: doc.doctorDetails?.roomNumber || 'OPD-101',
        isOnDuty: doc.doctorDetails?.isOnDuty !== false,
        consultationFee: doc.doctorDetails?.consultationFee || 500,
        rating: doc.doctorDetails?.rating || 4.8,
        activeQueueCount,
        availability: doc.doctorDetails?.availability || [],
      };
    });

    res.status(200).json({
      success: true,
      doctors: doctorBoard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search registered patients
// @route   GET /api/reception/search-patients
// @access  Private (Reception, Doctor, Admin)
const searchPatients = async (req, res, next) => {
  try {
    const { query } = req.query;
    let patients = [];

    if (mongoose.connection.readyState === 1) {
      const searchQuery = { role: 'patient' };
      if (query) {
        searchQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
        ];
      }
      patients = await User.find(searchQuery).select('-password');
    } else {
      patients = store.users.filter((u) => u.role === 'patient');
      if (query) {
        const q = query.toLowerCase();
        patients = patients.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phone && u.phone.includes(q))
        );
      }
    }

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily reception triage stats
// @route   GET /api/reception/stats
// @access  Private (Reception & Admin)
const getReceptionStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayApts = store.appointments.filter(
      (a) => new Date(a.appointmentDate).toISOString().split('T')[0] === todayStr
    );

    const stats = {
      totalToday: todayApts.length,
      checkedIn: todayApts.filter((a) => a.isCheckedIn).length,
      pendingCheckIn: todayApts.filter((a) => !a.isCheckedIn && a.status !== 'cancelled').length,
      inConsultation: todayApts.filter((a) => a.status === 'in-consultation').length,
      completedToday: todayApts.filter((a) => a.status === 'completed').length,
      cancelledToday: todayApts.filter((a) => a.status === 'cancelled').length,
      totalDoctorsOnDuty: store.users.filter((u) => u.role === 'doctor' && u.doctorDetails?.isOnDuty !== false).length,
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAppointments,
  createAppointment,
  patientCheckIn,
  getDoctorAvailability,
  searchPatients,
  getReceptionStats,
};
