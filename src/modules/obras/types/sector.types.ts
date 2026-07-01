export type SectorTipo =
  | 'complejo' | 'edificio' | 'ala' | 'piso'
  | 'modulo'  | 'unidad'   | 'ambiente' | 'sector' | 'otro';

export interface Sector {
  id: number;
  obra_id: number;
  tipo: SectorTipo;
  valor: string;
  orden: number;
  parent_id?: number | null;
  propietario_id?: number | null;
  created_at?: string | null;
}

export interface CreateSectorPayload {
  obra_id: number;
  tipo: SectorTipo;
  valor: string;
  orden?: number;
  parent_id?: number | null;
}

export const SECTOR_TIPO_LABELS: Record<SectorTipo, string> = {
  complejo:  'Complejo',
  edificio:  'Edificio',
  ala:       'Ala',
  piso:      'Piso',
  modulo:    'Módulo',
  unidad:    'Unidad',
  ambiente:  'Ambiente',
  sector:    'Sector',
  otro:      '',
};

export const SECTOR_TIPOS_OPTIONS: { value: SectorTipo; label: string }[] = [
  { value: 'complejo',  label: 'Complejo'  },
  { value: 'edificio',  label: 'Edificio'  },
  { value: 'ala',       label: 'Ala'       },
  { value: 'piso',      label: 'Piso'      },
  { value: 'modulo',    label: 'Módulo'    },
  { value: 'unidad',    label: 'Unidad'    },
  { value: 'ambiente',  label: 'Ambiente'  },
  { value: 'sector',    label: 'Sector'    },
  { value: 'otro',      label: 'Otro'      },
];

export function nombreCompletoSector(sector: Pick<Sector, 'tipo' | 'valor'>): string {
  const prefijo = SECTOR_TIPO_LABELS[sector.tipo];
  return prefijo ? `${prefijo} ${sector.valor}` : sector.valor;
}