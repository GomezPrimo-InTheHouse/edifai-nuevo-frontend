import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotifyProvider } from '../../shared/context/NotifyContext';
import theme from '../theme/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <NotifyProvider>
            {children}
          </NotifyProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};