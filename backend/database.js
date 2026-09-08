// 
import pool from './db.js';

const createTables = async () => {
  try {
    // 1. Създаваме таблицата за потребители (users) – ако не съществува
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255) UNIQUE,
        verification_token_expiry TIMESTAMP,
        old_verification_token VARCHAR(255) UNIQUE,
        reset_token VARCHAR(255) UNIQUE,
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Имаме таблица "users"');

    // 2. Създаваме таблицата за задачи (bel) – ако не съществува
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bel (
        bel_id SERIAL PRIMARY KEY,
        description VARCHAR(255),
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Имаме таблица "bel"');

  } catch (error) {
    console.error('❌ Грешка при създаване на таблиците:', error.message);
  }
};

export default createTables;