import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import oko1 from '../assets/oko1.png';
import oko2 from '../assets/oko2.png';
import './ResetPassword.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pasvisible, setPasvisible] = useState(false);

  async function onSubmitForm(e) {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Паролата трябва да е поне 6 символа');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Паролите не съвпадат');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${API_URL}/auth/reset-password/${token}`,
        { newPassword }
      );

      setTimeout(() => {
        navigate('/login?message=✅ Паролата е променена успешно! Моля, влезте с новата парола.');
      }, 1500);

    } catch (error) {
      console.error(error.message);
      const errorMsg = error.response?.data?.message || 'Грешка при смяна на паролата';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="reset-password-container">
      <form className="reset-password-form" onSubmit={onSubmitForm}>
        <h2>🔐 Нова парола</h2>
        <p className="reset-info">Въведете новата си парола.</p>

        <div className="input-wrapper">
          <label htmlFor="new-password">Нова парола:</label>
          <div className="pass-wrapper">
            <input
              id="new-password"
              type={pasvisible ? 'text' : 'password'}
              className="user-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Поне 6 символа"
              autoFocus
              required
            />
            <button
              type="button"
              className="show-login-btn"
              onClick={() => setPasvisible(!pasvisible)}
            >
              <img
                src={pasvisible ? oko2 : oko1}
                alt={pasvisible ? 'Скрий парола' : 'Покажи парола'}
                width="22"
                height="20"
              />
            </button>
          </div>

          <label htmlFor="confirm-password">Потвърди паролата:</label>
          <div className="pass-wrapper">
            <input
              id="confirm-password"
              type={pasvisible ? 'text' : 'password'}
              className="user-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Въведете паролата отново"
              required
            />
          </div>
        </div>

        <button type="submit" className="reset-btn" disabled={isLoading}>
          {isLoading ? '⏳ Запазване...' : 'Запази новата парола'}
        </button>

        <div className="reset-links">
          <Link to="/login">← Обратно към вход</Link>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;