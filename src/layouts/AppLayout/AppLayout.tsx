// import React from 'react';
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Box,
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   IconButton,
//   InputBase,
//   Avatar,
//   Badge,
//   Collapse,
// } from '@mui/material';

// import {
//   Menu,
//   Dashboard,
//   Home,
//   Construction,
//   Group,
//   Inventory2,
//   AssignmentTurnedIn,
//   ReceiptLong,
//   Settings,
//   NotificationsNone,
//   Search,
//   KeyboardArrowDown,
//   KeyboardArrowUp,
// } from '@mui/icons-material';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useEspecialidadesList } from '../../modules/trabajadores/hooks/useEspecialidades';

// interface AppLayoutProps {
//   children: React.ReactNode;
// }

// const drawerWidth = 272;

// const menuSections = [
//   {
//     title: 'GENERAL',
//     items: [
//       { label: 'Dashboard', icon: <Dashboard />, path: '/' },
//       { label: 'Home', icon: <Home />, path: '/' },
//       { label: 'Obras', icon: <Construction />, path: '/obras' },
//       { label: 'Labores', icon: <AssignmentTurnedIn />, path: '/labores' },
//     ],
//   },
//   {
//     title: 'OPERACIONES',
//     items: [
//       { label: 'Materiales', icon: <Inventory2 />, path: '/materiales' },
//       { label: 'Presentismo', icon: <AssignmentTurnedIn />, path: '/presentismo' },
//       { label: 'Presupuestos', icon: <ReceiptLong />, path: '/presupuestos' },
//     ],
//   },
//   {
//     title: 'SISTEMA',
//     items: [
//       { label: 'Configuración', icon: <Settings />, path: '/configuracion' },
//     ],
//   },
// ];

// export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
//   const [mobileOpen, setMobileOpen] = React.useState(false);
//   const [trabajadoresOpen, setTrabajadoresOpen] = React.useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   // Especialidades para el dropdown del sidebar
//   const { data: especialidades = [] } = useEspecialidadesList();
//   const [materialesOpen, setMaterialesOpen] = React.useState(false);

//   // Auto-abre si la ruta es de materiales
//     React.useEffect(() => {
//       if (location.pathname.startsWith('/materiales')) setMaterialesOpen(true);
//     }, [location.pathname]);

//   // Abre el dropdown automáticamente si la ruta es de trabajadores
//   React.useEffect(() => {
//     if (location.pathname.startsWith('/trabajadores')) {
//       setTrabajadoresOpen(true);
//     }
//   }, [location.pathname]);

//   const handleDrawerToggle = () => {
//     setMobileOpen((prev) => !prev);
//   };

//   const drawer = (
//     <Box
//       sx={{
//         height: '100%',
//         background: '#0F172A',
//         color: '#E2E8F0',
//         display: 'flex',
//         flexDirection: 'column',
//       }}
//     >
//       {/* Logo */}
//       <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
//         <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
//           EdifAI
//         </Typography>
//         <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
//           Gestión de obras
//         </Typography>
//       </Box>

//       <Box sx={{ px: 2, py: 2, flex: 1, overflowY: 'auto' }}>

//         {/* Sección PERSONAL — Trabajadores con dropdown */}
//         <Box sx={{ mb: 3 }}>
//           <Typography
//             variant="caption"
//             sx={{ px: 1.5, mb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}
//           >
//             PERSONAL
//           </Typography>

//           <List disablePadding>
//             {/* Item principal Trabajadores */}
//             <ListItem disablePadding sx={{ mb: 0.5 }}>
//               <ListItemButton
//                 onClick={() => {
//                   setTrabajadoresOpen((prev) => !prev);
//                   navigate('/trabajadores');
//                 }}
//                 sx={{
//                   borderRadius: 3,
//                   minHeight: 46,
//                   px: 1.5,
//                   backgroundColor: location.pathname.startsWith('/trabajadores')
//                     ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
//                   color: location.pathname.startsWith('/trabajadores') ? '#FFFFFF' : '#CBD5E1',
//                   '&:hover': {
//                     backgroundColor: location.pathname.startsWith('/trabajadores')
//                       ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255,255,255,0.05)',
//                   },
//                 }}
//               >
//                 <ListItemIcon sx={{ minWidth: 38, color: location.pathname.startsWith('/trabajadores') ? '#F59E0B' : '#94A3B8' }}>
//                   <Group />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Trabajadores"
//                   primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname.startsWith('/trabajadores') ? 700 : 500 }}
//                 />
//                 {/* Ícono de colapso */}
//                 <Box sx={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>
//                   {trabajadoresOpen ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
//                 </Box>
//               </ListItemButton>
//             </ListItem>

//             {/* Subitems — especialidades */}
//             <Collapse in={trabajadoresOpen} timeout="auto" unmountOnExit>
//               <List disablePadding sx={{ pl: 2 }}>
//                 {especialidades.map((esp) => {
//                   const path = `/trabajadores/especialidad/${esp.id}`;
//                   const isActive = location.pathname === path;
//                   return (
//                     <ListItem key={esp.id} disablePadding sx={{ mb: 0.5 }}>
//                       <ListItemButton
//                         onClick={() => navigate(path)}
//                         sx={{
//                           borderRadius: 3,
//                           minHeight: 38,
//                           px: 1.5,
//                           backgroundColor: isActive ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
//                           color: isActive ? '#FFFFFF' : '#94A3B8',
//                           '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
//                         }}
//                       >
//                         <ListItemText
//                           primary={esp.nombre}
//                           primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 400 }}
//                         />
//                       </ListItemButton>
//                     </ListItem>
//                   );
//                 })}
//               </List>
//             </Collapse>
//           </List>
//         </Box>

//         {/* Resto de secciones del menú */}
//         {menuSections.map((section) => (
//           <Box key={section.title} sx={{ mb: 3 }}>
//             <Typography
//               variant="caption"
//               sx={{ px: 1.5, mb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}
//             >
//               {section.title}
//             </Typography>

//             <List disablePadding>
//               {section.items.map((item) => {
//                 const isActive = item.path === '/'
//                   ? location.pathname === '/'
//                   : location.pathname.startsWith(item.path);

//                 return (
//                   <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
//                     <ListItemButton
//                       onClick={() => navigate(item.path)}
//                       sx={{
//                         borderRadius: 3,
//                         minHeight: 46,
//                         px: 1.5,
//                         backgroundColor: isActive ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
//                         color: isActive ? '#FFFFFF' : '#CBD5E1',
//                         '&:hover': {
//                           backgroundColor: isActive ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255,255,255,0.05)',
//                         },
//                       }}
//                     >
//                       <ListItemIcon sx={{ minWidth: 38, color: isActive ? '#F59E0B' : '#94A3B8' }}>
//                         {item.icon}
//                       </ListItemIcon>
//                       <ListItemText
//                         primary={item.label}
//                         primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
//                       />
//                     </ListItemButton>
//                   </ListItem>
//                 );
//               })}
//             </List>
//           </Box>
//         ))}
//       </Box>

//       {/* Usuario en el footer del sidebar */}
//       <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
//         <Box sx={{ p: 1.5, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
//           <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>Julián Gómez</Typography>
//           <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>Administrador</Typography>
//         </Box>
//       </Box>
//     </Box>
//   );

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
//       <AppBar
//         position="fixed"
//         elevation={0}
//         sx={{
//           width: { sm: `calc(100% - ${drawerWidth}px)` },
//           ml: { sm: `${drawerWidth}px` },
//           backgroundColor: 'rgba(248,250,252,0.9)',
//           backdropFilter: 'blur(10px)',
//           color: '#0F172A',
//           borderBottom: '1px solid #E2E8F0',
//         }}
//       >
//         <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, md: 3 } }}>
//           <IconButton
//             color="inherit"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{ mr: 1.5, display: { sm: 'none' } }}
//           >
//             <Menu />
//           </IconButton>

//           <Box
//             sx={{
//               display: 'flex', alignItems: 'center', gap: 1, px: 1.5, height: 42,
//               width: { xs: '100%', sm: 280, md: 340 },
//               backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3,
//             }}
//           >
//             <Search sx={{ fontSize: 18, color: '#64748B' }} />
//             <InputBase placeholder="Buscar obra, trabajador o material..." sx={{ flex: 1, fontSize: 14, color: '#0F172A' }} />
//           </Box>

//           <Box sx={{ flexGrow: 1 }} />

//           <IconButton sx={{ mr: 1, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
//             <Badge badgeContent={3} color="warning">
//               <NotificationsNone sx={{ color: '#334155' }} />
//             </Badge>
//           </IconButton>

//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pl: 1 }}>
//             <Avatar sx={{ width: 38, height: 38, bgcolor: '#0F172A', fontSize: 14, fontWeight: 700 }}>JG</Avatar>
//             <Box sx={{ display: { xs: 'none', md: 'block' } }}>
//               <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Julián Gómez</Typography>
//               <Typography sx={{ fontSize: 12, color: '#64748B' }}>Admin</Typography>
//             </Box>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
//         <Drawer
//           variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
//           ModalProps={{ keepMounted: true }}
//           sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' } }}
//         >
//           {drawer}
//         </Drawer>
//         <Drawer
//           variant="permanent" open
//           sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E2E8F0' } }}
//         >
//           {drawer}
//         </Drawer>
//       </Box>

//       <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: '72px', minHeight: '100vh' }}>
//         <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
//       </Box>
//     </Box>
//   );
// };

import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  InputBase, Avatar, Badge, Collapse,
} from '@mui/material';
import {
  Menu, Dashboard, Home, Construction, Group, Inventory2,
  AssignmentTurnedIn, ReceiptLong, Settings, NotificationsNone,
  Search, KeyboardArrowDown, KeyboardArrowUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEspecialidadesList } from '../../modules/trabajadores/hooks/useEspecialidades';

interface AppLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 272;

const menuSections = [
  {
    title: 'GENERAL',
    items: [
      { label: 'Dashboard', icon: <Dashboard />, path: '/' },
      { label: 'Home', icon: <Home />, path: '/' },
      { label: 'Obras', icon: <Construction />, path: '/obras' },
      { label: 'Labores', icon: <AssignmentTurnedIn />, path: '/labores' },
    ],
  },
  {
    title: 'OPERACIONES',
    items: [
      { label: 'Presentismo', icon: <AssignmentTurnedIn />, path: '/presentismo' },
      { label: 'Presupuestos', icon: <ReceiptLong />, path: '/presupuestos' },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { label: 'Configuración', icon: <Settings />, path: '/configuracion' },
    ],
  },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [trabajadoresOpen, setTrabajadoresOpen] = React.useState(false);
  const [materialesOpen, setMaterialesOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { data: especialidades = [] } = useEspecialidadesList();

  React.useEffect(() => {
    if (location.pathname.startsWith('/trabajadores')) setTrabajadoresOpen(true);
  }, [location.pathname]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/materiales')) setMaterialesOpen(true);
  }, [location.pathname]);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const drawer = (
    <Box sx={{ height: '100%', background: '#0F172A', color: '#E2E8F0', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>EdifAI</Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>Gestión de obras</Typography>
      </Box>

      <Box sx={{ px: 2, py: 2, flex: 1, overflowY: 'auto' }}>

        {/* PERSONAL — Trabajadores con dropdown de especialidades */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ px: 1.5, mb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
            PERSONAL
          </Typography>
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { setTrabajadoresOpen((prev) => !prev); navigate('/trabajadores'); }}
                sx={{
                  borderRadius: 3, minHeight: 46, px: 1.5,
                  backgroundColor: location.pathname.startsWith('/trabajadores') ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
                  color: location.pathname.startsWith('/trabajadores') ? '#FFFFFF' : '#CBD5E1',
                  '&:hover': { backgroundColor: location.pathname.startsWith('/trabajadores') ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255,255,255,0.05)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: location.pathname.startsWith('/trabajadores') ? '#F59E0B' : '#94A3B8' }}>
                  <Group />
                </ListItemIcon>
                <ListItemText primary="Trabajadores" primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname.startsWith('/trabajadores') ? 700 : 500 }} />
                <Box sx={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>
                  {trabajadoresOpen ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                </Box>
              </ListItemButton>
            </ListItem>
            <Collapse in={trabajadoresOpen} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ pl: 2 }}>
                {especialidades.map((esp) => {
                  const path = `/trabajadores/especialidad/${esp.id}`;
                  const isActive = location.pathname === path;
                  return (
                    <ListItem key={esp.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => navigate(path)}
                        sx={{
                          borderRadius: 3, minHeight: 38, px: 1.5,
                          backgroundColor: isActive ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
                          color: isActive ? '#FFFFFF' : '#94A3B8',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                        }}
                      >
                        <ListItemText primary={esp.nombre} primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 400 }} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </List>
        </Box>

        {/* Resto de secciones — con Materiales especial en OPERACIONES */}
        {menuSections.map((section) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ px: 1.5, mb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
              {section.title}
            </Typography>
            <List disablePadding>
              {/* Inyecta Materiales con dropdown al inicio de OPERACIONES */}
              {section.title === 'OPERACIONES' && (
                <>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => { setMaterialesOpen((prev) => !prev); navigate('/materiales'); }}
                      sx={{
                        borderRadius: 3, minHeight: 46, px: 1.5,
                        backgroundColor: location.pathname.startsWith('/materiales') ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
                        color: location.pathname.startsWith('/materiales') ? '#FFFFFF' : '#CBD5E1',
                        '&:hover': { backgroundColor: location.pathname.startsWith('/materiales') ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38, color: location.pathname.startsWith('/materiales') ? '#F59E0B' : '#94A3B8' }}>
                        <Inventory2 />
                      </ListItemIcon>
                      <ListItemText primary="Materiales" primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname.startsWith('/materiales') ? 700 : 500 }} />
                      <Box sx={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>
                        {materialesOpen ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={materialesOpen} timeout="auto" unmountOnExit>
                    <List disablePadding sx={{ pl: 2 }}>
                      {[{ label: 'Historial de precios', path: '/materiales/historial' }].map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                              onClick={() => navigate(item.path)}
                              sx={{
                                borderRadius: 3, minHeight: 38, px: 1.5,
                                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
                                color: isActive ? '#FFFFFF' : '#94A3B8',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                              }}
                            >
                              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 400 }} />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </>
              )}
              {/* Items normales de la sección */}
              {section.items.map((item) => {
                const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                return (
                  <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 3, minHeight: 46, px: 1.5,
                        backgroundColor: isActive ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#CBD5E1',
                        '&:hover': { backgroundColor: isActive ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38, color: isActive ? '#F59E0B' : '#94A3B8' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer usuario */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ p: 1.5, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>Julián Gómez</Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>Administrador</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <AppBar position="fixed" elevation={0} sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, backgroundColor: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(10px)', color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
        <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, md: 3 } }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1.5, display: { sm: 'none' } }}>
            <Menu />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, height: 42, width: { xs: '100%', sm: 280, md: 340 }, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Search sx={{ fontSize: 18, color: '#64748B' }} />
            <InputBase placeholder="Buscar obra, trabajador o material..." sx={{ flex: 1, fontSize: 14, color: '#0F172A' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton sx={{ mr: 1, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Badge badgeContent={3} color="warning">
              <NotificationsNone sx={{ color: '#334155' }} />
            </Badge>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pl: 1 }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: '#0F172A', fontSize: 14, fontWeight: 700 }}>JG</Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Julián Gómez</Typography>
              <Typography sx={{ fontSize: 12, color: '#64748B' }}>Admin</Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E2E8F0' } }}>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: '72px', minHeight: '100vh' }}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
};