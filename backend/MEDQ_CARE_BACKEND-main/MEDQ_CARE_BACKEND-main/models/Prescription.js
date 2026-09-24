const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "500mg"
  frequency: { type: String, required: true }, // e.g. "1-0-1 (After Food)"
  duration: { type: String, required: true }, // e.g. "5 Days"
  instructions: { type: String, default: 'Take with warm water' },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
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
    doctorSpecialization: {
      type: String,
      default: 'General Physician',
    },
    doctorLicense: {
      type: String,
      default: 'MCI-89234',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medicines: [medicineSchema],
    testsRecommended: [{ type: String }],
    advice: {
      type: String,
      default: 'Take plenty of fluids and rest.',
    },
    followUpDate: {
      type: Date,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
