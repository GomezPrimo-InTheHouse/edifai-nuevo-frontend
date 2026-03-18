import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // TODO: si se usa
import theme from '../theme/theme';
import { useAuthStore } from '../store/auth.store';

interface AppProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
//       <QueryClientProvider client={queryClient}>
          {children}
//       </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};


// ¿Para qué sirve AppProviders?
// Es un patrón que centraliza todos los "providers" de la app en un solo lugar. Un provider es un componente que pone contexto o configuración global disponible para toda la app debajo suyo. En tu caso:

// ThemeProvider — le da a todos los componentes MUI tu paleta de colores, tipografía y estilos personalizados
// BrowserRouter — habilita el sistema de rutas en toda la app
// QueryClientProvider — habilita TanStack Query para que cualquier página pueda usar useQuery, useMutation, etc.

// Sin AppProviders, cada página tendría que configurar todo eso por su cuenta. Con este patrón, lo configurás una sola vez y toda la app lo hereda.