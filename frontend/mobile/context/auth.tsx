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
// AuthProvider - Quáº£n lÃ½ tráº¡ng thÃ¡i Current User toÃ n á»©ng dá»¥ng
// Cháº·n User chÆ°a Ä‘Äƒng nháº­p vÃ o á»©ng dá»¥ng
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // Khá»Ÿi cháº¡y App: Load cached user & try refresh token
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
            // No cached user and failed to refresh â€” session expired
            await authService.removeToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.warn('Lá»—i kiá»ƒm tra session:', error);
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
    const currentAuthScreen = segments[1] as string | undefined;
    const requiresEmailVerification = Boolean(user?.email) && !user?.isEmailVerified;
    const isVerifyScreen = currentAuthScreen === 'verify-email';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (user && inAuthGroup) {
      if (!requiresEmailVerification && !isVerifyScreen) {
        router.replace('/(tabs)' as any);
      }
    }
  }, [user, segments, isLoading]);

  const login = async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    if (!res.user) throw new Error('ÄÄƒng nháº­p tháº¥t báº¡i');
    setUser(res.user);
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    if (!res.user) throw new Error('ÄÄƒng kÃ½ tháº¥t báº¡i');
    // Backend tráº£ vá» token + user ngay sau register, auto login
    setUser(res.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  /** Cáº­p nháº­t profile cho user hiá»‡n táº¡i */
  const updateUser = async (data: UpdateProfilePayload) => {
    if (!user) throw new Error('ChÆ°a Ä‘Äƒng nháº­p');
    const updatedUser = await authService.updateProfile(user.id, data);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  /** Refresh láº¡i thÃ´ng tin user tá»« server */
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

