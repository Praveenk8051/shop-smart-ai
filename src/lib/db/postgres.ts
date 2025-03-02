import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'llm_ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'Accenture@123',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Log queries in development mode
const logQuery = (query: string, params: any[], duration: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Query took ${duration}ms:`, query, params);
  }
};

// Helper function for queries with logging
export const query = async (text: string, params: any[] = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logQuery(text, params, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logQuery(text, params, duration);
    throw error;
  }
};

// Helper for single-row queries
export const querySingle = async (text: string, params: any[] = []) => {
  const result = await query(text, params);
  return result.rows[0];
};

// Helper for transactions
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default {
  query,
  querySingle,
  transaction,
  pool
};