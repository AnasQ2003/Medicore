const { executeQuery } = require('../config/db');

class Prescription {
  static async findAll(filters = {}) {
    let query = `
      SELECT rx.*, 
             p.name AS patientName,
             d.name AS doctorName
      FROM Prescriptions rx
      INNER JOIN Users p ON rx.patientId = p.id
      INNER JOIN Users d ON rx.doctorId = d.id
      WHERE 1=1
    `;
    const params = {};

    if (filters.doctorId) {
      query += ` AND rx.doctorId = @doctorId`;
      params.doctorId = filters.doctorId;
    }

    if (filters.patientId) {
      query += ` AND rx.patientId = @patientId`;
      params.patientId = filters.patientId;
    }

    query += ` ORDER BY rx.date DESC`;
    const result = await executeQuery(query, params);

    return result.recordset.map(r => ({
      id: r.prescriptionCode,
      dbId: r.id,
      patientId: r.patientId,
      patient: r.patientName,
      doctorId: r.doctorId,
      doctor: r.doctorName,
      date: r.date.toISOString().split('T')[0],
      items: r.items,
      status: r.status
    }));
  }

  static async create(rxData) {
    const { patientId, doctorId, items, status } = rxData;

    // Generate RX-XXX code
    const countQuery = `SELECT COUNT(*) as count FROM Prescriptions`;
    const countRes = await executeQuery(countQuery);
    const code = `RX-${900 + countRes.recordset[0].count + 1}`;

    const query = `
      INSERT INTO Prescriptions (prescriptionCode, patientId, doctorId, date, items, status)
      OUTPUT INSERTED.*
      VALUES (@code, @patientId, @doctorId, CAST(GETDATE() AS DATE), @items, @status)
    `;

    const result = await executeQuery(query, {
      code, patientId, doctorId, items, status: status || 'Draft'
    });

    return result.recordset[0];
  }

  static async updateStatus(code, status) {
    const query = `UPDATE Prescriptions SET status = @status WHERE prescriptionCode = @code`;
    await executeQuery(query, { code, status });
  }
}

module.exports = Prescription;
