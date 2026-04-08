import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as authService from '../utils/authService';
import type { User, LoginPayload, RegisterPayload, UpdateProfilePayload } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateProfilePayload) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ============================================================
// AuthProvider - Quản lý trạng thái Current User toàn ứng dụng
// Chặn User chưa đăng nhập vào ứng dụng
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // Khởi chạy App: Load cached user & try refresh token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await authService.getToken();
        if (token) {
          // Load cached user info first for instant UX
          const cachedUser = await authService.getCachedUserInfo();
          if (cachedUser) {
            setUser(cachedUser);
          }

          // Try to refresh token to validate session is still active
          const refreshResult = await authService.refreshAccessToken();
          if (refreshResult?.success && refreshResult.user) {
            setUser(refreshResult.user);
          } else if (!cachedUser) {
            // No cached user and failed to refresh — session expired
            await authService.removeToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.warn('Lỗi kiểm tra session:', error);
        await authService.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Root Navigation Router Guard
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === ('(auth)' as any);

    // Nếu chưa đăng nhập và cố vào (tabs) -> đá qua Login
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    }
    // Nếu đã đăng nhập nhưng đang đứng ở màn đăng nhập -> quăng vô (tabs)
    else if (user && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [user, segments, isLoading]);

  const login = async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    if (!res.user) throw new Error('Đăng nhập thất bại');
    setUser(res.user);
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    if (!res.user) throw new Error('Đăng ký thất bại');
    // Backend trả về token + user ngay sau register, auto login
    setUser(res.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  /** Cập nhật profile cho user hiện tại */
  const updateUser = async (data: UpdateProfilePayload) => {
    if (!user) throw new Error('Chưa đăng nhập');
    const updatedUser = await authService.updateProfile(user.id, data);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  /** Refresh lại thông tin user từ server */
  const refreshUser = async () => {
    if (!user) return;
    try {
      const freshUser = await authService.getUserById(user.id);
      if (freshUser) {
        setUser(freshUser);
        await authService.storeUserInfo(freshUser);
      }
    } catch (error) {
      console.warn('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
