import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoginState {
  isLoggedIn: boolean;
  loginType: 'qr' | 'cookie' | null;
  lastLoginTime: number | null;
  setLoggedIn: (status: boolean, type: 'qr' | 'cookie') => void;
  logout: () => void;
}

export const useLoginStore = create<LoginState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      loginType: null,
      lastLoginTime: null,
      setLoggedIn: (status: boolean, type: 'qr' | 'cookie') =>
        set({
          isLoggedIn: status,
          loginType: type,
          lastLoginTime: status ? Date.now() : null,
        }),
      logout: () =>
        set({
          isLoggedIn: false,
          loginType: null,
          lastLoginTime: null,
        }),
    }),
    {
      name: 'login-storage',
    }
  )
); 