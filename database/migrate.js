const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const config = {
  user: process.env.DB_USER || 'nodeuser',
  password: process.env.DB_PASSWORD || 'node1234',
  server: process.env.DB_HOST || 'AnasHP-02',
  database: process.env.DB_NAME || 'MedicoreDB',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true // Crucial for local dev SQL Server certificates
  }
};

const migrations = [
  { type: 'migration', file: 'migrations/001_create_tables.sql' },
  { type: 'seed', file: 'seeds/002_seed_data.sql' }
];

async function runSQLScript(pool, filePath) {
  try {
    const sqlScript = fs.readFileSync(filePath, 'utf8');

    // Split on GO and filter empty batches
    const batches = sqlScript
      .split(/^\s*GO\s*$/im)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    for (const batch of batches) {
      await pool.request().query(batch);
    }

    console.log(`✅ Run Successful: ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`❌ Error running script ${path.basename(filePath)}:`, err.message);
    throw err;
  }
}

async function runAll() {
  console.log('🚀 Starting database migrations and seeding for MediCore DB...\n');
  console.log('Connection Config:', {
    server: config.server,
    database: config.database,
    user: config.user,
    port: config.port
  });
  
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('🔌 Connected to SQL Server successfully.');
    
    for (const item of migrations) {
      const fullPath = path.join(__dirname, item.file);
      if (fs.existsSync(fullPath)) {
        await runSQLScript(pool, fullPath);
      } else {
        console.warn(`⚠️ Warning: Script file not found: ${fullPath}`);
      }
    }

    console.log('\n🎉 All database setup steps completed successfully!');
  } catch (err) {
    console.error('❌ Database migration process failed:', err.message);
  } finally {
    if (pool) await pool.close();
    process.exit(0);
  }
}

runAll();
