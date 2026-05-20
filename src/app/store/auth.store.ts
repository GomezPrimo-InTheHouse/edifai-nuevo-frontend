


// import { create } from 'zustand';

// interface User {
//   id: number;
//   email: string;
//   rol_id: number;
//   rol_nombre: string;
// }

// interface AuthState {
//   accessToken: string | null;
//   refreshToken: string | null;
//   user: User | null;
//   isAuthenticated: boolean;
//   setTokens: (accessToken: string, refreshToken: string, user: User) => void;
//   setAccessToken: (accessToken: string) => void;
//   logout: () => void;
// }

// const getInitialState = () => {
//   try {
//     const accessToken = localStorage.getItem('edifai_access_token');
//     const refreshToken = localStorage.getItem('edifai_refresh_token');
//     const userRaw = localStorage.getItem('edifai_user');
//     const user: User | null = userRaw ? JSON.parse(userRaw) : null;

//     if (accessToken && refreshToken) {
//       return { accessToken, refreshToken, user, isAuthenticated: true };
//     }
//   } catch {
//     // localStorage corrupto, iniciar limpio
//   }
//   return { accessToken: null, refreshToken: null, user: null, isAuthenticated: false };
// };

// export const useAuthStore = create<AuthState>((set) => ({
//   ...getInitialState(),

//   setTokens: (accessToken, refreshToken, user) => {
//     localStorage.setItem('edifai_access_token', accessToken);
//     localStorage.setItem('edifai_refresh_token', refreshToken);
//     localStorage.setItem('edifai_user', JSON.stringify(user));
//     set({ accessToken, refreshToken, user, isAuthenticated: true });
//   },

//   setAccessToken: (accessToken) => {
//     localStorage.setItem('edifai_access_token', accessToken);
//     set({ accessToken });
//   },

//   logout: () => {
//     localStorage.removeItem('edifai_access_token');
//     localStorage.removeItem('edifai_refresh_token');
//     localStorage.removeItem('edifai_user');
//     set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
//   },
// }));

import { create } from 'zustand';
import { type UserPreferencias, PREFERENCIAS_DEFAULT } from '../../modules/configuracion/types/preferencias.types';

export interface User {
  id: number;
  email: string;
  rol_id: number;
  rol_nombre: string;
  onboarding_completado: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  preferencias: UserPreferencias;

  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  setOnboardingCompletado: () => void;
  setPreferencias: (p: Partial<UserPreferencias>) => void;
  logout: () => void;
}

const getInitialState = () => {
  try {
    const accessToken  = localStorage.getItem('edifai_access_token');
    const refreshToken = localStorage.getItem('edifai_refresh_token');
    const userRaw      = localStorage.getItem('edifai_user');
    const prefRaw      = localStorage.getItem('edifai_preferencias');
    const user: User | null = userRaw ? JSON.parse(userRaw) : null;
    const preferencias: UserPreferencias = prefRaw ? JSON.parse(prefRaw) : PREFERENCIAS_DEFAULT;

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken, user, isAuthenticated: true, preferencias };
    }
  } catch {
    // localStorage corrupto
  }
  return {
    accessToken: null, refreshToken: null,
    user: null, isAuthenticated: false,
    preferencias: PREFERENCIAS_DEFAULT,
  };
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

  // Marca onboarding como completado en el store y localStorage
  setOnboardingCompletado: () => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, onboarding_completado: true };
      localStorage.setItem('edifai_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  setPreferencias: (p) => {
    set((state) => {
      const updated = { ...state.preferencias, ...p };
      localStorage.setItem('edifai_preferencias', JSON.stringify(updated));
      return { preferencias: updated };
    });
  },

  logout: () => {
    localStorage.removeItem('edifai_access_token');
    localStorage.removeItem('edifai_refresh_token');
    localStorage.removeItem('edifai_user');
    localStorage.removeItem('edifai_preferencias');
    set({
      accessToken: null, refreshToken: null,
      user: null, isAuthenticated: false,
      preferencias: PREFERENCIAS_DEFAULT,
    });
  },
}));