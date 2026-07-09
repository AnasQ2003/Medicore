-- ===================================================
-- SEED DATA: 002_seed_data
-- Description: Seeds initial clinical and administrative data
-- ===================================================

USE MedicoreDB;
GO

-- Note: Passwords are hashed using bcrypt.
-- Default password for all seeded users is: "password123"
-- Bcrypt Hash: $2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.

-- 1. Clear existing data in reverse order of dependencies
DELETE FROM Notifications;
DELETE FROM Bills;
DELETE FROM Tasks;
DELETE FROM Beds;
DELETE FROM Vitals;
DELETE FROM MedicalRecords;
DELETE FROM Prescriptions;
DELETE FROM Appointments;
DELETE FROM Patients;
DELETE FROM Users;
GO

-- 2. Seed Users
INSERT INTO Users (name, email, password, phone, address, role, status, gender, createdAt, updatedAt) VALUES
-- Super Admin
('Super Admin Adam', 'admin@medicore.demo', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 300 0000001', 'HQ Command Center, Islamabad', 'super-admin', 'Approved', 'Male', GETDATE(), GETDATE()),

-- Receptionist
('Receptionist Alice', 'receptionist@medicore.demo', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 300 0000002', 'Front Desk, Block A, Lahore', 'receptionist', 'Approved', 'Female', GETDATE(), GETDATE()),

-- Doctor
('Dr. Sarah Khan', 'doctor@medicore.demo', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 300 0000003', 'Consultation Clinic 104, Karachi', 'doctor', 'Approved', 'Female', GETDATE(), GETDATE()),
('Dr. Bilal Iqbal', 'bilal.iqbal@medicore.demo', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 300 0000004', 'Cardiology Lab 12, Karachi', 'doctor', 'Approved', 'Male', GETDATE(), GETDATE()),

-- Nurse
('Nurse Emily Watson', 'nurse@medicore.demo', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 300 0000005', 'IPD Ward 4, Block B, Islamabad', 'nurse', 'Approved', 'Female', GETDATE(), GETDATE()),

-- Patients (as Users)
('Ahmed Ali', 'patient@medicore.demo', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 300 1234567', 'House 12, Street 5, F-7 Islamabad', 'patient', 'Approved', 'Male', GETDATE(), GETDATE()),
('Fatima Noor', 'fatima.n@example.com', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 333 9876543', 'Apt 4B, Garden Towers, Lahore', 'patient', 'Approved', 'Female', GETDATE(), GETDATE()),
('Hassan Raza', 'hassan.r@example.com', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 321 2233445', 'Phase 5, DHA Karachi', 'patient', 'Approved', 'Male', GETDATE(), GETDATE()),
('Ayesha Tariq', 'ayesha.t@example.com', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 345 1112223', 'Bahria Town, Rawalpindi', 'patient', 'Approved', 'Female', GETDATE(), GETDATE()),
('Bilal Khan', 'bilal.k@example.com', '$2a$10$wK1Wd10X4Q2H/0h36p3UieP2i3P4O4J.tJk7nI5lI5f7bL2Z.P2H.', '+92 312 5556677', 'Gulberg, Lahore', 'patient', 'Approved', 'Male', GETDATE(), GETDATE());
GO

-- Get User IDs and Seed Patients info
-- Ahmed Ali
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
INSERT INTO Patients (userId, patientCode, age, bloodGroup, condition, allergies, chronic, currentMeds) VALUES
(@uid_ahmed, 'P-1042', 54, 'B+', 'Hypertension, mild dyslipidemia', '["Penicillin", "Peanuts"]', '["Hypertension (since 2019)", "Hyperlipidemia"]', '["Amlodipine 5mg OD", "Atorvastatin 10mg HS", "Aspirin 75mg OD"]');

-- Fatima Noor
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');
INSERT INTO Patients (userId, patientCode, age, bloodGroup, condition, allergies, chronic, currentMeds) VALUES
(@uid_fatima, 'P-1058', 31, 'O+', 'Anxiety with palpitations', '[]', '[]', '["Propranolol 20mg PRN"]');

-- Hassan Raza
DECLARE @uid_hassan INT = (SELECT id FROM Users WHERE email = 'hassan.r@example.com');
INSERT INTO Patients (userId, patientCode, age, bloodGroup, condition, allergies, chronic, currentMeds) VALUES
(@uid_hassan, 'P-1071', 66, 'A+', 'Post-MI, on dual antiplatelet', '["Sulfa"]', '["CAD", "T2DM", "CKD stage 2"]', '["Clopidogrel 75mg", "Aspirin 75mg", "Bisoprolol 5mg", "Rosuvastatin 20mg", "Metformin 500mg BD"]');

-- Ayesha Tariq
DECLARE @uid_ayesha INT = (SELECT id FROM Users WHERE email = 'ayesha.t@example.com');
INSERT INTO Patients (userId, patientCode, age, bloodGroup, condition, allergies, chronic, currentMeds) VALUES
(@uid_ayesha, 'P-1090', 28, 'AB+', 'First visit — routine check', '[]', '[]', '[]');

-- Bilal Khan
DECLARE @uid_bilal INT = (SELECT id FROM Users WHERE email = 'bilal.k@example.com');
INSERT INTO Patients (userId, patientCode, age, bloodGroup, condition, allergies, chronic, currentMeds) VALUES
(@uid_bilal, 'P-1102', 45, 'B-', 'Post-op gallbladder, recovery', '[]', '[]', '["Pantoprazole 40mg", "Paracetamol 500mg PRN"]');
GO

-- 3. Seed Appointments
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@medicore.demo');
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');
DECLARE @uid_hassan INT = (SELECT id FROM Users WHERE email = 'hassan.r@example.com');
DECLARE @uid_ayesha INT = (SELECT id FROM Users WHERE email = 'ayesha.t@example.com');
DECLARE @uid_bilal INT = (SELECT id FROM Users WHERE email = 'bilal.k@example.com');

INSERT INTO Appointments (appointmentCode, patientId, doctorId, time, date, reason, status, type) VALUES
('A-201', @uid_ahmed, @uid_doctor, '09:00', GETDATE(), 'Follow-up — Hypertension', 'Confirmed', 'In-person'),
('A-202', @uid_fatima, @uid_doctor, '09:30', GETDATE(), 'Chest pain consultation', 'Confirmed', 'In-person'),
('A-203', @uid_hassan, @uid_doctor, '10:15', GETDATE(), 'ECG review', 'Pending', 'Tele-consult'),
('A-204', @uid_ayesha, @uid_doctor, '11:00', GETDATE(), 'New patient', 'Confirmed', 'In-person'),
('A-205', @uid_bilal, @uid_doctor, '11:45', GETDATE(), 'Post-op review', 'Completed', 'In-person'),
('A-206', @uid_ahmed, @uid_doctor, '14:00', GETDATE(), 'Lab review', 'Confirmed', 'Tele-consult'),
('A-207', @uid_fatima, @uid_doctor, '15:30', GETDATE(), 'Anxiety counselling', 'Confirmed', 'In-person');
GO

-- 4. Seed Prescriptions
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@medicore.demo');
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');
DECLARE @uid_hassan INT = (SELECT id FROM Users WHERE email = 'hassan.r@example.com');
DECLARE @uid_ayesha INT = (SELECT id FROM Users WHERE email = 'ayesha.t@example.com');
DECLARE @uid_bilal INT = (SELECT id FROM Users WHERE email = 'bilal.k@example.com');

INSERT INTO Prescriptions (prescriptionCode, patientId, doctorId, date, items, status) VALUES
('RX-901', @uid_ahmed, @uid_doctor, DATEADD(DAY, -1, GETDATE()), 'Amlodipine 5mg, Atorvastatin 10mg', 'Issued'),
('RX-902', @uid_fatima, @uid_doctor, DATEADD(DAY, -2, GETDATE()), 'Propranolol 20mg PRN', 'Issued'),
('RX-903', @uid_hassan, @uid_doctor, DATEADD(DAY, -3, GETDATE()), 'Clopidogrel, Aspirin, Bisoprolol', 'Issued'),
('RX-904', @uid_bilal, @uid_doctor, DATEADD(DAY, -3, GETDATE()), 'Pantoprazole, Paracetamol', 'Issued'),
('RX-905', @uid_ayesha, @uid_doctor, GETDATE(), 'Multivitamin, Folic acid', 'Draft');
GO

-- 5. Seed Medical Records (History and Reports)
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@medicore.demo');
DECLARE @uid_doc_bilal INT = (SELECT id FROM Users WHERE email = 'bilal.iqbal@medicore.demo');
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');
DECLARE @uid_hassan INT = (SELECT id FROM Users WHERE email = 'hassan.r@example.com');
DECLARE @uid_bilal INT = (SELECT id FROM Users WHERE email = 'bilal.k@example.com');

INSERT INTO MedicalRecords (patientId, doctorId, date, diagnosis, notes, type, name) VALUES
-- Ahmed Ali History
(@uid_ahmed, @uid_doctor, '2026-05-28', 'Routine follow-up', 'BP 138/92, advised lifestyle changes, continue meds.', 'Consultation', 'Follow-up Record'),
(@uid_ahmed, @uid_doctor, '2026-03-12', 'Chest discomfort', 'ECG normal sinus. Trop-I negative. Reassured.', 'Consultation', 'Emergency Record'),
(@uid_ahmed, @uid_doc_bilal, '2025-11-04', 'Annual check', 'Lipid profile borderline. Started atorvastatin.', 'Consultation', 'Annual Checkup'),
-- Ahmed Ali Reports
(@uid_ahmed, NULL, '2026-05-20', 'Lab Test', 'Total Cholesterol: 210, HDL: 45, LDL: 135', 'Lab', 'Lipid Profile'),
(@uid_ahmed, NULL, '2026-03-12', 'Cardiology Test', 'ECG shows normal sinus rhythm, no ST shifts.', 'Cardio', 'ECG'),
-- Fatima Noor
(@uid_fatima, @uid_doctor, '2026-06-10', 'Palpitations', 'Holter recommended. Reassurance given.', 'Consultation', 'Cardiac Review'),
(@uid_fatima, NULL, '2026-06-08', 'Lab Test', 'TSH: 2.4 mIU/L (Normal)', 'Lab', 'TSH'),
-- Hassan Raza
(@uid_hassan, @uid_doctor, '2026-06-05', 'Post-MI review', 'Stable. EF 45%. Continue meds.', 'Consultation', 'Post-MI Follow-up'),
(@uid_hassan, NULL, '2026-01-20', 'Cardiology Report', 'LAD stenosis 80% post stenting.', 'Cardio', 'Coronary Angio'),
-- Bilal Khan
(@uid_bilal, @uid_doctor, '2026-06-12', 'Post-op review', 'Wound healing well. No signs of infection.', 'Consultation', 'Surgical Review'),
(@uid_bilal, NULL, '2026-06-10', 'Radiology Test', 'USG shows normal post-cholecystectomy fossa.', 'Radiology', 'USG Abdomen');
GO

-- 6. Seed Vitals
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');
DECLARE @uid_hassan INT = (SELECT id FROM Users WHERE email = 'hassan.r@example.com');
DECLARE @uid_bilal INT = (SELECT id FROM Users WHERE email = 'bilal.k@example.com');
DECLARE @uid_nurse INT = (SELECT id FROM Users WHERE email = 'nurse@medicore.demo');

INSERT INTO Vitals (patientId, recordedBy, date, bp, pulse, temp, spo2) VALUES
(@uid_ahmed, @uid_nurse, '2026-06-01', '138/92', 82, 36.8, 97),
(@uid_ahmed, @uid_nurse, '2026-05-15', '142/94', 84, 36.7, 98),
(@uid_ahmed, @uid_nurse, '2026-05-01', '136/88', 78, 36.6, 98),
(@uid_ahmed, @uid_nurse, '2026-04-15', '144/96', 86, 36.9, 97),
(@uid_fatima, @uid_nurse, '2026-06-10', '118/76', 96, 36.7, 99),
(@uid_hassan, @uid_nurse, '2026-06-05', '128/82', 68, 36.5, 96),
(@uid_bilal, @uid_nurse, '2026-06-12', '126/80', 80, 36.7, 98);
GO

-- 7. Seed Beds
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');

INSERT INTO Beds (bedNumber, roomNumber, wardType, status, patientId, admittedAt) VALUES
('Bed-101', 'Room 12', 'General Ward', 'Occupied', @uid_ahmed, DATEADD(DAY, -5, GETDATE())),
('Bed-102', 'Room 12', 'General Ward', 'Vacant', NULL, NULL),
('Bed-103', 'Room 14', 'General Ward', 'Vacant', NULL, NULL),
('ICU-01', 'ICU Room 1', 'ICU', 'Occupied', @uid_fatima, DATEADD(DAY, -2, GETDATE())),
('ICU-02', 'ICU Room 2', 'ICU', 'Maintenance', NULL, NULL),
('Bed-201', 'Room 21', 'Semi-Private', 'Vacant', NULL, NULL);
GO

-- 8. Seed Tasks (Nurse)
DECLARE @uid_nurse INT = (SELECT id FROM Users WHERE email = 'nurse@medicore.demo');
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');

INSERT INTO Tasks (description, assignedTo, dueDate, status, patientId) VALUES
('Administer IV antibiotics', @uid_nurse, DATEADD(HOUR, 2, GETDATE()), 'Pending', @uid_ahmed),
('Check vitals every 4 hours', @uid_nurse, DATEADD(HOUR, 4, GETDATE()), 'In Progress', @uid_fatima),
('Assist Doctor with rounds', @uid_nurse, DATEADD(HOUR, 1, GETDATE()), 'Pending', NULL),
('Change dressings for bed-101', @uid_nurse, DATEADD(HOUR, 6, GETDATE()), 'Completed', @uid_ahmed);
GO

-- 9. Seed Bills
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');
DECLARE @uid_fatima INT = (SELECT id FROM Users WHERE email = 'fatima.n@example.com');
DECLARE @uid_hassan INT = (SELECT id FROM Users WHERE email = 'hassan.r@example.com');

INSERT INTO Bills (billCode, patientId, date, amount, description, status) VALUES
('B-301', @uid_ahmed, DATEADD(DAY, -3, GETDATE()), 12500.00, 'Consultation + Lab Tests', 'Paid'),
('B-302', @uid_fatima, DATEADD(DAY, -1, GETDATE()), 45000.00, 'ICU Charges + Medication', 'Pending'),
('B-303', @uid_hassan, GETDATE(), 8000.00, 'ECG & Cardiology Review', 'Unpaid');
GO

-- 10. Seed Notifications
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@medicore.demo');
DECLARE @uid_nurse INT = (SELECT id FROM Users WHERE email = 'nurse@medicore.demo');
DECLARE @uid_ahmed INT = (SELECT id FROM Users WHERE email = 'patient@medicore.demo');

INSERT INTO Notifications (userId, title, body, type, unread) VALUES
(@uid_doctor, 'New appointment booked', 'Ayesha Tariq booked an 11:00 slot for tomorrow.', 'appointment', 1),
(@uid_doctor, 'Lab results ready', 'Lipid profile for Ahmed Ali is available.', 'lab', 1),
(@uid_doctor, 'Leave approved', 'Your leave for 22-Jun has been approved by admin.', 'leave', 1),
(@uid_doctor, 'Prescription refill request', 'Hassan Raza requested a refill for Clopidogrel.', 'rx', 0),
(@uid_doctor, 'New patient assigned', 'Bilal Khan transferred to your care.', 'patient', 0),
(@uid_doctor, 'System maintenance', 'Scheduled maintenance window 02:00–03:00.', 'system', 0),

(@uid_nurse, 'New vitals recording task', 'Please record vitals for Ahmed Ali in Bed-101.', 'patient', 1),
(@uid_nurse, 'Shift schedule update', 'Your night shift schedule has been updated.', 'system', 0),

(@uid_ahmed, 'Appointment Confirmed', 'Your appointment with Dr. Sarah Khan is confirmed for 09:00.', 'appointment', 1),
(@uid_ahmed, 'New Prescription Issued', 'Dr. Sarah Khan issued prescription RX-901.', 'rx', 1);
GO

-- Verify tables populated
SELECT 'Users seeded: ' + CAST(COUNT(*) AS VARCHAR) + ' records' FROM Users;
SELECT 'Patients seeded: ' + CAST(COUNT(*) AS VARCHAR) + ' records' FROM Patients;
SELECT 'Appointments seeded: ' + CAST(COUNT(*) AS VARCHAR) + ' records' FROM Appointments;
SELECT 'Prescriptions seeded: ' + CAST(COUNT(*) AS VARCHAR) + ' records' FROM Prescriptions;
SELECT 'Beds seeded: ' + CAST(COUNT(*) AS VARCHAR) + ' records' FROM Beds;
SELECT 'Tasks seeded: ' + CAST(COUNT(*) AS VARCHAR) + ' records' FROM Tasks;
SELECT 'Bills seeded: ' + CAST(COUNT(*) AS VARCHAR) + ' records' FROM Bills;
GO
