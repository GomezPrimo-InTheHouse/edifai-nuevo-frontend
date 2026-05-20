
import axios from 'axios';
import { env } from '../../app/config/env';

interface LoginPayload {
  email: string;
  password: string;
  totp?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    rol_id: number;
    rol_nombre: string;
    onboarding_completado: boolean; // ← agregar
  };
}

export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const credentials = btoa(`${payload.email}:${payload.password}`);
  const body: Record<string, string> = {};
  if (payload.totp) body.totp = payload.totp;

  const response = await axios.post(
    `${env.authApiUrl}/auth/login`,
    body,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

export const logoutApi = async (refreshToken: string, email: string): Promise<void> => {
  try {
    await axios.post(`${env.authApiUrl}/auth/logout`, { refreshToken, email });
  } catch {
    // best-effort
  }
};