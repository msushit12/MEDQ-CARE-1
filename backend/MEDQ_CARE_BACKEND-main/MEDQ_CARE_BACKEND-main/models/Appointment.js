const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
      default: '',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      default: 'General Physician',
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-consultation', 'completed', 'cancelled'],
      default: 'pending',
    },
    reason: {
      type: String,
      required: true,
    },
    symptoms: [{ type: String }],
    tokenNumber: {
      type: String,
      default: '',
    },
    roomNumber: {
      type: String,
      default: 'OPD-101',
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      enum: ['patient', 'reception', 'admin', 'doctor'],
      default: 'patient',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
