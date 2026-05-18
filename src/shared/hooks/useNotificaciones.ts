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
  const conectandoRef = useRef(false);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    setLoading(true);
    notificacionesApi
      .getAll()
      .then((data) => setNotificaciones(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // ── SSE — se monta una sola vez ───────────────────────────
  useEffect(() => {
    const conectar = async () => {
      if (conectandoRef.current) return;
      conectandoRef.current = true;

      const token = useAuthStore.getState().accessToken;
      if (!token) { conectandoRef.current = false; return; }

      eventSourceRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

      const url = `${env.notificacionesApiUrl}/notificaciones/sse?token=${token}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;
      conectandoRef.current = false;

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

        try {
          const refreshToken = useAuthStore.getState().refreshToken;
          const { data } = await axios.post(
            `${env.authApiUrl}/auth/refresh-token`,
            { refreshToken }
          );
          useAuthStore.getState().setAccessToken(data.accessToken);
          reconnectTimer.current = setTimeout(conectar, 500);
        } catch {
          console.error('SSE: sesión expirada');
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) return;
        es.close();
        eventSourceRef.current = null;
        reconnectTimer.current = setTimeout(conectar, 3000);
      };
    };

    conectar();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []); // ← sin dependencias, se monta una sola vez

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