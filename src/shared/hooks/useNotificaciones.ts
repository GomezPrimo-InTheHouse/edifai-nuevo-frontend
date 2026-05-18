import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../../app/store/auth.store';
import { notificacionesApi, type Notificacion } from '../../services/api/notificaciones.api';
import { env } from '../../app/config/env';
import axios from 'axios';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(false);
    notificacionesApi
      .getAll()
      .then((data) => setNotificaciones(data))
      .catch((err) => { console.error('Error cargando notificaciones:', err); setError(true); })
      .finally(() => setLoading(false));
  }, [accessToken]);

  // ── SSE ───────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }

    const conectar = (token: string) => {
      eventSourceRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

      const url = `${env.notificacionesApiUrl}/notificaciones/sse?token=${token}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => console.log('✅ SSE conectado:', new Date().toISOString());

      es.onmessage = (event) => {
        console.log('📨 SSE mensaje recibido:', event.data);
        try {
          const nueva: Notificacion = JSON.parse(event.data);
          setNotificaciones((prev) => [nueva, ...prev]);
        } catch (e) {
          console.error('Error parseando SSE:', e);
        }
      };

      es.addEventListener('auth_error', async () => {
        console.log('🔄 SSE auth_error — renovando token...');
        es.close();
        eventSourceRef.current = null;

        // Renovar token via refresh antes de reconectar
        try {
          const { data } = await axios.post(
            `${env.authApiUrl}/auth/refresh-token`,
            { refreshToken }
          );
          const nuevoToken = data.accessToken;
          setAccessToken(nuevoToken);
          reconnectTimer.current = setTimeout(() => conectar(nuevoToken), 500);
        } catch {
          console.error('SSE: no se pudo renovar el token — sesión expirada');
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) return;
        console.error('SSE error de red');
        es.close();
        eventSourceRef.current = null;
        reconnectTimer.current = setTimeout(() => conectar(useAuthStore.getState().accessToken!), 3000);
      };
    };

    conectar(accessToken);

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [accessToken]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarLeida = useCallback(async (id: number) => {
    try {
      await notificacionesApi.marcarLeida(id);
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch (err) {
      console.error('Error marcando leída:', err);
    }
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    try {
      await notificacionesApi.marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error marcando todas leídas:', err);
    }
  }, []);

  return { notificaciones, noLeidas, loading, error, marcarLeida, marcarTodasLeidas };
}