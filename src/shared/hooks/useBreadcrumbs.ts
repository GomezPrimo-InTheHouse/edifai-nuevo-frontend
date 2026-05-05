import { useLocation, useParams } from 'react-router-dom';

export interface Breadcrumb {
  label: string;
  path?: string;
}

const ROUTE_MAP: Record<string, string> = {
  '':              'Dashboard',
  'obras':         'Obras',
  'trabajadores':  'Trabajadores',
  'labores':       'Labores',
  'materiales':    'Materiales',
  'presupuestos':  'Presupuestos',
  'pagos':         'Pagos',
  'usuarios':      'Usuarios',
  'clientes':      'Clientes',
  'presentismo':   'Presentismo',
  'configuracion': 'Configuración',
  'nueva':         'Nueva',
  'nuevo':         'Nuevo',
  'crear':         'Crear',
  'editar':        'Editar',
  'historial':     'Historial',
  'admin':         'Administración',
  'especialidad':  'Especialidad',
  'trabajador':    'Trabajador',
};

export function useBreadcrumbs(): Breadcrumb[] {
  const location = useLocation();
  const state = location.state as { from?: string; obraId?: number; obraLabel?: string } | null;
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return [{ label: 'Dashboard' }];

  // Si viene desde una obra, construir breadcrumb contextual
  if (state?.from === 'obra' && state.obraId) {
    const laborSegment = segments[segments.length - 1];
    return [
      { label: 'Dashboard',                    path: '/' },
      { label: 'Obras',                         path: '/obras' },
      { label: state.obraLabel ?? `#${state.obraId}`, path: `/obras/${state.obraId}` },
      { label: `#${laborSegment}` },
    ];
  }

  const crumbs: Breadcrumb[] = [{ label: 'Dashboard', path: '/' }];
  let accumulatedPath = '';

  segments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    const isNumeric = /^\d+$/.test(segment);

    if (isNumeric) {
      crumbs.push({ label: `#${segment}`, path: isLast ? undefined : accumulatedPath });
    } else {
      const label = ROUTE_MAP[segment] ?? segment;
      crumbs.push({ label, path: isLast ? undefined : accumulatedPath });
    }
  });

  return crumbs;
}