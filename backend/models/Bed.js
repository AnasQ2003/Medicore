const { executeQuery } = require('../config/db');

class Bed {
  static async findAll() {
    const query = `
      SELECT b.*, u.name AS patientName
      FROM Beds b
      LEFT JOIN Users u ON b.patientId = u.id
      ORDER BY b.bedNumber ASC
    `;
    const result = await executeQuery(query);
    return result.recordset;
  }

  static async updateStatus(id, status, patientId = null) {
    const admittedAt = status === 'Occupied' ? 'GETDATE()' : 'NULL';
    const query = `
      UPDATE Beds 
      SET status = @status, 
          patientId = @patientId,
          admittedAt = ${admittedAt}
      WHERE id = @id
    `;
    await executeQuery(query, { id, status, patientId: patientId || null });
  }
}

module.exports = Bed;
