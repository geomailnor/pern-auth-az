export function clearStorage() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_email');
  localStorage.removeItem('auth_user_id');

  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
  sessionStorage.removeItem('auth_email');
  sessionStorage.removeItem('auth_user_id');
}

export function handleLogout(navigate) {
  clearStorage();
  navigate('/login');
}

