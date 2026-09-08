import { createContext, useState, useContext } from 'react';
import { clearStorage } from './utils/Logout';

// 1. Създаваме Context
const AuthContext = createContext();

// 2. Създаваме Provider компонент
export const AuthProvider = ({ children }) => {
  // Четем от localStorage при стартиране
  const [user, setUser] = useState({
    name: localStorage.getItem('auth_user') || '',
    email: localStorage.getItem('auth_email') || '',
    user_id: localStorage.getItem('auth_user_id') || null
  });

  // Функция за обновяване на потребителя
  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('auth_user', newUser.name);
    localStorage.setItem('auth_email', newUser.email);
    localStorage.setItem('auth_user_id', newUser.user_id);
  };

  // Функция за изход е clearStorage
  // Стойността, която ще бъде достъпна за всички компоненти
  const value = {
    user,
    updateUser,
    clearStorage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Създаваме hook за лесна употреба
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};