import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../../app/store/auth.store';
import { notificacionesApi, type Notificacion } from '../../services/api/notificaciones.api';
import { env } from '../../app/config/env';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const notificacionesActivas = useAuthStore((s) => s.preferencias.notificaciones);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    if (!notificacionesActivas) {
      setNotificaciones([]);
      setLoading(false);
      return;
    }
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    setLoading(true);
    notificacionesApi
      .getAll()
      .then((data) => setNotificaciones(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [notificacionesActivas]);

  // ── SSE con fetch — sin auto-reconexión del browser ───────
  useEffect(() => {
    if (!notificacionesActivas) {
      abortRef.current?.abort();
      return;
    }

    let activo = true;

    const conectar = async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const token = useAuthStore.getState().accessToken;
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const expira = new Date(decoded.exp * 1000);
        const ahora = new Date();
        console.log('🔑 Token expira:', expira.toISOString(), '| Ahora:', ahora.toISOString(), '| Válido:', expira > ahora);
      }
      if (!token) return;

      try {
        const response = await fetch(
          `${env.notificacionesApiUrl}/notificaciones/sse?token=${token}`,
          { signal: controller.signal }
        );

        if (!response.ok || !response.body) {
          console.error('SSE: respuesta inválida', response.status);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (activo) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: auth_error')) {
              console.log('🔄 SSE auth_error — token expirado');
              reader.cancel();
              setTimeout(async () => {
                if (!activo) return;
                try {
                  const refreshToken = useAuthStore.getState().refreshToken;
                  const res = await fetch(`${env.authApiUrl}/auth/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                  });
                  const data = await res.json();
                  if (data.accessToken) {
                    useAuthStore.getState().setAccessToken(data.accessToken);
                  }
                } catch {
                  console.error('SSE: no se pudo renovar token');
                }
                if (activo) conectar();
              }, 1000);
              return;
            }

            if (line.startsWith('data:')) {
              const jsonStr = line.slice(5).trim();
              if (!jsonStr) continue;
              try {
                const nueva: Notificacion = JSON.parse(jsonStr);
                console.log('📨 SSE mensaje recibido:', nueva);
                setNotificaciones((prev) => [nueva, ...prev]);
              } catch {
                // heartbeat u otro evento — ignorar
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('SSE error de red:', err.message);
        setTimeout(() => { if (activo) conectar(); }, 3000);
      }
    };

    conectar();

    return () => {
      activo = false;
      abortRef.current?.abort();
    };
  }, [notificacionesActivas]);

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