// import React from 'react';
// import { Box, Typography } from '@mui/material';

// interface PageHeaderProps {
//   title: string | any;
//   subtitle?: string | React.ReactNode;
//   actions?: React.ReactNode;
// }

// export const PageHeader: React.FC<PageHeaderProps> = ({
//   title,
//   subtitle,
//   actions,
// }) => {
//   return (
//     <Box sx={{ mb: 3 }}>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           gap: 2,
//         }}
//       >
//         <Box>
//           <Typography variant="h4" fontWeight={600}>
//             {title}
//           </Typography>

//           {subtitle && (
//             <Typography variant="body2" color="text.secondary">
//               {subtitle}
//             </Typography>
//           )}
//         </Box>

//         {actions && <Box>{actions}</Box>}
//       </Box>
//     </Box>
//   );
// };

import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string | any;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};