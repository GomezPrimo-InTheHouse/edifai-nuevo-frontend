export type SectorTipo = 'piso' | 'ala' | 'modulo' | 'unidad' | 'sector' | 'otro';

export interface Sector {
  id: number;
  obra_id: number;
  tipo: SectorTipo;
  valor: string;
  orden: number;
  propietario_id?: number | null;
  created_at?: string | null;
}

export interface CreateSectorPayload {
  obra_id: number;
  tipo: SectorTipo;
  valor: string;
  orden?: number;
}

export const SECTOR_TIPO_LABELS: Record<SectorTipo, string> = {
  piso:    'Piso',
  ala:     'Ala',
  modulo:  'Módulo',
  unidad:  'Unidad',
  sector:  'Sector',
  otro:    'Otro',
};

export const SECTOR_TIPOS_OPTIONS: { value: SectorTipo; label: string }[] = [
  { value: 'piso',    label: 'Piso'    },
  { value: 'ala',     label: 'Ala'     },
  { value: 'modulo',  label: 'Módulo'  },
  { value: 'unidad',  label: 'Unidad'  },
  { value: 'sector',  label: 'Sector'  },
  { value: 'otro',    label: 'Otro'    },
];

export function nombreCompletoSector(sector: Pick<Sector, 'tipo' | 'valor'>): string {
  const prefijo = SECTOR_TIPO_LABELS[sector.tipo];
  return prefijo && sector.tipo !== 'otro' ? `${prefijo} ${sector.valor}` : sector.valor;
}