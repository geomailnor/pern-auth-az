import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../email.js';

// Проверка за логнати потребители (в края)
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📝 РЕГИСТРАЦИЯ НА НОВ ПОТРЕБИТ.
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Проверка дали потребителят вече съществува
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: 'Потребител с този имейл или име вече съществува!'
      });
    }

    // 2. Хеширане на паролата
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Запазване в базата данни
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING user_id, username, email, created_at`,
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];

    // user е създаден, сега създавам verifi токен
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 час
    // const tokenExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 минута

    // Запазваме токена в базата
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expiry = $2 WHERE user_id = $3',
      [verificationToken, tokenExpiry, newUser.user_id]
    );

    // ⭐ Изпращаме имейл с линк за потвърждение
    try {
      await sendVerificationEmail(newUser.email, verificationToken);
      console.log(`✅ Имейл изпратен на ${newUser.email}`);
    } catch (emailError) {
      console.error('❌ Грешка при изпращане на имейл:', emailError);
      // Не спираме регистрацията, само логваме грешката
    }
    // 4. Създаване на JWT токен

    // 5. Отговор към клиента
    res.status(201).json({
      message: '✅ Регистрацията е успешна. Моля, потвърдете своя имейл!',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('❌ Грешка при регистрация:', error);
    res.status(500).json({ message: 'Грешка в сървъра' });
  }
});


// 🔑 ЛОГИН
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Търсим потребителя по имейл
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // 2. Ако няма такъв потребител
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Грешен имейл или парола' });
    }

    const user = result.rows[0];


    // ⭐ 2a. Проверка за потвърден имейл
    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Моля, потвърдете своя имейл, преди да влезете.'
      });
    }
    // 3. Проверяваме паролата
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    // 4. Ако паролата не е валидна
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Грешен имейл или парола' });
    }

    // 5. Създаваме JWT токен
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Връщаме успешен отговор
    res.json({
      message: '✅ Успешен вход',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('❌ Грешка при логин:', error);
    res.status(500).json({ message: 'Грешка в сървъра' });
  }
});

// 👓 МАРШРУТ ✅ ПОТВЪРЖДАВАНЕ НА ИМЕЙЛ
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    // 1. Търсим потребителя по токен
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );

    // 2. Ако няма такъв токен
    if (result.rows.length === 0) {
      // Проверяваме дали този токен не е стар (вече потвърден)
      const oldResult = await pool.query(
        'SELECT * FROM users WHERE old_verification_token = $1',
        [token]
      );
      if (oldResult.rows.length > 0) {
        // Вече е потвърден
        return res.redirect(
          `http://localhost:5173/login?message=✅ Имейлът вече е потвърден! Моля, влезте.`
        );
      }
      // Ако няма запис - невалиден токен
      return res.redirect(
        `http://localhost:5173/login?message=❌ Невалиден линк за потвърждение.`
      );
    }

    const user = result.rows[0];

    // 3. Проверяваме дали токенът е изтекъл
    if (user.verification_token_expiry && new Date() > user.verification_token_expiry) {
      return res.redirect(
        `http://localhost:5173/login?message=❌ Линкът за потвърждение е изтекъл. Моля, регистрирайте се отново.`
      );
    }

    // 4. Ако вече е потвърден - пренасочваме към Login с успех
    if (user.is_verified) {
      return res.redirect(
        `http://localhost:5173/login?message=✅ Имейлът вече е потвърден! Моля, влезте.`
      );
    }

    // 5. Потвърждаваме имейла  - запазваме токена в old_verification_token
    await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL, old_verification_token = verification_token, verification_token_expiry = NULL WHERE user_id = $1',
      [user.user_id]
    );

    // 6. Пренасочваме към Login с успех
    res.redirect(
      `http://localhost:5173/login?message=✅ Имейлът е потвърден успешно! Моля, влезте.`
    );

  } catch (error) {
    console.error('❌ Грешка при потвърждение:', error);
    res.redirect(
      `http://localhost:5173/login?message=❌ Грешка при потвърждение. Моля, опитайте отново.`
    );
  }
});

// 🔒 ЗАЩИТЕН МАРШРУТ - само за логнати потребители
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.user идва от middleware-а
    const result = await pool.query(
      'SELECT user_id, username, email, created_at FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Потребителят не е намерен' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('❌ Грешка при зареждане на потребител:', error);
    res.status(500).json({ message: 'Грешка в сървъра' });
  }
});

// 📝 ОБНОВЯВАНЕ НА ПРОФИЛ
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.user_id;

    // Проверка дали имейлът не е зает от друг потребител
    const emailExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND user_id != $2',
      [email, userId]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({ message: 'Този имейл вече се използва от друг потребител' });
    }

    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE user_id = $3 RETURNING user_id, username, email',
      [name, email, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Потребителят не е намерен' });
    }
    res.json({
      name: result.rows[0].username,
      email: result.rows[0].email
    });
  } catch (error) {
    console.error('❌ Грешка при обновяване на профил:', error);
    res.status(500).json({ message: 'Грешка в сървъра' });
  }
});

// 🔑 СМЯНА НА ПАРОЛА
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // 1. Намираме потребителя
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Потребителят не е намерен' });
    }

    const user = result.rows[0];

    // 2. Проверяваме текущата парола
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Текущата парола е грешна' });
    }

    // 3. Хешираме новата парола
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 4. Обновяваме паролата в базата
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: '✅ Паролата е променена успешно' });
  } catch (error) {
    console.error('❌ Грешка при смяна на парола:', error);
    res.status(500).json({ message: 'Грешка в сървъра' });
  }
});

// 🗑️ ИЗТРИВАНЕ НА ПРОФИЛ
router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Изтриваме потребителя
    const result = await pool.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING user_id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Потребителят не е намерен' });
    }

    res.json({ message: '✅ Профилът е изтрит успешно' });
  } catch (error) {
    console.error('❌ Грешка при изтриване на профил:', error);
    res.status(500).json({ message: 'Грешка в сървъра' });
  }
});
// ✅ ПОТВЪРЖДАВАНЕ НА ИМЕЙЛ
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Търсим потребител с този токен
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );

    // 2. Ако няма такъв токен - връщаме обща грешка
    if (result.rows.length === 0) {
      return res.status(400).json({
        message: 'Невалиден или изтекъл линк за потвърждение'
      });
    }

    const user = result.rows[0];

    // 3. Ако вече е потвърден - просто казваме, че е успешно (без излишни детайли)
    if (user.is_verified) {
      return res.json({
        message: '✅ Имейлът е потвърден успешно!'
      });
    }

    // 4. Потвърждаваме имейла
    await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE user_id = $1',
      [user.user_id]
    );

    res.json({
      message: '✅ Имейлът е потвърден успешно!'
    });

  } catch (error) {
    console.error('❌ Грешка при потвърждение на имейл:', error);
    res.status(500).json({ message: 'Грешка в сървъра' });
  }
});

export default router;