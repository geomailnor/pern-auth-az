import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { handleLogout } from "../utils/Logout";
import oko1 from '../assets/oko1.png';
import oko2 from '../assets/oko2.png';
import { API_URL } from '../config';

function Profile() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const passwordRef = useRef(null);
  const [pasvisible, setPasvisible] = useState(false);
  const firstInputRef = useRef(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  function getUser() {
    return localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
  }
  function getEmail() {
    return localStorage.getItem('auth_email') || sessionStorage.getItem('auth_email');
  }
  function openEditModal() {
    setEditFormData({
      name: localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user') || '',
      email: localStorage.getItem('auth_email') || sessionStorage.getItem('auth_email') || ''
    });
    setShowEditModal(true);
  }
  async function handleUpdateProfile(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await axios.put(`${API_URL}/auth/me`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = response.data;
      localStorage.setItem('auth_user', updatedUser.name);
      localStorage.setItem('auth_email', updatedUser.email);

      // ⭐ Вземаме user_id от localStorage (за да не се загуби)
      const userId = localStorage.getItem('auth_user_id') || sessionStorage.getItem('auth_user_id');

      // 👇 Обновяваме - ВКЛЮЧИТЕЛНО user_id
      updateUser({
        name: updatedUser.name,
        email: updatedUser.email,
        user_id: userId
      });

      setShowEditModal(false);
      toast.success('Профилът е обновен успешно!');
    } catch (error) {
      console.error('Грешка при обновяване');
      toast.error(error.response?.data?.message || 'Грешка при обновяване на профила');
    }
  }
  async function handleChangePassword(e) {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Новите пароли не съвпадат!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Паролата трябва да е поне 6 символа');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      await axios.put(`${API_URL}/auth/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Паролата е променена успешно!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Грешка при промяна на парола:', error);
      toast.error(error.response?.data?.message || 'Грешка при промяна на паролата');
    }
  };

  async function handleDeleteProfile() {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      await axios.delete(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Профилът е изтрит успешно');

      // Изтриваме всичко от localStorage и пренасочваме към login
      handleLogout(navigate);

    } catch (error) {
      console.error('Грешка при изтриване:', error);
      toast.error('Грешка при изтриване на профила');
    }
  };

  useEffect(() => {
    if (!showEditModal) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeEditModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEditModal, closeEditModal]);

  useEffect(() => {
    if (showEditModal) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showEditModal]);

  useEffect(() => {
    if (!showEditModal) return;

    const modalElement = document.querySelector('.modal-frm');
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    requestAnimationFrame(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else {
        const input = modalElement.querySelector('input, button');
        if (input) input.focus();
      }
    });

    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [showEditModal]);

  useEffect(() => {
    passwordRef.current?.focus();
  }, [pasvisible]);

  return (
    <div className="profile-container">
      <h2 className="profile-title">👤 Моят Профил</h2>

      {/* Информация за профила */}
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-field">
            <label>Име:</label>
            <p>{getUser()}</p>
          </div>
          <div className="profile-field">
            <label>Имеил:</label>
            <p>{getEmail()}</p>
          </div>
          <button
            className="profile-edit-btn"
            onClick={openEditModal}
            title="Редактиране на профила"
          >
            ✏️ Редактирай профил
          </button>
        </div>
      </div>

      {/* 🟢 МОДАЛ ЗА РЕДАКТИРАНЕ */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-frm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeEditModal}>
              &times;
            </button>
            <h2>✏️ Редактиране на профил</h2>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="edit-name">Име</label>
                <input
                  id="edit-name"
                  ref={firstInputRef}
                  className="input input-modal"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Въведете име..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-email">Имейл</label>
                <input
                  id="edit-email"
                  className="input input-modal"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="Въведете имейл..."
                  required
                />
              </div>

              <div className="modal-btns">
                <button type="submit" className="save-btn" title='Запазва промените'>
                  💾 Запази
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  title='Отказва промените'
                  onClick={closeEditModal}
                >
                  ❌ Отказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Смяна на парола */}
      <div className="profile-card">
        <h3>🔑 Смяна на парола</h3>
        <form onSubmit={handleChangePassword} className="profile-form">
          <div className="form-group">
            <label>Текуща парола</label>
            <div className='pass-wrapper'>
              <input
                type={pasvisible ? 'text' : 'password'}
                className='user-password'
                // value={}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                ref={passwordRef}
              />
              <button type='button' className='show-login-btn' onClick={() => setPasvisible(!pasvisible)}>
                <img src={pasvisible ? oko2 : oko1}
                  title={pasvisible ? 'скрий' : 'покажи'}
                  alt={pasvisible ? 'Скрий парола' : 'Покажи парола'}
                  width="22"
                  height="18"
                />
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Нова парола</label>
            <input
              type={pasvisible ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Потвърди нова парола</label>
            <input
              type={pasvisible ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="password-btn" title='Променя паролата'>🔄 Промени парола</button>
        </form>
      </div>
      {/*⚠️ Изтриване на профил */}
      <div className="profile-card danger-card">
        <h3>⚠️ Опасна зона</h3>
        <p className="danger-text">
          Изтриването на профила е необратимо! Всички ваши задачи ще бъдат загубени.
        </p>
        {!showDeleteConfirm ? (
          <button
            className="danger-btn"
            onClick={() => setShowDeleteConfirm(true)}
            title='Изтрива завинаги профила !'
          >
            🗑️ Изтрий профил
          </button>
        ) : (
          <div className="delete-confirm">
            <p className="confirm-text">Сигурни ли сте? Това действие е необратимо!</p>
            <div className="delete-confirm-actions">
              <button
                className="danger-btn confirm-yes"
                onClick={handleDeleteProfile}
              >
                ✅ Да, изтрий
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ❌ Отказ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Profile;