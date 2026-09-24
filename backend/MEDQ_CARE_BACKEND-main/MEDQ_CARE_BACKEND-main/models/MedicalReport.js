const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
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
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    doctorName: {
      type: String,
      default: 'Diagnostic Lab Specialist',
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Blood Test', 'Radiology / X-Ray', 'MRI / CT Scan', 'Pathology', 'Cardiology / ECG', 'General Lab'],
      default: 'General Lab',
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: 'medical_report.pdf',
    },
    fileSize: {
      type: String,
      default: '1.2 MB',
    },
    labName: {
      type: String,
      default: 'MedQ Central Diagnostics Lab',
    },
    summary: {
      type: String,
      default: 'Normal findings across evaluated biomarkers.',
    },
    metrics: [
      {
        parameter: { type: String },
        value: { type: String },
        unit: { type: String },
        referenceRange: { type: String },
        status: { type: String, enum: ['Normal', 'High', 'Low', 'Borderline'], default: 'Normal' },
      },
    ],
    status: {
      type: String,
      enum: ['Verified', 'Pending Review', 'Critical Attention'],
      default: 'Verified',
    },
  },
  {
    timestamps: true,
  }
);

const MedicalReport = mongoose.models.MedicalReport || mongoose.model('MedicalReport', medicalReportSchema);

module.exports = MedicalReport;
