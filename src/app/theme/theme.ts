// src/app/theme/theme.ts
import { createTheme, type Theme } from '@mui/material/styles';

export const getTheme = (modo: 'light' | 'dark'): Theme => createTheme({
  palette: {
    mode: modo,
    primary:    { main: '#F59E0B', contrastText: '#0F172A' },
    secondary:  { main: '#0F172A', contrastText: '#FFFFFF' },
    background: {
      default: modo === 'dark' ? '#0F172A' : '#F8FAFC',
      paper:   modo === 'dark' ? '#1E293B' : '#FFFFFF',
    },
    text: {
      primary:   modo === 'dark' ? '#F8FAFC' : '#0F172A',
      secondary: modo === 'dark' ? '#94A3B8' : '#64748B',
    },
    error:   { main: '#DC2626' },
    success: { main: '#16A34A' },
    warning: { main: '#F59E0B' },
    info:    { main: '#2563EB' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightBold: 700,
    h6: { fontWeight: 700 },
    body2: { fontWeight: 500 },
    caption: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton:    { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, borderRadius: 10 } } },
    MuiChip:      { styleOverrides: { root: { fontWeight: 700 } } },
    MuiCard:      { styleOverrides: { root: { boxShadow: 'none', border: '1px solid', borderColor: modo === 'dark' ? '#1E293B' : '#E2E8F0' } } },
    MuiPaper:     { styleOverrides: { root: { boxShadow: 'none' } } },
    MuiTab:       { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 700, color: '#64748B', backgroundColor: modo === 'dark' ? '#1E293B' : '#F8FAFC' } } },
  },
});