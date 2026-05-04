


import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  rol_id: number;
  rol_nombre: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}

const getInitialState = () => {
  try {
    const accessToken = localStorage.getItem('edifai_access_token');
    const refreshToken = localStorage.getItem('edifai_refresh_token');
    const userRaw = localStorage.getItem('edifai_user');
    const user: User | null = userRaw ? JSON.parse(userRaw) : null;

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken, user, isAuthenticated: true };
    }
  } catch {
    // localStorage corrupto, iniciar limpio
  }
  return { accessToken: null, refreshToken: null, user: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  setTokens: (accessToken, refreshToken, user) => {
    localStorage.setItem('edifai_access_token', accessToken);
    localStorage.setItem('edifai_refresh_token', refreshToken);
    localStorage.setItem('edifai_user', JSON.stringify(user));
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },

  setAccessToken: (accessToken) => {
    localStorage.setItem('edifai_access_token', accessToken);
    set({ accessToken });
  },

  logout: () => {
    localStorage.removeItem('edifai_access_token');
    localStorage.removeItem('edifai_refresh_token');
    localStorage.removeItem('edifai_user');
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));