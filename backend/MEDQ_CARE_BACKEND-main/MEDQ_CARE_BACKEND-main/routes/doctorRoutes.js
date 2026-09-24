const express = require('express');
const router = express.Router();
const {
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription,
  getPatientHistory,
  updateAvailability,
  getDoctorStats,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All doctor routes require authentication and doctor/admin role
router.use(protect);
router.use(authorizeRoles('doctor', 'admin'));

router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.post('/prescriptions', createPrescription);
router.get('/patient-history/:patientId', getPatientHistory);
router.put('/availability', updateAvailability);
router.get('/stats', getDoctorStats);

module.exports = router;
