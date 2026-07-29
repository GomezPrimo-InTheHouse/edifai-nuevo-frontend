// src/modules/dashboard/components/DashboardShared.tsx
import React from 'react';
import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';

// DashboardShared.tsx — reemplaza formatMoney por esta versión compacta

export const formatMoney = (value: number): string => {
  const abs = Math.abs(value);
  let compact = String(value);

  if (abs >= 1_000_000) {
    compact = trimZero(value / 1_000_000) + 'M';
  } else if (abs > 9999) {
    compact = trimZero(value / 1_000) + 'K';
  } else {
    compact = value.toLocaleString('es-AR');
  }

  return `$ ${compact}`;
};

const trimZero = (n: number): string => {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
};

export function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24)  return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)}d`;
}

export function KpiCard({
  icon, label, value, sub, color = '#F59E0B', onClick,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color?: string; onClick?: () => void;
}) {
  const theme = useTheme();
  return (
    <Card elevation={0} onClick={onClick} sx={{
      borderRadius: 3, border: `1px solid ${theme.palette.divider}`,
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s',
      '&:hover': onClick ? { borderColor: color, boxShadow: `0 0 0 1px ${color}22` } : {},
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </Typography>
            {sub && <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>{sub}</Typography>}
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: `${color}18`, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}