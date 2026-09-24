const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  createAppointment,
  patientCheckIn,
  getDoctorAvailability,
  searchPatients,
  getReceptionStats,
} = require('../controllers/receptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All reception routes require authentication and reception/admin role
router.use(protect);
router.use(authorizeRoles('reception', 'admin'));

router.get('/appointments/all', getAllAppointments);
router.post('/appointments/create', createAppointment);
router.put('/patient-checkin/:id', patientCheckIn);
router.get('/doctor-availability', getDoctorAvailability);
router.get('/search-patients', searchPatients);
router.get('/stats', getReceptionStats);

module.exports = router;
