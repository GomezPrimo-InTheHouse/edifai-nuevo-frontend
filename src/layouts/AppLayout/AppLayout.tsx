import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar, Collapse,
} from '@mui/material';
import {
  Menu, Dashboard, Construction, Group, Inventory2,
  AssignmentTurnedIn, ReceiptLong, Settings,
  KeyboardArrowDown, KeyboardArrowUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEspecialidadesList } from '../../modules/trabajadores/hooks/useEspecialidades';
import { UserMenuPopover } from '../../components/UserMenuPopover';
import { useAuthStore } from '../../app/store/auth.store';
import { NotificacionesPopover } from '../../components/NotificacionesPopover';
import { AppBreadcrumbs } from '../../shared/components/AppBreadcrumbs/AppBreadcrumbs';

interface AppLayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

const drawerWidth = 250;
const ROLES_ADMIN = [1, 3, 4, 6];

// ── Estructura del menú reordenada ────────────────────────────
const menuSections = [
  {
    title: 'GENERAL',
    onlyAdmin: false,
    items: [
      { label: 'Dashboard',    icon: <Dashboard />,         path: '/',           allowedRoles: [1, 3, 4, 6, 7, 8] },
      { label: 'Obras',        icon: <Construction />,       path: '/obras',      allowedRoles: [1, 3, 4, 6] },
      { label: 'Labores',      icon: <AssignmentTurnedIn />, path: '/labores',    allowedRoles: [1, 3, 4, 6, 7, 8] },
      { label: 'Clientes',     icon: <Group />,              path: '/clientes',   allowedRoles: [1, 3, 4, 6] },
    ],
  },
  {
    title: 'OPERACIONES',
    onlyAdmin: false,
    items: [
      { label: 'Presupuestos',    icon: <ReceiptLong />,        path: '/presupuestos',     allowedRoles: [1, 3, 4, 6] },
      { label: 'Pagos',           icon: <ReceiptLong />,        path: '/pagos',            allowedRoles: [1, 3, 4, 6] },
      { label: 'Presentismo',     icon: <AssignmentTurnedIn />, path: '/presentismo/admin',allowedRoles: [1, 3, 4, 6] },
      { label: 'Mi Presentismo',  icon: <AssignmentTurnedIn />, path: '/presentismo',      allowedRoles: [7, 8] },
    ],
  },
  {
    title: 'SISTEMA',
    onlyAdmin: true,
    items: [
      { label: 'Configuración', icon: <Settings />, path: '/configuracion', allowedRoles: [1, 3, 4, 6] },
      { label: 'Usuarios',      icon: <Group />,    path: '/usuarios',      allowedRoles: [1, 3, 4, 6] },
    ],
  },
];

// ── NavItem reutilizable ──────────────────────────────────────
function NavItem({
  label, icon, isActive, onClick, indent = false,
}: {
  label: string; icon?: React.ReactNode; path?: string;
  isActive: boolean; onClick: () => void; indent?: boolean;
}) {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 3,
          minHeight: indent ? 36 : 44,
          px: 1.5,
          pl: indent ? 2.5 : 1.5,
          backgroundColor: isActive ? 'rgba(245,158,11,0.16)' : 'transparent',
          color: isActive ? '#FFFFFF' : indent ? '#94A3B8' : '#CBD5E1',
          '&:hover': {
            backgroundColor: isActive ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.05)',
          },
        }}
      >
        {icon && (
          <ListItemIcon sx={{ minWidth: 34, color: isActive ? '#F59E0B' : '#94A3B8' }}>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={label}
          primaryTypographyProps={{ fontSize: indent ? 12 : 13, fontWeight: isActive ? 700 : 500 }}
        />
      </ListItemButton>
    </ListItem>
  );
}

// ── NavDropdown reutilizable ──────────────────────────────────
function NavDropdown({
  label, icon, isActive, isOpen, onToggle, children,
}: {
  label: string; icon: React.ReactNode; isActive: boolean;
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={onToggle}
          sx={{
            borderRadius: 3, minHeight: 44, px: 1.5,
            backgroundColor: isActive ? 'rgba(245,158,11,0.16)' : 'transparent',
            color: isActive ? '#FFFFFF' : '#CBD5E1',
            '&:hover': { backgroundColor: isActive ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.05)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: isActive ? '#F59E0B' : '#94A3B8' }}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}
          />
          <Box sx={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
          </Box>
        </ListItemButton>
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ pl: 1.5 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, noPadding = false }) => {
  const [mobileOpen, setMobileOpen]         = React.useState(false);
  const [trabajadoresOpen, setTrabajadoresOpen] = React.useState(false);
  const [materialesOpen, setMaterialesOpen] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<HTMLElement | null>(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { data: especialidades = [] } = useEspecialidadesList();

  const user        = useAuthStore((s) => s.user);
  const rolId       = user?.rol_id ?? -1;
  const isAdmin     = ROLES_ADMIN.includes(rolId);
  const initials    = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';
  const displayEmail = user?.email ?? '—';
  const displayRol  = user?.rol_nombre ?? '—';

  React.useEffect(() => {
    if (location.pathname.startsWith('/trabajadores')) setTrabajadoresOpen(true);
  }, [location.pathname]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/materiales')) setMaterialesOpen(true);
  }, [location.pathname]);

  const drawer = (
    <Box sx={{ height: '100%', background: '#0F172A', color: '#E2E8F0', display: 'flex', flexDirection: 'column' }}>

      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>EdifAI</Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>Gestión de obras</Typography>
      </Box>

      {/* Navegación */}
      <Box sx={{ px: 1.5, py: 2, flex: 1, overflowY: 'auto' }}>

        {/* PERSONAL — solo admins, con dropdown de trabajadores */}
        {isAdmin && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ px: 1, mb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
              PERSONAL
            </Typography>
            <List disablePadding>
              <NavDropdown
                label="Trabajadores"
                icon={<Group />}
                isActive={location.pathname.startsWith('/trabajadores')}
                isOpen={trabajadoresOpen}
                onToggle={() => { setTrabajadoresOpen((p) => !p); navigate('/trabajadores'); }}
              >
                {especialidades.map((esp) => {
                  const path = `/trabajadores/especialidad/${esp.id}`;
                  return (
                    <NavItem
                      key={esp.id}
                      label={esp.nombre}
                      path={path}
                      isActive={location.pathname === path}
                      onClick={() => navigate(path)}
                      indent
                    />
                  );
                })}
              </NavDropdown>
            </List>
          </Box>
        )}

        {/* Secciones dinámicas */}
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

                {/* Dropdown Materiales — solo en OPERACIONES para admins */}
                {section.title === 'OPERACIONES' && isAdmin && (
                  <NavDropdown
                    label="Materiales"
                    icon={<Inventory2 />}
                    isActive={location.pathname.startsWith('/materiales')}
                    isOpen={materialesOpen}
                    onToggle={() => { setMaterialesOpen((p) => !p); navigate('/materiales'); }}
                  >
                    <NavItem
                      label="Historial de precios"
                      path="/materiales/historial"
                      isActive={location.pathname === '/materiales/historial'}
                      onClick={() => navigate('/materiales/historial')}
                      indent
                    />
                  </NavDropdown>
                )}

                {/* Items filtrados por rol */}
                {section.items
                  .filter((item) => item.allowedRoles.includes(rolId))
                  .map((item) => {
                    const isActive = item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);
                    return (
                      <NavItem
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        path={item.path}
                        isActive={isActive}
                        onClick={() => navigate(item.path)}
                      />
                    );
                  })}
              </List>
            </Box>
          ))}
      </Box>

      {/* Footer usuario */}
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ p: 1.5, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{displayEmail}</Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>{displayRol}</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>

      {/* HEADER */}
      <AppBar position="fixed" elevation={0} sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: 'rgba(248,250,252,0.9)',
        backdropFilter: 'blur(10px)',
        color: '#0F172A',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, md: 2 } }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen((p) => !p)} sx={{ mr: 1.5, display: { sm: 'none' } }}>
            <Menu />
          </IconButton>

          {/* <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 1.5, height: 40,
            width: { xs: '100%', sm: 260, md: 320 },
            backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3,
          }}>
            <Search sx={{ fontSize: 18, color: '#64748B' }} />
            <InputBase placeholder="Buscar obra, trabajador o material..." sx={{ flex: 1, fontSize: 14, color: '#0F172A' }} />
          </Box> */}

          <Box sx={{ flexGrow: 1 }} />
          <NotificacionesPopover />

          <Box
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, pl: 1,
              cursor: 'pointer', borderRadius: 2, px: 1, py: 0.5,
              transition: 'background 0.15s',
              '&:hover': { backgroundColor: 'rgba(15,23,42,0.05)' },
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#0F172A', fontSize: 13, fontWeight: 700 }}>
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{displayEmail}</Typography>
              <Typography sx={{ fontSize: 12, color: '#64748B' }}>{displayRol}</Typography>
            </Box>
          </Box>

          <UserMenuPopover anchorEl={userMenuAnchor} onClose={() => setUserMenuAnchor(null)} />
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E2E8F0' } }}>
          {drawer}
        </Drawer>
      </Box>

      {/* CONTENIDO */}
      <Box component="main" sx={{
        flexGrow: 1,
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        maxWidth: { sm: `calc(100% - ${drawerWidth}px)` },
        mt: '64px',
        minHeight: '100vh',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}>
        <AppBreadcrumbs />
        <Box sx={{ p: noPadding ? 0 : { xs: 1, md: 1.5 }, width: '100%', boxSizing: 'border-box' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
