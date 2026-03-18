// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuthStore } from '../app/store/auth.store';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const { isAuthenticated } = useAuthStore();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };


import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../app/store/auth.store';
import { env } from '../app/config/env';

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (env.authBypass) {
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}