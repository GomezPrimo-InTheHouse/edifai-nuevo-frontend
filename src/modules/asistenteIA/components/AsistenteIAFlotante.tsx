// import { useState, useRef, useEffect } from 'react';
// import {
//   Box, Paper, TextField, IconButton, Typography,
//   Stack, CircularProgress, Fab, Collapse, Divider, Chip,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import { useTranslation } from 'react-i18next';
// import { Send, X, Bot, User, MessageSquare, Plus } from 'lucide-react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { asistenteApi, type MensajeAsistente } from '../../../services/api/asistente.api';

// const ROLES_ADMIN = [1, 3, 4, 6, 9];

// const PREGUNTAS_SUGERIDAS = [
//   '¿Cómo está el negocio hoy?',
//   '¿Qué obras están activas?',
//   '¿Hay labores atrasadas?',
//   '¿Cuánto hay pendiente de pago?',
//   '¿Qué materiales no tienen stock?',
//   '¿Cuál es la obra con más gastos imprevistos?',
//   '¿Qué trabajadores no tienen labores activas?',
//   '¿Cuánto vale el inventario de materiales?',
//   '¿Cuáles son los materiales más usados?',
//   '¿Cuál fue el mes con mayor gasto?',
// ];

// interface AsistenteIAFlotanteProps {
//   rolId: number;
// }

// export const AsistenteIAFlotante: React.FC<AsistenteIAFlotanteProps> = ({ rolId }) => {
//   const theme = useTheme();
//   const { t } = useTranslation();
//   const queryClient = useQueryClient();

//   const [abierto, setAbierto] = useState(false);
//   const [input, setInput] = useState('');
//   const [sesionId, setSesionId] = useState<number | undefined>();
//   const [mensajes, setMensajes] = useState<MensajeAsistente[]>([]);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const esAdmin = ROLES_ADMIN.includes(rolId);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [mensajes]);

//   // foco al abrir
//   useEffect(() => {
//     if (abierto) setTimeout(() => inputRef.current?.focus(), 150);
//   }, [abierto]);

//   const enviarMutation = useMutation({
//     mutationFn: (mensaje: string) => asistenteApi.enviarMensaje(mensaje, sesionId),
//     onMutate: (mensaje) => {
//       setMensajes((prev) => [...prev, { rol: 'user', contenido: mensaje }]);
//     },
//     onSuccess: (res) => {
//       setSesionId(res.data.sesion_id);
//       setMensajes((prev) => [...prev, { rol: 'assistant', contenido: res.data.respuesta }]);
//       queryClient.invalidateQueries({ queryKey: ['asistente', 'sesiones'] });
//     },
//     onError: () => {
//       setMensajes((prev) => [...prev, {
//         rol: 'assistant',
//         contenido: 'Ocurrió un error al procesar tu mensaje. Intentá de nuevo.',
//       }]);
//     },
//   });

//   const handleEnviar = (texto?: string) => {
//     const msg = (texto ?? input).trim();
//     if (!msg || enviarMutation.isPending) return;
//     enviarMutation.mutate(msg);
//     setInput('');
//   };

//   const handleNueva = () => {
//     setSesionId(undefined);
//     setMensajes([]);
//     setInput('');
//   };

//   const hayMensajes = mensajes.length > 0;

//   if (!esAdmin) return null;

//   return (
//     <>
//       <Collapse
//         in={abierto}
//         sx={{
//           position: 'fixed',
//           bottom: 88,
//           right: 24,
//           zIndex: 1300,
//           width: { xs: 'calc(100vw - 48px)', sm: 400 },
//         }}
//       >
//         <Paper
//           elevation={0}
//           sx={{
//             display: 'flex',
//             flexDirection: 'column',
//             height: 520,
//             border: `1px solid ${theme.palette.divider}`,
//             borderRadius: 3,
//             overflow: 'hidden',
//             bgcolor: 'background.paper',
//             boxShadow: theme.palette.mode === 'dark'
//               ? '0 8px 32px rgba(0,0,0,0.6)'
//               : '0 8px 32px rgba(0,0,0,0.15)',
//           }}
//         >
//           {/* Header */}
//           <Box sx={{
//             px: 2, py: 1.5,
//             bgcolor: '#0F172A',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             flexShrink: 0,
//           }}>
//             <Stack direction="row" spacing={1} alignItems="center">
//               <Bot size={18} color="#F59E0B" />
//               <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
//                 {t('asistente_ia.title')}
//               </Typography>
//               {/* indicador online */}
//               <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#22C55E', ml: 0.5 }} />
//             </Stack>
//             <Stack direction="row" spacing={0.5}>
//               <IconButton size="small" onClick={handleNueva} title={t('asistente_ia.nueva_sesion')}>
//                 <Plus size={16} color="#94A3B8" />
//               </IconButton>
//               <IconButton size="small" onClick={() => setAbierto(false)}>
//                 <X size={16} color="#94A3B8" />
//               </IconButton>
//             </Stack>
//           </Box>

//           <Divider />

//           {/* Mensajes */}
//           <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>

//             {/* Estado vacío + preguntas sugeridas */}
//             {!hayMensajes && (
//               <Box>
//                 <Box sx={{ textAlign: 'center', mb: 2.5 }}>
//                   <Bot size={28} color={theme.palette.text.disabled} />
//                   <Typography variant="body2" color="text.secondary" mt={1} fontSize={13}>
//                     {t('asistente_ia.empty')}
//                   </Typography>
//                 </Box>

//                 <Typography
//                   variant="caption"
//                   color="text.disabled"
//                   sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: '0.06em' }}
//                 >
//                   {t('asistente_ia.sugerencias_titulo')}
//                 </Typography>

//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
//                   {PREGUNTAS_SUGERIDAS.map((pregunta) => (
//                     <Chip
//                       key={pregunta}
//                       label={pregunta}
//                       size="small"
//                       onClick={() => handleEnviar(pregunta)}
//                       disabled={enviarMutation.isPending}
//                       sx={{
//                         fontSize: 11,
//                         height: 'auto',
//                         py: 0.5,
//                         cursor: 'pointer',
//                         bgcolor: theme.palette.action.hover,
//                         border: `1px solid ${theme.palette.divider}`,
//                         '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.4 },
//                         '&:hover': { bgcolor: 'rgba(245,158,11,0.1)', borderColor: '#F59E0B' },
//                         transition: 'all 0.15s',
//                       }}
//                     />
//                   ))}
//                 </Box>
//               </Box>
//             )}

//             {/* Mensajes */}
//             <Stack spacing={1.5}>
//               {mensajes.map((m, i) => (
//                 <Box
//                   key={i}
//                   sx={{ display: 'flex', justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start' }}
//                 >
//                   <Box
//                     sx={{
//                       maxWidth: '85%',
//                       px: 1.5, py: 1,
//                       borderRadius: m.rol === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
//                       bgcolor: m.rol === 'user' ? '#0F172A' : theme.palette.action.hover,
//                       border: `1px solid ${theme.palette.divider}`,
//                     }}
//                   >
//                     <Stack direction="row" spacing={0.75} alignItems="center" mb={0.25}>
//                       {m.rol === 'user'
//                         ? <User size={11} color="#94A3B8" />
//                         : <Bot size={11} color="#F59E0B" />}
//                       <Typography sx={{ fontSize: 10, color: m.rol === 'user' ? '#94A3B8' : theme.palette.text.secondary }}>
//                         {m.rol === 'user' ? t('asistente_ia.vos') : t('asistente_ia.asistente')}
//                       </Typography>
//                     </Stack>
//                     <Typography
//                       sx={{
//                         fontSize: 13,
//                         whiteSpace: 'pre-wrap',
//                         color: m.rol === 'user' ? '#F8FAFC' : theme.palette.text.primary,
//                       }}
//                     >
//                       {m.contenido}
//                     </Typography>
//                   </Box>
//                 </Box>
//               ))}

//               {enviarMutation.isPending && (
//                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 0.5 }}>
//                   <Box sx={{
//                     px: 1.5, py: 1,
//                     borderRadius: '12px 12px 12px 4px',
//                     bgcolor: theme.palette.action.hover,
//                     border: `1px solid ${theme.palette.divider}`,
//                   }}>
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       <CircularProgress size={12} sx={{ color: '#F59E0B' }} />
//                       <Typography variant="caption" color="text.secondary">
//                         {t('asistente_ia.pensando')}
//                       </Typography>
//                     </Stack>
//                   </Box>
//                 </Box>
//               )}
//             </Stack>

//             {/* Sugerencias contextuales después del primer mensaje */}
//             {hayMensajes && !enviarMutation.isPending && mensajes[mensajes.length - 1]?.rol === 'assistant' && (
//               <Box sx={{ mt: 2 }}>
//                 <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
//                   {t('asistente_ia.seguir_preguntando')}
//                 </Typography>
//                 <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
//                   {PREGUNTAS_SUGERIDAS.slice(0, 3).map((pregunta) => (
//                     <Chip
//                       key={pregunta}
//                       label={pregunta}
//                       size="small"
//                       onClick={() => handleEnviar(pregunta)}
//                       sx={{
//                         fontSize: 11,
//                         cursor: 'pointer',
//                         bgcolor: 'transparent',
//                         border: `1px solid ${theme.palette.divider}`,
//                         '&:hover': { bgcolor: 'rgba(245,158,11,0.1)', borderColor: '#F59E0B' },
//                         transition: 'all 0.15s',
//                       }}
//                     />
//                   ))}
//                 </Stack>
//               </Box>
//             )}
//           </Box>

//           <Divider />

//           {/* Input */}
//           <Box sx={{ p: 1.5, flexShrink: 0 }}>
//             <Stack direction="row" spacing={1}>
//               <TextField
//                 inputRef={inputRef}
//                 fullWidth
//                 size="small"
//                 placeholder={t('asistente_ia.placeholder')}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     handleEnviar();
//                   }
//                 }}
//                 disabled={enviarMutation.isPending}
//                 multiline
//                 maxRows={3}
//                 sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
//               />
//               <IconButton
//                 onClick={() => handleEnviar()}
//                 disabled={enviarMutation.isPending || !input.trim()}
//                 sx={{
//                   bgcolor: '#F59E0B',
//                   color: '#0F172A',
//                   borderRadius: 2,
//                   '&:hover': { bgcolor: '#D97706' },
//                   '&:disabled': { bgcolor: theme.palette.action.disabledBackground },
//                   alignSelf: 'flex-end',
//                 }}
//               >
//                 <Send size={16} />
//               </IconButton>
//             </Stack>
//           </Box>
//         </Paper>
//       </Collapse>

//       {/* FAB */}
//       <Fab
//         onClick={() => setAbierto((p) => !p)}
//         sx={{
//           position: 'fixed',
//           bottom: 24,
//           right: 24,
//           zIndex: 1300,
//           bgcolor: '#0F172A',
//           color: '#F59E0B',
//           boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
//           '&:hover': { bgcolor: '#1E293B' },
//         }}
//       >
//         {abierto ? <X size={22} /> : <MessageSquare size={22} />}
//       </Fab>
//     </>
//   );
// };

import { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, TextField, IconButton, Typography,
  Stack, CircularProgress, Fab, Collapse, Divider, Chip, Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Send, X, Bot, User, MessageSquare, Plus, Mic, MicOff, FileDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { asistenteApi, type MensajeAsistente } from '../../../services/api/asistente.api';

const ROLES_ADMIN = [1, 3, 4, 6, 9];

const PREGUNTAS_SUGERIDAS = [
  '¿Cómo está el negocio hoy?',
  '¿Qué obras están activas?',
  '¿Hay labores atrasadas?',
  '¿Cuánto hay pendiente de pago?',
  '¿Qué materiales no tienen stock?',
  '¿Cuál es la obra con más gastos imprevistos?',
  '¿Qué trabajadores no tienen labores activas?',
  '¿Cuánto vale el inventario de materiales?',
  '¿Cuáles son los materiales más usados?',
  '¿Cuál fue el mes con mayor gasto?',
];

const blobToFile = (blob: Blob, filename: string): File =>
  new File([blob], filename, { type: blob.type });

interface AsistenteIAFlotanteProps {
  rolId: number;
}

export const AsistenteIAFlotante: React.FC<AsistenteIAFlotanteProps> = ({ rolId }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [abierto, setAbierto] = useState(false);
  const [input, setInput] = useState('');
  const [sesionId, setSesionId] = useState<number | undefined>();
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([]);
  const [grabando, setGrabando] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [errorAudio, setErrorAudio] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const esAdmin = ROLES_ADMIN.includes(rolId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 150);
  }, [abierto]);

  const enviarMutation = useMutation({
    mutationFn: (mensaje: string) => asistenteApi.enviarMensaje(mensaje, sesionId),
    onMutate: (mensaje) => {
      setMensajes((prev) => [...prev, { rol: 'user', contenido: mensaje }]);
    },
    onSuccess: (res) => {
      setSesionId(res.data.sesion_id);
      setMensajes((prev) => [...prev, { rol: 'assistant', contenido: res.data.respuesta }]);
      queryClient.invalidateQueries({ queryKey: ['asistente', 'sesiones'] });
    },
    onError: () => {
      setMensajes((prev) => [...prev, {
        rol: 'assistant',
        contenido: 'Ocurrió un error al procesar tu mensaje. Intentá de nuevo.',
      }]);
    },
  });

  const handleEnviar = (texto?: string) => {
    const msg = (texto ?? input).trim();
    if (!msg || enviarMutation.isPending) return;
    enviarMutation.mutate(msg);
    setInput('');
  };

  const handleNueva = () => {
    setSesionId(undefined);
    setMensajes([]);
    setInput('');
  };

  // ── Audio: grabación + Groq Whisper (mismo patrón que BotGastoImprevisto) ──
  const iniciarGrabacion = async () => {
    setErrorAudio(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribirConGroq(blob, mimeType);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabando(true);
    } catch (err: any) {
      setErrorAudio(err.name === 'NotAllowedError'
        ? 'Permiso de micrófono denegado.'
        : `No se pudo acceder al micrófono: ${err.message}`);
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  };

  const transcribirConGroq = async (blob: Blob, mimeType: string) => {
    setTranscribiendo(true);
    try {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = blobToFile(blob, `audio.${ext}`);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('model', 'whisper-large-v3-turbo');
      fd.append('language', 'es');
      fd.append('response_format', 'json');

      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorAudio(`Error al transcribir: ${data.error?.message ?? 'Error desconocido'}`);
        return;
      }
      const texto = data.text?.trim();
      if (!texto) {
        setErrorAudio('No se detectó voz. Intentá de nuevo.');
        return;
      }
      handleEnviar(texto);
    } catch (err: any) {
      setErrorAudio(`Error al transcribir: ${err.message}`);
    } finally {
      setTranscribiendo(false);
    }
  };

  const limpiarTexto = (texto: string): string =>
  texto
    .replace(/[ÁÀÄÂ]/g, 'A').replace(/[áàäâ]/g, 'a')
    .replace(/[ÉÈËÊ]/g, 'E').replace(/[éèëê]/g, 'e')
    .replace(/[ÍÌÏÎ]/g, 'I').replace(/[íìïî]/g, 'i')
    .replace(/[ÓÒÖÔ]/g, 'O').replace(/[óòöô]/g, 'o')
    .replace(/[ÚÙÜÛ]/g, 'U').replace(/[úùüû]/g, 'u')
    .replace(/Ñ/g, 'N').replace(/ñ/g, 'n')
    .replace(/[^\x00-\x7F]/g, '');

const exportarPDF = (contenido: string) => {
  const doc  = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11);
  doc.text('EdifAI — Asistente IA', 14, 12);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generado: ${fecha}`, 14, 21);

  let cursorY = 36;
  const lineas = contenido.split('\n');

  for (let idx = 0; idx < lineas.length; idx++) {
    if (cursorY > 270) { doc.addPage(); cursorY = 14; }

    const raw = lineas[idx].trim();
    if (!raw) { cursorY += 3; continue; }

    if (/^---+$/.test(raw)) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(14, cursorY, 196, cursorY);
      cursorY += 5;
      continue;
    }

    if (raw.startsWith('## ')) {
      const texto = limpiarTexto(raw.replace(/^##\s+/, '').replace(/[*_`#|]/g, '').trim());
      doc.setFillColor(30, 58, 95);
      doc.roundedRect(14, cursorY - 1, 182, 8, 1, 1, 'F');
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.text(texto, 17, cursorY + 5);
      doc.setFont('helvetica', 'normal');
      cursorY += 12;
      continue;
    }

    if (raw.startsWith('### ')) {
      const texto = limpiarTexto(raw.replace(/^###\s+/, '').replace(/[*_`#]/g, '').trim());
      doc.setFontSize(10);
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text(texto, 14, cursorY);
      doc.setFont('helvetica', 'normal');
      cursorY += 7;
      continue;
    }

    if (raw.startsWith('|')) {
      const filasMd: string[] = [];
      let i = idx;
      while (i < lineas.length && lineas[i].trim().startsWith('|')) {
        filasMd.push(lineas[i].trim());
        i++;
      }

      const parseFila = (f: string) =>
        f.split('|')
          .slice(1, -1)
          .map(c => limpiarTexto(c.replace(/[*_`]/g, '').trim()));

      const separadorIdx = filasMd.findIndex(f => /^\|[\s\-|]+\|$/.test(f));
      if (separadorIdx !== -1) {
        const head = [parseFila(filasMd[0])];
        const body = filasMd.slice(separadorIdx + 1).map(parseFila);

        if (cursorY > 240) { doc.addPage(); cursorY = 14; }

        autoTable(doc, {
          startY: cursorY,
          head,
          body,
          styles:             { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
          headStyles:         { fillColor: [30, 58, 95], textColor: [248, 250, 252], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin:             { left: 14, right: 14 },
        });

        cursorY = (doc as any).lastAutoTable.finalY + 6;
        // Marcar filas procesadas
        for (let k = idx + 1; k < idx + filasMd.length; k++) lineas[k] = '';
        idx += filasMd.length - 1;
      }
      continue;
    }

    if (raw.startsWith('- ') || raw.startsWith('* ')) {
      const texto = limpiarTexto(raw.slice(2).replace(/\*\*(.*?)\*\*/g, '$1').replace(/[*_`]/g, '').trim());
      const wrapped = doc.splitTextToSize(`• ${texto}`, 174);
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(wrapped, 18, cursorY);
      cursorY += wrapped.length * 5 + 1;
      continue;
    }

    if (/^\*\*.*\*\*/.test(raw)) {
      const texto = limpiarTexto(raw.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[*_`]/g, '').trim());
      if (!texto) continue;
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const wrapped = doc.splitTextToSize(texto, 182);
      doc.text(wrapped, 14, cursorY);
      doc.setFont('helvetica', 'normal');
      cursorY += wrapped.length * 5 + 2;
      continue;
    }

    const textoLimpio = limpiarTexto(
      raw.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[*_`#|]/g, '').trim()
    );
    if (!textoLimpio) continue;

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(textoLimpio, 182);
    doc.text(wrapped, 14, cursorY);
    cursorY += wrapped.length * 5 + 2;
  }

  const totalPaginas = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`EdifAI · Pagina ${p} de ${totalPaginas}`, 14, 290);
    doc.text(fecha, 170, 290);
  }

  doc.save(`asistente-edifai-${Date.now()}.pdf`);
};

  const hayMensajes = mensajes.length > 0;

  if (!esAdmin) return null;

  return (
    <>
      <Collapse
        in={abierto}
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(88px + env(safe-area-inset-bottom))', sm: 88 },
          right: { xs: 12, sm: 24 },
          left: { xs: 12, sm: 'auto' },
          zIndex: 1300,
          width: { xs: 'auto', sm: 400 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: '70dvh', sm: 520 },
            maxHeight: { xs: '70dvh', sm: 520 },
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.6)'
              : '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <Box sx={{
            px: 2, py: 1.5,
            bgcolor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Bot size={18} color="#F59E0B" />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
                {t('asistente_ia.title')}
              </Typography>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#22C55E', ml: 0.5 }} />
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={handleNueva} title={t('asistente_ia.nueva_sesion')}>
                <Plus size={16} color="#94A3B8" />
              </IconButton>
              <IconButton size="small" onClick={() => setAbierto(false)}>
                <X size={16} color="#94A3B8" />
              </IconButton>
            </Stack>
          </Box>

          <Divider />

          {/* Mensajes */}
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', p: 2, minHeight: 0 }}>

            {!hayMensajes && (
              <Box>
                <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                  <Bot size={28} color={theme.palette.text.disabled} />
                  <Typography variant="body2" color="text.secondary" mt={1} fontSize={13}>
                    {t('asistente_ia.empty')}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: '0.06em' }}
                >
                  {t('asistente_ia.sugerencias_titulo')}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {PREGUNTAS_SUGERIDAS.map((pregunta) => (
                    <Chip
                      key={pregunta}
                      label={pregunta}
                      size="small"
                      onClick={() => handleEnviar(pregunta)}
                      disabled={enviarMutation.isPending}
                      sx={{
                        fontSize: 11,
                        height: 'auto',
                        py: 0.5,
                        cursor: 'pointer',
                        bgcolor: theme.palette.action.hover,
                        border: `1px solid ${theme.palette.divider}`,
                        '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.4 },
                        '&:hover': { bgcolor: 'rgba(245,158,11,0.1)', borderColor: '#F59E0B' },
                        transition: 'all 0.15s',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Stack spacing={1.5}>
              {mensajes.map((m, i) => (
                <Box
                  key={i}
                  sx={{ display: 'flex', justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <Box sx={{ maxWidth: '85%' }}>
                    <Box
                      sx={{
                        px: 1.5, py: 1,
                        borderRadius: m.rol === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        bgcolor: m.rol === 'user' ? '#0F172A' : theme.palette.action.hover,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center" mb={0.25}>
                        {m.rol === 'user'
                          ? <User size={11} color="#94A3B8" />
                          : <Bot size={11} color="#F59E0B" />}
                        <Typography sx={{ fontSize: 10, color: m.rol === 'user' ? '#94A3B8' : theme.palette.text.secondary }}>
                          {m.rol === 'user' ? t('asistente_ia.vos') : t('asistente_ia.asistente')}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          fontSize: 13,
                          whiteSpace: 'pre-wrap',
                          color: m.rol === 'user' ? '#F8FAFC' : theme.palette.text.primary,
                        }}
                      >
                        {m.contenido}
                      </Typography>
                    </Box>

                    {/* Exportar solo en mensajes del asistente */}
                    {m.rol === 'assistant' && (
                      <Tooltip title={t('asistente_ia.exportar_pdf')}>
                        <IconButton
                          size="small"
                          onClick={() => exportarPDF(m.contenido)}
                          sx={{ mt: 0.25, width: 22, height: 22 }}
                        >
                          <FileDown size={12} color={theme.palette.text.disabled} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              ))}

              {(enviarMutation.isPending || transcribiendo) && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 0.5 }}>
                  <Box sx={{
                    px: 1.5, py: 1,
                    borderRadius: '12px 12px 12px 4px',
                    bgcolor: theme.palette.action.hover,
                    border: `1px solid ${theme.palette.divider}`,
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={12} sx={{ color: '#F59E0B' }} />
                      <Typography variant="caption" color="text.secondary">
                        {transcribiendo ? t('asistente_ia.transcribiendo') : t('asistente_ia.pensando')}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              )}
            </Stack>

            {hayMensajes && !enviarMutation.isPending && mensajes[mensajes.length - 1]?.rol === 'assistant' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
                  {t('asistente_ia.seguir_preguntando')}
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {PREGUNTAS_SUGERIDAS.slice(0, 3).map((pregunta) => (
                    <Chip
                      key={pregunta}
                      label={pregunta}
                      size="small"
                      onClick={() => handleEnviar(pregunta)}
                      sx={{
                        fontSize: 11,
                        cursor: 'pointer',
                        bgcolor: 'transparent',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: 'rgba(245,158,11,0.1)', borderColor: '#F59E0B' },
                        transition: 'all 0.15s',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          <Divider />

          {errorAudio && (
            <Box sx={{ px: 1.5, pt: 1 }}>
              <Typography variant="caption" color="error">{errorAudio}</Typography>
            </Box>
          )}

          {/* Input */}
          <Box sx={{ p: 1.5, flexShrink: 0 }}>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                disabled={enviarMutation.isPending || transcribiendo}
                sx={{
                  width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                  bgcolor: grabando ? '#EF4444' : theme.palette.action.hover,
                  color: grabando ? '#FFFFFF' : theme.palette.text.primary,
                  border: `1px solid ${grabando ? '#EF4444' : theme.palette.divider}`,
                  '&:hover': { bgcolor: grabando ? '#DC2626' : theme.palette.action.selected },
                }}
              >
                {grabando ? <MicOff size={18} /> : <Mic size={18} />}
              </IconButton>

              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                placeholder={t('asistente_ia.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEnviar();
                  }
                }}
                disabled={enviarMutation.isPending}
                multiline
                maxRows={3}
                sx={{
                  // fontSize 16 evita el auto-zoom de iOS/Android al enfocar el input
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiOutlinedInput-input': { fontSize: 16 },
                }}
              />
              <IconButton
                onClick={() => handleEnviar()}
                disabled={enviarMutation.isPending || !input.trim()}
                sx={{
                  bgcolor: '#F59E0B',
                  color: '#0F172A',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#D97706' },
                  '&:disabled': { bgcolor: theme.palette.action.disabledBackground },
                  alignSelf: 'flex-end',
                }}
              >
                <Send size={16} />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Collapse>

      <Fab
        onClick={() => setAbierto((p) => !p)}
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1300,
          bgcolor: '#0F172A',
          color: '#F59E0B',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          '&:hover': { bgcolor: '#1E293B' },
        }}
      >
        {abierto ? <X size={22} /> : <MessageSquare size={22} />}
      </Fab>
    </>
  );
};