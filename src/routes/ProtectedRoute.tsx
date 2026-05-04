import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../app/store/auth.store';
import { env } from '../app/config/env';

interface ProtectedRouteProps {
  allowedRoles?: number[];
}
//la funcion tiene propiedad allowedRoles que es un array de numeros, 
// cada numero representa el id de un rol permitido para acceder a esa ruta. 
// Si allowedRoles no se proporciona, se asume que cualquier usuario autenticado puede acceder a la ruta protegida.
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps = {}) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (env.authBypass) {
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si la ruta tiene roles requeridos, verificar que el usuario los tenga
  if (allowedRoles && allowedRoles.length > 0) {
    const userRolId = user?.rol_id ?? -1;
    if (!allowedRoles.includes(userRolId)) {
      return <Navigate to="/sin-acceso" replace />;
    }
  }

  return <Outlet />;
}