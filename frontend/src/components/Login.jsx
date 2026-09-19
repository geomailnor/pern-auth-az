import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useAuth } from '../AuthContext';
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import oko1 from '../assets/oko1.png';
import oko2 from '../assets/oko2.png';
import Spinner from "./Spinner";
import { API_URL } from '../config';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef(null);
  const [pasvisible, setPasvisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  // ⭐ Четем съобщението от URL параметър при зареждане
  const [message, setMessage] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('message') || '';
  });

  // ⭐ Изчистваме URL-то и настройваме автоматично скриване
  useEffect(() => {
    if (message) {
      // Изчистваме URL-то, за да не остане при презареждане
      window.history.replaceState({}, document.title, '/login');

      // Автоматично скриване след 8 секунди
      const timer = setTimeout(() => {
        setMessage('');
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    passwordRef.current?.focus();
  }, [pasvisible]);

  function validateForm() {
    const newErrors = {};
    if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Въведете валиден имейл';
    }
    return newErrors;
  }

  async function onSubmitForm(e) {
    e.preventDefault();

    const greshki = validateForm();
    const errorMessages = Object.values(greshki);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0]);
      return;
    }

    setIsLoading(true);
    try {
      const body = { email: email, password: password };
      const response = await axios.post(`${API_URL}/auth/login`, body);
      const { token, user } = response.data;
      toast.success('Успешен вход 👍');

      if (rememberMe) {
        localStorage.setItem('auth_token', token);
      } else {
        sessionStorage.setItem('auth_token', token);
      }

      updateUser({
        name: user.username,
        email: user.email,
        user_id: user.user_id
      });

      navigate('/');
      setEmail('');
      setPassword('');

    } catch (error) {
      console.error(error.message);
      const errorMsg = error.response?.data?.message || 'Грешка при влизане';
      toast.error(errorMsg);

      // ⭐ Ако грешката е за непотвърден имейл - показваме бутона за повторно изпращане
      if (error.response?.status === 403 && errorMsg.includes('потвърдете')) {
        setShowResend(true);
        setResendEmail(email); // Попълваме имейла автоматично
      }
    } finally {
      setIsLoading(false);
    }
  }
  async function handleResendVerification() {
    setResendLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/resend-verification`,
        { email: resendEmail }
      );

      toast.success(response.data.message);
      setShowResend(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Грешка при изпращане');
    } finally {
      setResendLoading(false);
    }
  }
  return (
    <form className="login-form" onSubmit={onSubmitForm}>
      <div className="vsichko-wrapper">
        <h2>Login</h2>

        {/* ⭐ Съобщение за успешна регистрация */}
        {message && (
          <div className="registration-message">
            <div className="registration-message-text">{message}</div>
            <button
              type="button"
              className="registration-message-close"
              onClick={() => setMessage('')}
            >
              &times;
            </button>
          </div>
        )}
        {/* ⭐ Бутон за повторно изпращане на верификационен имейл */}
        {showResend && (
          <div className="resend-verification">
            <p>Не сте получили имейл за потвърждение?</p>
            <div className="resend-form">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Въведете имейла си"
                className="user-email"
              />
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="resend-btn"
              >
                {resendLoading ? '⏳ Изпращане...' : '📧 Изпрати ми нов линк'}
              </button>
            </div>
            <button
              type="button"
              className="resend-close"
              onClick={() => setShowResend(false)}
            >
              ×
            </button>
          </div>
        )}

        <div className="input-wrapper">
          <label htmlFor="user-post">Email:</label>
          <input
            autoFocus
            id="user-post"
            type="text"
            className="user-email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label htmlFor="user-parola">Password:</label>
          <div className="pass-wrapper">
            <input
              id="user-parola"
              ref={passwordRef}
              type={pasvisible ? 'text' : 'password'}
              className="user-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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

          <div className="remember-me-div">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Запомни ме</label>
          </div>
        </div>

        <div className="forgot-password-link">
          <Link to="/forgot-password">Забравена парола?</Link>
        </div>

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Влез'}
        </button>
      </div>
    </form>
  );
}

export default Login;