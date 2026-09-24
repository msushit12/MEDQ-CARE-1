const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medq_care';

  try {
    console.log('🌱 [MedQ Seeder]: Connecting to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ [MedQ Seeder]: Connected.');

    // Clear existing collections
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await MedicalReport.deleteMany({});
    console.log('🧹 [MedQ Seeder]: Existing collections cleared.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('MedQ@2026', salt);

    // 1. Create Patient User
    const patientUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'patient@medqcare.com',
      password: passwordHash,
      phone: '+1 (555) 234-5678',
      role: 'patient',
      gender: 'Female',
      dateOfBirth: new Date('1994-06-15'),
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      patientDetails: {
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        medicalHistory: ['Mild Asthma', 'Migraine'],
        emergencyContact: {
          name: 'Robert Jenkins',
          relation: 'Spouse',
          phone: '+1 (555) 876-5432',
        },
      },
    });

    // 2. Create Doctor Users
    const doctorUser1 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'doctor@medqcare.com',
      password: passwordHash,
      phone: '+1 (555) 345-6789',
      role: 'doctor',
      gender: 'Male',
      dateOfBirth: new Date('1982-11-20'),
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      doctorDetails: {
        specialization: 'Cardiologist & Internal Medicine',
        licenseNumber: 'MD-MED-84920',
        experience: 14,
        qualification: 'MD, FACC, Harvard Med',
        consultationFee: 750,
        rating: 4.9,
        roomNumber: 'OPD-304',
        isOnDuty: true,
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'] },
          { day: 'Tuesday', slots: ['09:00 AM', '10:30 AM', '01:30 PM', '03:30 PM'] },
          { day: 'Wednesday', slots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '03:30 PM'] },
          { day: 'Friday', slots: ['09:30 AM', '11:30 AM', '01:30 PM', '03:00 PM'] },
        ],
      },
    });

    const doctorUser2 = await User.create({
      name: 'Dr. Aisha Patel',
      email: 'aisha.patel@medqcare.com',
      password: passwordHash,
      phone: '+1 (555) 456-7890',
      role: 'doctor',
      gender: 'Female',
      dateOfBirth: new Date('1988-04-12'),
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1594824813598-a28a30143899?w=150&auto=format&fit=crop&q=80',
      doctorDetails: {
        specialization: 'General Physician & Diabetologist',
        licenseNumber: 'MD-MED-99312',
        experience: 9,
        qualification: 'MBBS, MD (Medicine)',
        consultationFee: 500,
        rating: 4.8,
        roomNumber: 'OPD-102',
        isOnDuty: true,
        availability: [
          { day: 'Monday', slots: ['10:00 AM', '11:00 AM', '03:00 PM', '05:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
          { day: 'Friday', slots: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'] },
        ],
      },
    });

    // 3. Create Reception User
    const receptionUser = await User.create({
      name: 'Elena Rostova',
      email: 'reception@medqcare.com',
      password: passwordHash,
      phone: '+1 (555) 567-8901',
      role: 'reception',
      gender: 'Female',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      receptionDetails: {
        department: 'Main Registration Desk & Triage',
        shiftTiming: 'Morning (07:30 AM - 03:30 PM)',
        employeeId: 'MEDQ-REC-007',
      },
    });

    // 4. Create Admin User
    const adminUser = await User.create({
      name: 'Administrator Chief',
      email: 'admin@medqcare.com',
      password: passwordHash,
      phone: '+1 (555) 999-0000',
      role: 'admin',
      gender: 'Male',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      adminDetails: {
        accessLevel: 'SuperAdmin',
        department: 'Executive Healthcare Informatics',
        permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'MANAGE_DOCTORS', 'VIEW_AUDIT_LOGS', 'SYSTEM_SETTINGS'],
      },
    });

    // 5. Create Appointments
    const apt1 = await Appointment.create({
      patientId: patientUser._id,
      patientName: patientUser.name,
      patientPhone: patientUser.phone,
      doctorId: doctorUser1._id,
      doctorName: doctorUser1.name,
      specialization: doctorUser1.doctorDetails.specialization,
      appointmentDate: new Date(Date.now() + 86400000 * 1),
      timeSlot: '10:00 AM',
      status: 'confirmed',
      reason: 'Routine Cardiac Follow-up & Blood Pressure Check',
      symptoms: ['Occasional Palpitations', 'Mild Fatigue'],
      tokenNumber: 'CARD-12',
      roomNumber: 'OPD-304',
      consultationFee: 750,
      isPaid: true,
      isCheckedIn: false,
      createdBy: 'patient',
    });

    const apt2 = await Appointment.create({
      patientId: patientUser._id,
      patientName: patientUser.name,
      patientPhone: patientUser.phone,
      doctorId: doctorUser2._id,
      doctorName: doctorUser2.name,
      specialization: doctorUser2.doctorDetails.specialization,
      appointmentDate: new Date(Date.now() - 86400000 * 5),
      timeSlot: '11:00 AM',
      status: 'completed',
      reason: 'Seasonal Viral Fever & Throat Infection',
      symptoms: ['Sore Throat', 'Low Grade Fever'],
      tokenNumber: 'GEN-08',
      roomNumber: 'OPD-102',
      consultationFee: 500,
      isPaid: true,
      isCheckedIn: true,
      checkedInAt: new Date(Date.now() - 86400000 * 5),
      createdBy: 'patient',
    });

    // 6. Create Prescriptions
    await Prescription.create({
      appointmentId: apt2._id,
      patientId: patientUser._id,
      patientName: patientUser.name,
      doctorId: doctorUser2._id,
      doctorName: doctorUser2.name,
      doctorSpecialization: doctorUser2.doctorDetails.specialization,
      doctorLicense: doctorUser2.doctorDetails.licenseNumber,
      diagnosis: 'Acute Upper Respiratory Tract Pharyngitis',
      medicines: [
        {
          name: 'Amoxicillin + Clavulanic Acid 625mg',
          dosage: '1 Tablet',
          frequency: '1-0-1 (After Food)',
          duration: '5 Days',
          instructions: 'Complete full antibiotic course',
        },
        {
          name: 'Paracetamol 650mg (Dolo)',
          dosage: '1 Tablet',
          frequency: 'SOS (When Fever > 100°F)',
          duration: '3 Days',
          instructions: 'Take with full glass of water',
        },
      ],
      testsRecommended: ['Complete Blood Count (CBC)', 'Throat Swab Culture'],
      advice: 'Drink warm water with honey. Avoid cold beverages and air conditioner direct draft. Rest for 3 days.',
      followUpDate: new Date(Date.now() + 86400000 * 7),
      date: new Date(Date.now() - 86400000 * 5),
    });

    // 7. Create Medical Reports
    await MedicalReport.create({
      patientId: patientUser._id,
      patientName: patientUser.name,
      doctorId: doctorUser1._id,
      doctorName: doctorUser1.name,
      title: 'Comprehensive Lipid Profile & Lipid Biomarkers',
      category: 'Blood Test',
      reportDate: new Date(Date.now() - 86400000 * 3),
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'Lipid_Profile_Report_2026.pdf',
      fileSize: '1.4 MB',
      labName: 'MedQ Central Diagnostics Lab (NABL Accredited)',
      summary: 'HDL Cholesterol levels are optimal. LDL is mildly borderline. Dietary adjustments advised.',
      metrics: [
        { parameter: 'Total Cholesterol', value: '192', unit: 'mg/dL', referenceRange: '< 200', status: 'Normal' },
        { parameter: 'HDL (Good) Cholesterol', value: '58', unit: 'mg/dL', referenceRange: '> 50', status: 'Normal' },
        { parameter: 'LDL (Bad) Cholesterol', value: '118', unit: 'mg/dL', referenceRange: '< 100', status: 'Borderline' },
        { parameter: 'Triglycerides', value: '135', unit: 'mg/dL', referenceRange: '< 150', status: 'Normal' },
      ],
      status: 'Verified',
    });

    console.log('🎉 [MedQ Seeder]: Seed data successfully populated into MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [MedQ Seeder Error]:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
