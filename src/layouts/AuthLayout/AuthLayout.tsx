import React from 'react';
import { Box, Paper } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/graficas/edifai_login_bg.svg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundColor: '#0F172A',
        p: 2,
        zIndex: 9999,
        overflowY: 'auto',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/graficas/edifai_logo_sin_fondo.png"
            alt="EdifAI"
            style={{ width: '100%', maxWidth: 260, height: 'auto' }}
          />
        </Box>

        {children}
      </Paper>
    </Box>
  );
};