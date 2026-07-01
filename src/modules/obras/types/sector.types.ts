// export type SectorTipo =
//   | 'complejo' | 'edificio' | 'ala' | 'piso'
//   | 'modulo'  | 'unidad'   | 'ambiente' | 'sector' | 'otro';

// export interface Sector {
//   id: number;
//   obra_id: number;
//   tipo: SectorTipo;
//   valor: string;
//   orden: number;
//   parent_id?: number | null;
//   propietario_id?: number | null;
//   created_at?: string | null;
// }

// export interface CreateSectorPayload {
//   obra_id: number;
//   tipo: SectorTipo;
//   valor: string;
//   orden?: number;
//   parent_id?: number | null;
// }

// export const SECTOR_TIPO_LABELS: Record<SectorTipo, string> = {
//   complejo:  'Complejo',
//   edificio:  'Edificio',
//   ala:       'Ala',
//   piso:      'Piso',
//   modulo:    'Módulo',
//   unidad:    'Unidad',
//   ambiente:  'Ambiente',
//   sector:    'Sector',
//   otro:      '',
// };

// export const SECTOR_TIPOS_OPTIONS: { value: SectorTipo; label: string }[] = [
//   { value: 'complejo',  label: 'Complejo'  },
//   { value: 'edificio',  label: 'Edificio'  },
//   { value: 'ala',       label: 'Ala'       },
//   { value: 'piso',      label: 'Piso'      },
//   { value: 'modulo',    label: 'Módulo'    },
//   { value: 'unidad',    label: 'Unidad'    },
//   { value: 'ambiente',  label: 'Ambiente'  },
//   { value: 'sector',    label: 'Sector'    },
//   { value: 'otro',      label: 'Otro'      },
// ];

// export function nombreCompletoSector(sector: Pick<Sector, 'tipo' | 'valor'>): string {
//   const prefijo = SECTOR_TIPO_LABELS[sector.tipo];
//   return prefijo ? `${prefijo} ${sector.valor}` : sector.valor;
// }

export type SectorTipo =
  | 'complejo' | 'edificio' | 'ala' | 'piso'
  | 'modulo' | 'unidad' | 'ambiente' | 'sector' | 'otro';

export interface Sector {
  id: number;
  obra_id: number;
  tipo: SectorTipo;
  valor: string;
  orden: number;
  parent_id?: number | null;
  activo: boolean;
  propietario_id?: number | null;
  created_at?: string | null;
}

export interface SectorConStats extends Sector {
  labor_count: number;
}

export interface CreateSectorPayload {
  obra_id: number;
  tipo: SectorTipo;
  valor: string;
  orden?: number;
  parent_id?: number | null;
}

export interface SectorLocal {
  tempId: string;
  tipo: SectorTipo;
  valor: string;
  orden: number;
  parent_tempId?: string | null;
}

export const SECTOR_TIPO_LABELS: Record<SectorTipo, string> = {
  complejo: 'Complejo', edificio: 'Edificio', ala: 'Ala', piso: 'Piso',
  modulo: 'Módulo', unidad: 'Unidad', ambiente: 'Ambiente', sector: 'Sector', otro: '',
};

export const SECTOR_TIPOS_OPTIONS: { value: SectorTipo; label: string }[] = [
  { value: 'complejo', label: 'Complejo' }, { value: 'edificio', label: 'Edificio' },
  { value: 'ala',      label: 'Ala'      }, { value: 'piso',     label: 'Piso'     },
  { value: 'modulo',   label: 'Módulo'   }, { value: 'unidad',   label: 'Unidad'   },
  { value: 'ambiente', label: 'Ambiente' }, { value: 'sector',   label: 'Sector'   },
  { value: 'otro',     label: 'Otro'     },
];

export function nombreCompletoSector(sector: Pick<Sector | SectorLocal, 'tipo' | 'valor'>): string {
  const prefijo = SECTOR_TIPO_LABELS[sector.tipo];
  return prefijo ? `${prefijo} ${sector.valor}` : sector.valor;
}

export function getDescendantIds(id: number, sectores: Sector[]): number[] {
  return sectores
    .filter(s => s.parent_id === id)
    .flatMap(c => [c.id, ...getDescendantIds(c.id, sectores)]);
}

export function getDescendantTempIds(tempId: string, sectores: SectorLocal[]): string[] {
  return sectores
    .filter(s => s.parent_tempId === tempId)
    .flatMap(c => [c.tempId, ...getDescendantTempIds(c.tempId, sectores)]);
}

export function flattenSectorTree(
  sectores: Sector[],
  parentId: number | null = null,
  depth = 0,
): { sector: Sector; depth: number }[] {
  return sectores
    .filter(s => (s.parent_id ?? null) === parentId)
    .sort((a, b) => a.orden - b.orden || a.id - b.id)
    .flatMap(s => [{ sector: s, depth }, ...flattenSectorTree(sectores, s.id, depth + 1)]);
}

export function flattenLocalSectorTree(
  sectores: SectorLocal[],
  parentTempId: string | null = null,
  depth = 0,
): { sector: SectorLocal; depth: number }[] {
  return sectores
    .filter(s => (s.parent_tempId ?? null) === parentTempId)
    .sort((a, b) => a.orden - b.orden)
    .flatMap(s => [{ sector: s, depth }, ...flattenLocalSectorTree(sectores, s.tempId, depth + 1)]);
}