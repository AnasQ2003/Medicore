const { executeQuery } = require('../config/db');

class Appointment {
  static async findAll(filters = {}) {
    let query = `
      SELECT a.*, 
             p.name AS patientName, p.email AS patientEmail, pat.patientCode AS patientCode,
             d.name AS doctorName, d.email AS doctorEmail
      FROM Appointments a
      INNER JOIN Users p ON a.patientId = p.id
      INNER JOIN Patients pat ON p.id = pat.userId
      INNER JOIN Users d ON a.doctorId = d.id
      WHERE 1=1
    `;
    const params = {};

    if (filters.doctorId) {
      query += ` AND a.doctorId = @doctorId`;
      params.doctorId = filters.doctorId;
    }

    if (filters.patientId) {
      query += ` AND a.patientId = @patientId`;
      params.patientId = filters.patientId;
    }

    if (filters.date) {
      query += ` AND a.date = @date`;
      params.date = filters.date;
    }

    query += ` ORDER BY a.date DESC, a.time ASC`;
    const result = await executeQuery(query, params);
    
    // Map backend field names to frontend mock fields if needed
    return result.recordset.map(r => ({
      id: r.appointmentCode, // Return code as id to match frontend (A-201, etc.)
      dbId: r.id,            // True database integer ID
      patientId: r.patientId,
      patient: r.patientName,
      patientCode: r.patientCode,
      doctorId: r.doctorId,
      doctor: r.doctorName,
      time: r.time,
      date: r.date.toISOString().split('T')[0],
      reason: r.reason,
      status: r.status,
      type: r.type
    }));
  }

  static async create(apptData) {
    const { patientId, doctorId, time, date, reason, type } = apptData;
    
    // Generate code A-XXX
    const countQuery = `SELECT COUNT(*) as count FROM Appointments`;
    const countRes = await executeQuery(countQuery);
    const code = `A-${200 + countRes.recordset[0].count + 1}`;

    const query = `
      INSERT INTO Appointments (appointmentCode, patientId, doctorId, time, date, reason, status, type)
      OUTPUT INSERTED.*
      VALUES (@code, @patientId, @doctorId, @time, @date, @reason, 'Confirmed', @type)
    `;

    const result = await executeQuery(query, {
      code, patientId, doctorId, time, date: date || new Date().toISOString().split('T')[0], reason, type: type || 'In-person'
    });

    return result.recordset[0];
  }

  static async updateStatus(code, status, newTime = null) {
    let query = `
      UPDATE Appointments 
      SET status = @status
    `;
    const params = { code, status };

    if (newTime) {
      query += `, time = @newTime`;
      params.newTime = newTime;
    }

    query += ` WHERE appointmentCode = @code`;
    await executeQuery(query, params);
  }

  static async delete(code) {
    const query = `DELETE FROM Appointments WHERE appointmentCode = @code`;
    const result = await executeQuery(query, { code });
    return result.rowsAffected[0] > 0;
  }
}

module.exports = Appointment;
