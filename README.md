# Belezhki – Моите бележки

PERN stack приложение за управление на задачи с имейл верификация.

## Технологии
- Frontend: React + Vite (Vercel)
- Backend: Node.js + Express (Render)
- База данни: PostgreSQL (Neon)
- Имейли: Brevo API
- Автентикация: JWT
- Хостинг: Vercel (frontend), Render (backend)

## URL-и
- Frontend: https://belezhki.vercel.app
- Backend: https://pern-auth-az.onrender.com

## Функционалности
- ✅ Регистрация с верификация на имейл
- ✅ Вход с JWT
- ✅ CRUD на бележки
- ✅ Профил (име, парола, изтриване)
- ✅ Забравена парола
- ✅ Повторно изпращане на верификационен имейл
- ✅ Автоматично почистване на непотвърдени потребители

# 📝 Belezhki – Моите бележки

PERN stack приложение за управление на задачи с имейл верификация.

## 🚀 Демо

- **Frontend:** https://belezhki.vercel.app
- **Backend:** https://pern-auth-az.onrender.com

## 🛠️ Технологии

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **База данни:** PostgreSQL (Neon)
- **Имейли:** Brevo API
- **Автентикация:** JWT
- **Хостинг:** Vercel (frontend), Render (backend)

## ✨ Функционалности

- ✅ Регистрация с потвърждение на имейл
- ✅ Вход с JWT токени
- ✅ Управление на бележки (добавяне, редакция, изтриване)
- ✅ Профил (промяна на име, смяна на парола, изтриване на акаунт)
- ✅ Забравена парола с имейл линк
- ✅ Повторно изпращане на верификационен имейл
- ✅ Автоматично почистване на непотвърдени потребители


### Backend
cd backend
npm install
npm run dev

### Frontend
cd frontend
npm install
npm run dev

🔐 Environment Variables
Backend (.env)
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=таен_ключ...
SMTP_USER=имейл@gmail.com
BREVO_API_KEY=brevo_ключ
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173


Frontend (.env)
VITE_API_URL=http://localhost:5000/api

Struktura
pern-auth-az/
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── db.js
│   ├── email.js
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   └── config.js
│   └── package.json
└── README.md