import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

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
        {/* Logo JSX — sin fondo oscuro */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <svg width="52" height="52" viewBox="-90 -90 180 180" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,-90 77.9,-45 77.9,45 0,90 -77.9,45 -77.9,-45" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinejoin="round"/>
            <polygon points="0,-67 58,-33.5 58,33.5 0,67 -58,33.5 -58,-33.5" fill="none" stroke="rgba(15,23,42,0.3)" strokeWidth="2" strokeLinejoin="round"/>
            <polygon points="0,-40 40,-20 0,0 -40,-20" fill="rgba(15,23,42,0.18)" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round"/>
            <polygon points="-40,-20 0,0 0,40 -40,20" fill="rgba(15,23,42,0.06)" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round"/>
            <polygon points="0,0 40,-20 40,20 0,40" fill="rgba(15,23,42,0.12)" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          <Box>
            <Typography sx={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#0F172A' }}>
              Edif<span style={{ color: '#F59E0B' }}>AI</span>
            </Typography>
            <Typography sx={{ fontSize: 10, letterSpacing: '0.25em', color: '#64748B', fontWeight: 600 }}>
              GESTIÓN DE OBRAS
            </Typography>
          </Box>
        </Box>

        {children}
      </Paper>
    </Box>
  );
};