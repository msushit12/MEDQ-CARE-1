const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { store } = require('../models/dataStore');
const mongoose = require('mongoose');

// @desc    Get directory of active doctors (for appointment booking)
// @route   GET /api/appointments/doctors
// @access  Public / Authenticated
const getDoctorDirectory = async (req, res, next) => {
  try {
    let doctors = [];

    if (mongoose.connection.readyState === 1) {
      doctors = await User.find({ role: 'doctor', status: 'active' }).select('-password');
    } else {
      doctors = store.users.filter((u) => u.role === 'doctor' && u.status === 'active');
    }

    const doctorDirectory = doctors.map((doc) => ({
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      profileImage: doc.profileImage,
      specialization: doc.doctorDetails?.specialization || 'General Physician',
      qualification: doc.doctorDetails?.qualification || 'MBBS, MD',
      experience: doc.doctorDetails?.experience || 5,
      consultationFee: doc.doctorDetails?.consultationFee || 500,
      rating: doc.doctorDetails?.rating || 4.8,
      roomNumber: doc.doctorDetails?.roomNumber || 'OPD-101',
      isOnDuty: doc.doctorDetails?.isOnDuty !== false,
      availability: doc.doctorDetails?.availability || [
        { day: 'Monday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        { day: 'Tuesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        { day: 'Thursday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        { day: 'Friday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      ],
    }));

    res.status(200).json({
      success: true,
      count: doctorDirectory.length,
      doctors: doctorDirectory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots for a doctor on a given date
// @route   GET /api/appointments/slots/:doctorId
// @access  Public / Authenticated
const getDoctorSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const defaultSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
    ];

    // Find existing bookings on this date
    let bookedSlots = [];
    if (date) {
      const targetDateStr = new Date(date).toISOString().split('T')[0];
      const matchingApts = store.appointments.filter(
        (a) =>
          a.doctorId.toString() === doctorId.toString() &&
          a.status !== 'cancelled' &&
          new Date(a.appointmentDate).toISOString().split('T')[0] === targetDateStr
      );
      bookedSlots = matchingApts.map((a) => a.timeSlot);
    }

    const availableSlots = defaultSlots.map((slot) => ({
      slot,
      isAvailable: !bookedSlots.includes(slot),
    }));

    res.status(200).json({
      success: true,
      doctorId,
      date: date || new Date().toISOString().split('T')[0],
      slots: availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let appointment = null;

    if (mongoose.connection.readyState === 1) {
      appointment = await Appointment.findById(id);
    } else {
      appointment = store.appointments.find((a) => a._id.toString() === id.toString());
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment record not found.' });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorDirectory,
  getDoctorSlots,
  getAppointmentById,
};
