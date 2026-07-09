-- ===================================================
-- MIGRATION: 001_create_tables
-- Description: Creates all tables for MediCore HMS
-- ===================================================

-- 1. Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        phone NVARCHAR(20) NULL,
        address NVARCHAR(500) NULL,
        role NVARCHAR(20) NOT NULL CHECK (role IN ('super-admin', 'doctor', 'nurse', 'receptionist', 'patient')),
        status NVARCHAR(20) DEFAULT 'Approved',
        profilePictureUrl NVARCHAR(500) NULL,
        dateOfBirth DATE NULL,
        gender NVARCHAR(10) NULL CHECK (gender IN ('Male', 'Female', 'Other')),
        emailNotifications BIT DEFAULT 1,
        smsNotifications BIT DEFAULT 0,
        pushNotifications BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        lastLogin DATETIME NULL
    );

    CREATE INDEX IX_Users_Email ON Users(email);
    CREATE INDEX IX_Users_Role ON Users(role);
    PRINT '✅ Users table created successfully';
END
GO

-- 2. Patients Table (Extends Users with clinical info)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Patients' AND xtype='U')
BEGIN
    CREATE TABLE Patients (
        userId INT PRIMARY KEY FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        patientCode NVARCHAR(20) UNIQUE NOT NULL,
        age INT NULL,
        bloodGroup NVARCHAR(10) NULL,
        condition NVARCHAR(500) NULL,
        allergies NVARCHAR(MAX) NULL,   -- JSON representation of array
        chronic NVARCHAR(MAX) NULL,     -- JSON representation of array
        currentMeds NVARCHAR(MAX) NULL  -- JSON representation of array
    );

    CREATE INDEX IX_Patients_Code ON Patients(patientCode);
    PRINT '✅ Patients table created successfully';
END
GO

-- 3. Appointments Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Appointments' AND xtype='U')
BEGIN
    CREATE TABLE Appointments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        appointmentCode NVARCHAR(20) UNIQUE NOT NULL,
        patientId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        doctorId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        time NVARCHAR(10) NOT NULL, -- e.g. "09:00"
        date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        reason NVARCHAR(255) NOT NULL,
        status NVARCHAR(20) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Pending', 'Completed', 'Cancelled', 'Delayed')),
        type NVARCHAR(20) DEFAULT 'In-person' CHECK (type IN ('In-person', 'Tele-consult')),
        createdAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX IX_Appointments_Doctor ON Appointments(doctorId);
    CREATE INDEX IX_Appointments_Patient ON Appointments(patientId);
    CREATE INDEX IX_Appointments_Date ON Appointments(date);
    PRINT '✅ Appointments table created successfully';
END
GO

-- 4. Prescriptions Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Prescriptions' AND xtype='U')
BEGIN
    CREATE TABLE Prescriptions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        prescriptionCode NVARCHAR(20) UNIQUE NOT NULL,
        patientId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        doctorId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        items NVARCHAR(MAX) NOT NULL, -- e.g. "Amlodipine 5mg, Atorvastatin 10mg"
        status NVARCHAR(20) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Draft')),
        createdAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX IX_Prescriptions_Patient ON Prescriptions(patientId);
    CREATE INDEX IX_Prescriptions_Doctor ON Prescriptions(doctorId);
    PRINT '✅ Prescriptions table created successfully';
END
GO

-- 5. MedicalRecords Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MedicalRecords' AND xtype='U')
BEGIN
    CREATE TABLE MedicalRecords (
        id INT IDENTITY(1,1) PRIMARY KEY,
        patientId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        doctorId INT NULL FOREIGN KEY REFERENCES Users(id),
        date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        diagnosis NVARCHAR(255) NOT NULL,
        notes NVARCHAR(MAX) NULL,
        type NVARCHAR(50) DEFAULT 'Lab', -- Lab, Cardio, Radiology, etc.
        name NVARCHAR(100) NOT NULL,      -- e.g. "Lipid Profile"
        createdAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX IX_MedicalRecords_Patient ON MedicalRecords(patientId);
    PRINT '✅ MedicalRecords table created successfully';
END
GO

-- 6. Vitals Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Vitals' AND xtype='U')
BEGIN
    CREATE TABLE Vitals (
        id INT IDENTITY(1,1) PRIMARY KEY,
        patientId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        recordedBy INT NULL FOREIGN KEY REFERENCES Users(id),
        date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        bp NVARCHAR(20) NOT NULL, -- e.g. "120/80"
        pulse INT NOT NULL,       -- e.g. 72
        temp DECIMAL(4,1) NOT NULL, -- e.g. 36.6
        spo2 INT NOT NULL,        -- e.g. 98
        createdAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX IX_Vitals_Patient ON Vitals(patientId);
    PRINT '✅ Vitals table created successfully';
END
GO

-- 7. Beds Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Beds' AND xtype='U')
BEGIN
    CREATE TABLE Beds (
        id INT IDENTITY(1,1) PRIMARY KEY,
        bedNumber NVARCHAR(20) NOT NULL UNIQUE,
        roomNumber NVARCHAR(20) NOT NULL,
        wardType NVARCHAR(50) NOT NULL, -- ICU, Ward A, Ward B
        status NVARCHAR(20) DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied', 'Maintenance')),
        patientId INT NULL FOREIGN KEY REFERENCES Users(id),
        admittedAt DATETIME NULL
    );

    PRINT '✅ Beds table created successfully';
END
GO

-- 8. Tasks Table (Nurse tasks, etc.)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tasks' AND xtype='U')
BEGIN
    CREATE TABLE Tasks (
        id INT IDENTITY(1,1) PRIMARY KEY,
        description NVARCHAR(500) NOT NULL,
        assignedTo INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        dueDate DATETIME NOT NULL,
        status NVARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
        patientId INT NULL FOREIGN KEY REFERENCES Users(id),
        createdAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX IX_Tasks_AssignedTo ON Tasks(assignedTo);
    PRINT '✅ Tasks table created successfully';
END
GO

-- 9. Bills Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bills' AND xtype='U')
BEGIN
    CREATE TABLE Bills (
        id INT IDENTITY(1,1) PRIMARY KEY,
        billCode NVARCHAR(20) UNIQUE NOT NULL,
        patientId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        amount DECIMAL(10,2) NOT NULL,
        description NVARCHAR(255) NOT NULL,
        status NVARCHAR(20) DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Pending')),
        createdAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX IX_Bills_Patient ON Bills(patientId);
    PRINT '✅ Bills table created successfully';
END
GO

-- 10. Notifications Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' AND xtype='U')
BEGIN
    CREATE TABLE Notifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        title NVARCHAR(100) NOT NULL,
        body NVARCHAR(255) NOT NULL,
        type NVARCHAR(20) NOT NULL,
        unread BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX IX_Notifications_User ON Notifications(userId);
    PRINT '✅ Notifications table created successfully';
END
GO
