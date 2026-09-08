import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";
import oko1 from '../assets/oko1.png';
import oko2 from '../assets/oko2.png';
import Spinner from "./Spinner";
import { API_URL } from '../config';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const passwordRef = useRef(null);
  const [pasvisible, setPasvisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();



  useEffect(() => {
    passwordRef.current?.focus();
  }, [pasvisible]);

  function validateForm() {
    const newErrors = {};

    if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Въведете валиден имейл';
    }
    if (password.length < 6) {
      newErrors.password = 'Паролата да е поне 6 символа!';
    }
    if (password !== confirmPass) {
      newErrors.confirmPass = 'Паролите не съвпадат';
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
      const body = { username: username, email: email, password: password };
      const result = await axios.post(`${API_URL}/auth/register`, body);
      const { user } = result.data;

      updateUser({
        name: user.username,
        email: user.email,
        user_id: user.user_id
      });

      // toast.success('Успешна регистрация! Моля, проверете имейла си за потвърждение.');

      // ⭐ Изчистваме формата
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPass('');

      // Пренасочваме към login стр.
      // navigate('/login');
      navigate('/login?message=✅ Регистрацията е успешна! Моля, проверете имейла си и кликнете върху линка за потвърждение. Можете да затворите този прозорец.');

    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data?.message || '❌ Грешка при регистрация');
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="register-form" onSubmit={onSubmitForm}>
      <div className="vsichko-wrapper">
        <h2>Register Form</h2>
        <div className="input-wrapper">
          <label htmlFor="user-ime">User name:</label>
          <input autoFocus id="user-ime" type="text" className="user-name" value={username} onChange={e => setUsername(e.target.value)} />

          <label htmlFor="user-post">Email:</label>
          <input id="user-post" type="text" className="user-email" value={email} onChange={e => setEmail(e.target.value)} />

          <label htmlFor="user-parola">Password:</label>

          <div className="pass-wrapper">
            <input id="user-parola" ref={passwordRef} type={pasvisible ? 'text' : 'password'} className="user-password" value={password} onChange={e => setPassword(e.target.value)} />

            <button type="button" className="show-pass-btn" onClick={() => setPasvisible(!pasvisible)}>
              <img
                src={pasvisible ? oko2 : oko1}
                alt={pasvisible ? 'Скрий парола' : 'Покажи парола'}
                width="22"
                height="20"
              />
            </button>
          </div>
          <label htmlFor="confirm-parola">Confirm password:</label>
          <div className="pass-wrapper">
            <input id="confirm-parola" type={pasvisible ? 'text' : 'password'} className="user-password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="input-btn" disabled={isLoading}>{isLoading ? <Spinner /> : 'Регистрация'}</button>
      </div>
    </form>
  );
}
export default Register;