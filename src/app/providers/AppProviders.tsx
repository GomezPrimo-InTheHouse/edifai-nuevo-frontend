import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { getTheme } from '../theme/theme';
import { useAuthStore } from '../store/auth.store';
import { NotifyProvider } from '../../shared/context/NotifyContext';
import '../traduction/i18n'; 
import { useTranslation } from 'react-i18next';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function ThemedApp({ children }: { children: React.ReactNode }) {
  const tema = useAuthStore((s) => s.preferencias.tema);
  const idioma = useAuthStore((s) => s.preferencias.idioma);
  const theme = React.useMemo(() => getTheme(tema), [tema]);
  const { i18n } = useTranslation();

  // Sincronizar idioma del store con i18next
  React.useEffect(() => {
    if (i18n.language !== idioma) {
      i18n.changeLanguage(idioma);
    }
  }, [idioma, i18n]);

  React.useEffect(() => {
    console.log('🌐 Idioma store:', idioma, '| i18n.language:', i18n.language);
    if (i18n.language !== idioma) {
      i18n.changeLanguage(idioma);
    }
  }, [idioma, i18n]);

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