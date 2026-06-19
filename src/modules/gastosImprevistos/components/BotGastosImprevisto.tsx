

// src/modules/gastosImprevistos/components/BotGastosImprevisto.tsx
import React, { useState, useRef } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { Mic, MicOff, Check, X, Bot, AlertTriangle, Camera, Plus, Trash2 } from 'lucide-react';
import type { CreateGastoImprevistoPayload, CreateGastoImprevistoPayloadV2, FormaPagoDetalle } from '../types/gastosImprevisto.types';
import type { Obra } from '../../obras/types/obra.types';
import type { EspecialidadOption } from '../../trabajadores/types/trabajador.types';
import { gastoImprevistoApi } from '../../../services/api/gastoImprevisto.api';

interface FormasPago { id: number; nombre: string; }
interface Trabajador { id: number; nombre: string; apellido: string; }

interface CamposInterpretados {
  obra_id?:                 number;
  especialidad_id?:         number;
  descripcion?:             string;
  monto?:                   number;
  formas_pago?:             FormaPagoDetalle[];
  pagado_por_id?:           number;
  pagado_por_nombre_libre?: string;
  fecha?:                   string;
  ticket_url?:              string;
}

interface BotGastoImprevistoProps {
  obras:              Obra[];
  especialidades:     EspecialidadOption[];
  formasPago:         FormasPago[];
  trabajadores:       Trabajador[];
  onConfirmar:        (payload: CreateGastoImprevistoPayload) => Promise<void>;
  isSubmitting:       boolean;
  // Nuevas props para modo worker
  trabajadorLogueado?: { id: number; nombre: string; apellido: string };
  soloEquipo?:         boolean;
}

const CAMPOS_REQUERIDOS = [
  'obra_id', 'especialidad_id', 'descripcion',
  'monto', 'pagado_por_id',
] as const;

const LABEL: Record<string, string> = {
  obra_id:         'Obra',
  especialidad_id: 'Especialidad',
  descripcion:     'Descripción',
  monto:           'Monto',
  pagado_por_id:   'Pagado por',
  fecha:           'Fecha',
};

const blobToFile = (blob: Blob, filename: string): File =>
  new File([blob], filename, { type: blob.type });

export const BotGastoImprevisto: React.FC<BotGastoImprevistoProps> = ({
  obras, especialidades, formasPago, trabajadores, onConfirmar, isSubmitting,
  trabajadorLogueado, soloEquipo = false,
}) => {
  const theme = useTheme();

  // Lista de trabajadores filtrada según modo
  const trabajadoresDisponibles = soloEquipo && trabajadorLogueado
    ? trabajadores // ya viene filtrado desde el padre (equipo + el propio trabajador)
    : trabajadores;

  const [open,          setOpen]          = useState(false);
  const [grabando,      setGrabando]      = useState(false);
  const [procesando,    setProcesando]    = useState(false);
  const [etapa,         setEtapa]         = useState<'transcribiendo' | 'interpretando' | 'analizando_ticket' | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [historial,     setHistorial]     = useState<string[]>([]);
  const [editando,      setEditando]      = useState<string | null>(null);
  const [ticketPreview, setTicketPreview] = useState<string | null>(null);
  // Estado local del input de monto para evitar que se borre al tipear
  const [montoInput,    setMontoInput]    = useState<string>('');

  const [campos, setCampos] = useState<CamposInterpretados>(() => ({
    fecha:         new Date().toISOString().split('T')[0],
    formas_pago:   [],
    // Pre-asignar trabajador logueado si viene en modo worker
    pagado_por_id: trabajadorLogueado?.id,
  }));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const fileInputRef     = useRef<HTMLInputElement>(null);

  // ── Validaciones ─────────────────────────────────────────────
  const faltantes       = CAMPOS_REQUERIDOS.filter(c => !campos[c as keyof CamposInterpretados]);
  const formasPagoValidas = (campos.formas_pago ?? []).length > 0;
  const sumaFormasPago    = (campos.formas_pago ?? []).reduce((acc, fp) => acc + Number(fp.monto), 0);
  const formasPagoSuman   = campos.monto ? Math.abs(sumaFormasPago - Number(campos.monto)) <= 0.01 : false;
  const tieneWarningPagador = !campos.pagado_por_id && !!campos.pagado_por_nombre_libre;
  const listo = faltantes.length === 0 && formasPagoValidas && formasPagoSuman;

  // ── Grabación ────────────────────────────────────────────────
  const iniciarGrabacion = async () => {
    setError(null);
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        method:  'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body:    fd,
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

  // ── Claude — interpretar texto ────────────────────────────────
  const interpretarConClaude = async (textoNuevo: string) => {
    setProcesando(true);
    setEtapa('interpretando');
    const nuevoHistorial = [...historial, textoNuevo];
    setHistorial(nuevoHistorial);

    const hoy  = new Date().toISOString().split('T')[0];
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Contexto del trabajador logueado para el prompt
    const contextoPagador = trabajadorLogueado
      ? `El usuario logueado es: ${trabajadorLogueado.nombre} ${trabajadorLogueado.apellido} (id: ${trabajadorLogueado.id}). Si el usuario dice "yo", "yo pagué", "lo pagué yo" o similar, asigná este trabajador como pagado_por_trabajador_id.`
      : '';

    const prompt = [
      'Sos un asistente experto en gestión de obras de construcción argentina.',
      'Tu tarea es extraer campos de un gasto imprevisto de obra a partir de texto de voz.',
      '',
      'CAMPOS YA EXTRAÍDOS (no los pierdas, solo actualizá si hay corrección explícita):',
      JSON.stringify(campos, null, 2),
      '',
      'HISTORIAL DE MENSAJES DEL USUARIO:',
      nuevoHistorial.map((m, i) => `Mensaje ${i + 1}: "${m}"`).join('\n'),
      '',
      'DATOS DISPONIBLES EN EL SISTEMA:',
      'Obras: ' + JSON.stringify(obras.map(o => ({ id: o.id, nombre: o.nombre }))),
      'Especialidades: ' + JSON.stringify(especialidades.map(e => ({ id: e.id, nombre: e.nombre }))),
      'Formas de pago: ' + JSON.stringify(formasPago.map(f => ({ id: f.id, nombre: f.nombre }))),
      'Trabajadores disponibles: ' + JSON.stringify(trabajadoresDisponibles.map(t => ({ id: t.id, nombre: `${t.nombre} ${t.apellido}` }))),
      '',
      'REGLAS DE EXTRACCIÓN:',
      '',
      'OBRA:',
      '- Buscá coincidencia por nombre (parcial o fonética) con las obras disponibles.',
      '- Devolvé obra_id con el id encontrado.',
      '',
      'ESPECIALIDAD (inferencia inteligente):',
      '- Inferí la especialidad según el tipo de gasto o material mencionado.',
      '- Ejemplos: cemento/ladrillo/revoque/hormigón → albañilería; pintura/látex/esmalte → pintura; cable/tablero/disyuntor → electricidad; caño/válvula/grifo → plomería; madera/puerta/ventana → carpintería; cerámico/porcelanato → colocación.',
      '- Si el usuario menciona explícitamente una especialidad, priorizá eso.',
      '- Devolvé especialidad_id con el id más cercano de la lista disponible.',
      '',
      'DESCRIPCIÓN:',
      '- Generá una descripción clara y concisa del gasto en 1-2 oraciones.',
      '- Incluí qué se compró o pagó y para qué obra o trabajo si se menciona.',
      '',
      'PAGADO POR (MUY IMPORTANTE):',
      contextoPagador,
      '- La lista de trabajadores disponibles está arriba. Buscá coincidencia por nombre, apellido o apodo, incluso con errores de pronunciación o transcripción.',
      '- Ejemplos de frases que indican quién pagó: "lo pagó Juan", "pagué yo", "lo abonó García", "fue María la que puso la plata", "lo pagamos entre Rodrigo y yo".',
      '- Si encontrás coincidencia clara con un trabajador de la lista, devolvé pagado_por_trabajador_id con su id.',
      '- Si el nombre mencionado NO está en la lista de trabajadores disponibles, devolvé pagado_por_nombre_libre con el nombre tal como fue dicho.',
      '- NUNCA devuelvas ambos campos a la vez.',
      '- Si no se menciona quién pagó y hay un usuario logueado, NO asumas automáticamente que fue él — esperá que lo confirme.',
      '',
      'MONTO (MUY IMPORTANTE):',
      '- Extraé SOLO el número, sin símbolos ($), sin puntos de miles, sin comas decimales a menos que sea un decimal real.',
      '- Números en palabras: "dos mil quinientos" → 2500, "un millón" → 1000000, "ciento cincuenta" → 150.',
      '- "mil y pico" → 1000 aproximado. "como dos lucas" → 2000.',
      '- Si el usuario dice "con IVA" o "más IVA", multiplicá por 1.21.',
      '- Devolvé el monto como número entero o decimal, sin formato.',
      '',
      'FORMAS DE PAGO:',
      '- Array de { forma_pago_id, monto }.',
      '- Buscá la forma de pago por nombre en la lista disponible.',
      '- "efectivo" → buscá el id de efectivo. "transferencia" → buscá el id de transferencia.',
      '- Si dice "50% efectivo 50% transferencia" y el monto es 2000 → dos objetos con 1000 cada uno.',
      '- Si solo menciona una forma sin porcentaje, asignale el monto total.',
      '',
      'FECHA:',
      '- Formato YYYY-MM-DD.',
      '- "ayer" → ' + ayer + '. "hoy" o sin mención → ' + hoy + '.',
      '- Calculá fechas relativas correctamente según hoy.',
      '',
      'IMPORTANTE:',
      '- Devolvé SOLO el JSON con los campos que cambian o se agregan.',
      '- No incluyas campos que ya están correctos y no cambian.',
      '- Si el usuario corrige un campo, actualizalo.',
      '- Si no podés determinar un campo con certeza, no lo incluyas.',
      '- Sin markdown, sin explicaciones, solo JSON puro.',
      '',
      'Campos posibles: obra_id, especialidad_id, descripcion, monto, fecha, pagado_por_trabajador_id, pagado_por_nombre_libre, formas_pago: [{ forma_pago_id, monto }]',
    ].join('\n');

try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':                            'application/json',
          'x-api-key':                               import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version':                       '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      'claude-haiku-4-5',
          max_tokens: 600,
          messages:   [{ role: 'user', content: prompt }],
        }),
      });
      const data    = await res.json();
      const rawText = data.content?.[0]?.text ?? '';
      const clean   = rawText.replace(/```json|```/g, '').trim();
      const parsed  = JSON.parse(clean);

      console.log('🤖 Claude parsed:', JSON.stringify(parsed, null, 2));

      // Si viene pagado_por_trabajador_id lo mapeamos a pagado_por_id
      const { pagado_por_trabajador_id, pagado_por_nombre_libre, formas_pago: formasPagoNuevas, ...rest } = parsed;
      console.log('pagado_por_trabajador_id:', pagado_por_trabajador_id);
      console.log('trabajadoresDisponibles:', JSON.stringify(
        trabajadoresDisponibles.map(t => ({ id: t.id, nombre: `${t.nombre} ${t.apellido}`}))
      ));

      setCampos(prev => ({
        ...prev,
        ...rest,
        ...(formasPagoNuevas && formasPagoNuevas.length > 0 ? { formas_pago: formasPagoNuevas } : {}),
        ...(pagado_por_trabajador_id ? { pagado_por_id: pagado_por_trabajador_id, pagado_por_nombre_libre: undefined } : {}),
        ...(pagado_por_nombre_libre  ? { pagado_por_nombre_libre, pagado_por_id: undefined } : {}),
      }));

      // Sincronizar montoInput si vino monto nuevo
      if (rest.monto !== undefined) {
        setMontoInput(String(rest.monto));
      }
    } catch {
      setError('No se pudo interpretar el mensaje. Intentá de nuevo.');
    } finally {
      setProcesando(false);
      setEtapa(null);
    }
  };

  // ── Upload + análisis ticket ──────────────────────────────────
  const handleTicketChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProcesando(true);
    setEtapa('analizando_ticket');

    try {
      const localUrl = URL.createObjectURL(file);
      setTicketPreview(localUrl);

      const ticketUrl = await gastoImprevistoApi.uploadTicket(file);
      const resultado = await gastoImprevistoApi.analizarTicketConIA(
        ticketUrl,
        formasPago.map(f => ({ id: f.id, nombre: f.nombre }))
      );

      setCampos(prev => ({
        ...prev,
        ticket_url: ticketUrl,
        ...(resultado.descripcion && { descripcion: resultado.descripcion }),
        ...(resultado.monto       && { monto: resultado.monto }),
        ...(resultado.fecha       && { fecha: resultado.fecha }),
        ...(resultado.formas_pago && resultado.formas_pago.length > 0 && { formas_pago: resultado.formas_pago }),
      }));

      if (resultado.monto) setMontoInput(String(resultado.monto));

    } catch (err: any) {
      setError(`Error al procesar el ticket: ${err.message}`);
    } finally {
      setProcesando(false);
      setEtapa(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Formas de pago ────────────────────────────────────────────
  const agregarFormaPago = () => {
    setCampos(prev => ({
      ...prev,
      formas_pago: [...(prev.formas_pago ?? []), { forma_pago_id: 0, monto: 0 }],
    }));
  };

  const actualizarFormaPago = (index: number, field: 'forma_pago_id' | 'monto', value: number) => {
    setCampos(prev => {
      const fp = [...(prev.formas_pago ?? [])];
      fp[index] = { ...fp[index], [field]: value };
      return { ...prev, formas_pago: fp };
    });
  };

  const eliminarFormaPago = (index: number) => {
    setCampos(prev => ({
      ...prev,
      formas_pago: (prev.formas_pago ?? []).filter((_, i) => i !== index),
    }));
  };

  // ── Confirmar ────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!listo) return;
    const payload: CreateGastoImprevistoPayloadV2 = {
      obra_id:         campos.obra_id!,
      especialidad_id: campos.especialidad_id!,
      descripcion:     campos.descripcion!,
      monto:           campos.monto!,
      formas_pago:     campos.formas_pago!,
      pagado_por_id:   campos.pagado_por_id!,
      fecha:           campos.fecha!,
      ticket_url:      campos.ticket_url ?? null,
    };
    await onConfirmar(payload as any);
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
    setCampos({
      fecha:         new Date().toISOString().split('T')[0],
      formas_pago:   [],
      pagado_por_id: trabajadorLogueado?.id,
    });
    setEditando(null);
    setTicketPreview(null);
    setMontoInput('');
  };

  // ── Helpers display ──────────────────────────────────────────
  const obraNombre         = obras.find(o => o.id === campos.obra_id)?.nombre;
  const especialidadNombre = especialidades.find(e => e.id === campos.especialidad_id)?.nombre;
  const pagadorNombre      = trabajadoresDisponibles.find(t => t.id === campos.pagado_por_id);

  const etapaLabel = etapa === 'transcribiendo'
    ? 'Transcribiendo audio...'
    : etapa === 'interpretando'
    ? 'Interpretando con IA...'
    : etapa === 'analizando_ticket'
    ? 'Analizando ticket con IA...'
    : '';

  // ── Render campo editable ────────────────────────────────────
  const renderCampoEditable = (key: string, label: string, valor: string | undefined) => {
    const falta = !valor;
    return (
      <Stack key={key} direction="row" alignItems="center" justifyContent="space-between"
        sx={{ p: 1, borderRadius: 1.5, bgcolor: falta ? '#FEF2F2' : theme.palette.action.hover }}>
        <Typography variant="caption" color={falta ? 'error' : 'text.secondary'} sx={{ minWidth: 90 }}>
          {label}
        </Typography>
        {editando === key ? (
          key === 'obra_id' ? (
            <TextField select size="small" value={campos.obra_id ?? ''} sx={{ minWidth: 150 }}
              onChange={(e) => { setCampos(p => ({ ...p, obra_id: Number(e.target.value) })); setEditando(null); }}>
              {obras.map(o => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
            </TextField>
          ) : key === 'especialidad_id' ? (
            <TextField select size="small" value={campos.especialidad_id ?? ''} sx={{ minWidth: 150 }}
              onChange={(e) => { setCampos(p => ({ ...p, especialidad_id: Number(e.target.value) })); setEditando(null); }}>
              {especialidades.map(e => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
            </TextField>
          ) : key === 'pagado_por_id' ? (
            <TextField select size="small" value={campos.pagado_por_id ?? ''} sx={{ minWidth: 150 }}
              onChange={(e) => { setCampos(p => ({ ...p, pagado_por_id: Number(e.target.value), pagado_por_nombre_libre: undefined })); setEditando(null); }}>
              {trabajadoresDisponibles.map(t => <MenuItem key={t.id} value={t.id}>{t.nombre} {t.apellido}</MenuItem>)}
            </TextField>
          ) : key === 'fecha' ? (
            <TextField type="date" size="small" value={campos.fecha ?? ''} sx={{ minWidth: 150 }}
              onChange={(e) => { setCampos(p => ({ ...p, fecha: e.target.value })); setEditando(null); }}
              InputLabelProps={{ shrink: true }} />
          ) : key === 'monto' ? (
            // ── Monto: input controlado que no se borra ──
            <TextField
              type="number" size="small" sx={{ minWidth: 150 }}
              value={montoInput}
              onChange={(e) => {
                setMontoInput(e.target.value);
                const n = parseFloat(e.target.value);
                if (!isNaN(n)) setCampos(p => ({ ...p, monto: n }));
              }}
              onBlur={() => setEditando(null)}
              autoFocus
              InputProps={{ inputProps: { min: 0 } }}
            />
          ) : (
            <TextField size="small" value={(campos as any)[key] ?? ''} sx={{ minWidth: 150 }}
              onChange={(e) => { setCampos(p => ({ ...p, [key]: e.target.value })); }}
              onBlur={() => setEditando(null)} autoFocus />
          )
        ) : (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="caption" fontWeight={600} color={falta ? 'error' : 'text.primary'}
              sx={{ maxWidth: 160, textAlign: 'right' }}>
              {valor ?? '—'}
            </Typography>
            <IconButton size="small" onClick={() => {
              if (key === 'monto' && campos.monto) setMontoInput(String(campos.monto));
              setEditando(key);
            }} sx={{ width: 22, height: 22 }}>
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

      <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth
        PaperProps={{ sx: { mx: { xs: 1, sm: 3 }, borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Bot size={20} color="#F59E0B" />
            <Typography fontWeight={700}>Registrar gasto con IA</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={2} sx={{ mt: 1 }}>

            {/* Instrucción adaptativa */}
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">
                {historial.length === 0 && !campos.ticket_url
                  ? 'Subí una foto del ticket o grabá el gasto por voz.'
                  : faltantes.length > 0
                  ? `Faltan: ${faltantes.map(f => LABEL[f]).join(', ')}`
                  : !formasPagoValidas
                  ? 'Agregá al menos una forma de pago.'
                  : !formasPagoSuman
                  ? `Las formas de pago deben sumar $${Number(campos.monto).toLocaleString('es-AR')}`
                  : '✅ Todos los campos completos. Revisá y confirmá.'}
              </Typography>
            </Box>

            {/* ── Ticket upload ── */}
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={handleTicketChange}
                capture="environment"
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" startIcon={<Camera size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={procesando} fullWidth sx={{ borderRadius: 2, py: 1.5 }}>
                  {campos.ticket_url ? 'Cambiar ticket' : 'Subir ticket / factura'}
                </Button>
                {campos.ticket_url && (
                  <IconButton size="small" color="error"
                    onClick={() => { setCampos(p => ({ ...p, ticket_url: undefined })); setTicketPreview(null); }}>
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Stack>
              {ticketPreview && (
                <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                  <img src={ticketPreview} alt="Ticket" style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} />
                </Box>
              )}
            </Box>

            {/* ── Grabación de voz ── */}
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                disabled={procesando}
                sx={{
                  width: 52, height: 52, borderRadius: 2,
                  bgcolor: grabando ? '#EF4444' : theme.palette.action.hover,
                  color:   grabando ? '#FFFFFF' : theme.palette.text.primary,
                  border:  `1px solid ${grabando ? '#EF4444' : theme.palette.divider}`,
                  '&:hover': { bgcolor: grabando ? '#DC2626' : theme.palette.action.selected },
                  flexShrink: 0,
                }}
              >
                {grabando ? <MicOff size={22} /> : <Mic size={22} />}
              </IconButton>
              <Typography variant="caption" color={grabando ? 'error' : 'text.secondary'}>
                {grabando
                  ? '🔴 Grabando... tocá para detener'
                  : historial.length === 0
                  ? 'O grabá el gasto por voz'
                  : 'Grabá para agregar o corregir información'}
              </Typography>
            </Stack>

            {/* Historial */}
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

            {/* Procesando */}
            {procesando && etapa && (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">{etapaLabel}</Typography>
              </Stack>
            )}

            {/* Error */}
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

            {/* ── Card de campos ── */}
            {(Object.keys(campos).length > 1) && (
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
                      <Chip label={`${faltantes.length} faltante${faltantes.length !== 1 ? 's' : ''}`}
                        color="error" size="small" />
                    )}
                  </Stack>

                  <Stack spacing={0.75}>
                    {renderCampoEditable('obra_id',         LABEL.obra_id,         obraNombre)}
                    {renderCampoEditable('especialidad_id', LABEL.especialidad_id,  especialidadNombre)}
                    {renderCampoEditable('descripcion',     LABEL.descripcion,      campos.descripcion)}
                    {renderCampoEditable('monto',           LABEL.monto,            campos.monto ? `$${Number(campos.monto).toLocaleString('es-AR')}` : undefined)}
                    {renderCampoEditable('pagado_por_id',   LABEL.pagado_por_id,    pagadorNombre ? `${pagadorNombre.nombre} ${pagadorNombre.apellido}` : undefined)}
                    {renderCampoEditable('fecha',           LABEL.fecha,            campos.fecha ? new Date(campos.fecha + 'T12:00:00').toLocaleDateString('es-AR') : undefined)}
                  </Stack>

                  {/* ── Formas de pago ── */}
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        FORMAS DE PAGO
                      </Typography>
                      {campos.monto && (
                        <Typography variant="caption" color={formasPagoSuman ? 'success.main' : 'error'}>
                          {formasPagoSuman
                            ? '✅ Suma correcta'
                            : `Faltan $${(Number(campos.monto) - sumaFormasPago).toLocaleString('es-AR')}`}
                        </Typography>
                      )}
                    </Stack>

                    <Stack spacing={1}>
                      {(campos.formas_pago ?? []).map((fp, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                          <TextField select size="small" sx={{ flex: 1 }}
                            value={fp.forma_pago_id || ''}
                            onChange={(e) => actualizarFormaPago(i, 'forma_pago_id', Number(e.target.value))}>
                            <MenuItem value="">Forma de pago</MenuItem>
                            {formasPago.map(f => <MenuItem key={f.id} value={f.id}>{f.nombre}</MenuItem>)}
                          </TextField>
                          <TextField size="small" type="number" sx={{ width: 110 }}
                            placeholder="Monto"
                            value={fp.monto || ''}
                            onChange={(e) => actualizarFormaPago(i, 'monto', Number(e.target.value))}
                            InputProps={{ inputProps: { min: 0 } }}
                          />
                          <IconButton size="small" color="error" onClick={() => eliminarFormaPago(i)}>
                            <Trash2 size={14} />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>

                    <Button size="small" startIcon={<Plus size={14} />}
                      onClick={agregarFormaPago} sx={{ mt: 1, color: 'text.secondary' }}>
                      Agregar forma de pago
                    </Button>
                  </Box>

                  {/* Warning pagador */}
                  {tieneWarningPagador && (
                    <Alert severity="warning" icon={<AlertTriangle size={16} />} sx={{ mt: 1.5, py: 0.5 }}>
                      "{campos.pagado_por_nombre_libre}" no está registrado. Seleccionalo manualmente.
                    </Alert>
                  )}

                  {/* Confirmar */}
                  {listo && (
                    <Button fullWidth variant="contained"
                      sx={{ mt: 2, bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}
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

        <DialogActions sx={{ px: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCerrar} startIcon={<X size={14} />}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  );
};