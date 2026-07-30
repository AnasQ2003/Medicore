const express = require('express');
const router = express.Router();

const {
  login,
  register,
  getMe,
  updateProfile,
  checkEmail
} = require('../controllers/authController');

const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getPrescriptions,
  createPrescription,
  getPatients,
  getPatientDetails,
  recordVitals,
  getBeds,
  updateBedStatus,
  getTasks,
  updateTaskStatus,
  getBills,
  createBill,
  payBill,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAdminAnalytics,
  getDoctorsList
} = require('../controllers/clinicalController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

// Authentication / Profile
router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/check-email', checkEmail);
router.get('/auth/me', protect, getMe);
router.put('/auth/profile', protect, updateProfile);

// Staff / Doctors List
router.get('/doctors', protect, getDoctorsList);

// Appointments
router.get('/appointments', protect, getAppointments);
router.post('/appointments/book', protect, createAppointment);
router.put('/appointments/:code/status', protect, updateAppointmentStatus);
router.delete('/appointments/:code', protect, deleteAppointment);

// Prescriptions
router.get('/prescriptions', protect, getPrescriptions);
router.post('/prescriptions/new', protect, createPrescription);

// Patients Management
router.get('/patients', protect, getPatients);
router.get('/patients/:id', protect, getPatientDetails);
router.post('/vitals/record', protect, recordVitals);

// Beds Ward Allocation
router.get('/beds', protect, getBeds);
router.put('/beds/:id/status', protect, updateBedStatus);

// Tasks (Nursing, etc.)
router.get('/tasks', protect, getTasks);
router.put('/tasks/:id/status', protect, updateTaskStatus);

// Billing System
router.get('/bills', protect, getBills);
router.post('/bills/create', protect, createBill);
router.put('/bills/:code/pay', protect, payBill);

// Notifications Hub
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

// Admin dashboard analytics
router.get('/admin/analytics', protect, restrictTo('super-admin'), getAdminAnalytics);

module.exports = router;
