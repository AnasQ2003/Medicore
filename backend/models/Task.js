const { executeQuery } = require('../config/db');

class Task {
  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, u.name AS patientName, n.name AS nurseName
      FROM Tasks t
      LEFT JOIN Users u ON t.patientId = u.id
      INNER JOIN Users n ON t.assignedTo = n.id
      WHERE 1=1
    `;
    const params = {};

    if (filters.assignedTo) {
      query += ` AND t.assignedTo = @assignedTo`;
      params.assignedTo = filters.assignedTo;
    }

    query += ` ORDER BY t.dueDate ASC`;
    const result = await executeQuery(query, params);
    return result.recordset;
  }

  static async create(taskData) {
    const { description, assignedTo, dueDate, patientId } = taskData;
    const query = `
      INSERT INTO Tasks (description, assignedTo, dueDate, status, patientId)
      OUTPUT INSERTED.*
      VALUES (@description, @assignedTo, @dueDate, 'Pending', @patientId)
    `;
    const result = await executeQuery(query, {
      description, assignedTo, dueDate, patientId: patientId || null
    });
    return result.recordset[0];
  }

  static async updateStatus(id, status) {
    const query = `UPDATE Tasks SET status = @status WHERE id = @id`;
    await executeQuery(query, { id, status });
  }
}

module.exports = Task;
