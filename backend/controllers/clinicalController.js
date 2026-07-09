const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const Vital = require('../models/Vital');
const Bed = require('../models/Bed');
const Task = require('../models/Task');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const User = require('../models/User');

// --- Appointments ---
const getAppointments = async (req, res, next) => {
  try {
    const filters = {};
    if (req.user.role === 'doctor') {
      filters.doctorId = req.user.id;
    } else if (req.user.role === 'patient') {
      filters.patientId = req.user.id;
    }
    const data = await Appointment.findAll(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, time, date, reason, type } = req.body;
    
    // Fallback/Defaults
    const bookingDocId = doctorId || (await User.getDoctors())[0]?.id;
    const bookingPatId = req.user.role === 'patient' ? req.user.id : patientId;

    if (!bookingPatId || !reason) {
      res.status(400);
      throw new Error('Please provide patientId and reason');
    }

    const appt = await Appointment.create({
      patientId: bookingPatId,
      doctorId: bookingDocId,
      time,
      date,
      reason,
      type
    });

    // Create Notification
    const patientName = (await User.findById(bookingPatId))?.name || 'A patient';
    await Notification.create({
      userId: bookingDocId,
      title: 'New appointment booked',
      body: `${patientName} booked a ${time} slot.`,
      type: 'appointment'
    });

    res.status(210).json({ success: true, message: 'Appointment booked successfully', data: appt });
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { status, time } = req.body;

    await Appointment.updateStatus(code, status, time);

    // Notify patient
    const appts = await Appointment.findAll();
    const appt = appts.find(a => a.id === code);
    if (appt) {
      await Notification.create({
        userId: appt.patientId,
        title: `Appointment ${status}`,
        body: `Your appointment with ${appt.doctor} has been marked as ${status}${time ? ' for ' + time : ''}.`,
        type: 'appointment'
      });
    }

    res.status(200).json({ success: true, message: `Appointment status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { code } = req.params;
    await Appointment.delete(code);
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Prescriptions ---
const getPrescriptions = async (req, res, next) => {
  try {
    const filters = {};
    if (req.user.role === 'doctor') {
      filters.doctorId = req.user.id;
    } else if (req.user.role === 'patient') {
      filters.patientId = req.user.id;
    }
    const data = await Prescription.findAll(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createPrescription = async (req, res, next) => {
  try {
    const { patientId, items, status } = req.body;
    const doctorId = req.user.id;

    if (!patientId || !items) {
      res.status(400);
      throw new Error('Please provide patientId and items');
    }

    const rx = await Prescription.create({
      patientId,
      doctorId,
      items,
      status: status || 'Draft'
    });

    if (status === 'Issued') {
      await Notification.create({
        userId: patientId,
        title: 'New Prescription Issued',
        body: `Dr. ${req.user.name || 'Sarah Khan'} has issued a new prescription.`,
        type: 'rx'
      });
    }

    res.status(210).json({ success: true, message: 'Prescription written successfully', data: rx });
  } catch (error) {
    next(error);
  }
};

// --- Patient clinical files ---
const getPatients = async (req, res, next) => {
  try {
    const data = await User.getPatients();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getPatientDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error('Patient not found');
    }

    const vitals = await Vital.findByPatient(id);
    const history = await MedicalRecord.findByPatient(id);

    // Map history to include clinical entries and reports
    const consultations = history.filter(h => h.type === 'Consultation');
    const reports = history.filter(h => h.type !== 'Consultation');

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        patientCode: user.patientCode,
        age: user.age,
        bloodGroup: user.bloodGroup,
        condition: user.condition,
        allergies: user.allergies ? JSON.parse(user.allergies) : [],
        chronic: user.chronic ? JSON.parse(user.chronic) : [],
        currentMeds: user.currentMeds ? JSON.parse(user.currentMeds) : [],
        vitals,
        history: consultations,
        reports
      }
    });
  } catch (error) {
    next(error);
  }
};

const recordVitals = async (req, res, next) => {
  try {
    const { patientId, bp, pulse, temp, spo2 } = req.body;
    const recordedBy = req.user.id;

    if (!patientId || !bp || !pulse || !temp || !spo2) {
      res.status(400);
      throw new Error('Please fill all vitals parameters');
    }

    const newVital = await Vital.create({
      patientId,
      recordedBy,
      bp,
      pulse: parseInt(pulse),
      temp: parseFloat(temp),
      spo2: parseInt(spo2)
    });

    res.status(210).json({ success: true, message: 'Vitals recorded successfully', data: newVital });
  } catch (error) {
    next(error);
  }
};

// --- Beds allocation ---
const getBeds = async (req, res, next) => {
  try {
    const data = await Bed.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateBedStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, patientId } = req.body;
    await Bed.updateStatus(id, status, patientId);
    res.status(200).json({ success: true, message: `Bed is now ${status}` });
  } catch (error) {
    next(error);
  }
};

// --- Nurse tasks ---
const getTasks = async (req, res, next) => {
  try {
    const filters = {};
    if (req.user.role === 'nurse') {
      filters.assignedTo = req.user.id;
    }
    const data = await Task.findAll(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Task.updateStatus(id, status);
    res.status(200).json({ success: true, message: `Task marked as ${status}` });
  } catch (error) {
    next(error);
  }
};

// --- Billing ---
const getBills = async (req, res, next) => {
  try {
    const filters = {};
    if (req.user.role === 'patient') {
      filters.patientId = req.user.id;
    }
    const data = await Bill.findAll(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createBill = async (req, res, next) => {
  try {
    const { patientId, amount, description } = req.body;
    if (!patientId || !amount || !description) {
      res.status(400);
      throw new Error('Please fill all billing parameters');
    }
    const bill = await Bill.create({ patientId, amount, description });
    res.status(210).json({ success: true, message: 'Invoice generated successfully', data: bill });
  } catch (error) {
    next(error);
  }
};

const payBill = async (req, res, next) => {
  try {
    const { code } = req.params;
    await Bill.updateStatus(code, 'Paid');
    res.status(200).json({ success: true, message: 'Invoice settled successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Notifications ---
const getNotifications = async (req, res, next) => {
  try {
    const data = await Notification.findByUser(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// --- Admin metrics ---
const getAdminAnalytics = async (req, res, next) => {
  try {
    const appts = await Appointment.findAll();
    const patients = await User.getPatients();
    const staff = await User.getStaff();
    const bills = await Bill.findAll();
    
    const revenue = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalAppointments: appts.length,
        activePatients: patients.length,
        totalStaff: staff.length,
        totalRevenue: revenue,
        recentAppointments: appts.slice(0, 5),
        staffList: staff
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorsList = async (req, res, next) => {
  try {
    const data = await User.getDoctors();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
