import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import './db.js';
import createTables from "./database.js";
import authRoutes from './routes/auth.js';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Създаваме таблиците при стартиране
createTables();

// =============================================
// 📍 МАРШРУТИ ОТ AUTH ПРОЕКТА
// =============================================
app.use('/api/auth', authRoutes);

// =============================================
// 📍 МАРШРУТИ ОТ TODO ПРОЕКТА (копирани от todo/server/index.js)
// =============================================

// Create a bel
app.post('/bels', async (req, res) => {
  try {
    const { description, user_id } = req.body;
    const newBel = await pool.query(
      'INSERT INTO bel (description, user_id) VALUES($1,$2) RETURNING *',
      [description, user_id]
    );
    res.json(newBel.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Грешка в сървъра' });
  }
});

// Get all bels
app.get('/bels', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: 'Липсва user_id' });
    }
    const allBels = await pool.query(
      'SELECT * FROM bel WHERE user_id=$1 ORDER BY bel_id DESC',
      [user_id]
    );
    res.json(allBels.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Грешка в сървъра' });
  }
});

// Get a bel
app.get('/bels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: 'Липсва user_id' });
    }
    const oneBel = await pool.query(
      'SELECT * FROM bel WHERE bel_id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (oneBel.rows.length === 0) {
      return res.status(404).json({ message: "Бележката не е намерена или не е на този потребител" });
    }
    res.json(oneBel.rows[0]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Грешка в сървъра' });
  }
});

// Update a bel
app.put('/bels/:id', async (req, res) => {
  try {
    const { description } = req.body;
    const { id } = req.params;
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: 'Липсва user_id' });
    }
    const checkBel = await pool.query(
      'SELECT * FROM bel WHERE bel_id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (checkBel.rows.length === 0) {
      return res.status(404).json({ message: 'Бележката не е намерена или не е на този потребител' });
    }
    const updBel = await pool.query(
      'UPDATE bel SET description = $1 WHERE bel_id = $2 RETURNING *',
      [description, id]
    );
    res.json(updBel.rows[0]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Грешка в сървъра" });
  }
});

// Delete a bel
app.delete('/bels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: 'Липсва user_id' });
    }
    const checkBel = await pool.query(
      'SELECT * FROM bel WHERE bel_id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (checkBel.rows.length === 0) {
      return res.status(404).json({ message: 'Бележката не е намерена или не е на този потребител' });
    }
    const delBel = await pool.query(
      'DELETE FROM bel WHERE bel_id = $1 RETURNING *',
      [id]
    );
    res.json({ message: '✅ Бележката е изтрита успешно!', deleted: delBel.rows[0] });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Грешка в сървъра" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Сървърът работи на http://localhost:${PORT}`);
});