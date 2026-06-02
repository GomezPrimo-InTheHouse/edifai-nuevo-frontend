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

// const SpeechRecognitionAPI =
//   (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// export const BotGastoImprevisto: React.FC<BotGastoImprevistoProps> = ({
//   obras, especialidades, formasPago, trabajadores, onConfirmar, isSubmitting,
// }) => {
//   const theme = useTheme();

//   const [open,          setOpen]          = useState(false);
//   const [texto,         setTexto]         = useState('');
//   const [grabando,      setGrabando]      = useState(false);
//   const [procesando,    setProcesando]    = useState(false);
//   const [resultado,     setResultado]     = useState<CreateGastoImprevistoPayload | null>(null);
//   const [error,         setError]         = useState<string | null>(null);

//   const recognitionRef = useRef<any>(null);
// const iniciarGrabacion = () => {
//   if (!SpeechRecognitionAPI) {
//     setError('Tu navegador no soporta reconocimiento de voz. Escribí el gasto manualmente.');
//     return;
//   }
//   const recognition = new SpeechRecognitionAPI();
//   recognition.lang = 'es-AR';
//   recognition.continuous = false;
//   recognition.interimResults = true;
//   recognition.onstart  = () => setGrabando(true);
//   recognition.onresult = (event: any) => {
//     const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
//     setTexto(transcript);
//   };
//   recognition.onend   = () => setGrabando(false);
//   recognition.onerror = (event: any) => {
//     setGrabando(false);
//     console.error('SpeechRecognition error:', event.error, event.message);
//     if (event.error === 'not-allowed') {
//       setError('Permiso de micrófono denegado. Habilitalo en la configuración del browser.');
//     } else if (event.error === 'network') {
//       setError('Error de red. SpeechRecognition requiere conexión a servidores de Google.');
//     } else if (event.error === 'no-speech') {
//       setError('No se detectó voz. Intentá de nuevo.');
//     } else {
//       setError(`Error al grabar (${event.error}). Intentá de nuevo o escribí el gasto.`);
//     }
//   };
//   recognitionRef.current = recognition;
//   recognition.start();
// };

//   const detenerGrabacion = () => { recognitionRef.current?.stop(); setGrabando(false); };

//   const procesarConIA = async () => {
//     if (!texto.trim()) return;
//     setProcesando(true);
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

// GASTO A INTERPRETAR: "${texto}"

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
//     }
//   };

//   const handleConfirmar = async () => {
//     if (!resultado) return;
//     await onConfirmar(resultado);
//     setOpen(false);
//     setTexto('');
//     setResultado(null);
//   };

//   const handleCerrar = () => {
//     setOpen(false);
//     setTexto('');
//     setResultado(null);
//     setError(null);
//     recognitionRef.current?.stop();
//   };

//   const obraNombre         = obras.find(o => o.id === resultado?.obra_id)?.nombre ?? '-';
//   const especialidadNombre = especialidades.find(e => e.id === resultado?.especialidad_id)?.nombre ?? '-';
//   const formaPagoNombre    = formasPago.find(f => f.id === resultado?.forma_pago_id)?.nombre ?? '-';
//   const trabajadorEncontrado = trabajadores.find(t => t.id === resultado?.pagado_por_id);

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
//                   onClick={procesarConIA}
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
//                 <Typography variant="caption" color="error">Grabando... tocá el micrófono para detener</Typography>
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
//                       { label: 'Monto',        value: `$${Number(resultado.monto).toLocaleString('es-AR')}` },
//                       { label: 'Obra',         value: obraNombre },
//                       { label: 'Especialidad', value: especialidadNombre },
//                       { label: 'Descripción',  value: resultado.descripcion },
//                       { label: 'Motivo',       value: resultado.motivo },
//                       { label: 'Forma de pago', value: formaPagoNombre },
//                       ...(trabajadorEncontrado ? [{ label: 'Pagado por', value: `${trabajadorEncontrado.nombre} ${trabajadorEncontrado.apellido}` }] : []),
//                       { label: 'Fecha',        value: new Date(resultado.fecha).toLocaleDateString('es-AR') },
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
//                       onClick={handleConfirmar} disabled={isSubmitting}
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
//           50% { opacity: 0.3; }
//         }
//       `}</style>
//     </>
//   );
// };
// // src/modules/gastosImprevistos/components/BotGastosImprevisto.tsx
// // import React, { useState, useRef } from 'react';
// // import {
// //     Box, Button, Card, CardContent, CircularProgress,
// //     Dialog, DialogActions, DialogContent, DialogTitle,
// //     IconButton, Stack, TextField, Typography, useTheme,
// // } from '@mui/material';
// // import { Mic, MicOff, Send, Check, X, Bot } from 'lucide-react';
// // import type { CreateGastoImprevistoPayload } from '../types/gastosImprevisto.types';
// // import type { Obra } from '../../obras/types/obra.types';
// // import type { EspecialidadOption } from '../../trabajadores/types/trabajador.types';

// // interface FormasPago { id: number; nombre: string; }
// // interface Trabajador { id: number; nombre: string; apellido: string; }

// // interface BotGastoImprevistoProps {
// //     obras: Obra[];
// //     especialidades: EspecialidadOption[];
// //     formasPago: FormasPago[];
// //     trabajadores: Trabajador[];
// //     onConfirmar: (payload: CreateGastoImprevistoPayload) => Promise<void>;
// //     isSubmitting: boolean;
// // }

// // // Convierte blob a base64 sin el prefijo data:...
// // const blobToBase64 = (blob: Blob): Promise<string> =>
// //     new Promise((resolve, reject) => {
// //         const reader = new FileReader();
// //         reader.onloadend = () => {
// //             const result = reader.result as string;
// //             resolve(result.split(',')[1]);
// //         };
// //         reader.onerror = reject;
// //         reader.readAsDataURL(blob);
// //     });

// // export const BotGastoImprevisto: React.FC<BotGastoImprevistoProps> = ({
// //     obras, especialidades, formasPago, trabajadores, onConfirmar, isSubmitting,
// // }) => {
// //     const theme = useTheme();

// //     const [open, setOpen] = useState(false);
// //     const [texto, setTexto] = useState('');
// //     const [grabando, setGrabando] = useState(false);
// //     const [procesando, setProcesando] = useState(false);
// //     const [resultado, setResultado] = useState<CreateGastoImprevistoPayload | null>(null);
// //     const [error, setError] = useState<string | null>(null);
// //     const [etapa, setEtapa] = useState<'idle' | 'transcribiendo' | 'interpretando'>('idle');

// //     const mediaRecorderRef = useRef<MediaRecorder | null>(null);
// //     const chunksRef = useRef<Blob[]>([]);

// //     // ── Grabación con MediaRecorder ──────────────────────────────
// //     const iniciarGrabacion = async () => {
// //         setError(null);
// //         try {
// //             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// //             // Elegir mimeType compatible (WebM en desktop, OGG como fallback)
// //             const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
// //                 ? 'audio/webm;codecs=opus'
// //                 : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
// //                     ? 'audio/ogg;codecs=opus'
// //                     : 'audio/webm';

// //             const recorder = new MediaRecorder(stream, { mimeType });
// //             chunksRef.current = [];

// //             recorder.ondataavailable = (e) => {
// //                 if (e.data.size > 0) chunksRef.current.push(e.data);
// //             };

// //             recorder.onstop = async () => {
// //                 // Detener tracks del micrófono
// //                 stream.getTracks().forEach(t => t.stop());

// //                 const blob = new Blob(chunksRef.current, { type: mimeType });
// //                 await transcribirYProcesar(blob, mimeType);
// //             };

// //             recorder.start();
// //             mediaRecorderRef.current = recorder;
// //             setGrabando(true);
// //         } catch (err: any) {
// //             console.error('Error nombre:', err.name);
// //             console.error('Error mensaje:', err.message);
// //             console.error('Error completo:', err);
// //             if (err.name === 'NotAllowedError') {
// //                 setError('Permiso de micrófono denegado. Habilitalo en la configuración del browser.');
// //             } else {
// //                 setError('No se pudo acceder al micrófono. Verificá los permisos del browser.');
// //             }
// //         }
// //     };

// //     const detenerGrabacion = () => {
// //         mediaRecorderRef.current?.stop();
// //         setGrabando(false);
// //     };

// //     // ── Transcribir con Gemini Flash ─────────────────────────────
// //     const transcribirYProcesar = async (blob: Blob, mimeType: string) => {
// //         setProcesando(true);
// //         setEtapa('transcribiendo');
// //         setError(null);

// //         try {
// //             const base64Audio = await blobToBase64(blob);

// //             const geminiRes = await fetch(
// //                 `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
// //                 {
// //                     method: 'POST',
// //                     headers: { 'Content-Type': 'application/json' },
// //                     body: JSON.stringify({
// //                         contents: [{
// //                             parts: [
// //                                 {
// //                                     inline_data: {
// //                                         mime_type: mimeType.split(';')[0], // solo "audio/webm" sin codec
// //                                         data: base64Audio,
// //                                     },
// //                                 },
// //                                 {
// //                                     text: 'Transcribí exactamente lo que dice este audio en español argentino. Devolvé solo el texto transcripto, sin explicaciones ni formato.',
// //                                 },
// //                             ],
// //                         }],
// //                     }),
// //                 }
// //             );

// //             const geminiData = await geminiRes.json();
// //             const transcripcion = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

// //             if (!transcripcion) {
// //                 setError('No se pudo transcribir el audio. Intentá de nuevo o escribí el gasto.');
// //                 return;
// //             }

// //             setTexto(transcripcion);
// //             await procesarConClaude(transcripcion);

// //         } catch {
// //             setError('Error al transcribir el audio. Intentá de nuevo o escribí el gasto manualmente.');
// //         } finally {
// //             setProcesando(false);
// //             setEtapa('idle');
// //         }
// //     };

// //     // ── Procesar texto con Claude Haiku ──────────────────────────
// //     const procesarConClaude = async (textoInput?: string) => {
// //         const textoFinal = textoInput ?? texto;
// //         if (!textoFinal.trim()) return;

// //         setProcesando(true);
// //         setEtapa('interpretando');
// //         setError(null);
// //         setResultado(null);

// //         const prompt = `Sos un asistente de gestión de obras de construcción.
// // Extraé los datos del siguiente gasto imprevisto y devolvé SOLO un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

// // CAMPOS REQUERIDOS:
// // - obra_id: number
// // - especialidad_id: number
// // - descripcion: string
// // - motivo: string
// // - monto: number (sin símbolos ni puntos de miles)
// // - forma_pago_id: number
// // - pagado_por_id: number
// // - fecha: string (formato YYYY-MM-DD, si no se menciona usar ${new Date().toISOString().split('T')[0]})

// // DATOS DISPONIBLES:
// // Obras: ${JSON.stringify(obras.map(o => ({ id: o.id, nombre: o.nombre })))}
// // Especialidades: ${JSON.stringify(especialidades.map(e => ({ id: e.id, nombre: e.nombre })))}
// // Formas de pago: ${JSON.stringify(formasPago.map(f => ({ id: f.id, nombre: f.nombre })))}
// // Trabajadores: ${JSON.stringify(trabajadores.map(t => ({ id: t.id, nombre: `${t.nombre} ${t.apellido}` })))}

// // GASTO A INTERPRETAR: "${textoFinal}"

// // Respondé ÚNICAMENTE con el JSON, nada más.`;

// //         try {
// //             const response = await fetch('https://api.anthropic.com/v1/messages', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
// //                     'anthropic-version': '2023-06-01',
// //                     'anthropic-dangerous-direct-browser-access': 'true',
// //                 },
// //                 body: JSON.stringify({
// //                     model: 'claude-haiku-4-5',
// //                     max_tokens: 500,
// //                     messages: [{ role: 'user', content: prompt }],
// //                 }),
// //             });

// //             const data = await response.json();
// //             const rawText = data.content?.[0]?.text ?? '';
// //             const clean = rawText.replace(/```json|```/g, '').trim();
// //             const parsed: CreateGastoImprevistoPayload = JSON.parse(clean);
// //             setResultado(parsed);
// //         } catch {
// //             setError('No se pudo interpretar el gasto. Intentá ser más específico.');
// //         } finally {
// //             setProcesando(false);
// //             setEtapa('idle');
// //         }
// //     };

// //     const handleConfirmar = async () => {
// //         if (!resultado) return;
// //         await onConfirmar(resultado);
// //         handleCerrar();
// //     };

// //     const handleCerrar = () => {
// //         if (grabando) mediaRecorderRef.current?.stop();
// //         setOpen(false);
// //         setTexto('');
// //         setResultado(null);
// //         setError(null);
// //         setGrabando(false);
// //         setProcesando(false);
// //         setEtapa('idle');
// //     };

// //     const obraNombre = obras.find(o => o.id === resultado?.obra_id)?.nombre ?? '-';
// //     const especialidadNombre = especialidades.find(e => e.id === resultado?.especialidad_id)?.nombre ?? '-';
// //     const formaPagoNombre = formasPago.find(f => f.id === resultado?.forma_pago_id)?.nombre ?? '-';
// //     const trabajadorEncontrado = trabajadores.find(t => t.id === resultado?.pagado_por_id);

// //     const etapaLabel = etapa === 'transcribiendo' ? 'Transcribiendo audio...' : 'Interpretando gasto...';

// //     return (
// //         <>
// //             <Button variant="contained" startIcon={<Bot size={16} />} onClick={() => setOpen(true)}>
// //                 Registrar con IA
// //             </Button>

// //             <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
// //                 <DialogTitle>
// //                     <Stack direction="row" alignItems="center" gap={1}>
// //                         <Bot size={20} color="#F59E0B" />
// //                         <Typography fontWeight={700}>Registrar gasto con IA</Typography>
// //                     </Stack>
// //                 </DialogTitle>

// //                 <DialogContent>
// //                     <Stack spacing={2.5} sx={{ mt: 1 }}>

// //                         {/* Instrucción */}
// //                         <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
// //                             <Typography variant="body2" color="text.secondary">
// //                                 Dictá o escribí el gasto en lenguaje natural. Por ejemplo:
// //                             </Typography>
// //                             <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
// //                                 "Gasté $15.000 en materiales eléctricos para la Obra Puente Avellaneda, lo pagué con transferencia"
// //                             </Typography>
// //                         </Box>

// //                         {/* Input + botones */}
// //                         <Stack direction="row" spacing={1} alignItems="flex-start">
// //                             <TextField
// //                                 fullWidth multiline minRows={3}
// //                                 placeholder="Describí el gasto..."
// //                                 value={texto}
// //                                 onChange={(e) => setTexto(e.target.value)}
// //                                 disabled={grabando || procesando}
// //                             />
// //                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
// //                                 {/* Botón micrófono */}
// //                                 <IconButton
// //                                     onClick={grabando ? detenerGrabacion : iniciarGrabacion}
// //                                     disabled={procesando}
// //                                     sx={{
// //                                         width: 48, height: 48, borderRadius: 2,
// //                                         bgcolor: grabando ? '#EF4444' : theme.palette.action.hover,
// //                                         color: grabando ? '#FFFFFF' : theme.palette.text.primary,
// //                                         border: `1px solid ${grabando ? '#EF4444' : theme.palette.divider}`,
// //                                         '&:hover': { bgcolor: grabando ? '#DC2626' : theme.palette.action.selected },
// //                                     }}
// //                                 >
// //                                     {grabando ? <MicOff size={20} /> : <Mic size={20} />}
// //                                 </IconButton>

// //                                 {/* Botón enviar texto manual */}
// //                                 <IconButton
// //                                     onClick={() => procesarConClaude()}
// //                                     disabled={!texto.trim() || procesando || grabando}
// //                                     sx={{
// //                                         width: 48, height: 48, borderRadius: 2,
// //                                         bgcolor: texto.trim() && !procesando ? '#F59E0B' : theme.palette.action.hover,
// //                                         color: texto.trim() && !procesando ? '#0F172A' : theme.palette.text.disabled,
// //                                         border: `1px solid ${theme.palette.divider}`,
// //                                         '&:hover': { bgcolor: '#D97706' },
// //                                     }}
// //                                 >
// //                                     {procesando ? <CircularProgress size={18} /> : <Send size={20} />}
// //                                 </IconButton>
// //                             </Box>
// //                         </Stack>

// //                         {/* Indicador de grabación */}
// //                         {grabando && (
// //                             <Stack direction="row" alignItems="center" gap={1}>
// //                                 <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444', animation: 'pulse 1s infinite' }} />
// //                                 <Typography variant="caption" color="error">
// //                                     Grabando... tocá el micrófono para detener
// //                                 </Typography>
// //                             </Stack>
// //                         )}

// //                         {/* Indicador de procesamiento */}
// //                         {procesando && (
// //                             <Stack direction="row" alignItems="center" gap={1}>
// //                                 <CircularProgress size={14} />
// //                                 <Typography variant="caption" color="text.secondary">{etapaLabel}</Typography>
// //                             </Stack>
// //                         )}

// //                         {/* Error */}
// //                         {error && (
// //                             <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
// //                                 <Typography variant="caption" color="error">{error}</Typography>
// //                             </Box>
// //                         )}

// //                         {/* Card de confirmación */}
// //                         {resultado && (
// //                             <Card elevation={0} sx={{ borderRadius: 2, border: `2px solid #F59E0B`, bgcolor: theme.palette.background.paper }}>
// //                                 <CardContent sx={{ p: 2 }}>
// //                                     <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
// //                                         <Bot size={16} color="#F59E0B" />
// //                                         <Typography variant="body2" fontWeight={700} color="#F59E0B">
// //                                             IA interpretó el gasto — ¿es correcto?
// //                                         </Typography>
// //                                     </Stack>
// //                                     <Stack spacing={1}>
// //                                         {[
// //                                             { label: 'Monto', value: `$${Number(resultado.monto).toLocaleString('es-AR')}` },
// //                                             { label: 'Obra', value: obraNombre },
// //                                             { label: 'Especialidad', value: especialidadNombre },
// //                                             { label: 'Descripción', value: resultado.descripcion },
// //                                             { label: 'Motivo', value: resultado.motivo },
// //                                             { label: 'Forma de pago', value: formaPagoNombre },
// //                                             ...(trabajadorEncontrado
// //                                                 ? [{ label: 'Pagado por', value: `${trabajadorEncontrado.nombre} ${trabajadorEncontrado.apellido}` }]
// //                                                 : []),
// //                                             { label: 'Fecha', value: new Date(resultado.fecha + 'T12:00:00').toLocaleDateString('es-AR') },
// //                                         ].map((item) => (
// //                                             <Stack key={item.label} direction="row" justifyContent="space-between">
// //                                                 <Typography variant="caption" color="text.secondary">{item.label}</Typography>
// //                                                 <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ maxWidth: 200, textAlign: 'right' }}>
// //                                                     {item.value}
// //                                                 </Typography>
// //                                             </Stack>
// //                                         ))}
// //                                     </Stack>
// //                                     <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
// //                                         <Button fullWidth variant="outlined" size="small" startIcon={<X size={14} />}
// //                                             onClick={() => { setResultado(null); setTexto(''); }}>
// //                                             Corregir
// //                                         </Button>
// //                                         <Button fullWidth variant="contained" size="small"
// //                                             startIcon={isSubmitting ? <CircularProgress size={14} /> : <Check size={14} />}
// //                                             onClick={handleConfirmar}
// //                                             disabled={isSubmitting}
// //                                             sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
// //                                             {isSubmitting ? 'Guardando...' : 'Confirmar'}
// //                                         </Button>
// //                                     </Stack>
// //                                 </CardContent>
// //                             </Card>
// //                         )}
// //                     </Stack>
// //                 </DialogContent>

// //                 <DialogActions>
// //                     <Button onClick={handleCerrar}>Cancelar</Button>
// //                 </DialogActions>
// //             </Dialog>

// //             <style>{`
// //         @keyframes pulse {
// //           0%, 100% { opacity: 1; }
// //           50%       { opacity: 0.3; }
// //         }
// //       `}</style>
// //         </>
// //     );
// // };

// src/modules/gastosImprevistos/components/BotGastosImprevisto.tsx
import React, { useState, useRef } from 'react';
import {
  Box, Button, Card, CardContent, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { Mic, MicOff, Send, Check, X, Bot } from 'lucide-react';
import type { CreateGastoImprevistoPayload } from '../types/gastosImprevisto.types';
import type { Obra } from '../../obras/types/obra.types';
import type { EspecialidadOption } from '../../trabajadores/types/trabajador.types';

interface FormasPago { id: number; nombre: string; }
interface Trabajador { id: number; nombre: string; apellido: string; }

interface BotGastoImprevistoProps {
  obras:          Obra[];
  especialidades: EspecialidadOption[];
  formasPago:     FormasPago[];
  trabajadores:   Trabajador[];
  onConfirmar:    (payload: CreateGastoImprevistoPayload) => Promise<void>;
  isSubmitting:   boolean;
}

const blobToFile = (blob: Blob, filename: string): File =>
  new File([blob], filename, { type: blob.type });

export const BotGastoImprevisto: React.FC<BotGastoImprevistoProps> = ({
  obras, especialidades, formasPago, trabajadores, onConfirmar, isSubmitting,
}) => {
  const theme = useTheme();

  const [open,       setOpen]       = useState(false);
  const [texto,      setTexto]      = useState('');
  const [grabando,   setGrabando]   = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [resultado,  setResultado]  = useState<CreateGastoImprevistoPayload | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [etapa,      setEtapa]      = useState<'transcribiendo' | 'interpretando' | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);

  // ── Grabación ────────────────────────────────────────────────
  const iniciarGrabacion = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribirConWhisper(blob, mimeType);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabando(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Permiso de micrófono denegado. Habilitalo en la configuración del browser.');
      } else {
        setError(`No se pudo acceder al micrófono: ${err.message}`);
      }
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  };

 const transcribirConWhisper = async (blob: Blob, mimeType: string) => {
  setProcesando(true);
  setEtapa('transcribiendo');
  setError(null);

  try {
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const file = blobToFile(blob, `audio.${extension}`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'es');
    formData.append('response_format', 'json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Groq error:', data);
      setError(`Error al transcribir: ${data.error?.message ?? 'Error desconocido'}`);
      return;
    }

    const transcripcion = data.text?.trim();
    if (!transcripcion) {
      setError('No se detectó voz. Intentá de nuevo.');
      return;
    }

    setTexto(transcripcion);
    await procesarConClaude(transcripcion);

  } catch (err: any) {
    setError(`Error al transcribir el audio: ${err.message}`);
  } finally {
    setProcesando(false);
    setEtapa(null);
  }
};

  // ── Claude — estructurar JSON ────────────────────────────────
  const procesarConClaude = async (textoInput?: string) => {
    const textoFinal = textoInput ?? texto;
    if (!textoFinal.trim()) return;

    setProcesando(true);
    setEtapa('interpretando');
    setError(null);
    setResultado(null);

    const prompt = `Sos un asistente de gestión de obras de construcción.
Extraé los datos del siguiente gasto imprevisto y devolvé SOLO un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

CAMPOS REQUERIDOS:
- obra_id: number
- especialidad_id: number
- descripcion: string
- motivo: string
- monto: number (sin símbolos ni puntos de miles)
- forma_pago_id: number
- pagado_por_id: number
- fecha: string (formato YYYY-MM-DD, si no se menciona usar ${new Date().toISOString().split('T')[0]})

DATOS DISPONIBLES:
Obras: ${JSON.stringify(obras.map(o => ({ id: o.id, nombre: o.nombre })))}
Especialidades: ${JSON.stringify(especialidades.map(e => ({ id: e.id, nombre: e.nombre })))}
Formas de pago: ${JSON.stringify(formasPago.map(f => ({ id: f.id, nombre: f.nombre })))}
Trabajadores: ${JSON.stringify(trabajadores.map(t => ({ id: t.id, nombre: `${t.nombre} ${t.apellido}` })))}

GASTO A INTERPRETAR: "${textoFinal}"

Respondé ÚNICAMENTE con el JSON, nada más.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
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

      const data = await response.json();
      const rawText = data.content?.[0]?.text ?? '';
      const clean = rawText.replace(/```json|```/g, '').trim();
      const parsed: CreateGastoImprevistoPayload = JSON.parse(clean);
      setResultado(parsed);
    } catch {
      setError('No se pudo interpretar el gasto. Intentá ser más específico.');
    } finally {
      setProcesando(false);
      setEtapa(null);
    }
  };

  const handleConfirmar = async () => {
    if (!resultado) return;
    await onConfirmar(resultado);
    handleCerrar();
  };

  const handleCerrar = () => {
    if (grabando) mediaRecorderRef.current?.stop();
    setOpen(false);
    setTexto('');
    setResultado(null);
    setError(null);
    setGrabando(false);
    setProcesando(false);
    setEtapa(null);
  };

  const obraNombre           = obras.find(o => o.id === resultado?.obra_id)?.nombre ?? '-';
  const especialidadNombre   = especialidades.find(e => e.id === resultado?.especialidad_id)?.nombre ?? '-';
  const formaPagoNombre      = formasPago.find(f => f.id === resultado?.forma_pago_id)?.nombre ?? '-';
  const trabajadorEncontrado = trabajadores.find(t => t.id === resultado?.pagado_por_id);

  const etapaLabel = etapa === 'transcribiendo' ? 'Transcribiendo audio...' : 'Interpretando gasto...';

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
          <Stack spacing={2.5} sx={{ mt: 1 }}>

            <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="body2" color="text.secondary">
                Dictá o escribí el gasto en lenguaje natural. Por ejemplo:
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                "Gasté $15.000 en materiales eléctricos para la Obra Puente Avellaneda, lo pagué con transferencia"
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                fullWidth multiline minRows={3}
                placeholder="Describí el gasto..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                disabled={grabando || procesando}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

                <IconButton
                  onClick={() => procesarConClaude()}
                  disabled={!texto.trim() || procesando || grabando}
                  sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: texto.trim() && !procesando ? '#F59E0B' : theme.palette.action.hover,
                    color:   texto.trim() && !procesando ? '#0F172A' : theme.palette.text.disabled,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { bgcolor: '#D97706' },
                  }}
                >
                  {procesando ? <CircularProgress size={18} /> : <Send size={20} />}
                </IconButton>
              </Box>
            </Stack>

            {grabando && (
              <Stack direction="row" alignItems="center" gap={1}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444', animation: 'pulse 1s infinite' }} />
                <Typography variant="caption" color="error">
                  Grabando... tocá el micrófono para detener
                </Typography>
              </Stack>
            )}

            {procesando && etapa && (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">{etapaLabel}</Typography>
              </Stack>
            )}

            {error && (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <Typography variant="caption" color="error">{error}</Typography>
              </Box>
            )}

            {resultado && (
              <Card elevation={0} sx={{ borderRadius: 2, border: `2px solid #F59E0B`, bgcolor: theme.palette.background.paper }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                    <Bot size={16} color="#F59E0B" />
                    <Typography variant="body2" fontWeight={700} color="#F59E0B">
                      IA interpretó el gasto — ¿es correcto?
                    </Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {[
                      { label: 'Monto',         value: `$${Number(resultado.monto).toLocaleString('es-AR')}` },
                      { label: 'Obra',          value: obraNombre },
                      { label: 'Especialidad',  value: especialidadNombre },
                      { label: 'Descripción',   value: resultado.descripcion },
                      { label: 'Motivo',        value: resultado.motivo },
                      { label: 'Forma de pago', value: formaPagoNombre },
                      ...(trabajadorEncontrado
                        ? [{ label: 'Pagado por', value: `${trabajadorEncontrado.nombre} ${trabajadorEncontrado.apellido}` }]
                        : []),
                      { label: 'Fecha', value: new Date(resultado.fecha + 'T12:00:00').toLocaleDateString('es-AR') },
                    ].map((item) => (
                      <Stack key={item.label} direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ maxWidth: 200, textAlign: 'right' }}>
                          {item.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<X size={14} />}
                      onClick={() => { setResultado(null); setTexto(''); }}>
                      Corregir
                    </Button>
                    <Button fullWidth variant="contained" size="small"
                      startIcon={isSubmitting ? <CircularProgress size={14} /> : <Check size={14} />}
                      onClick={handleConfirmar}
                      disabled={isSubmitting}
                      sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
                      {isSubmitting ? 'Guardando...' : 'Confirmar'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCerrar}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </>
  );
};