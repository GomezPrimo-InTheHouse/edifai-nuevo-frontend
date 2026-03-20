import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Alert, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Snackbar, Stack, Typography,
} from '@mui/material';

type Severity = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  message: string;
  severity: Severity;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'error' | 'warning';
}

interface NotifyContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotifyContext = createContext<NotifyContextType | null>(null);

let nextId = 0;

export const NotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  // Agrega una nueva notificación toast
  const push = useCallback((message: string, severity: Severity) => {
    const id = nextId++;
    setNotifications((prev) => [...prev, { id, message, severity }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  }, []);

  const success = useCallback((msg: string) => push(msg, 'success'), [push]);
  const error = useCallback((msg: string) => push(msg, 'error'), [push]);
  const warning = useCallback((msg: string) => push(msg, 'warning'), [push]);
  const info = useCallback((msg: string) => push(msg, 'info'), [push]);

  // Abre el diálogo de confirmación y retorna una promesa
  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ open: true, options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    confirmState?.resolve(true);
    setConfirmState(null);
  };

  const handleCancel = () => {
    confirmState?.resolve(false);
    setConfirmState(null);
  };

  const handleClose = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const confirmSeverity = confirmState?.options.severity ?? 'warning';
  const confirmColor = confirmSeverity === 'error' ? 'error' : 'warning';

  return (
    <NotifyContext.Provider value={{ success, error, warning, info, confirm }}>
      {children}

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmState?.open ?? false}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
        disableEnforceFocus
      >
        <DialogTitle>
          <Typography fontWeight={700} fontSize={16}>
            {confirmState?.options.title ?? 'Confirmar acción'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmState?.options.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleCancel}>
            {confirmState?.options.cancelLabel ?? 'Cancelar'}
          </Button>
          <Button variant="contained" color={confirmColor} onClick={handleConfirm}>
            {confirmState?.options.confirmLabel ?? 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stack de notificaciones toast */}
      <Stack
        spacing={1}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, minWidth: 300 }}
      >
        {notifications.map((n) => (
          <Snackbar
            key={n.id}
            open
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ position: 'relative', bottom: 'auto', right: 'auto' }}
          >
            <Alert
              severity={n.severity}
              onClose={() => handleClose(n.id)}
              variant="filled"
              sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}
            >
              {n.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </NotifyContext.Provider>
  );
};

export function useNotify(): NotifyContextType {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify debe usarse dentro de NotifyProvider');
  return ctx;
}