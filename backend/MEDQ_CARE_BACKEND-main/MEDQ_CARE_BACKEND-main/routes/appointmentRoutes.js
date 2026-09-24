const express = require('express');
const router = express.Router();
const {
  getDoctorDirectory,
  getDoctorSlots,
  getAppointmentById,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Public / Semi-public routes for appointment discovery
router.get('/doctors', getDoctorDirectory);
router.get('/slots/:doctorId', getDoctorSlots);
router.get('/:id', protect, getAppointmentById);

module.exports = router;
