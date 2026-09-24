const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');
const { store } = require('../models/dataStore');
const mongoose = require('mongoose');

// @desc    Get patient appointments
// @route   GET /api/patient/appointments
// @access  Private (Patient only)
const getAppointments = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    let appointments = [];

    if (mongoose.connection.readyState === 1) {
      appointments = await Appointment.find({ patientId }).sort({ appointmentDate: -1 });
    } else {
      appointments = store.appointments
        .filter((a) => a.patientId.toString() === patientId.toString())
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
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

// @desc    Book a new appointment
// @route   POST /api/patient/appointments/book
// @access  Private (Patient only)
const bookAppointment = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, appointmentDate, timeSlot, reason, symptoms } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, time slot, and reason are required.',
      });
    }

    // Find Doctor details
    let doctor = null;
    if (mongoose.connection.readyState === 1) {
      doctor = await User.findById(doctorId);
    } else {
      doctor = store.users.find((u) => u._id.toString() === doctorId.toString() && u.role === 'doctor');
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Selected doctor not found or is currently inactive.',
      });
    }

    const tokenPrefix = doctor.doctorDetails?.specialization?.slice(0, 3).toUpperCase() || 'OPD';
    const randomTokenNum = Math.floor(10 + Math.random() * 90);
    const tokenNumber = `${tokenPrefix}-${randomTokenNum}`;

    let newAppointment;
    if (mongoose.connection.readyState === 1) {
      newAppointment = await Appointment.create({
        patientId,
        patientName: req.user.name,
        patientPhone: req.user.phone || '',
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
        isPaid: true,
        createdBy: 'patient',
      });
    } else {
      newAppointment = {
        _id: `apt_${Date.now()}`,
        patientId: patientId.toString(),
        patientName: req.user.name,
        patientPhone: req.user.phone || '',
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
        isPaid: true,
        isCheckedIn: false,
        createdBy: 'patient',
        createdAt: new Date(),
      };
      store.appointments.unshift(newAppointment);
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'BOOK_APPOINTMENT',
      user: req.user.name,
      role: req.user.role,
      details: `Appointment booked with ${doctor.name} for ${new Date(appointmentDate).toDateString()} at ${timeSlot}.`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Appointment booked successfully! Token: ${tokenNumber}`,
      appointment: newAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel patient appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private (Patient only)
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      const appointment = await Appointment.findOne({ _id: id, patientId });
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found or not owned by user.' });
      }
      appointment.status = 'cancelled';
      await appointment.save();
      return res.status(200).json({ success: true, message: 'Appointment cancelled.', appointment });
    } else {
      const apt = store.appointments.find((a) => a._id.toString() === id.toString() && a.patientId.toString() === patientId.toString());
      if (!apt) {
        return res.status(404).json({ success: false, message: 'Appointment not found.' });
      }
      apt.status = 'cancelled';
      return res.status(200).json({ success: true, message: 'Appointment cancelled successfully.', appointment: apt });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private (Patient only)
const getPrescriptions = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    let prescriptions = [];

    if (mongoose.connection.readyState === 1) {
      prescriptions = await Prescription.find({ patientId }).sort({ date: -1 });
    } else {
      prescriptions = store.prescriptions.filter((p) => p.patientId.toString() === patientId.toString());
    }

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient medical reports
// @route   GET /api/patient/reports
// @access  Private (Patient only)
const getReports = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    let reports = [];

    if (mongoose.connection.readyState === 1) {
      reports = await MedicalReport.find({ patientId }).sort({ reportDate: -1 });
    } else {
      reports = store.reports.filter((r) => r.patientId.toString() === patientId.toString());
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new medical report
// @route   POST /api/patient/reports
// @access  Private (Patient only)
const uploadReport = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { title, category, fileUrl, fileName, fileSize, labName, summary, metrics } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Report title is required.' });
    }

    let newReport;
    if (mongoose.connection.readyState === 1) {
      newReport = await MedicalReport.create({
        patientId,
        patientName: req.user.name,
        title,
        category: category || 'General Lab',
        fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileSize: fileSize || '1.1 MB',
        labName: labName || 'MedQ Central Diagnostics Lab',
        summary: summary || 'Patient uploaded lab documentation.',
        metrics: metrics || [],
        status: 'Verified',
      });
    } else {
      newReport = {
        _id: `rep_${Date.now()}`,
        patientId: patientId.toString(),
        patientName: req.user.name,
        title,
        category: category || 'General Lab',
        reportDate: new Date(),
        fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileSize: fileSize || '1.1 MB',
        labName: labName || 'MedQ Central Diagnostics Lab',
        summary: summary || 'Patient uploaded lab documentation.',
        metrics: metrics || [],
        status: 'Verified',
        createdAt: new Date(),
      };
      store.reports.unshift(newReport);
    }

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded and securely cataloged in your health record.',
      report: newReport,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile & health vitals
// @route   PUT /api/patient/profile
// @access  Private (Patient only)
const updateProfile = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { name, phone, gender, dateOfBirth, address, patientDetails } = req.body;

    let updatedUser;
    if (mongoose.connection.readyState === 1) {
      updatedUser = await User.findByIdAndUpdate(
        patientId,
        {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(gender && { gender }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(address && { address }),
          ...(patientDetails && { patientDetails }),
        },
        { new: true }
      ).select('-password');
    } else {
      const user = store.users.find((u) => u._id.toString() === patientId.toString());
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (gender) user.gender = gender;
      if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
      if (address) user.address = address;
      if (patientDetails) user.patientDetails = { ...user.patientDetails, ...patientDetails };
      const { password, ...userWithoutPass } = user;
      updatedUser = userWithoutPass;
    }

    res.status(200).json({
      success: true,
      message: 'Health profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  bookAppointment,
  cancelAppointment,
  getPrescriptions,
  getReports,
  uploadReport,
  updateProfile,
};
