import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout/AppLayout';

import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
//OBRAS
import { ObrasListPage } from '../../modules/obras/pages/ObrasListPage';
import { ObraDetailPage } from '../../modules/obras/pages/ObraDetailPage';
import { ObraCreatePage } from '../../modules/obras/pages/ObraCreatePage';
import { ObraEditPage } from '../../modules/obras/pages/ObraEditPage';

//TRABAJADORES
import { TrabajadoresListPage } from '../../modules/trabajadores/pages/TrabajadoresListPage';
import { TrabajadorDetailPage } from '../../modules/trabajadores/pages/TrabajadorDetailPage';
import { TrabajadorCreatePage } from '../../modules/trabajadores/pages/TrabajadorCreatePage';
import { TrabajadorEditPage } from '../../modules/trabajadores/pages/TrabajadorEditPage';


export const AppRouter = () => {
  return (
    <Routes>
      {/*  Layout wrapper */}
      {/* <Route element={<AppLayout children={undefined} />}> */}
        {/* Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Obras */}
        <Route path="/obras" element={<ObrasListPage />} />
        <Route path="/obras/nueva" element={<ObraCreatePage />} />
        <Route path="/obras/:id" element={<ObraDetailPage />} />
        <Route path="/obras/:id/editar" element={<ObraEditPage />} />
      {/* </Route> */}
      {/* Trabajadores */}
      <Route path="/trabajadores" element={<TrabajadoresListPage />} />
      <Route path="/trabajadores/nuevo" element={<TrabajadorCreatePage />} />
      <Route path="/trabajadores/:id" element={<TrabajadorDetailPage />} />
      <Route path="/trabajadores/:id/editar" element={<TrabajadorEditPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
      {/* </Route> */}
    </Routes>
    
  );
};