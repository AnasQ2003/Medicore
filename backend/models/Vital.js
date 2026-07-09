const { executeQuery } = require('../config/db');

class Vital {
  static async findByPatient(patientId) {
    const query = `
      SELECT v.*, n.name AS nurseName
      FROM Vitals v
      LEFT JOIN Users n ON v.recordedBy = n.id
      WHERE v.patientId = @patientId
      ORDER BY v.date DESC, v.createdAt DESC
    `;
    const result = await executeQuery(query, { patientId });
    return result.recordset.map(r => ({
      id: r.id,
      patientId: r.patientId,
      nurse: r.nurseName || 'System',
      date: r.date.toISOString().split('T')[0],
      bp: r.bp,
      pulse: r.pulse,
      temp: parseFloat(r.temp),
      spo2: r.spo2
    }));
  }

  static async create(vitalData) {
    const { patientId, recordedBy, bp, pulse, temp, spo2 } = vitalData;
    const query = `
      INSERT INTO Vitals (patientId, recordedBy, date, bp, pulse, temp, spo2)
      OUTPUT INSERTED.*
      VALUES (@patientId, @recordedBy, CAST(GETDATE() AS DATE), @bp, @pulse, @temp, @spo2)
    `;
    const result = await executeQuery(query, {
      patientId, recordedBy, bp, pulse, temp, spo2
    });
    return result.recordset[0];
  }
}

module.exports = Vital;
