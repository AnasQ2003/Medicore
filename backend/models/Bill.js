const { executeQuery } = require('../config/db');

class Bill {
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, u.name AS patientName
      FROM Bills b
      INNER JOIN Users u ON b.patientId = u.id
      WHERE 1=1
    `;
    const params = {};

    if (filters.patientId) {
      query += ` AND b.patientId = @patientId`;
      params.patientId = filters.patientId;
    }

    query += ` ORDER BY b.date DESC`;
    const result = await executeQuery(query, params);
    
    return result.recordset.map(r => ({
      id: r.billCode,
      dbId: r.id,
      patientId: r.patientId,
      patientName: r.patientName,
      date: r.date.toISOString().split('T')[0],
      amount: parseFloat(r.amount),
      description: r.description,
      status: r.status
    }));
  }

  static async create(billData) {
    const { patientId, amount, description } = billData;

    // Generate B-XXX bill code
    const countQuery = `SELECT COUNT(*) as count FROM Bills`;
    const countRes = await executeQuery(countQuery);
    const code = `B-${300 + countRes.recordset[0].count + 1}`;

    const query = `
      INSERT INTO Bills (billCode, patientId, date, amount, description, status)
      OUTPUT INSERTED.*
      VALUES (@code, @patientId, CAST(GETDATE() AS DATE), @amount, @description, 'Unpaid')
    `;

    const result = await executeQuery(query, {
      code, patientId, amount, description
    });

    return result.recordset[0];
  }

  static async updateStatus(code, status) {
    const query = `UPDATE Bills SET status = @status WHERE billCode = @code`;
    await executeQuery(query, { code, status });
  }
}

module.exports = Bill;
