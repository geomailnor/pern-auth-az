import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

// Зареждаме променливите от .env файла
dotenv.config();

// Създаваме връзка с базата данни
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Нужно е за Neon
  }
});

export default pool;

