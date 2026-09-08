import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Създаваме транспортер (който ще изпраща имейлите)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true за порт 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2. Функция за изпращане на верификационен имейл
export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5000/api/auth/verify-email/${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Потвърдете своя имейл адрес',
    html: `
      <h1>Добре дошли в "Моите бележки"!</h1>
      <p>Моля, кликнете върху линка, за да потвърдите своя имейл адрес: </p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>Този линк е валиден 24 часа.</p>
      <p>Ако не сте се регистрирали, игнорирайте това съобщение.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Имейл за верификация изпратен на ${email}`);
  } catch (error) {
    console.error('❌ Грешка при изпращане на имейл:', error);
    throw new Error('Неуспешно изпращане на имейл');
  }
};