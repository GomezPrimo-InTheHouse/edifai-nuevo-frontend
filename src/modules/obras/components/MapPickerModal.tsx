import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  DialogTitle, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { MapPin, Search, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
});

export interface MapPickerResult {
  direccion: string;
  latitud:   number;
  longitud:  number;
}

interface Props {
  open:              boolean;
  onClose:           () => void;
  onConfirm:         (result: MapPickerResult) => void;
  initialLatitud?:   number | null;
  initialLongitud?:  number | null;
  initialDireccion?: string;
}

const DEFAULT_LAT  = -32.4098;
const DEFAULT_LNG  = -63.2439;
const DEFAULT_ZOOM = 13;

async function buscarDireccion(query: string): Promise<{ lat: number; lon: number; display_name: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ar`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display_name: data[0].display_name };
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url  = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } });
  const data = await res.json();
  return data?.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

export function MapPickerModal({
  open, onClose, onConfirm,
  initialLatitud, initialLongitud, initialDireccion = '',
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const markerRef       = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialDireccion);
  const [direccion,   setDireccion]   = useState(initialDireccion);
  const [coords,      setCoords]      = useState<{ lat: number; lng: number } | null>(
    initialLatitud && initialLongitud ? { lat: initialLatitud, lng: initialLongitud } : null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Inicializar mapa cuando abre
  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const initLat = initialLatitud  ?? DEFAULT_LAT;
      const initLng = initialLongitud ?? DEFAULT_LNG;

      const map = L.map(mapContainerRef.current).setView([initLat, initLng], DEFAULT_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const attachDragEnd = (marker: L.Marker) => {
        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          setCoords({ lat: pos.lat, lng: pos.lng });
          const dir = await reverseGeocode(pos.lat, pos.lng);
          setDireccion(dir);
          setSearchQuery(dir);
        });
      };

      if (initialLatitud && initialLongitud) {
        const marker = L.marker([initialLatitud, initialLongitud], { draggable: true }).addTo(map);
        markerRef.current = marker;
        setCoords({ lat: initialLatitud, lng: initialLongitud });
        attachDragEnd(marker);
      }

      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current = marker;
          attachDragEnd(marker);
        }
        setCoords({ lat, lng });
        const dir = await reverseGeocode(lat, lng);
        setDireccion(dir);
        setSearchQuery(dir);
      });

      mapRef.current = map;
    }, 100);

    return () => clearTimeout(timeout);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Destruir mapa al cerrar
  useEffect(() => {
    if (!open && mapRef.current) {
      mapRef.current.remove();
      mapRef.current    = null;
      markerRef.current = null;
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const result = await buscarDireccion(searchQuery.trim());
      if (!result) {
        setSearchError('No se encontró la dirección. Intentá con otra búsqueda.');
        return;
      }
      const { lat, lon, display_name } = result;

      if (mapRef.current) {
        mapRef.current.setView([lat, lon], 16);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          const marker = L.marker([lat, lon], { draggable: true }).addTo(mapRef.current);
          markerRef.current = marker;
          marker.on('dragend', async () => {
            const pos = marker.getLatLng();
            setCoords({ lat: pos.lat, lng: pos.lng });
            const dir = await reverseGeocode(pos.lat, pos.lng);
            setDireccion(dir);
            setSearchQuery(dir);
          });
        }
      }

      setCoords({ lat, lng: lon });
      setDireccion(display_name);
    } catch {
      setSearchError('Error al buscar. Verificá tu conexión.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!coords) return;
    onConfirm({ direccion, latitud: coords.lat, longitud: coords.lng });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <MapPin size={18} />
            <Typography variant="h6" fontWeight={700}>Seleccionar ubicación</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Buscador */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0' }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth size="small"
              placeholder="Buscá una dirección, barrio o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              error={!!searchError}
              helperText={searchError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#94A3B8" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              sx={{ minWidth: 100, flexShrink: 0 }}
            >
              {isSearching ? <CircularProgress size={18} color="inherit" /> : 'Buscar'}
            </Button>
          </Stack>

          {coords && (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Stack direction="row" alignItems="flex-start" gap={1}>
                <MapPin size={14} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.4, display: 'block' }}>
                    {direccion}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 10 }}>
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {!coords && (
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, display: 'block' }}>
              Buscá una dirección o hacé click en el mapa para colocar el pin. Podés arrastrarlo para ajustar.
            </Typography>
          )}
        </Box>

        {/* Mapa */}
        <Box ref={mapContainerRef} sx={{ height: 400, width: '100%', cursor: 'crosshair' }} />

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="outlined" onClick={onClose}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!coords}
              startIcon={<MapPin size={16} />}
            >
              Confirmar ubicación
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}