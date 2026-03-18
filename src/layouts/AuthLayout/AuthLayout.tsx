import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

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
        background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)',
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
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0F172A',
            }}
          >
            EdifAI
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#64748B', mt: 0.5 }}
          >
            Gestión inteligente de obras
          </Typography>
        </Box>

        {children}
      </Paper>
    </Box>
  );
};