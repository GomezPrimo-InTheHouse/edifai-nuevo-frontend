import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../../app/store/auth.store';
import { notificacionesApi, type Notificacion } from '../../services/api/notificaciones.api';
import { env } from '../../app/config/env';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reconectar, setReconectar] = useState(0); // forzar reconexión
  const eventSourceRef = useRef<EventSource | null>(null);

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

  // ── SSE ───────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }

    eventSourceRef.current?.close();

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
      console.log('🔄 SSE auth_error — esperando token renovado...');
      es.close();
      eventSourceRef.current = null;
      // Esperar a que el interceptor renueve el token y forzar reconexión
      setTimeout(() => setReconectar((n) => n + 1), 1000);
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      console.error('SSE error de red');
      es.close();
      eventSourceRef.current = null;
      setTimeout(() => setReconectar((n) => n + 1), 2000);
    };

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [accessToken, reconectar]);

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