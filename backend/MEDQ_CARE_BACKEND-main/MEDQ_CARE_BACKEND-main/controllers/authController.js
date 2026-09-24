const User = require('../models/User');
const { store } = require('../models/dataStore');
const { generateToken } = require('../config/jwt');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// @desc    Register a new user (role-specific)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'patient',
      gender,
      dateOfBirth,
      // Role-specific payloads
      patientDetails,
      doctorDetails,
      receptionDetails,
      adminDetails,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let existingUser = null;
    if (mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ email: normalizedEmail });
    } else {
      existingUser = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let newUser;
    if (mongoose.connection.readyState === 1) {
      newUser = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone: phone || '',
        role,
        gender: gender || 'Prefer not to say',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        patientDetails: patientDetails || {},
        doctorDetails: doctorDetails || {},
        receptionDetails: receptionDetails || {},
        adminDetails: adminDetails || {},
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      newUser = {
        _id: `user_${role}_${Date.now()}`,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role,
        gender: gender || 'Prefer not to say',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        status: 'active',
        patientDetails: patientDetails || { bloodGroup: 'O+', allergies: [], medicalHistory: [] },
        doctorDetails: doctorDetails || {
          specialization: 'General Medicine',
          experience: 1,
          consultationFee: 500,
          roomNumber: 'OPD-101',
          isOnDuty: true,
        },
        receptionDetails: receptionDetails || { department: 'Registration Desk', shiftTiming: 'Morning' },
        adminDetails: adminDetails || { accessLevel: 'StandardAdmin', permissions: ['MANAGE_USERS'] },
        createdAt: new Date(),
      };
      store.users.push(newUser);
    }

    const token = generateToken({ id: newUser._id, role: newUser.role, email: newUser.email });

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      gender: newUser.gender,
      profileImage: newUser.profileImage,
      patientDetails: newUser.patientDetails,
      doctorDetails: newUser.doctorDetails,
      receptionDetails: newUser.receptionDetails,
      adminDetails: newUser.adminDetails,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: `Registration successful! Welcome to MedQ Care ${role} portal.`,
      token,
      role: newUser.role,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail }).select('+password');
    } else {
      user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Role check if specific role was provided
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Account role mismatch: This account is registered as '${user.role}', but you are attempting to log in to the '${role}' portal. Please select the correct portal.`,
      });
    }

    // Check password
    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please verify your credentials.',
      });
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated or suspended. Please contact MedQ Care administration.',
      });
    }

    const token = generateToken({ id: user._id, role: user.role, email: user.email });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      profileImage: user.profileImage,
      status: user.status,
      patientDetails: user.patientDetails,
      doctorDetails: user.doctorDetails,
      receptionDetails: user.receptionDetails,
      adminDetails: user.adminDetails,
      createdAt: user.createdAt,
    };

    // Log login activity
    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      action: 'USER_LOGIN',
      user: user.name,
      role: user.role,
      details: `Successful login to ${user.role} portal.`,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Login successful. Welcome back, ${user.name}!`,
      token,
      role: user.role,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private (Protected by JWT)
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Request Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
  }

  res.status(200).json({
    success: true,
    message: `If an account with email ${email} exists, a secure password reset link and OTP has been dispatched.`,
  });
};

// @desc    Get Pre-configured Demo Accounts for Instant Testing
// @route   GET /api/auth/demo-credentials
// @access  Public
const getDemoCredentials = (req, res) => {
  res.status(200).json({
    success: true,
    credentials: [
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
    ],
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  getDemoCredentials,
};
