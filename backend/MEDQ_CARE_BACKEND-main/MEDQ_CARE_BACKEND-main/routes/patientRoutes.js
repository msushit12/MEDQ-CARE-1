const express = require('express');
const router = express.Router();
const {
  getAppointments,
  bookAppointment,
  cancelAppointment,
  getPrescriptions,
  getReports,
  uploadReport,
  updateProfile,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All patient routes require authentication and patient/admin role
router.use(protect);
router.use(authorizeRoles('patient', 'admin'));

router.get('/appointments', getAppointments);
router.post('/appointments/book', bookAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.get('/prescriptions', getPrescriptions);
router.get('/reports', getReports);
router.post('/reports', uploadReport);
router.put('/profile', updateProfile);

module.exports = router;
