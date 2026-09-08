import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../AuthContext';
import { handleLogout } from '../utils/Logout.js';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const vProfilaSme = location.pathname === '/profile';
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const isAuthenticated = !!token;

  return (
    <nav>
      <ul className="navbar-list">

        {/* Ако НЕ е логнат → показва Login и Register */}
        {!isAuthenticated && (
          <>
            <li className="header-item">
              <NavLink to='/login'>Login</NavLink>
            </li>
            <li className="header-item">
              <NavLink to='/register'>Register</NavLink>
            </li>
          </>
        )}
        {/* Ако Е логнат → показва име, профил и бутон за изход */}
        {isAuthenticated && (
          <>
            <li className="header-item">
              <span className="username-display">{user.name}</span>
            </li>
            <li className="header-item">
              <NavLink to={vProfilaSme ? '/' : '/profile'}>
                <span title={vProfilaSme ? 'Връщане към Dashboard' : 'Преглед на профила'}>{vProfilaSme ? '⬅️ Назад' : '👤 Профил'}</span>
              </NavLink>
            </li>
            <li className="header-item">
              <button onClick={() => handleLogout(navigate)} className="logout-btn">
                Изход
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
export default Navbar;