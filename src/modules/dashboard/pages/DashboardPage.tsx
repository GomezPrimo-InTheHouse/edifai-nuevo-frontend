
// src/modules/dashboard/pages/DashboardPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { useAuthStore } from '../../../app/store/auth.store';
import { DashboardAdminPage } from './DashboardAdminPage';
import { DashboardTrabajadorPage } from './DashboardTrabajadorPage';

const ROLES_ADMIN  = [1, 3, 4, 6, 9];
const ROLES_WORKER = [7, 8];

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const user  = useAuthStore((s) => s.user);
  const rolId = user?.rol_id ?? -1;

  return (
    <AppLayout>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={ROLES_ADMIN.includes(rolId) ? t('dashboard.subtitle_admin') : t('dashboard.subtitle_worker')}
      />
      {ROLES_ADMIN.includes(rolId)  && <DashboardAdminPage />}
      {ROLES_WORKER.includes(rolId) && <DashboardTrabajadorPage />}
      {!ROLES_ADMIN.includes(rolId) && !ROLES_WORKER.includes(rolId) && (
        <Typography color="text.secondary">{t('dashboard.no_dashboard')}</Typography>
      )}
    </AppLayout>
    
  );
};

export default DashboardPage;