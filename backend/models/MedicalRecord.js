const { executeQuery } = require('../config/db');

class MedicalRecord {
  static async findByPatient(patientId) {
    const query = `
      SELECT mr.*, d.name AS doctorName
      FROM MedicalRecords mr
      LEFT JOIN Users d ON mr.doctorId = d.id
      WHERE mr.patientId = @patientId
      ORDER BY mr.date DESC
    `;
    const result = await executeQuery(query, { patientId });
    return result.recordset.map(r => ({
      id: r.id,
      patientId: r.patientId,
      doctorId: r.doctorId,
      doctor: r.doctorName || 'Laboratory / Imaging',
      date: r.date.toISOString().split('T')[0],
      diagnosis: r.diagnosis,
      notes: r.notes,
      type: r.type,
      name: r.name
    }));
  }

  static async create(recordData) {
    const { patientId, doctorId, diagnosis, notes, type, name } = recordData;
    const query = `
      INSERT INTO MedicalRecords (patientId, doctorId, date, diagnosis, notes, type, name)
      OUTPUT INSERTED.*
      VALUES (@patientId, @doctorId, CAST(GETDATE() AS DATE), @diagnosis, @notes, @type, @name)
    `;
    const result = await executeQuery(query, {
      patientId, doctorId: doctorId || null, diagnosis, notes: notes || '', type: type || 'Consultation', name
    });
    return result.recordset[0];
  }
}

module.exports = MedicalRecord;
