import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function onSubmitForm(e) {
    e.preventDefault();

    if (!email.includes('@') || !email.includes('.')) {
      toast.error('Въведете валиден имейл');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });

      toast.success(response.data.message || 'Проверете имейла си');
      setIsSubmitted(true);
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data?.message || 'Грешка при заявка');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" onSubmit={onSubmitForm}>
        <h2>🔑 Забравена парола</h2>

        {isSubmitted ? (
          <div className="success-message">
            <p>✅ Ако този имейл съществува, ще получите линк за възстановяване.</p>
            <p>Проверете пощата си (и спам папката).</p>
            <Link to="/login" className="back-link">← Обратно към вход</Link>
          </div>
        ) : (
          <>
            <p className="forgot-info">
              Въведете имейла, с който сте се регистрирали. Ще получите линк за нова парола.
            </p>

            <div className="input-wrapper">
              <label htmlFor="forgot-email">Имейл:</label>
              <input
                id="forgot-email"
                type="email"
                className="user-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Въведете вашия имейл"
                autoFocus
                required
              />
            </div>

            <button type="submit" className="forgot-btn" disabled={isLoading}>
              {isLoading ? '⏳ Изпращане...' : 'Изпрати линк'}
            </button>

            <div className="forgot-links">
              <Link to="/login">← Обратно към вход</Link>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ForgotPassword;