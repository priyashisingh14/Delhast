import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { setAccessToken } from '../api/apiClient';

const getStoredAuth = () => {
  try {
    const storedUser = localStorage.getItem('delhast_auth_user');
    const storedToken = localStorage.getItem('delhast_auth_token');
    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      setAccessToken(storedToken);
      return {
        user,
        accessToken: storedToken,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true
      };
    }
  } catch {}
  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: true
  };
};

const initialAuth = getStoredAuth();

export const useAuthStore = create((set, get) => ({
  user: initialAuth.user,
  accessToken: initialAuth.accessToken,
  isAuthenticated: initialAuth.isAuthenticated,
  isLoading: initialAuth.isLoading,
  isInitialized: initialAuth.isInitialized,

  // Set authenticated user and access token
  setAuth: (user, token) => {
    setAccessToken(token);
    try {
      if (user) localStorage.setItem('delhast_auth_user', JSON.stringify(user));
      if (token) localStorage.setItem('delhast_auth_token', token);
    } catch {}
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true
    });
  },

  // Initialize auth state by checking active 30-day refresh session cookie
  initAuth: async () => {
    try {
      const data = await authApi.refreshSession();
      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        try {
          if (data.user) localStorage.setItem('delhast_auth_user', JSON.stringify(data.user));
          localStorage.setItem('delhast_auth_token', data.accessToken);
        } catch {}
        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true
        });
        return true;
      }
    } catch {
      // If we already had valid credentials in storage, retain them
      const storedToken = localStorage.getItem('delhast_auth_token');
      if (!storedToken) {
        setAccessToken(null);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        });
      } else {
        set({ isLoading: false, isInitialized: true });
      }
      return false;
    }
  },

  // Sign in
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authApi.signIn(email, password);
      if (data.success) {
        get().setAuth(data.user, data.accessToken);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials or server error.';
      set({ isLoading: false });
      return { success: false, message };
    }
  },

  // Log out
  logout: async () => {
    try {
      await authApi.signOut();
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      try {
        localStorage.removeItem('delhast_auth_user');
        localStorage.removeItem('delhast_auth_token');
      } catch {}
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true
      });
    }
  }
}));
