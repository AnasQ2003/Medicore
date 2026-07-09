const sql = require('mssql');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  user: process.env.DB_USER || 'nodeuser',
  password: process.env.DB_PASSWORD || 'node1234',
  server: process.env.DB_HOST || 'AnasHP-02',
  database: process.env.DB_NAME || 'MedicoreDB',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true, // Crucial for local dev environments
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

const connectDB = async () => {
  try {
    if (pool) {
      return pool;
    }

    pool = await sql.connect(dbConfig);
    console.log('🔌 SQL Server Connected Successfully (MediCore DB)');
    return pool;
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return pool;
};

const executeQuery = async (query, params = {}) => {
  try {
    const activePool = await connectDB();
    const request = activePool.request();
    
    // Add parameters to the query
    Object.keys(params).forEach(key => {
      const val = params[key];
      // SQL Server driver fails if we pass 'undefined' - must be 'null' or a value
      request.input(key, val === undefined ? null : val);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('❌ Query Execution Error:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  getPool,
  executeQuery,
  sql
};
