// import React, { useState } from 'react';
// import { Box, Button, TextField, Typography, Alert } from '@mui/material';
// import { useAuthStore } from '../../../app/store/auth.store';
// import { AuthLayout } from '../../../layouts/AuthLayout/AuthLayout';

// export const LoginPage: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const login = useAuthStore((state) => state.login);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       await login({ email, password });
//     } catch (err) {
//       setError('Credenciales inválidas');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <Typography component="h1" variant="h5" gutterBottom>
//         Iniciar Sesión
//       </Typography>
//       {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
//       <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
//         <TextField
//           margin="normal"
//           required
//           fullWidth
//           id="email"
//           label="Email"
//           name="email"
//           autoComplete="email"
//           autoFocus
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <TextField
//           margin="normal"
//           required
//           fullWidth
//           name="password"
//           label="Contraseña"
//           type="password"
//           id="password"
//           autoComplete="current-password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <Button
//           type="submit"
//           fullWidth
//           variant="contained"
//           sx={{ mt: 3, mb: 2 }}
//           disabled={loading}
//         >
//           {loading ? 'Ingresando...' : 'Ingresar'}
//         </Button>
//       </Box>
//     </AuthLayout>
//   );
// };


import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../layouts/AuthLayout/AuthLayout';
import { loginApi } from '../../../services/api/auth.api';
import { useAuthStore } from '../../../app/store/auth.store';

// ── Schemas Zod ──────────────────────────────────────────────
const step1Schema = z.object({
  email: z.string().email('Ingresá un email válido'),
});

const step2Schema = z.object({
  password: z.string().min(1, 'Ingresá tu contraseña'),
  totp: z.string().optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

// ── Componente ────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [showTotp, setShowTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form paso 1
  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: '' },
  });

  // Form paso 2
  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { password: '', totp: '' },
  });

  // ── Submit paso 1 ──
  const onSubmit1 = (values: Step1Values) => {
    setEmail(values.email);
    setErrorMessage(null);
    setStep(2);
  };

  // ── Submit paso 2 ──
  const onSubmit2 = async (values: Step2Values) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: { email: string; password: string; totp?: string } = {
        email,
        password: values.password,
      };
      if (showTotp && values.totp) {
        payload.totp = values.totp;
      }

      const data = await loginApi(payload);
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.user);
      navigate('/');

    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } } };
      const status = axiosError.response?.status;
      const backendMsg = axiosError.response?.data?.error ?? '';

      if (status === 401 && backendMsg === 'Código TOTP inválido' && !showTotp) {
        // Primera vez que falla por TOTP → mostrar campo
        setShowTotp(true);
        setErrorMessage(null);
      } else if (backendMsg) {
        setErrorMessage(backendMsg);
      } else {
        setErrorMessage('No se pudo conectar con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Volver al paso 1 ──
  const handleBack = () => {
    setStep(1);
    setShowTotp(false);
    setErrorMessage(null);
    form2.reset();
  };

  // ── Estilos del botón principal ──
  const btnSx = {
    bgcolor: '#F59E0B',
    color: '#0F172A',
    fontWeight: 700,
    mt: 2,
    '&:hover': { bgcolor: '#D97706' },
    '&:disabled': { bgcolor: '#F59E0B', opacity: 0.7 },
  };

  return (
    <AuthLayout>
      {/* ── PASO 1: Email ── */}
      {step === 1 && (
        <Box component="form" onSubmit={form1.handleSubmit(onSubmit1)} noValidate>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sistema de gestión de obras
          </Typography>

          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            autoFocus
            autoComplete="email"
            {...form1.register('email')}
            error={!!form1.formState.errors.email}
            helperText={form1.formState.errors.email?.message}
          />

          <Button fullWidth type="submit" variant="contained" sx={btnSx}>
            Siguiente
          </Button>
        </Box>
      )}

      {/* ── PASO 2: Password (+ TOTP condicional) ── */}
      {step === 2 && (
        <Box component="form" onSubmit={form2.handleSubmit(onSubmit2)} noValidate>
          {/* Email + botón volver */}
          <Box display="flex" alignItems="center" gap={0.5} mb={2}>
            <IconButton onClick={handleBack} size="small" aria-label="Volver">
              <ChevronLeft size={20} />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={500} mb={2}>
            Bienvenido
          </Typography>

          {/* Password */}
          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoFocus
            autoComplete="current-password"
            {...form2.register('password')}
            error={!!form2.formState.errors.password}
            helperText={form2.formState.errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* TOTP condicional */}
          {showTotp && (
            <Box mt={2}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Tu cuenta requiere autenticación de dos factores
              </Alert>
              <TextField
                fullWidth
                label="Código de autenticación"
                autoFocus
                inputProps={{
                  maxLength: 6,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                helperText="Ingresá el código de 6 dígitos de tu app autenticadora"
                {...form2.register('totp')}
                error={!!form2.formState.errors.totp}
              />
            </Box>
          )}

          {/* Error message */}
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Submit */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={btnSx}
          >
            {isLoading ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </Button>
        </Box>
      )}
    </AuthLayout>
  );
};