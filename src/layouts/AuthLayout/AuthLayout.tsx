import React from 'react';
import { Box, Paper } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/graficas/edifai_login_bg.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 2,
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
        {/* Logo dentro del card */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <img
            src="/graficas/edifai_logo_dark_navy.svg"
            alt="EdifAI"
            style={{ width: '100%', maxWidth: 340, height: 'auto' }}
          />
        </Box>

        {children}
      </Paper>
    </Box>
  );
};