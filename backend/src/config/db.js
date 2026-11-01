import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  // Optional: max connections in the pool (default 10)
  // max: 10,
});

// Verify the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
    return;
  }
  console.log('PostgreSQL connected successfully');
  release();
});

export default pool;
