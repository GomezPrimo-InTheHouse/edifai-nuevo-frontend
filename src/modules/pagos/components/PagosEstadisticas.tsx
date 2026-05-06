import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { usePagosEstadisticas } from '../hooks/usePagos';

const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

function KPICard({ label, value, color = '#0F172A' }: { label: string; value: string; color?: string }) {
  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B', display: 'block', mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function formatMonto(v: string | number) {
  return `$${Number(v).toLocaleString('es-AR')}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#0F172A', p: 1.5, borderRadius: 2 }}>
      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Typography key={i} variant="body2" fontWeight={700} sx={{ color: '#fff' }}>
          {formatMonto(p.value)}
        </Typography>
      ))}
    </Box>
  );
}

export function PagosEstadisticas() {
  const { data, isLoading } = usePagosEstadisticas();

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress size={28} />
    </Box>
  );

  if (!data) return null;

  const { totales, por_trabajador, por_mes, por_forma_pago } = data;

  const datosMes = por_mes.map(m => ({
    name: m.mes_label,
    total: Number(m.total),
  }));

  const datosTrabajador = por_trabajador.map(t => ({
    name: t.trabajador.split(' ')[0], // solo nombre para el eje
    fullName: t.trabajador,
    total: Number(t.total_cobrado),
  }));

  const datosFormaPago = por_forma_pago.map(f => ({
    name: f.forma_pago,
    value: Number(f.total),
  }));

  const totalPagado  = Number(totales.total_pagado);
  const totalParcial = Number(totales.total_parcial);
  const totalGeneral = Number(totales.total_general);
  const cantidadPagos = Number(totales.cantidad_pagos);

  return (
    <Box sx={{ mb: 3 }}>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KPICard label="TOTAL GENERAL" value={formatMonto(totalGeneral)} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KPICard label="TOTAL PAGADO" value={formatMonto(totalPagado)} color="#15803D" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KPICard label="TOTAL PARCIAL" value={formatMonto(totalParcial)} color="#A16207" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KPICard label="CANTIDAD DE PAGOS" value={cantidadPagos.toString()} />
        </Grid>
      </Grid>

      {/* Gráficos fila 1 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Evolución mensual */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B', mb: 2 }}>
                EVOLUCIÓN MENSUAL
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={datosMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="total" stroke="#0F172A" strokeWidth={2.5} dot={{ fill: '#0F172A', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Forma de pago */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B', mb: 2 }}>
                FORMA DE PAGO
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={datosFormaPago} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" nameKey="name">
                    {datosFormaPago.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatMonto(v)} />
                  <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Gráficos fila 2 */}
      <Grid container spacing={2}>

        {/* Pagos por trabajador */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B', mb: 2 }}>
                PAGOS POR TRABAJADOR
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={datosTrabajador} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="fullName" tick={{ fontSize: 12, fill: '#475569' }} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#0F172A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}