import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from 'services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('access_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedUser, token } = await authService.login(email, password);
    localStorage.setItem('access_token', token);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await authService.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = { children: PropTypes.node };
