/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext(null);

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
};

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(getStoredUser);
  const [initializing, setInitializing] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthHeader(null);
    setToken(null);
    setUser(null);
  }, []);

  const saveAuth = useCallback((nextUser, nextToken) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setAuthHeader(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const fetchUser = useCallback(async () => {
    const { data } = await axios.get(`${API_BASE_URL}/auth/me`);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        clearAuth();
        setInitializing(false);
        return;
      }

      setAuthHeader(storedToken);

      try {
        await fetchUser();
        setToken(storedToken);
      } catch {
        clearAuth();
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, [clearAuth, fetchUser]);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
      device_name: 'deliverx-web',
    });

    saveAuth(data.user, data.token);
    return data.user;
  }, [saveAuth]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`);
      }
    } finally {
      clearAuth();
    }
  }, [clearAuth, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      userRole: user?.role || null,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      fetchUser,
    }),
    [token, user, initializing, login, logout, fetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
