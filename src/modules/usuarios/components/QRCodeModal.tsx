// import React, { useState } from 'react';
// import {
//   Alert, Box, Button, Collapse, Dialog, DialogContent,
//   DialogTitle, Divider, IconButton, Tooltip, Typography,
// } from '@mui/material';
// import { Copy, ChevronDown, ChevronUp, X } from 'lucide-react';

// interface Props {
//   open:     boolean;
//   onClose:  () => void;
//   qrUrl:    string;
//   email:    string;
//   totpSeed?: string;   // ← nuevo prop
// }

// export const QRCodeModal: React.FC<Props> = ({ open, onClose, qrUrl, email, totpSeed }) => {
//   const [showSeed, setShowSeed]     = useState(false);
//   const [copiado,  setCopiado]      = useState(false);

//   const handleCopiar = () => {
//     if (!totpSeed) return;
//     navigator.clipboard.writeText(totpSeed);
//     setCopiado(true);
//     setTimeout(() => setCopiado(false), 2000);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableEnforceFocus>
//       <DialogTitle>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Typography variant="h6" fontWeight={700}>Configurar autenticador</Typography>
//           <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
//         </Box>
//       </DialogTitle>

//       <DialogContent>
//         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//           Escaneá este código QR con Google Authenticator u otra app TOTP para configurar
//           el acceso de <strong>{email}</strong>.
//         </Typography>

//         {/* QR */}
//         <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//           <img src={qrUrl} alt="QR TOTP" style={{ width: 200, height: 200, borderRadius: 8 }} />
//         </Box>

//         <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}>
//           Este código solo se muestra una vez. Guardalo antes de cerrar.
//         </Alert>

//         {/* Código manual — alternativa al QR */}
//         {totpSeed && (
//           <>
//             <Divider sx={{ mb: 2 }} />

//             <Box
//               onClick={() => setShowSeed((v) => !v)}
//               sx={{
//                 display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                 cursor: 'pointer', mb: 1,
//               }}
//             >
//               <Typography variant="body2" fontWeight={600} sx={{ color: '#475569' }}>
//                 ¿No podés escanear el QR? Usá el código manual
//               </Typography>
//               {showSeed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//             </Box>

//             <Collapse in={showSeed}>
//               <Box sx={{
//                 p: 2, borderRadius: 2, bgcolor: '#F8FAFC',
//                 border: '1px solid #E2E8F0', mb: 2,
//               }}>
//                 <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1, fontWeight: 600 }}>
//                   CLAVE SECRETA (BASE32)
//                 </Typography>

//                 {/* Seed formateada en grupos de 4 para legibilidad */}
//                 <Typography
//                   variant="body2"
//                   fontWeight={700}
//                   sx={{
//                     fontFamily: 'monospace', letterSpacing: 2,
//                     color: '#0F172A', wordBreak: 'break-all', mb: 1.5,
//                   }}
//                 >
//                   {totpSeed.match(/.{1,4}/g)?.join(' ') ?? totpSeed}
//                 </Typography>

//                 <Tooltip title={copiado ? '¡Copiado!' : 'Copiar al portapapeles'}>
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     startIcon={<Copy size={14} />}
//                     onClick={handleCopiar}
//                     fullWidth
//                     sx={{ fontSize: 12 }}
//                   >
//                     {copiado ? '¡Copiado!' : 'Copiar código'}
//                   </Button>
//                 </Tooltip>

//                 <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1.5, lineHeight: 1.5 }}>
//                   Ingresá este código manualmente en tu app de autenticación
//                   (Google Authenticator, Authy, etc.) en lugar de escanear el QR.
//                 </Typography>
//               </Box>
//             </Collapse>
//           </>
//         )}

//         <Button variant="contained" fullWidth onClick={onClose}>
//           Listo, ya lo guardé
//         </Button>
//       </DialogContent>
//     </Dialog>
//   );
// };

import React, { useState } from 'react';
import {
  Alert, Box, Button, Collapse, Dialog, DialogContent,
  DialogTitle, Divider, IconButton, Tooltip, Typography, useTheme,
} from '@mui/material';
import { Copy, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  open:      boolean;
  onClose:   () => void;
  qrUrl:     string;
  email:     string;
  totpSeed?: string;
}

export const QRCodeModal: React.FC<Props> = ({ open, onClose, qrUrl, email, totpSeed }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showSeed, setShowSeed] = useState(false);
  const [copiado, setCopiado]   = useState(false);

  const handleCopiar = () => {
    if (!totpSeed) return;
    navigator.clipboard.writeText(totpSeed);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableEnforceFocus
      PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ borderBottom: `0.5px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{t('qr_modal.titulo')}</Typography>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
          {t('qr_modal.descripcion', { email })}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src={qrUrl} alt="QR TOTP" style={{ width: 200, height: 200, borderRadius: 8 }} />
        </Box>

        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}>
          {t('qr_modal.aviso_unico')}
        </Alert>

        {totpSeed && (
          <>
            <Divider sx={{ mb: 2 }} />

            <Box
              onClick={() => setShowSeed((v) => !v)}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', mb: 1 }}
            >
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {t('qr_modal.no_escanear')}
              </Typography>
              {showSeed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Box>

            <Collapse in={showSeed}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}`, mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1, fontWeight: 600 }}>
                  {t('qr_modal.clave_secreta')}
                </Typography>

                <Typography variant="body2" fontWeight={700} sx={{
                  fontFamily: 'monospace', letterSpacing: 2,
                  color: 'text.primary', wordBreak: 'break-all', mb: 1.5,
                }}>
                  {totpSeed.match(/.{1,4}/g)?.join(' ') ?? totpSeed}
                </Typography>

                <Tooltip title={copiado ? t('qr_modal.copiado') : t('qr_modal.copiar_tooltip')}>
                  <Button
                    size="small" variant="outlined"
                    startIcon={<Copy size={14} />}
                    onClick={handleCopiar}
                    fullWidth sx={{ fontSize: 12 }}
                  >
                    {copiado ? t('qr_modal.copiado') : t('qr_modal.copiar_btn')}
                  </Button>
                </Tooltip>

                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5, lineHeight: 1.5 }}>
                  {t('qr_modal.instruccion_manual')}
                </Typography>
              </Box>
            </Collapse>
          </>
        )}

        <Button variant="contained" fullWidth onClick={onClose}>
          {t('qr_modal.listo')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};