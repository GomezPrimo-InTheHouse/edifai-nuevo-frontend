// import { useEffect, useRef, useState, useCallback } from 'react';
// import { useAuthStore } from '../../app/store/auth.store';
// import { notificacionesApi, type Notificacion } from '../../services/api/notificaciones.api';
// import { env } from '../../app/config/env';

// export function useNotificaciones() {
//   const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(false);
//   const eventSourceRef          = useRef<EventSource | null>(null);

//   // Leer accessToken del store — el hook se re-ejecuta cada vez que cambia
//   const accessToken = useAuthStore((s) => s.accessToken);

//   // ── Carga inicial — se repite cada vez que cambia el token ──
//   // Esto cubre el caso donde el token expiró durante la sesión
//   useEffect(() => {
//     if (!accessToken) return;

//     setLoading(true);
//     setError(false);

//     notificacionesApi
//       .getAll()
//       .then((data) => setNotificaciones(data))
//       .catch((err) => {
//         console.error('Error cargando notificaciones:', err);
//         setError(true);
//       })
//       .finally(() => setLoading(false));

//   }, [accessToken]); // ← dependencia en accessToken, no array vacío

//   // ── SSE — reconecta automáticamente cuando cambia el token ──
//   useEffect(() => {
//     if (!accessToken) {
//       // Sin token → cerrar conexión si existe
//       eventSourceRef.current?.close();
//       return;
//     }

//     const conectarSSE = () => {
//       // Cerrar conexión anterior
//       eventSourceRef.current?.close();

//       const url = `${env.notificacionesApiUrl}/notificaciones/sse?token=${accessToken}`;
//       const es  = new EventSource(url);
//       eventSourceRef.current = es;

//       es.onopen = () => {
//         console.log('SSE conectado');
//       };

//       es.onmessage = (event) => {
//         try {
//           const nueva: Notificacion = JSON.parse(event.data);
//           setNotificaciones((prev) => [nueva, ...prev]);
//         } catch (e) {
//           console.error('Error parseando notificación SSE:', e);
//         }
//       };

//       es.onerror = () => {
//         console.error('SSE error — cerrando conexión');
//         es.close();
//         eventSourceRef.current = null;
//         // No reconectar acá — esperar a que el interceptor de Axios
//         // renueve el token, lo que dispara este useEffect de nuevo
//       };
//     };

//     conectarSSE();

//     return () => {
//       eventSourceRef.current?.close();
//       eventSourceRef.current = null;
//     };

//   }, [accessToken]); // ← mismo trigger: cuando Axios renueva el token, este effect se re-ejecuta

//   // ── Acciones ──────────────────────────────────────────────
//   const noLeidas = notificaciones.filter((n) => !n.leida).length;

//   const marcarLeida = useCallback(async (id: number) => {
//     try {
//       await notificacionesApi.marcarLeida(id);
//       setNotificaciones((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
//       );
//     } catch (err) {
//       console.error('Error marcando leída:', err);
//     }
//   }, []);

//   const marcarTodasLeidas = useCallback(async () => {
//     try {
//       await notificacionesApi.marcarTodasLeidas();
//       setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
//     } catch (err) {
//       console.error('Error marcando todas leídas:', err);
//     }
//   }, []);

//   return { notificaciones, noLeidas, loading, error, marcarLeida, marcarTodasLeidas };
// }

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../../app/store/auth.store';
import { notificacionesApi, type Notificacion } from '../../services/api/notificaciones.api';
import { env } from '../../app/config/env';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const eventSourceRef          = useRef<EventSource | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;

    setLoading(true);
    setError(false);

    notificacionesApi
      .getAll()
      .then((data) => setNotificaciones(data))
      .catch((err) => {
        console.error('Error cargando notificaciones:', err);
        setError(true);
      })
      .finally(() => setLoading(false));

  }, [accessToken]);

  // ── SSE ───────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      eventSourceRef.current?.close();
      return;
    }

    const conectarSSE = () => {
      eventSourceRef.current?.close();

      const url = `${env.notificacionesApiUrl}/notificaciones/sse?token=${accessToken}`;
      const es  = new EventSource(url);
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

      // Token expirado — el servidor manda este evento antes de cerrar
      es.addEventListener('auth_error', () => {
        // console.warn('SSE auth_error — token expirado, esperando renovación');
        es.close();
        eventSourceRef.current = null;
        // No reconectar — el interceptor de Axios renovará el token
        // lo que dispara este useEffect de nuevo con el token nuevo
      });

      es.onerror = () => {
        // Solo llega acá si es un error de red real (servidor caído, CORS, etc.)
        if (es.readyState === EventSource.CLOSED) return;
        console.error('SSE error de red — cerrando conexión');
        es.close();
        eventSourceRef.current = null;
      };
    };

    conectarSSE();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };

  }, [accessToken]);

  // ── Acciones ──────────────────────────────────────────────
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarLeida = useCallback(async (id: number) => {
    try {
      await notificacionesApi.marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
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