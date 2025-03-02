import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const migrationsDir = path.join(__dirname);

// Create a connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'llm_ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'Accenture@123',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Create migrations table if it doesn't exist
const ensureMigrationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
};

// Get applied migrations from the database
const getAppliedMigrations = async () => {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
};

// Run migrations
const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`Found ${appliedMigrations.length} previously applied migrations`);
    
    // Read migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order
    
    // Apply pending migrations
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`Applying migration: ${file}`);
        
        // Read and apply migration
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Begin transaction
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Run the migration
          await client.query(sql);
          
          // Record the migration
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          
          await client.query('COMMIT');
          console.log(`Successfully applied migration: ${file}`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        } finally {
          client.release();
        }
      } else {
        console.log(`Skipping already applied migration: ${file}`);
      }
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration process failed:', error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
};

// Run migrations directly if this script is executed
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration process failed:', err);
      process.exit(1);
    });
}

export default runMigrations;