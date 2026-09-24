const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const { store } = require('../models/dataStore');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// @desc    Get all users (with role filter and search)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, query } = req.query;
    let users = [];

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (role) filter.role = role;
      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
        ];
      }
      users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    } else {
      users = store.users.map((u) => {
        const { password, ...userWithoutPass } = u;
        return userWithoutPass;
      });

      if (role) {
        users = users.filter((u) => u.role === role);
      }
      if (query) {
        const q = query.toLowerCase();
        users = users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phone && u.phone.includes(q))
        );
      }
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (active, inactive, suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['active', 'inactive', 'suspended'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    let updatedUser;
    if (mongoose.connection.readyState === 1) {
      updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    } else {
      const user = store.users.find((u) => u._id.toString() === id.toString());
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      user.status = status;
      const { password, ...userWithoutPass } = user;
      updatedUser = userWithoutPass;
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'USER_STATUS_CHANGE',
      user: req.user.name,
      role: req.user.role,
      details: `User status for ID ${id} set to '${status}'.`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `User status successfully updated to '${status}'.`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own active account.' });
    }

    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndDelete(id);
    } else {
      const idx = store.users.findIndex((u) => u._id.toString() === id.toString());
      if (idx === -1) return res.status(404).json({ success: false, message: 'User not found.' });
      store.users.splice(idx, 1);
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'USER_DELETED',
      user: req.user.name,
      role: req.user.role,
      details: `User ID ${id} was permanently removed by administrator.`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'User account removed from MedQ Care platform.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin onboarding a new doctor
// @route   POST /api/admin/doctor/create
// @access  Private (Admin only)
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      specialization,
      licenseNumber,
      experience,
      qualification,
      consultationFee,
      roomNumber,
      availability,
    } = req.body;

    if (!name || !email || !password || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, temporary password, and medical license number are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let existing = null;

    if (mongoose.connection.readyState === 1) {
      existing = await User.findOne({ email: normalizedEmail });
    } else {
      existing = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    }

    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    let newDoctor;
    if (mongoose.connection.readyState === 1) {
      newDoctor = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone: phone || '',
        role: 'doctor',
        gender: gender || 'Male',
        doctorDetails: {
          specialization: specialization || 'General Medicine',
          licenseNumber,
          experience: experience || 5,
          qualification: qualification || 'MBBS, MD',
          consultationFee: consultationFee || 500,
          roomNumber: roomNumber || 'OPD-105',
          isOnDuty: true,
          availability: availability || [
            { day: 'Monday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
            { day: 'Wednesday', slots: ['10:00 AM', '12:00 PM', '03:00 PM'] },
            { day: 'Friday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
          ],
        },
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      newDoctor = {
        _id: `user_doctor_${Date.now()}`,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: 'doctor',
        gender: gender || 'Male',
        status: 'active',
        doctorDetails: {
          specialization: specialization || 'General Medicine',
          licenseNumber,
          experience: experience || 5,
          qualification: qualification || 'MBBS, MD',
          consultationFee: consultationFee || 500,
          rating: 5.0,
          roomNumber: roomNumber || 'OPD-105',
          isOnDuty: true,
          availability: availability || [
            { day: 'Monday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
            { day: 'Wednesday', slots: ['10:00 AM', '12:00 PM', '03:00 PM'] },
            { day: 'Friday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
          ],
        },
        createdAt: new Date(),
      };
      store.users.push(newDoctor);
    }

    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'DOCTOR_ONBOARDED',
      user: req.user.name,
      role: req.user.role,
      details: `New physician onboarded: ${name} (${specialization || 'General Medicine'}, License: ${licenseNumber}).`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    const { password: _, ...doctorResponse } = newDoctor;

    res.status(201).json({
      success: true,
      message: `Physician ${name} onboarded successfully to MedQ Care hospital network.`,
      doctor: doctorResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform comprehensive analytics & KPIs
// @route   GET /api/admin/reports/analytics
// @access  Private (Admin only)
const getPlatformAnalytics = async (req, res, next) => {
  try {
    const totalUsers = store.users.length;
    const patientCount = store.users.filter((u) => u.role === 'patient').length;
    const doctorCount = store.users.filter((u) => u.role === 'doctor').length;
    const receptionCount = store.users.filter((u) => u.role === 'reception').length;
    const adminCount = store.users.filter((u) => u.role === 'admin').length;

    const totalAppointments = store.appointments.length;
    const completedAppointments = store.appointments.filter((a) => a.status === 'completed').length;
    const totalRevenue = store.appointments
      .filter((a) => a.isPaid)
      .reduce((acc, a) => acc + (a.consultationFee || 500), 0);

    const totalPrescriptions = store.prescriptions.length;
    const totalReports = store.reports.length;

    // Monthly appointment trend (mock aggregated)
    const appointmentTrends = [
      { month: 'Jan', count: 42, revenue: 25200 },
      { month: 'Feb', count: 58, revenue: 34800 },
      { month: 'Mar', count: 74, revenue: 44400 },
      { month: 'Apr', count: 91, revenue: 54600 },
      { month: 'May', count: 110, revenue: 66000 },
      { month: 'Jun', count: 128, revenue: 76800 },
      { month: 'Jul', count: 145, revenue: 87000 },
      { month: 'Aug', count: 162, revenue: 97200 },
    ];

    // Department workload distribution
    const departmentDistribution = [
      { name: 'Cardiology', consultations: 142, percentage: 35 },
      { name: 'General Medicine', consultations: 118, percentage: 29 },
      { name: 'Pediatrics', consultations: 68, percentage: 17 },
      { name: 'Orthopedics', consultations: 48, percentage: 12 },
      { name: 'Neurology', consultations: 28, percentage: 7 },
    ];

    res.status(200).json({
      success: true,
      analytics: {
        summary: {
          totalUsers,
          patientCount,
          doctorCount,
          receptionCount,
          adminCount,
          totalAppointments,
          completedAppointments,
          totalRevenue,
          totalPrescriptions,
          totalReports,
          systemUptime: '99.98%',
          securityScore: 'A+ (HIPAA & FHIR Ready)',
        },
        appointmentTrends,
        departmentDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit trail logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: store.auditLogs.length,
      logs: store.auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  createDoctor,
  getPlatformAnalytics,
  getAuditLogs,
};
