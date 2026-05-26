// import { useNavigate } from 'react-router-dom';
// import { Box, Typography, useMediaQuery, useTheme, IconButton } from '@mui/material';
// import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
// import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

// export function AppBreadcrumbs() {
//   const crumbs = useBreadcrumbs();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const isHome = crumbs.length === 1;

//   if (isHome) return null;

//   // Mobile: solo muestra botón de retroceso + página actual
//   if (isMobile) {
//     const prev = crumbs[crumbs.length - 2];
//     const current = crumbs[crumbs.length - 1];
//     return (
//       <Box sx={{
//         display: 'flex', alignItems: 'center', gap: 1,
//         px: 2, py: 1,
//         bgcolor: '#FFFFFF',
//         borderBottom: '1px solid #E2E8F0',
//       }}>
//         <IconButton
//           size="small"
//           onClick={() => prev.path ? navigate(prev.path) : navigate(-1)}
//           sx={{ color: '#0F172A', p: 0.5 }}
//         >
//           <ArrowLeft size={18} />
//         </IconButton>
//         <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A' }}>
//           {current.label}
//         </Typography>
//       </Box>
//     );
//   }

//   // Desktop: breadcrumb completo
//   return (
//     <Box sx={{
//       display: 'flex', alignItems: 'center', gap: 0.5,
//       px: 2, py: 1,
//       bgcolor: '#FFFFFF',
//       borderBottom: '1px solid #E2E8F0',
//     }}>
//       <Box
//         onClick={() => navigate('/')}
//         sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748B', '&:hover': { color: '#0F172A' } }}
//       >
//         <Home size={14} />
//       </Box>

//       {crumbs.slice(1).map((crumb, index) => (
//         <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//           <ChevronRight size={14} color="#CBD5E1" />
//           {crumb.path ? (
//             <Typography
//               variant="caption"
//               fontWeight={500}
//               onClick={() => navigate(crumb.path!)}
//               sx={{ color: '#64748B', cursor: 'pointer', '&:hover': { color: '#0F172A' } }}
//             >
//               {crumb.label}
//             </Typography>
//           ) : (
//             <Typography variant="caption" fontWeight={700} sx={{ color: '#0F172A' }}>
//               {crumb.label}
//             </Typography>
//           )}
//         </Box>
//       ))}
//     </Box>
//   );
// }

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

export function AppBreadcrumbs() {
  const crumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isHome = crumbs.length === 1;
  if (isHome) return null;

  if (isMobile) {
    const prev = crumbs[crumbs.length - 2];
    const current = crumbs[crumbs.length - 1];
    return (
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <IconButton
          size="small"
          onClick={() => prev.path ? navigate(prev.path) : navigate(-1)}
          sx={{ color: 'text.primary', p: 0.5 }}
        >
          <ArrowLeft size={18} />
        </IconButton>
        <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
          {current.label}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.5,
      px: 2, py: 1,
      bgcolor: 'background.paper',
      borderBottom: `1px solid ${theme.palette.divider}`,
    }}>
      <Box
        onClick={() => navigate('/')}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
      >
        <Home size={14} />
      </Box>

      {crumbs.slice(1).map((crumb, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ChevronRight size={14} color={theme.palette.divider} />
          {crumb.path ? (
            <Typography
              variant="caption"
              fontWeight={500}
              onClick={() => navigate(crumb.path!)}
              sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
            >
              {crumb.label}
            </Typography>
          ) : (
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
              {crumb.label}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}