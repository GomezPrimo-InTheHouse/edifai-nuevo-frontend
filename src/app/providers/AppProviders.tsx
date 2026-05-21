// src/app/providers/AppProviders.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { getTheme } from '../theme/theme';
import { useAuthStore } from '../store/auth.store';
import { NotifyProvider } from '../../shared/context/NotifyContext';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function ThemedApp({ children }: { children: React.ReactNode }) {
  const tema = useAuthStore((s) => s.preferencias.tema);
  const theme = React.useMemo(() => getTheme(tema), [tema]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemedApp>
          <NotifyProvider>
            {children}
          </NotifyProvider>
        </ThemedApp>
      </BrowserRouter>
    </QueryClientProvider>
  );
};