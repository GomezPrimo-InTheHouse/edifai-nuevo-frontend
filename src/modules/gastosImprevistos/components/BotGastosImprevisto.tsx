

// // src/modules/gastosImprevistos/components/BotGastosImprevisto.tsx
// import React, { useState, useRef } from 'react';
// import {
//   Box, Button, Card, CardContent, CircularProgress,
//   Dialog, DialogActions, DialogContent, DialogTitle,
//   IconButton, Stack, TextField, Typography, useTheme,
// } from '@mui/material';
// import { Mic, MicOff, Send, Check, X, Bot } from 'lucide-react';
// import type { CreateGastoImprevistoPayload } from '../types/gastosImprevisto.types';
// import type { Obra } from '../../obras/types/obra.types';
// import type { EspecialidadOption } from '../../trabajadores/types/trabajador.types';

// interface FormasPago { id: number; nombre: string; }
// interface Trabajador { id: number; nombre: string; apellido: string; }

// interface BotGastoImprevistoProps {
//   obras:          Obra[];
//   especialidades: EspecialidadOption[];
//   formasPago:     FormasPago[];
//   trabajadores:   Trabajador[];
//   onConfirmar:    (payload: CreateGastoImprevistoPayload) => Promise<void>;
//   isSubmitting:   boolean;
// }

// const blobToFile = (blob: Blob, filename: string): File =>
//   new File([blob], filename, { type: blob.type });

// export const BotGastoImprevisto: React.FC<BotGastoImprevistoProps> = ({
//   obras, especialidades, formasPago, trabajadores, onConfirmar, isSubmitting,
// }) => {
//   const theme = useTheme();

//   const [open,       setOpen]       = useState(false);
//   const [texto,      setTexto]      = useState('');
//   const [grabando,   setGrabando]   = useState(false);
//   const [procesando, setProcesando] = useState(false);
//   const [resultado,  setResultado]  = useState<CreateGastoImprevistoPayload | null>(null);
//   const [error,      setError]      = useState<string | null>(null);
//   const [etapa,      setEtapa]      = useState<'transcribiendo' | 'interpretando' | null>(null);

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const chunksRef        = useRef<Blob[]>([]);

//   // ── Grabación ────────────────────────────────────────────────
//   const iniciarGrabacion = async () => {
//     setError(null);
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
//         ? 'audio/webm;codecs=opus'
//         : MediaRecorder.isTypeSupported('audio/mp4')
//         ? 'audio/mp4'
//         : 'audio/webm';

//       const recorder = new MediaRecorder(stream, { mimeType });
//       chunksRef.current = [];

//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunksRef.current.push(e.data);
//       };

//       recorder.onstop = async () => {
//         stream.getTracks().forEach(t => t.stop());
//         const blob = new Blob(chunksRef.current, { type: mimeType });
//         await transcribirConWhisper(blob, mimeType);
//       };

//       recorder.start();
//       mediaRecorderRef.current = recorder;
//       setGrabando(true);
//     } catch (err: any) {
//       if (err.name === 'NotAllowedError') {
//         setError('Permiso de micrófono denegado. Habilitalo en la configuración del browser.');
//       } else {
//         setError(`No se pudo acceder al micrófono: ${err.message}`);
//       }
//     }
//   };

//   const detenerGrabacion = () => {
//     mediaRecorderRef.current?.stop();
//     setGrabando(false);
//   };

//  const transcribirConWhisper = async (blob: Blob, mimeType: string) => {
//   setProcesando(true);
//   setEtapa('transcribiendo');
//   setError(null);

//   try {
//     const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
//     const file = blobToFile(blob, `audio.${extension}`);

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('model', 'whisper-large-v3-turbo');
//     formData.append('language', 'es');
//     formData.append('response_format', 'json');

//     const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
//       },
//       body: formData,
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       console.error('Groq error:', data);
//       setError(`Error al transcribir: ${data.error?.message ?? 'Error desconocido'}`);
//       return;
//     }

//     const transcripcion = data.text?.trim();
//     if (!transcripcion) {
//       setError('No se detectó voz. Intentá de nuevo.');
//       return;
//     }

//     setTexto(transcripcion);
//     await procesarConClaude(transcripcion);

//   } catch (err: any) {
//     setError(`Error al transcribir el audio: ${err.message}`);
//   } finally {
//     setProcesando(false);
//     setEtapa(null);
//   }
// };

//   // ── Claude — estructurar JSON ────────────────────────────────
//   const procesarConClaude = async (textoInput?: string) => {
//     const textoFinal = textoInput ?? texto;
//     if (!textoFinal.trim()) return;

//     setProcesando(true);
//     setEtapa('interpretando');
//     setError(null);
//     setResultado(null);

//     const prompt = `Sos un asistente de gestión de obras de construcción.
// Extraé los datos del siguiente gasto imprevisto y devolvé SOLO un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

// CAMPOS REQUERIDOS:
// - obra_id: number
// - especialidad_id: number
// - descripcion: string
// - motivo: string
// - monto: number (sin símbolos ni puntos de miles)
// - forma_pago_id: number
// - pagado_por_id: number
// - fecha: string (formato YYYY-MM-DD, si no se menciona usar ${new Date().toISOString().split('T')[0]})

// DATOS DISPONIBLES:
// Obras: ${JSON.stringify(obras.map(o => ({ id: o.id, nombre: o.nombre })))}
// Especialidades: ${JSON.stringify(especialidades.map(e => ({ id: e.id, nombre: e.nombre })))}
// Formas de pago: ${JSON.stringify(formasPago.map(f => ({ id: f.id, nombre: f.nombre })))}
// Trabajadores: ${JSON.stringify(trabajadores.map(t => ({ id: t.id, nombre: `${t.nombre} ${t.apellido}` })))}

// GASTO A INTERPRETAR: "${textoFinal}"

// Respondé ÚNICAMENTE con el JSON, nada más.`;

//     try {
//       const response = await fetch('https://api.anthropic.com/v1/messages', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
//           'anthropic-version': '2023-06-01',
//           'anthropic-dangerous-direct-browser-access': 'true',
//         },
//         body: JSON.stringify({
//           model: 'claude-haiku-4-5',
//           max_tokens: 500,
//           messages: [{ role: 'user', content: prompt }],
//         }),
//       });

//       const data = await response.json();
//       const rawText = data.content?.[0]?.text ?? '';
//       const clean = rawText.replace(/```json|```/g, '').trim();
//       const parsed: CreateGastoImprevistoPayload = JSON.parse(clean);
//       setResultado(parsed);
//     } catch {
//       setError('No se pudo interpretar el gasto. Intentá ser más específico.');
//     } finally {
//       setProcesando(false);
//       setEtapa(null);
//     }
//   };

//   const handleConfirmar = async () => {
//     if (!resultado) return;
//     await onConfirmar(resultado);
//     handleCerrar();
//   };

//   const handleCerrar = () => {
//     if (grabando) mediaRecorderRef.current?.stop();
//     setOpen(false);
//     setTexto('');
//     setResultado(null);
//     setError(null);
//     setGrabando(false);
//     setProcesando(false);
//     setEtapa(null);
//   };

//   const obraNombre           = obras.find(o => o.id === resultado?.obra_id)?.nombre ?? '-';
//   const especialidadNombre   = especialidades.find(e => e.id === resultado?.especialidad_id)?.nombre ?? '-';
//   const formaPagoNombre      = formasPago.find(f => f.id === resultado?.forma_pago_id)?.nombre ?? '-';
//   const trabajadorEncontrado = trabajadores.find(t => t.id === resultado?.pagado_por_id);

//   const etapaLabel = etapa === 'transcribiendo' ? 'Transcribiendo audio...' : 'Interpretando gasto...';

//   return (
//     <>
//       <Button variant="contained" startIcon={<Bot size={16} />} onClick={() => setOpen(true)}>
//         Registrar con IA
//       </Button>

//       <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           <Stack direction="row" alignItems="center" gap={1}>
//             <Bot size={20} color="#F59E0B" />
//             <Typography fontWeight={700}>Registrar gasto con IA</Typography>
//           </Stack>
//         </DialogTitle>

//         <DialogContent>
//           <Stack spacing={2.5} sx={{ mt: 1 }}>

//             <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
//               <Typography variant="body2" color="text.secondary">
//                 Dictá o escribí el gasto en lenguaje natural. Por ejemplo:
//               </Typography>
//               <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
//                 "Gasté $15.000 en materiales eléctricos para la Obra Puente Avellaneda, lo pagué con transferencia"
//               </Typography>
//             </Box>

//             <Stack direction="row" spacing={1} alignItems="flex-start">
//               <TextField
//                 fullWidth multiline minRows={3}
//                 placeholder="Describí el gasto..."
//                 value={texto}
//                 onChange={(e) => setTexto(e.target.value)}
//                 disabled={grabando || procesando}
//               />
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 <IconButton
//                   onClick={grabando ? detenerGrabacion : iniciarGrabacion}
//                   disabled={procesando}
//                   sx={{
//                     width: 48, height: 48, borderRadius: 2,
//                     bgcolor: grabando ? '#EF4444' : theme.palette.action.hover,
//                     color:   grabando ? '#FFFFFF' : theme.palette.text.primary,
//                     border: `1px solid ${grabando ? '#EF4444' : theme.palette.divider}`,
//                     '&:hover': { bgcolor: grabando ? '#DC2626' : theme.palette.action.selected },
//                   }}
//                 >
//                   {grabando ? <MicOff size={20} /> : <Mic size={20} />}
//                 </IconButton>

//                 <IconButton
//                   onClick={() => procesarConClaude()}
//                   disabled={!texto.trim() || procesando || grabando}
//                   sx={{
//                     width: 48, height: 48, borderRadius: 2,
//                     bgcolor: texto.trim() && !procesando ? '#F59E0B' : theme.palette.action.hover,
//                     color:   texto.trim() && !procesando ? '#0F172A' : theme.palette.text.disabled,
//                     border: `1px solid ${theme.palette.divider}`,
//                     '&:hover': { bgcolor: '#D97706' },
//                   }}
//                 >
//                   {procesando ? <CircularProgress size={18} /> : <Send size={20} />}
//                 </IconButton>
//               </Box>
//             </Stack>

//             {grabando && (
//               <Stack direction="row" alignItems="center" gap={1}>
//                 <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444', animation: 'pulse 1s infinite' }} />
//                 <Typography variant="caption" color="error">
//                   Grabando... tocá el micrófono para detener
//                 </Typography>
//               </Stack>
//             )}

//             {procesando && etapa && (
//               <Stack direction="row" alignItems="center" gap={1}>
//                 <CircularProgress size={14} />
//                 <Typography variant="caption" color="text.secondary">{etapaLabel}</Typography>
//               </Stack>
//             )}

//             {error && (
//               <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
//                 <Typography variant="caption" color="error">{error}</Typography>
//               </Box>
//             )}

//             {resultado && (
//               <Card elevation={0} sx={{ borderRadius: 2, border: `2px solid #F59E0B`, bgcolor: theme.palette.background.paper }}>
//                 <CardContent sx={{ p: 2 }}>
//                   <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
//                     <Bot size={16} color="#F59E0B" />
//                     <Typography variant="body2" fontWeight={700} color="#F59E0B">
//                       IA interpretó el gasto — ¿es correcto?
//                     </Typography>
//                   </Stack>
//                   <Stack spacing={1}>
//                     {[
//                       { label: 'Monto',         value: `$${Number(resultado.monto).toLocaleString('es-AR')}` },
//                       { label: 'Obra',          value: obraNombre },
//                       { label: 'Especialidad',  value: especialidadNombre },
//                       { label: 'Descripción',   value: resultado.descripcion },
//                       { label: 'Motivo',        value: resultado.motivo },
//                       { label: 'Forma de pago', value: formaPagoNombre },
//                       ...(trabajadorEncontrado
//                         ? [{ label: 'Pagado por', value: `${trabajadorEncontrado.nombre} ${trabajadorEncontrado.apellido}` }]
//                         : []),
//                       { label: 'Fecha', value: new Date(resultado.fecha + 'T12:00:00').toLocaleDateString('es-AR') },
//                     ].map((item) => (
//                       <Stack key={item.label} direction="row" justifyContent="space-between">
//                         <Typography variant="caption" color="text.secondary">{item.label}</Typography>
//                         <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ maxWidth: 200, textAlign: 'right' }}>
//                           {item.value}
//                         </Typography>
//                       </Stack>
//                     ))}
//                   </Stack>
//                   <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
//                     <Button fullWidth variant="outlined" size="small" startIcon={<X size={14} />}
//                       onClick={() => { setResultado(null); setTexto(''); }}>
//                       Corregir
//                     </Button>
//                     <Button fullWidth variant="contained" size="small"
//                       startIcon={isSubmitting ? <CircularProgress size={14} /> : <Check size={14} />}
//                       onClick={handleConfirmar}
//                       disabled={isSubmitting}
//                       sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
//                       {isSubmitting ? 'Guardando...' : 'Confirmar'}
//                     </Button>
//                   </Stack>
//                 </CardContent>
//               </Card>
//             )}
//           </Stack>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={handleCerrar}>Cancelar</Button>
//         </DialogActions>
//       </Dialog>

//       <style>{`
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50%       { opacity: 0.3; }
//         }
//       `}</style>
//     </>
//   );
// };

// src/modules/gastosImprevistos/components/BotGastosImprevisto.tsx
import React, { useState, useRef } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { Mic, MicOff, Send, Check, X, Bot, AlertTriangle } from 'lucide-react';
import type { CreateGastoImprevistoPayload } from '../types/gastosImprevisto.types';
import type { Obra } from '../../obras/types/obra.types';
import type { EspecialidadOption } from '../../trabajadores/types/trabajador.types';

interface FormasPago { id: number; nombre: string; }
interface Trabajador { id: number; nombre: string; apellido: string; }

interface CamposInterpretados {
  obra_id?:          number;
  especialidad_id?:  number;
  descripcion?:      string;
  motivo?:           string;
  monto?:            number;
  forma_pago_id?:    number;
  pagado_por_id?:    number;
  pagado_por_nombre_libre?: string; // nombre que dijo el usuario pero no matcheó
  fecha?:            string;
}

interface BotGastoImprevistoProps {
  obras:          Obra[];
  especialidades: EspecialidadOption[];
  formasPago:     FormasPago[];
  trabajadores:   Trabajador[];
  onConfirmar:    (payload: CreateGastoImprevistoPayload) => Promise<void>;
  isSubmitting:   boolean;
}

const CAMPOS_REQUERIDOS = [
  'obra_id', 'especialidad_id', 'descripcion',
  'motivo', 'monto', 'forma_pago_id', 'pagado_por_id',
] as const;

const LABEL: Record<string, string> = {
  obra_id:         'Obra',
  especialidad_id: 'Especialidad',
  descripcion:     'Descripción',
  motivo:          'Motivo',
  monto:           'Monto',
  forma_pago_id:   'Forma de pago',
  pagado_por_id:   'Pagado por',
  fecha:           'Fecha',
};

const blobToFile = (blob: Blob, filename: string): File =>
  new File([blob], filename, { type: blob.type });

export const BotGastoImprevisto: React.FC<BotGastoImprevistoProps> = ({
  obras, especialidades, formasPago, trabajadores, onConfirmar, isSubmitting,
}) => {
  const theme = useTheme();

  const [open,       setOpen]       = useState(false);
  const [grabando,   setGrabando]   = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [etapa,      setEtapa]      = useState<'transcribiendo' | 'interpretando' | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  // Historial de mensajes del usuario (para contexto multi-turno)
  const [historial,  setHistorial]  = useState<string[]>([]);

  // Campos acumulados entre turnos
  const [campos, setCampos] = useState<CamposInterpretados>({
    fecha: new Date().toISOString().split('T')[0],
  });

  // Edición manual desde la card
  const [editando, setEditando] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);

  // ── Campos faltantes ─────────────────────────────────────────
  const faltantes = CAMPOS_REQUERIDOS.filter(c => !campos[c as keyof CamposInterpretados]);
  const tieneWarningPagador = !campos.pagado_por_id && !!campos.pagado_por_nombre_libre;
  const listo = faltantes.length === 0;

  // ── Grabación ────────────────────────────────────────────────
  const iniciarGrabacion = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribirConGroq(blob, mimeType);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabando(true);
    } catch (err: any) {
      setError(err.name === 'NotAllowedError'
        ? 'Permiso de micrófono denegado.'
        : `No se pudo acceder al micrófono: ${err.message}`);
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  };

  // ── Groq Whisper ─────────────────────────────────────────────
  const transcribirConGroq = async (blob: Blob, mimeType: string) => {
    setProcesando(true);
    setEtapa('transcribiendo');
    try {
      const ext  = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = blobToFile(blob, `audio.${ext}`);
      const fd   = new FormData();
      fd.append('file', file);
      fd.append('model', 'whisper-large-v3-turbo');
      fd.append('language', 'es');
      fd.append('response_format', 'json');

      const res  = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) { setError(`Error al transcribir: ${data.error?.message ?? 'Error desconocido'}`); return; }

      const texto = data.text?.trim();
      if (!texto)  { setError('No se detectó voz. Intentá de nuevo.'); return; }

      await interpretarConClaude(texto);
    } catch (err: any) {
      setError(`Error al transcribir: ${err.message}`);
    } finally {
      setProcesando(false);
      setEtapa(null);
    }
  };

  // ── Claude — interpretar y MERGEAR con campos existentes ─────
  const interpretarConClaude = async (textoNuevo: string) => {
    setProcesando(true);
    setEtapa('interpretando');

    const nuevoHistorial = [...historial, textoNuevo];
    setHistorial(nuevoHistorial);

    const prompt = `Sos un asistente de gestión de obras de construcción argentino.
El usuario está registrando un gasto imprevisto en múltiples mensajes de voz.
Tu tarea es extraer los campos que puedas del mensaje actual y combinarlos con los ya extraídos.

CAMPOS YA EXTRAÍDOS (no los pierdas a menos que el usuario los corrija explícitamente):
${JSON.stringify(campos, null, 2)}

HISTORIAL DE MENSAJES DEL USUARIO:
${nuevoHistorial.map((m, i) => `Mensaje ${i + 1}: "${m}"`).join('\n')}

DATOS DISPONIBLES:
Obras: ${JSON.stringify(obras.map(o => ({ id: o.id, nombre: o.nombre })))}
Especialidades: ${JSON.stringify(especialidades.map(e => ({ id: e.id, nombre: e.nombre })))}
Formas de pago: ${JSON.stringify(formasPago.map(f => ({ id: f.id, nombre: f.nombre })))}
Trabajadores/Pagadores: ${JSON.stringify(trabajadores.map(t => ({ id: t.id, nombre: `${t.nombre} ${t.apellido}` })))}

REGLAS:
- Si el usuario menciona una obra, buscá el id más cercano por nombre
- Si el usuario dice un nombre de pagador que no está en la lista, guardalo en "pagado_por_nombre_libre" y dejá "pagado_por_id" sin valor
- Si el usuario corrige un campo (ej: "no, la obra es X"), actualizá ese campo
- Si no podés determinar un campo, no lo incluyas (dejá el valor anterior)
- fecha: formato YYYY-MM-DD, default hoy ${new Date().toISOString().split('T')[0]}
- monto: número sin símbolos

Devolvé SOLO un JSON con los campos que pudiste determinar (solo los que cambian o se agregan).
Sin markdown, sin texto adicional.`;

    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data    = await res.json();
      const rawText = data.content?.[0]?.text ?? '';
      const clean   = rawText.replace(/```json|```/g, '').trim();
      const parsed  = JSON.parse(clean);

      // Merge: nuevos campos encima de los existentes
      setCampos(prev => ({ ...prev, ...parsed }));
    } catch {
      setError('No se pudo interpretar el mensaje. Intentá de nuevo.');
    } finally {
      setProcesando(false);
      setEtapa(null);
    }
  };

  // ── Confirmar ────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!listo) return;
    const payload: CreateGastoImprevistoPayload = {
      obra_id:        campos.obra_id!,
      especialidad_id: campos.especialidad_id!,
      descripcion:    campos.descripcion!,
      motivo:         campos.motivo!,
      monto:          campos.monto!,
      forma_pago_id:  campos.forma_pago_id!,
      pagado_por_id:  campos.pagado_por_id!,
      fecha:          campos.fecha!,
    };
    await onConfirmar(payload);
    handleCerrar();
  };

  const handleCerrar = () => {
    if (grabando) mediaRecorderRef.current?.stop();
    setOpen(false);
    setGrabando(false);
    setProcesando(false);
    setEtapa(null);
    setError(null);
    setHistorial([]);
    setCampos({ fecha: new Date().toISOString().split('T')[0] });
    setEditando(null);
  };

  // ── Helpers display ──────────────────────────────────────────
  const obraNombre        = obras.find(o => o.id === campos.obra_id)?.nombre;
  const especialidadNombre = especialidades.find(e => e.id === campos.especialidad_id)?.nombre;
  const formaPagoNombre   = formasPago.find(f => f.id === campos.forma_pago_id)?.nombre;
  const pagadorNombre     = trabajadores.find(t => t.id === campos.pagado_por_id);

  const etapaLabel = etapa === 'transcribiendo' ? 'Transcribiendo audio...' : 'Interpretando con IA...';

  // ── Render campo editable ────────────────────────────────────
  const renderCampoEditable = (key: string, label: string, valor: string | undefined) => {
    const falta = !valor;
    return (
      <Stack key={key} direction="row" alignItems="center" justifyContent="space-between"
        sx={{ p: 1, borderRadius: 1.5, bgcolor: falta ? '#FEF2F2' : theme.palette.action.hover }}>
        <Typography variant="caption" color={falta ? 'error' : 'text.secondary'} sx={{ minWidth: 100 }}>
          {label}
        </Typography>
        {editando === key ? (
          // Campo en edición — select para IDs, text para el resto
          key === 'obra_id' ? (
            <TextField select size="small" value={campos.obra_id ?? ''} sx={{ minWidth: 160 }}
              onChange={(e) => { setCampos(p => ({ ...p, obra_id: Number(e.target.value) })); setEditando(null); }}>
              {obras.map(o => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
            </TextField>
          ) : key === 'especialidad_id' ? (
            <TextField select size="small" value={campos.especialidad_id ?? ''} sx={{ minWidth: 160 }}
              onChange={(e) => { setCampos(p => ({ ...p, especialidad_id: Number(e.target.value) })); setEditando(null); }}>
              {especialidades.map(e => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
            </TextField>
          ) : key === 'forma_pago_id' ? (
            <TextField select size="small" value={campos.forma_pago_id ?? ''} sx={{ minWidth: 160 }}
              onChange={(e) => { setCampos(p => ({ ...p, forma_pago_id: Number(e.target.value) })); setEditando(null); }}>
              {formasPago.map(f => <MenuItem key={f.id} value={f.id}>{f.nombre}</MenuItem>)}
            </TextField>
          ) : key === 'pagado_por_id' ? (
            <TextField select size="small" value={campos.pagado_por_id ?? ''} sx={{ minWidth: 160 }}
              onChange={(e) => { setCampos(p => ({ ...p, pagado_por_id: Number(e.target.value), pagado_por_nombre_libre: undefined })); setEditando(null); }}>
              {trabajadores.map(t => <MenuItem key={t.id} value={t.id}>{t.nombre} {t.apellido}</MenuItem>)}
            </TextField>
          ) : key === 'fecha' ? (
            <TextField type="date" size="small" value={campos.fecha ?? ''} sx={{ minWidth: 160 }}
              onChange={(e) => { setCampos(p => ({ ...p, fecha: e.target.value })); setEditando(null); }}
              InputLabelProps={{ shrink: true }} />
          ) : key === 'monto' ? (
            <TextField type="number" size="small" value={campos.monto ?? ''} sx={{ minWidth: 160 }}
              onChange={(e) => { setCampos(p => ({ ...p, monto: Number(e.target.value) })); setEditando(null); }} />
          ) : (
            <TextField size="small" value={(campos as any)[key] ?? ''} sx={{ minWidth: 160 }}
              onChange={(e) => { setCampos(p => ({ ...p, [key]: e.target.value })); }}
              onBlur={() => setEditando(null)} autoFocus />
          )
        ) : (
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" fontWeight={600} color={falta ? 'error' : 'text.primary'}
              sx={{ maxWidth: 180, textAlign: 'right' }}>
              {valor ?? '—'}
            </Typography>
            <IconButton size="small" onClick={() => setEditando(key)}
              sx={{ width: 22, height: 22 }}>
              <Typography variant="caption" color="text.disabled">✏️</Typography>
            </IconButton>
          </Stack>
        )}
      </Stack>
    );
  };

  return (
    <>
      <Button variant="contained" startIcon={<Bot size={16} />} onClick={() => setOpen(true)}>
        Registrar con IA
      </Button>

      <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1}>
            <Bot size={20} color="#F59E0B" />
            <Typography fontWeight={700}>Registrar gasto con IA</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>

            {/* Instrucción adaptativa */}
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="body2" color="text.secondary">
                {historial.length === 0
                  ? 'Dictá o escribí el gasto. Podés hacerlo en varios mensajes.'
                  : faltantes.length > 0
                  ? `Faltan datos: ${faltantes.map(f => LABEL[f]).join(', ')}. Grabá un mensaje con esa información.`
                  : '✅ Todos los campos completos. Revisá y confirmá.'}
              </Typography>
            </Box>

            {/* Historial de mensajes */}
            {historial.length > 0 && (
              <Stack spacing={0.5}>
                {historial.map((msg, i) => (
                  <Box key={i} sx={{ p: 1, borderRadius: 1.5, bgcolor: theme.palette.action.hover }}>
                    <Typography variant="caption" color="text.disabled">Mensaje {i + 1}:</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{msg}</Typography>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Botones de grabación */}
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                disabled={procesando}
                sx={{
                  width: 48, height: 48, borderRadius: 2,
                  bgcolor: grabando ? '#EF4444' : theme.palette.action.hover,
                  color:   grabando ? '#FFFFFF' : theme.palette.text.primary,
                  border: `1px solid ${grabando ? '#EF4444' : theme.palette.divider}`,
                  '&:hover': { bgcolor: grabando ? '#DC2626' : theme.palette.action.selected },
                }}
              >
                {grabando ? <MicOff size={20} /> : <Mic size={20} />}
              </IconButton>
              <Typography variant="caption" color={grabando ? 'error' : 'text.secondary'}>
                {grabando
                  ? '🔴 Grabando... tocá para detener'
                  : historial.length === 0
                  ? 'Tocá para grabar'
                  : 'Grabá para agregar o corregir información'}
              </Typography>
            </Stack>

            {/* Procesando */}
            {procesando && etapa && (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">{etapaLabel}</Typography>
              </Stack>
            )}

            {/* Error */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
            )}

            {/* Card de campos — aparece desde el primer mensaje */}
            {(Object.keys(campos).length > 1 || campos.fecha) && (
              <Card elevation={0} sx={{
                borderRadius: 2,
                border: `2px solid ${listo ? '#F59E0B' : theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Bot size={16} color="#F59E0B" />
                      <Typography variant="body2" fontWeight={700} color="#F59E0B">
                        Campos interpretados
                      </Typography>
                    </Stack>
                    {!listo && (
                      <Chip
                        label={`${faltantes.length} faltante${faltantes.length > 1 ? 's' : ''}`}
                        color="error" size="small"
                      />
                    )}
                  </Stack>

                  <Stack spacing={0.75}>
                    {renderCampoEditable('obra_id',         LABEL.obra_id,         obraNombre)}
                    {renderCampoEditable('especialidad_id', LABEL.especialidad_id,  especialidadNombre)}
                    {renderCampoEditable('descripcion',     LABEL.descripcion,      campos.descripcion)}
                    {renderCampoEditable('motivo',          LABEL.motivo,           campos.motivo)}
                    {renderCampoEditable('monto',           LABEL.monto,            campos.monto ? `$${Number(campos.monto).toLocaleString('es-AR')}` : undefined)}
                    {renderCampoEditable('forma_pago_id',   LABEL.forma_pago_id,    formaPagoNombre)}
                    {renderCampoEditable('pagado_por_id',   LABEL.pagado_por_id,    pagadorNombre ? `${pagadorNombre.nombre} ${pagadorNombre.apellido}` : undefined)}
                    {renderCampoEditable('fecha',           LABEL.fecha,            campos.fecha ? new Date(campos.fecha + 'T12:00:00').toLocaleDateString('es-AR') : undefined)}
                  </Stack>

                  {/* Warning pagador nombre libre */}
                  {tieneWarningPagador && (
                    <Alert severity="warning" icon={<AlertTriangle size={16} />} sx={{ mt: 1.5, py: 0.5 }}>
                      "{campos.pagado_por_nombre_libre}" no está registrado. Seleccionalo manualmente en el campo "Pagado por".
                    </Alert>
                  )}

                  {/* Botón confirmar */}
                  {listo && (
                    <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}
                      startIcon={isSubmitting ? <CircularProgress size={14} /> : <Check size={14} />}
                      onClick={handleConfirmar} disabled={isSubmitting}>
                      {isSubmitting ? 'Guardando...' : 'Confirmar gasto'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCerrar} startIcon={<X size={14} />}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  );
};