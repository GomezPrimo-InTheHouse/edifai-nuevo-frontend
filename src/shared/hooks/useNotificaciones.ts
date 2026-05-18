import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../../app/store/auth.store';
import { notificacionesApi, type Notificacion } from '../../services/api/notificaciones.api';
import { env } from '../../app/config/env';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const tokenRef = useRef<string | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);

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

  // ── SSE — solo conecta una vez, no reconecta por refresh de token ─────────
 useEffect(() => {
    if (!accessToken) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      tokenRef.current = null;
      return;
    }

    // Si ya hay conexión activa, solo actualizar el tokenRef
    if (
      eventSourceRef.current &&
      eventSourceRef.current.readyState !== EventSource.CLOSED
    ) {
      tokenRef.current = accessToken;
      return;
    }

    tokenRef.current = accessToken;

    const url = `${env.notificacionesApiUrl}/notificaciones/sse?token=${accessToken}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('✅ SSE conectado:', new Date().toISOString());
    };

    es.onmessage = (event) => {
      console.log('📨 SSE mensaje recibido:', event.data);
      try {
        const nueva: Notificacion = JSON.parse(event.data);
        setNotificaciones((prev) => [nueva, ...prev]);
      } catch (e) {
        console.error('Error parseando notificación SSE:', e);
      }
    };

    es.addEventListener('auth_error', () => {
      es.close();
      eventSourceRef.current = null;
      // No reconectar acá — el interceptor de Axios renovará el token
      // lo que cambia accessToken en el store y re-ejecuta este useEffect
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      console.error('SSE error de red — cerrando conexión');
      es.close();
      eventSourceRef.current = null;
    };

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
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