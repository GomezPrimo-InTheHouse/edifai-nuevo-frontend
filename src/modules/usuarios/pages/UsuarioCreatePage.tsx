import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { UsuarioForm } from '../components/UsuarioForm';
import { QRCodeModal } from '../components/QRCodeModal';
import { useCreateUsuario } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';

export const UsuarioCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const createMutation = useCreateUsuario();
  const user = useAuthStore((s) => s.user);
  const [qrData, setQrData] = useState<{ qrUrl: string; email: string } | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      const result = await createMutation.mutateAsync({
        nombre: values.nombre,
        email: values.email,
        password: values.password,
        rol_id: Number(values.rol_id),
        usuario_creador_id: user?.id ?? null,
      });

      // El backend devuelve qrCodeDataURL
      if (result.qrCodeDataURL) {
        setQrData({
          qrUrl: result.qrCodeDataURL,
          email: values.email,
        });
      } else {
        notify.success('Usuario creado correctamente');
        navigate('/usuarios');
      }
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'No se pudo crear el usuario.';
      notify.error(mensaje);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Nuevo usuario"
        subtitle="Crear un usuario administrador del sistema."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/usuarios')}
          >
            Volver
          </Button>
        }
      />
      <UsuarioForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />

      {/* QR Modal — aparece después de crear, se cierra manualmente */}
      {qrData && (
        <QRCodeModal
          open={!!qrData}
          onClose={() => {
            setQrData(null);
            navigate('/usuarios');
          }}
          qrUrl={qrData.qrUrl}
          email={qrData.email}
        />
      )}
    </AppLayout>
  );
};