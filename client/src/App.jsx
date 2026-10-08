import { useState } from 'react';
import Auth from './Auth.jsx';
import Dashboard from './Dashboard.jsx';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return user ? <Dashboard user={user} onLogout={logout} /> : <Auth onAuth={login} />;
}
