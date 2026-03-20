import { Routes, Route, Navigate } from 'react-router-dom';


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
import { TrabajadoresPorEspecialidadPage } from '../../modules/trabajadores/pages/TrabajadoresPorEspecialidadPage';
//Labores
import { LaboresListPage } from '../../modules/labores/pages/LaboresListPage';
import { LaborDetailPage } from '../../modules/labores/pages/LaborDetailPage';
import { LaborCreatePage } from '../../modules/labores/pages/LaborCreatePage';
import { LaborEditPage } from '../../modules/labores/pages/LaborEditPage';

//Materiales
import { MaterialesListPage } from '../../modules/materiales/pages/MaterialesListPage';
import { MaterialCreatePage } from '../../modules/materiales/pages/MaterialCreatePage';
import { MaterialEditPage } from '../../modules/materiales/pages/MaterialEditPage';
import { MaterialDetailPage } from '../../modules/materiales/pages/MaterialDetailPage';
import { HistorialPreciosPage } from '../../modules/materiales/pages/HistorialPreciosPage';

//Presupuestos
import { PresupuestosListPage } from '../../modules/presupuestos/pages/PresupuestosListPage';
import { PresupuestoCreatePage } from '../../modules/presupuestos/pages/PresupuestoCreatePage';
import { PresupuestoEditPage } from '../../modules/presupuestos/pages/PresupuestoEditPage';
import { PresupuestoDetailPage } from '../../modules/presupuestos/pages/PresupuestoDetailPage';



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
      <Route path="/trabajadores/especialidad/:especialidad_id" element={<TrabajadoresPorEspecialidadPage />} />
      
      {/* Labores */}
      <Route path="/labores" element={<LaboresListPage />} />
      <Route path="/labores/nueva" element={<LaborCreatePage />} />
      <Route path="/labores/:id" element={<LaborDetailPage />} />
      <Route path="/labores/:id/editar" element={<LaborEditPage />} />

      {/* Materiales */}
      <Route path="/materiales" element={<MaterialesListPage />} />
      <Route path="/materiales/nuevo" element={<MaterialCreatePage />} />
      <Route path="/materiales/historial" element={<HistorialPreciosPage />} />
      <Route path="/materiales/:id" element={<MaterialDetailPage />} />
      <Route path="/materiales/:id/editar" element={<MaterialEditPage />} />
      <Route path="/materiales/historial" element={<HistorialPreciosPage />} />

      {/* Presupuestos */}
      
      <Route path="/presupuestos" element={<PresupuestosListPage />} />
      <Route path="/presupuestos/nuevo" element={<PresupuestoCreatePage />} />
      <Route path="/presupuestos/:id" element={<PresupuestoDetailPage />} />
      <Route path="/presupuestos/:id/editar" element={<PresupuestoEditPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
      {/* </Route> */}
    </Routes>
    
  );
};