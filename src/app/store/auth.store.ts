import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  login: async (credentials) => {
    try {
      // TODO: Usar httpClient.post('/auth/login', credentials)
      console.log('Login:', credentials);
      set({ isAuthenticated: true, user: { name: 'User', email: credentials.email } });
      localStorage.setItem('token', 'fake-jwt-token');
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
    localStorage.removeItem('token');
  },
}));
