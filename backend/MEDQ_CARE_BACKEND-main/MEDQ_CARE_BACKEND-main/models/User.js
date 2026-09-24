const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'reception', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      required: [true, 'Role is required'],
      default: 'patient',
    },
    profileImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    // Common fields
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      default: '',
    },
    // Role-specific embedded details
    patientDetails: {
      bloodGroup: { type: String, default: 'O+' },
      allergies: [{ type: String }],
      medicalHistory: [{ type: String }],
      emergencyContact: {
        name: { type: String, default: '' },
        relation: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
    },
    doctorDetails: {
      specialization: { type: String, default: 'General Medicine' },
      licenseNumber: { type: String, default: '' },
      experience: { type: Number, default: 5 },
      qualification: { type: String, default: 'MBBS, MD' },
      consultationFee: { type: Number, default: 500 },
      rating: { type: Number, default: 4.8 },
      roomNumber: { type: String, default: 'OPD-101' },
      isOnDuty: { type: Boolean, default: true },
      availability: [
        {
          day: { type: String },
          slots: [{ type: String }],
        },
      ],
    },
    receptionDetails: {
      department: { type: String, default: 'Main Desk / OPD' },
      shiftTiming: { type: String, default: 'Morning (08:00 AM - 04:00 PM)' },
      employeeId: { type: String, default: 'REC-001' },
    },
    adminDetails: {
      accessLevel: { type: String, default: 'SuperAdmin' },
      department: { type: String, default: 'Hospital Administration' },
      permissions: [{ type: String }],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
