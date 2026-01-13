import pg from 'pg'
import { config } from 'dotenv'
config()
const { Pool } = pg;

// export const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     max: 20,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 2000,
// });

// pool.on('connect', () => {
//     console.log('Connected to PostgreSQL database');
// });

// pool.on('error', (err) => {
//     console.error('Unexpected database error:', err);
//     process.exit(-1);
// });

export const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon free tier and most cloud providers
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Successfully connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});
