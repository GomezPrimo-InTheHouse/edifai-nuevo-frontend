import React from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  qrUrl: string;
  email: string;
}

export const QRCodeModal: React.FC<Props> = ({ open, onClose, qrUrl, email }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableEnforceFocus>
    <DialogTitle>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Configurar autenticador</Typography>
        <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Escaneá este código QR con Google Authenticator u otra app TOTP para configurar el acceso de <strong>{email}</strong>.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <img src={qrUrl} alt="QR TOTP" style={{ width: 200, height: 200, borderRadius: 8 }} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
        Este código solo se muestra una vez. Guardalo antes de cerrar.
      </Typography>
      <Button variant="contained" fullWidth onClick={onClose}>Listo, ya lo guardé</Button>
    </DialogContent>
  </Dialog>
);