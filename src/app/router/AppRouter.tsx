

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '../../routes/ProtectedRoute';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { SinAccesoPage } from '../../modules/auth/pages/SinAccesoPage';

import DashboardPage from '../../modules/dashboard/pages/DashboardPage';

// OBRAS
import { ObrasListPage } from '../../modules/obras/pages/ObrasListPage';
import { ObraDetailPage } from '../../modules/obras/pages/ObraDetailPage';
import { ObraCreatePage } from '../../modules/obras/pages/ObraCreatePage';
import { ObraEditPage } from '../../modules/obras/pages/ObraEditPage';

// TRABAJADORES
import { TrabajadoresListPage } from '../../modules/trabajadores/pages/TrabajadoresListPage';
import { TrabajadorDetailPage } from '../../modules/trabajadores/pages/TrabajadorDetailPage';
import { TrabajadorCreatePage } from '../../modules/trabajadores/pages/TrabajadorCreatePage';
import { TrabajadorEditPage } from '../../modules/trabajadores/pages/TrabajadorEditPage';
import { TrabajadoresPorEspecialidadPage } from '../../modules/trabajadores/pages/TrabajadoresPorEspecialidadPage';

// LABORES
import { LaboresListPage } from '../../modules/labores/pages/LaboresListPage';
import { LaborDetailPage } from '../../modules/labores/pages/LaborDetailPage';
import { LaborCreatePage } from '../../modules/labores/pages/LaborCreatePage';
import { LaborEditPage } from '../../modules/labores/pages/LaborEditPage';

// MATERIALES
import { MaterialesListPage } from '../../modules/materiales/pages/MaterialesListPage';
import { MaterialCreatePage } from '../../modules/materiales/pages/MaterialCreatePage';
import { MaterialEditPage } from '../../modules/materiales/pages/MaterialEditPage';
import { MaterialDetailPage } from '../../modules/materiales/pages/MaterialDetailPage';
import { HistorialPreciosPage } from '../../modules/materiales/pages/HistorialPreciosPage';

// PRESUPUESTOS
import { PresupuestosListPage } from '../../modules/presupuestos/pages/PresupuestosListPage';
import { PresupuestoCreatePage } from '../../modules/presupuestos/pages/PresupuestoCreatePage';
import { PresupuestoEditPage } from '../../modules/presupuestos/pages/PresupuestoEditPage';
import { PresupuestoDetailPage } from '../../modules/presupuestos/pages/PresupuestoDetailPage';

// PAGOS
import { PagosListPage } from '../../modules/pagos/pages/PagosListPage';
import { PagoDetailPage } from '../../modules/pagos/pages/PagoDetailPage';
import { PagosByTrabajadorPage } from '../../modules/pagos/pages/PagosByTrabajadorPage';

// USUARIOS
import { UsuariosListPage } from '../../modules/usuarios/pages/UsuariosListPage';
import { UsuarioCreatePage } from '../../modules/usuarios/pages/UsuarioCreatePage';
import { UsuarioEditPage } from '../../modules/usuarios/pages/UsuarioEditPage';
import { UsuarioDetailPage } from '../../modules/usuarios/pages/UsuarioDetailPage';

// PRESENTISMO
import { PresentismoPage } from '../../modules/presentismo/pages/PresentismoPage';
import { PresentismoAdminPage } from '../../modules/presentismo/pages/PresentismoAdminPage';

// CLIENTES
import { ClientesListPage } from '../../modules/clientes/pages/ClientesListPage';
import { ClienteDetailPage } from '../../modules/clientes/pages/ClienteDetailPage';
import { ClienteCreatePage } from '../../modules/clientes/pages/ClienteCreatePage';
import { ClienteEditPage } from '../../modules/clientes/pages/ClienteEditPage';

// CONFIGURACION ← nuevo
import { OnboardWizard } from '../../modules/configuracion/pages/OnboardWizard';
import { ConfiguracionPage } from '../../modules/configuracion/pages/ConfiguracionPage';

const ROLES_ADMIN  = [1, 3, 4, 6];
const ROLES_WORKER = [7, 8];
const ROLES_ALL    = [...ROLES_ADMIN, ...ROLES_WORKER];

export const AppRouter = () => {
  const navigate = useNavigate();

  return (
    <Routes>

      {/* ── Públicas ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sin-acceso" element={<SinAccesoPage />} />

      {/*
        ── Onboarding ──
        Ruta protegida solo para admins. No usa AppLayout —
        el wizard ocupa la pantalla completa.
      */}
      <Route element={<ProtectedRoute allowedRoles={ROLES_ADMIN} />}>
        <Route
          path="/onboarding"
          element={
            <OnboardWizard onComplete={() => navigate('/', { replace: true })} />
          }
        />
      </Route>

      {/* ── Compartidas ── */}
      <Route element={<ProtectedRoute allowedRoles={ROLES_ALL} />}>
        <Route index element={<DashboardPage />} />
      </Route>

      {/* ── Labores (admin + workers) ── */}
      <Route element={<ProtectedRoute allowedRoles={ROLES_ALL} />}>
        <Route path="/labores" element={<LaboresListPage />} />
        <Route path="/labores/:id" element={<LaborDetailPage />} />
      </Route>

      {/* ── Labores solo admin ── */}
      <Route element={<ProtectedRoute allowedRoles={ROLES_ADMIN} />}>
        <Route path="/labores/nueva" element={<LaborCreatePage />} />
        <Route path="/labores/:id/editar" element={<LaborEditPage />} />
      </Route>

      {/* ── Solo admin ── */}
      <Route element={<ProtectedRoute allowedRoles={ROLES_ADMIN} />}>

        <Route path="/obras" element={<ObrasListPage />} />
        <Route path="/obras/nueva" element={<ObraCreatePage />} />
        <Route path="/obras/:id" element={<ObraDetailPage />} />
        <Route path="/obras/:id/editar" element={<ObraEditPage />} />

        <Route path="/trabajadores" element={<TrabajadoresListPage />} />
        <Route path="/trabajadores/nuevo" element={<TrabajadorCreatePage />} />
        <Route path="/trabajadores/:id" element={<TrabajadorDetailPage />} />
        <Route path="/trabajadores/:id/editar" element={<TrabajadorEditPage />} />
        <Route path="/trabajadores/especialidad/:especialidad_id" element={<TrabajadoresPorEspecialidadPage />} />

        <Route path="/materiales" element={<MaterialesListPage />} />
        <Route path="/materiales/nuevo" element={<MaterialCreatePage />} />
        <Route path="/materiales/historial" element={<HistorialPreciosPage />} />
        <Route path="/materiales/:id" element={<MaterialDetailPage />} />
        <Route path="/materiales/:id/editar" element={<MaterialEditPage />} />

        <Route path="/presupuestos" element={<PresupuestosListPage />} />
        <Route path="/presupuestos/nuevo" element={<PresupuestoCreatePage />} />
        <Route path="/presupuestos/:id" element={<PresupuestoDetailPage />} />
        <Route path="/presupuestos/:id/editar" element={<PresupuestoEditPage />} />

        <Route path="/pagos" element={<PagosListPage />} />
        <Route path="/pagos/:id" element={<PagoDetailPage />} />
        <Route path="/pagos/trabajador/:trabajador_id" element={<PagosByTrabajadorPage />} />

        <Route path="/usuarios" element={<UsuariosListPage />} />
        <Route path="/usuarios/nuevo" element={<UsuarioCreatePage />} />
        <Route path="/usuarios/:id" element={<UsuarioDetailPage />} />
        <Route path="/usuarios/:id/editar" element={<UsuarioEditPage />} />

        <Route path="/presentismo/admin" element={<PresentismoAdminPage />} />

        <Route path="/clientes" element={<ClientesListPage />} />
        <Route path="/clientes/crear" element={<ClienteCreatePage />} />
        <Route path="/clientes/:id" element={<ClienteDetailPage />} />
        <Route path="/clientes/:id/editar" element={<ClienteEditPage />} />

        {/* Configuración — usa AppLayout normal */}
        <Route path="/configuracion" element={<ConfiguracionPage />} />

      </Route>

      {/* ── Workers ── */}
      <Route element={<ProtectedRoute allowedRoles={ROLES_WORKER} />}>
        <Route path="/presentismo" element={<PresentismoPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
};