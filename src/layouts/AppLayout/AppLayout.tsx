import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar, Collapse,
  useTheme,
} from '@mui/material';
import {
  Menu, Dashboard, Construction, Group, Inventory2,
  AssignmentTurnedIn, ReceiptLong,
  KeyboardArrowDown, KeyboardArrowUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEspecialidadesList } from '../../modules/trabajadores/hooks/useEspecialidades';
import { UserMenuPopover } from '../../components/UserMenuPopover';
import { useAuthStore } from '../../app/store/auth.store';
import { NotificacionesPopover } from '../../components/NotificacionesPopover';
import { AppBreadcrumbs } from '../../shared/components/AppBreadcrumbs/AppBreadcrumbs';
import { ConfiguracionPopover } from '../../components/ConfiguracionPopover';

interface AppLayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

const drawerWidth = 250;
const ROLES_ADMIN = [1, 3, 4, 6];

function NavItem({ label, icon, isActive, onClick, indent = false }: {
  label: string; icon?: React.ReactNode; path?: string;
  isActive: boolean; onClick: () => void; indent?: boolean;
}) {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton onClick={onClick} sx={{
        borderRadius: 3, minHeight: indent ? 36 : 44,
        px: 1.5, pl: indent ? 2.5 : 1.5,
        backgroundColor: isActive ? 'rgba(245,158,11,0.16)' : 'transparent',
        color: isActive ? '#FFFFFF' : indent ? '#94A3B8' : '#CBD5E1',
        '&:hover': { backgroundColor: isActive ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.05)' },
      }}>
        {icon && (
          <ListItemIcon sx={{ minWidth: 34, color: isActive ? '#F59E0B' : '#94A3B8' }}>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText primary={label}
          primaryTypographyProps={{ fontSize: indent ? 12 : 13, fontWeight: isActive ? 700 : 500 }} />
      </ListItemButton>
    </ListItem>
  );
}

function NavDropdown({ label, icon, isActive, isOpen, onToggle, children }: {
  label: string; icon: React.ReactNode; isActive: boolean;
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton onClick={onToggle} sx={{
          borderRadius: 3, minHeight: 44, px: 1.5,
          backgroundColor: isActive ? 'rgba(245,158,11,0.16)' : 'transparent',
          color: isActive ? '#FFFFFF' : '#CBD5E1',
          '&:hover': { backgroundColor: isActive ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.05)' },
        }}>
          <ListItemIcon sx={{ minWidth: 34, color: isActive ? '#F59E0B' : '#94A3B8' }}>
            {icon}
          </ListItemIcon>
          <ListItemText primary={label}
            primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }} />
          <Box sx={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
          </Box>
        </ListItemButton>
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ pl: 1.5 }}>{children}</List>
      </Collapse>
    </>
  );
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, noPadding = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [trabajadoresOpen, setTrabajadoresOpen] = React.useState(false);
  const [materialesOpen, setMaterialesOpen] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<HTMLElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { data: especialidades = [] } = useEspecialidadesList();

  const user = useAuthStore((s) => s.user);
  const rolId = user?.rol_id ?? -1;
  const isAdmin = ROLES_ADMIN.includes(rolId);
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';
  const displayEmail = user?.email ?? '—';
  const displayRol = user?.rol_nombre ?? '—';

  const menuSections = [
    {
      title: t('nav.secciones.general'),
      onlyAdmin: false,
      items: [
        { label: t('nav.dashboard'), icon: <Dashboard />, path: '/', allowedRoles: [1, 3, 4, 6, 7, 8] },
        { label: t('nav.obras'), icon: <Construction />, path: '/obras', allowedRoles: [1, 3, 4, 6] },
        { label: t('nav.labores'), icon: <AssignmentTurnedIn />, path: '/labores', allowedRoles: [1, 3, 4, 6, 7, 8] },
        { label: t('nav.clientes'), icon: <Group />, path: '/clientes', allowedRoles: [1, 3, 4, 6] },
      ],
    },
    {
      title: t('nav.secciones.operaciones'),
      onlyAdmin: false,
      items: [
        { label: t('nav.presupuestos'), icon: <ReceiptLong />, path: '/presupuestos', allowedRoles: [1, 3, 4, 6] },
        { label: t('nav.pagos'), icon: <ReceiptLong />, path: '/pagos', allowedRoles: [1, 3, 4, 6] },
        { label: 'Gastos Imprevistos', icon: <ReceiptLong />, path: '/gastos-imprevistos', allowedRoles: [1, 3, 4, 6] },
        { label: t('nav.presentismo'), icon: <AssignmentTurnedIn />, path: '/presentismo/admin', allowedRoles: [1, 3, 4, 6] },
        { label: t('nav.mi_presentismo'), icon: <AssignmentTurnedIn />, path: '/presentismo', allowedRoles: [7, 8] },
      ],
    },
    {
      title: t('nav.secciones.sistema'),
      onlyAdmin: true,
      items: [
        { label: t('nav.usuarios'), icon: <Group />, path: '/usuarios', allowedRoles: [1, 3, 4, 6] },
      ],
    },
  ];

  React.useEffect(() => {
    if (user && ROLES_ADMIN.includes(user.rol_id) && !user.onboarding_completado && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [user]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/trabajadores')) setTrabajadoresOpen(true);
  }, [location.pathname]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/materiales')) setMaterialesOpen(true);
  }, [location.pathname]);

  const drawer = (
    <Box sx={{ height: '100%', background: '#0F172A', color: '#E2E8F0', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>EdifAI</Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>{t('nav.subtitulo')}</Typography>
      </Box>

      <Box sx={{ px: 1.5, py: 2, flex: 1, overflowY: 'auto' }}>
        {isAdmin && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ px: 1, mb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
              {t('nav.secciones.personal')}
            </Typography>
            <List disablePadding>
              <NavDropdown
                label={t('nav.trabajadores')} icon={<Group />}
                isActive={location.pathname.startsWith('/trabajadores')}
                isOpen={trabajadoresOpen}
                onToggle={() => { setTrabajadoresOpen((p) => !p); navigate('/trabajadores'); }}
              >
                {especialidades.map((esp) => {
                  const path = `/trabajadores/especialidad/${esp.id}`;
                  return (
                    <NavItem key={esp.id} label={esp.nombre} path={path}
                      isActive={location.pathname === path}
                      onClick={() => navigate(path)} indent />
                  );
                })}
              </NavDropdown>
            </List>
          </Box>
        )}

        {menuSections
          .filter((section) => {
            if (section.onlyAdmin && !isAdmin) return false;
            return section.items.some((item) => item.allowedRoles.includes(rolId));
          })
          .map((section) => (
            <Box key={section.title} sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ px: 1, mb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
                {section.title}
              </Typography>
              <List disablePadding>
                {section.title === t('nav.secciones.operaciones') && isAdmin && (
                  <NavDropdown
                    label={t('nav.materiales')} icon={<Inventory2 />}
                    isActive={location.pathname.startsWith('/materiales')}
                    isOpen={materialesOpen}
                    onToggle={() => { setMaterialesOpen((p) => !p); navigate('/materiales'); }}
                  >
                    <NavItem label={t('nav.historial_precios')} path="/materiales/historial"
                      isActive={location.pathname === '/materiales/historial'}
                      onClick={() => navigate('/materiales/historial')} indent />
                  </NavDropdown>
                )}
                {section.items
                  .filter((item) => item.allowedRoles.includes(rolId))
                  .map((item) => {
                    const isActive = item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);
                    return (
                      <NavItem key={item.path} label={item.label} icon={item.icon}
                        path={item.path} isActive={isActive} onClick={() => navigate(item.path)} />
                    );
                  })}
              </List>
            </Box>
          ))}
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ p: 1.5, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{displayEmail}</Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>{displayRol}</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <AppBar position="fixed" elevation={0} sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)',
        backdropFilter: 'blur(10px)',
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, md: 2 } }}>
          <IconButton color="inherit" edge="start"
            onClick={() => setMobileOpen((p) => !p)}
            sx={{ mr: 1.5, display: { sm: 'none' } }}>
            <Menu />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <NotificacionesPopover />
          <ConfiguracionPopover />
          <Box
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, pl: 1,
              cursor: 'pointer', borderRadius: 2, px: 1, py: 0.5,
              transition: 'background 0.15s',
              '&:hover': { backgroundColor: theme.palette.action.hover },
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#F59E0B', color: '#0F172A', fontSize: 13, fontWeight: 700 }}>
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.palette.text.primary }}>{displayEmail}</Typography>
              <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>{displayRol}</Typography>
            </Box>
          </Box>
          <UserMenuPopover anchorEl={userMenuAnchor} onClose={() => setUserMenuAnchor(null)} />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: `1px solid ${theme.palette.divider}` },
          }}>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{
        flexGrow: 1,
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        maxWidth: { sm: `calc(100% - ${drawerWidth}px)` },
        mt: '64px', minHeight: '100vh', overflow: 'auto', boxSizing: 'border-box',
        backgroundColor: theme.palette.background.default,
      }}>
        <AppBreadcrumbs />
        <Box sx={{ p: noPadding ? 0 : { xs: 1, md: 1.5 }, width: '100%', boxSizing: 'border-box' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};