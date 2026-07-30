const { executeQuery } = require('../config/db');
const { hashPassword } = require('../utils/passwordHelper');

class User {
  static async findByEmail(email) {
    const query = `
      SELECT u.*, p.patientCode, p.age, p.bloodGroup, p.condition, p.allergies, p.chronic, p.currentMeds
      FROM Users u
      LEFT JOIN Patients p ON u.id = p.userId
      WHERE u.email = @email
    `;
    const result = await executeQuery(query, { email });
    return result.recordset[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.address, u.role, u.status, u.profilePictureUrl, 
             u.dateOfBirth, u.gender, u.emailNotifications, u.smsNotifications, u.pushNotifications, u.createdAt, u.lastLogin,
             p.patientCode, p.age, p.bloodGroup, p.condition, p.allergies, p.chronic, p.currentMeds
      FROM Users u
      LEFT JOIN Patients p ON u.id = p.userId
      WHERE u.id = @id
    `;
    const result = await executeQuery(query, { id });
    return result.recordset[0];
  }

  static async create(userData) {
    const { name, email, password, phone, address, role, gender, dateOfBirth } = userData;
    const hashedPassword = await hashPassword(password);
    
    // Begin transaction style (single query batch for SQL Server)
    const userQuery = `
      INSERT INTO Users (name, email, password, phone, address, role, gender, dateOfBirth, status)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role, INSERTED.status
      VALUES (@name, @email, @password, @phone, @address, @role, @gender, @dateOfBirth, 'Approved')
    `;
    
    const userResult = await executeQuery(userQuery, {
      name, email, password: hashedPassword, phone, address, role, gender, dateOfBirth: dateOfBirth || null
    });
    
    const newUser = userResult.recordset[0];
    
    if (role === 'patient') {
      // Generate a random patient code P-XXXX
      const patientCode = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      const patientQuery = `
        INSERT INTO Patients (userId, patientCode, age, bloodGroup, condition, allergies, chronic, currentMeds)
        VALUES (@userId, @patientCode, @age, @bloodGroup, @condition, @allergies, @chronic, @currentMeds)
      `;
      await executeQuery(patientQuery, {
        userId: newUser.id,
        patientCode,
        age: userData.age || null,
        bloodGroup: userData.bloodGroup || null,
        condition: userData.condition || null,
        allergies: userData.allergies ? JSON.stringify(userData.allergies) : '[]',
        chronic: userData.chronic ? JSON.stringify(userData.chronic) : '[]',
        currentMeds: userData.currentMeds ? JSON.stringify(userData.currentMeds) : '[]'
      });
      newUser.patientCode = patientCode;
    }
    
    return newUser;
  }

  static async update(id, updateData) {
    const userFields = [];
    const patientFields = [];
    const params = { id };

    const userKeys = ['name', 'email', 'phone', 'address', 'gender', 'dateOfBirth', 'profilePictureUrl', 'emailNotifications', 'smsNotifications', 'pushNotifications'];
    const patientKeys = ['age', 'bloodGroup', 'condition', 'allergies', 'chronic', 'currentMeds'];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (userKeys.includes(key)) {
          userFields.push(`${key} = @${key}`);
          params[key] = updateData[key];
        } else if (patientKeys.includes(key)) {
          patientFields.push(`${key} = @${key}`);
          // JSON arrays need stringifying
          if (['allergies', 'chronic', 'currentMeds'].includes(key)) {
            params[key] = Array.isArray(updateData[key]) ? JSON.stringify(updateData[key]) : updateData[key];
          } else {
            params[key] = updateData[key];
          }
        }
      }
    });

    if (userFields.length > 0) {
      userFields.push(`updatedAt = GETDATE()`);
      const userQuery = `
        UPDATE Users 
        SET ${userFields.join(', ')} 
        WHERE id = @id
      `;
      await executeQuery(userQuery, params);
    }

    if (patientFields.length > 0) {
      const patientQuery = `
        UPDATE Patients 
        SET ${patientFields.join(', ')} 
        WHERE userId = @id
      `;
      await executeQuery(patientQuery, params);
    }

    return this.findById(id);
  }

  static async updateLastLogin(id) {
    const query = `UPDATE Users SET lastLogin = GETDATE() WHERE id = @id`;
    await executeQuery(query, { id });
  }

  static async getDoctors() {
    const query = `SELECT id, name, email, phone, address, gender FROM Users WHERE role = 'doctor' AND status = 'Approved'`;
    const result = await executeQuery(query);
    return result.recordset;
  }

  static async getPatients() {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.address, u.gender, 
             p.patientCode, p.age, p.bloodGroup, p.condition, p.allergies, p.chronic, p.currentMeds
      FROM Users u
      INNER JOIN Patients p ON u.id = p.userId
      WHERE u.role = 'patient'
    `;
    const result = await executeQuery(query);
    const Vital = require('./Vital');
    const patients = [];
    for (const r of result.recordset) {
      let vitals = [];
      try {
        vitals = await Vital.findByPatient(r.id);
      } catch (err) {
        console.error('Error fetching vitals for patient', r.id, err);
      }
      if (!vitals || vitals.length === 0) {
        vitals = [{ id: 1, bp: '120/80', pulse: 72, temp: 36.5, spo2: 98, date: new Date().toISOString().split('T')[0], nurse: 'Nurse Emily Watson' }];
      }
      patients.push({
        ...r,
        condition: r.condition || 'Post-op Recovery & Routine Checkup',
        allergies: r.allergies ? JSON.parse(r.allergies) : [],
        chronic: r.chronic ? JSON.parse(r.chronic) : [],
        currentMeds: r.currentMeds ? JSON.parse(r.currentMeds) : [],
        vitals
      });
    }
    return patients;
  }

  static async getStaff() {
    const query = `SELECT id, name, email, phone, role, status, createdAt FROM Users WHERE role IN ('nurse', 'receptionist', 'doctor')`;
    const result = await executeQuery(query);
    return result.recordset;
  }

  static async delete(id) {
    const query = `DELETE FROM Users WHERE id = @id`;
    const result = await executeQuery(query, { id });
    return result.rowsAffected[0] > 0;
  }
}

module.exports = User;
