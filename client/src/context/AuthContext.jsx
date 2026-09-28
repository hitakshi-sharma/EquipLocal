import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user session on page load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const meRes = await authService.getMe();
        const userData =
          meRes.data?.user ||
          meRes.data?.data?.user ||
          meRes.data?.data ||
          meRes.data;
        if (userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login user and save token in cookie
  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const payload = res.data?.data || res.data || res;
    const authUser = payload.user || payload;
    const token = payload.accessToken || payload.token;
    if (token) {
      Cookies.set('accessToken', token, {
        expires: 1,
        secure:
          typeof window !== 'undefined' &&
          window.location.protocol === 'https:',
        sameSite: 'Strict',
      });
    }
    setUser(authUser);
    return authUser;
  };

  // Register new user
  const register = async (userData) => {
    const res = await authService.register(userData);
    return res.data || res;
  };

  // Verify email OTP
  const verifyOtp = async (email, otp) => {
    const res = await authService.verifyOtp({ email, otp });
    const payload = res.data?.data || res.data || res;
    const authUser = payload.user || payload;
    const token = payload.accessToken || payload.token;
    if (token) {
      Cookies.set('accessToken', token, {
        expires: 1,
        secure:
          typeof window !== 'undefined' &&
          window.location.protocol === 'https:',
        sameSite: 'Strict',
      });
    }
    setUser(authUser);
    return authUser;
  };

  // Resend email OTP
  const resendOtp = async (email) => {
    const res = await authService.resendOtp({ email });
    return res.data || res;
  };

  // Logout user and clear cookie
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      Cookies.remove('accessToken');
      setUser(null);
    }
  };

  const isOwner = user?.role === 'owner';
  const isRenter = user?.role === 'renter' || user?.role === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        isOwner,
        isRenter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
