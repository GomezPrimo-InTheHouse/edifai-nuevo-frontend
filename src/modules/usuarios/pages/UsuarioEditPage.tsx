import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { UsuarioForm } from '../components/UsuarioForm';
import { useUpdateUsuario, useUsuarioDetail } from '../hooks/useUsuarios';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';

const ROLES_TRABAJADOR = [7, 8];

export const UsuarioEditPage: React.FC = () => {
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const { id }    = useParams<{ id: string }>();
  const usuarioId = Number(id);
  const notify    = useNotify();
  const user      = useAuthStore((s) => s.user);

  const { data: usuario, isLoading } = useUsuarioDetail(usuarioId);
  const updateMutation = useUpdateUsuario();

  if (isLoading) return <LoadingState message={t('usuarios.edit.loading')} />;

  const esTrabajador = ROLES_TRABAJADOR.includes(Number(usuario?.rol_id));

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        id:                     usuarioId,
        email:                  values.email,
        usuario_modificador_id: user?.id ?? null,
      };

      if (esTrabajador) {
        if (values.password) payload.password = values.password;
      } else {
        payload.nombre  = values.nombre;
        payload.rol_id  = Number(values.rol_id);
      }

      await updateMutation.mutateAsync(payload);
      notify.success(t('usuarios.edit.success'));
      navigate(`/usuarios/${usuarioId}`);
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('usuarios.edit.error'));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('usuarios.edit.title')}
        subtitle={esTrabajador ? t('usuarios.edit.subtitle_trabajador') : t('usuarios.edit.subtitle')}
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/usuarios/${usuarioId}`)}>
            {t('usuarios.acciones.volver')}
          </Button>
        }
      />
      <UsuarioForm
        initialData={usuario}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        isEdit
      />
    </AppLayout>
  );
};