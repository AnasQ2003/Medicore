-- ===================================================
-- SEED DATA: 002_seed_data
-- Description: Seeds initial clinical and administrative data
-- ===================================================

USE MedicoreDB;
GO

-- Note: Passwords are hashed using bcrypt.
-- Default passwords for seeded users:
-- Super Admin: admin@example.com / admin123
-- Doctor: doctor@example.com / doctor123
-- Nurse: nurse@example.com / nurse123
-- Patient: patient@example.com / patient123
-- Receptionist: receptionist@example.com / receptionist123
-- Bcrypt Hash for all: $2a$10$PM8Lim9kYa33df.3QbfhieejdNRp5d.oqwuTdnr30yAaac2ysUFzi

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
('Super Admin', 'admin@example.com', '$2a$10$PM8Lim9kYa33df.3QbfhieejdNRp5d.oqwuTdnr30yAaac2ysUFzi', '+92 300 0000001', 'HQ Command Center, Islamabad', 'super-admin', 'Approved', 'Male', GETDATE(), GETDATE()),

-- Receptionist
('Receptionist Alice', 'receptionist@example.com', '$2a$10$PM8Lim9kYa33df.3QbfhieejdNRp5d.oqwuTdnr30yAaac2ysUFzi', '+92 300 0000002', 'Front Desk, Block A, Lahore', 'receptionist', 'Approved', 'Female', GETDATE(), GETDATE()),

-- Doctor
('Dr. Sarah Khan', 'doctor@example.com', '$2a$10$PM8Lim9kYa33df.3QbfhieejdNRp5d.oqwuTdnr30yAaac2ysUFzi', '+92 300 0000003', 'Consultation Clinic 104, Karachi', 'doctor', 'Approved', 'Female', GETDATE(), GETDATE()),

-- Nurse
('Nurse Emily Watson', 'nurse@example.com', '$2a$10$PM8Lim9kYa33df.3QbfhieejdNRp5d.oqwuTdnr30yAaac2ysUFzi', '+92 300 0000005', 'IPD Ward 4, Block B, Islamabad', 'nurse', 'Approved', 'Female', GETDATE(), GETDATE()),

-- Patient
('Patient John Doe', 'patient@example.com', '$2a$10$PM8Lim9kYa33df.3QbfhieejdNRp5d.oqwuTdnr30yAaac2ysUFzi', '+92 300 1234567', 'House 12, Street 5, F-7 Islamabad', 'patient', 'Approved', 'Male', GETDATE(), GETDATE());
GO

-- Get User IDs and Seed Patients info
-- Patient John Doe
DECLARE @uid_patient INT = (SELECT id FROM Users WHERE email = 'patient@example.com');
INSERT INTO Patients (userId, patientCode, age, bloodGroup, condition, allergies, chronic, currentMeds) VALUES
(@uid_patient, 'P-1001', 30, 'O+', null, '[]', '[]', '[]');
GO

-- 3. Seed Appointments
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@example.com');
DECLARE @uid_patient INT = (SELECT id FROM Users WHERE email = 'patient@example.com');

INSERT INTO Appointments (appointmentCode, patientId, doctorId, time, date, reason, status, type) VALUES
('A-001', @uid_patient, @uid_doctor, '09:00', GETDATE(), 'Routine checkup', 'Confirmed', 'In-person');
GO

-- 4. Seed Prescriptions
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@example.com');
DECLARE @uid_patient INT = (SELECT id FROM Users WHERE email = 'patient@example.com');

INSERT INTO Prescriptions (prescriptionCode, patientId, doctorId, date, items, status) VALUES
('RX-001', @uid_patient, @uid_doctor, GETDATE(), 'Multivitamin', 'Issued');
GO

-- 5. Seed Medical Records (History and Reports)
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@example.com');
DECLARE @uid_patient INT = (SELECT id FROM Users WHERE email = 'patient@example.com');

INSERT INTO MedicalRecords (patientId, doctorId, date, diagnosis, notes, type, name) VALUES
(@uid_patient, @uid_doctor, GETDATE(), 'Routine checkup', 'Patient is healthy', 'Consultation', 'Initial Consultation');
GO

-- 6. Seed Vitals
DECLARE @uid_patient INT = (SELECT id FROM Users WHERE email = 'patient@example.com');
DECLARE @uid_nurse INT = (SELECT id FROM Users WHERE email = 'nurse@example.com');

INSERT INTO Vitals (patientId, recordedBy, date, bp, pulse, temp, spo2) VALUES
(@uid_patient, @uid_nurse, GETDATE(), '120/80', 72, 36.5, 98);
GO

-- 7. Seed Beds
INSERT INTO Beds (bedNumber, roomNumber, wardType, status, patientId, admittedAt) VALUES
('Bed-101', 'Room 12', 'General Ward', 'Vacant', NULL, NULL),
('Bed-102', 'Room 12', 'General Ward', 'Vacant', NULL, NULL),
('ICU-01', 'ICU Room 1', 'ICU', 'Vacant', NULL, NULL);
GO

-- 8. Seed Tasks (Nurse)
DECLARE @uid_nurse INT = (SELECT id FROM Users WHERE email = 'nurse@example.com');

INSERT INTO Tasks (description, assignedTo, dueDate, status, patientId) VALUES
('Morning rounds', @uid_nurse, DATEADD(HOUR, 2, GETDATE()), 'Pending', NULL);
GO

-- 9. Seed Bills
DECLARE @uid_patient INT = (SELECT id FROM Users WHERE email = 'patient@example.com');

INSERT INTO Bills (billCode, patientId, date, amount, description, status) VALUES
('B-001', @uid_patient, GETDATE(), 5000.00, 'Consultation fee', 'Unpaid');
GO

-- 10. Seed Notifications
DECLARE @uid_doctor INT = (SELECT id FROM Users WHERE email = 'doctor@example.com');
DECLARE @uid_nurse INT = (SELECT id FROM Users WHERE email = 'nurse@example.com');
DECLARE @uid_patient INT = (SELECT id FROM Users WHERE email = 'patient@example.com');

INSERT INTO Notifications (userId, title, body, type, unread) VALUES
(@uid_doctor, 'New appointment', 'Patient booked an appointment', 'appointment', 1),
(@uid_nurse, 'Shift update', 'Your schedule has been updated', 'system', 1),
(@uid_patient, 'Appointment confirmed', 'Your appointment is confirmed', 'appointment', 1);
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
