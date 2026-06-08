

import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Divider,
  Button,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { LogOut, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../app/store/auth.store';
import { logoutApi } from '../services/api/auth.api';

interface UserMenuPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({ anchorEl, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, logout, refreshToken } = useAuthStore();
  const open = Boolean(anchorEl);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  const handleLogout = async () => {
    if (refreshToken) {
      await logoutApi(refreshToken, user?.email ?? '');
    }
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            width: 280,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      {/* Header  */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, background: '#0F172A' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#F59E0B', color: '#0F172A', fontSize: 13, fontWeight: 700 }}>
          {initials}
        </Avatar>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
              {user?.email ?? '—'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Shield size={11} color="#F59E0B" />
              <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
                {user?.rol_nombre ?? '—'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Datos del usuario */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', letterSpacing: '0.07em', mb: 1.5 }}>
          {t('user_menu.info_cuenta')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
          <Mail size={14} color={theme.palette.text.secondary} />
          <Box>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              {t('user_menu.email')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 500 }}>
              {user?.email ?? '—'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Shield size={14} color={theme.palette.text.secondary} />
          <Box>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              {t('user_menu.rol')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 500 }}>
              {user?.rol_nombre ?? '—'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Logout */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<LogOut size={16} />}
          sx={{
            justifyContent: 'flex-start',
            color: '#DC2626',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 2,
            px: 1.5,
            '&:hover': { backgroundColor: 'rgba(220,38,38,0.07)' },
          }}
        >
          {t('user_menu.cerrar_sesion')}
        </Button>
      </Box>
    </Popover>
  );
};