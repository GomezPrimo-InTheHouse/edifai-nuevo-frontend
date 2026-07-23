import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUploadComprobante, useAnalizarComprobanteConIA } from '../hooks/useCompras';
import type { AnalizarComprobantePayload } from '../types/compra.types';

interface ComprobanteUploaderProps {
  comprobanteUrl?: string;
  onUploaded: (url: string) => void;
  onDatosExtraidos: (datos: AnalizarComprobantePayload) => void;
}

export function ComprobanteUploader({ comprobanteUrl, onUploaded, onDatosExtraidos }: ComprobanteUploaderProps) {
  const { t } = useTranslation();
  const uploadComprobante = useUploadComprobante();
  const analizarIA = useAnalizarComprobanteConIA();
  const [analizando, setAnalizando] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadComprobante.mutateAsync(file);
    onUploaded(url);

    setAnalizando(true);
    try {
      const datos = await analizarIA.mutateAsync(url);
      onDatosExtraidos(datos);
    } catch {
      // si la IA falla, el usuario completa a mano
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <Button variant="outlined" component="label" disabled={uploadComprobante.isPending || analizando} sx={{ alignSelf: 'flex-start' }}>
      {analizando ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
      {comprobanteUrl ? t('compras.form.comprobante_cargado') : t('compras.form.subir_comprobante')}
      <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
    </Button>
  );
}