import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ⭐ Brevo API конфигурация
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// ⭐ Функция за изпращане на верификационен имейл чрез Brevo
export const sendVerificationEmail = async (email, token) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const verificationLink = `${baseUrl}/api/auth/verify-email/${token}`;

  // ⭐ Данни за имейла според изискванията на Brevo API
  const emailData = {
    sender: {
      name: 'Моите бележки',
      email: process.env.SMTP_USER || 'geomailnor@gmail.com'
    },
    to: [{ email: email }],
    subject: 'Потвърдете своя имейл адрес',
    htmlContent: `
      <h1>Добре дошли в "Моите бележки"!</h1>
      <p>Моля, кликнете върху линка, за да потвърдите своя имейл адрес:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>Този линк е валиден 24 часа.</p>
      <p>Ако не сте се регистрирали, игнорирайте това съобщение.</p>
    `
  };

  try {
    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      }
    });

    console.log(`✅ Имейл за верификация изпратен на ${email} чрез Brevo`);
    return response.data;
  } catch (error) {
    console.error('❌ Грешка при изпращане на имейл чрез Brevo:');
    if (error.response) {
      console.error('📝 Детайли от Brevo:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw new Error('Неуспешно изпращане на имейл');
  }
};