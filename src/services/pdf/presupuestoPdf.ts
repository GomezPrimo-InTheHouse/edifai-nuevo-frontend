import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Presupuesto } from '../../modules/presupuestos/types/presupuesto.types';
import type { Labor } from '../../modules/labores/types/labor.types';
import type { PresupuestoMaterial } from '../../modules/presupuestos/types/presupuesto.types';

const BRAND_COLOR: [number, number, number] = [30, 80, 160];
const GRAY: [number, number, number] = [100, 116, 139];

function formatPesos(valor: number | string | null | undefined): string {
  return `$${Number(valor ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

function addHeader(doc: jsPDF, titulo: string, subtitulo?: string) {
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('EdifAI', 10, 11);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 105, 11, { align: 'center' });
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }), 200, 11, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  if (subtitulo) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(subtitulo, 10, 24);
    doc.setTextColor(0, 0, 0);
  }
}

// ── PDF de un presupuesto individual ────────────────────────────────────────
export function generarPdfPresupuesto(
  presupuesto: any,
  materiales: PresupuestoMaterial[]
) {
  const doc = new jsPDF();
  addHeader(doc, 'Detalle de Presupuesto');

  let y = 28;

  // Info principal
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(presupuesto.nombre || `Presupuesto #${presupuesto.id}`, 10, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  if (presupuesto.descripcion) { doc.text(presupuesto.descripcion, 10, y); y += 5; }
  doc.setTextColor(0, 0, 0);

  // Tabla info general
  autoTable(doc, {
    startY: y + 2,
    head: [['Campo', 'Valor']],
    body: [
      ['Obra', presupuesto.obra_nombre ?? '-'],
      ['Labor', presupuesto.labor_nombre ?? '-'],
      ['Responsable', presupuesto.jefe_nombre ? `${presupuesto.jefe_nombre} ${presupuesto.jefe_apellido ?? ''}`.trim() : '-'],
      ['Especialidad', presupuesto.jefe_especialidad ?? '-'],
      ['Costo mano de obra', formatPesos(presupuesto.costo_mano_obra)],
      ['Total estimado', formatPesos(presupuesto.total_estimado)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND_COLOR },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Tabla materiales
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Materiales incluidos', 10, y);
  y += 3;

  if (materiales.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('Sin materiales registrados.', 10, y + 6);
    doc.setTextColor(0, 0, 0);
  } else {
    autoTable(doc, {
      startY: y + 2,
      head: [['Material', 'Unidad', 'Cantidad', 'Precio unit.', 'Subtotal']],
      body: materiales.map((m) => [
        m.material_nombre ?? '-',
        m.unidad ?? '-',
        m.cantidad,
        formatPesos(m.precio_unitario),
        formatPesos(m.subtotal),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: BRAND_COLOR },
      margin: { left: 10, right: 10 },
    });
  }

  doc.save(`presupuesto-${presupuesto.id}.pdf`);
}

// ── PDF de reporte filtrado (múltiples presupuestos) ────────────────────────
export async function generarPdfReporteFiltrado(
  presupuestos: Presupuesto[],
  labores: Labor[],
  materialesPorPresupuesto: Record<number, PresupuestoMaterial[]>,
  estadoNombre: (id?: number | null) => string | undefined
) {
  const doc = new jsPDF();
  const getLaborById = (id?: number | null) => labores.find((l) => l.id === id);

  addHeader(doc, 'Reporte de Presupuestos', `Total: ${presupuestos.length} presupuesto${presupuestos.length !== 1 ? 's' : ''}`);

  // Tabla resumen
  autoTable(doc, {
    startY: 28,
    head: [['Nombre', 'Obra', 'Labor', 'Especialidad', 'Trabajador', 'Total estimado', 'Estado']],
    body: presupuestos.map((p) => {
      const labor = getLaborById(p.labor_id);
      return [
        p.nombre || `Presupuesto #${p.id}`,
        labor?.obra_nombre ?? '-',
        labor?.nombre ?? '-',
        labor?.especialidad_nombre ?? '-',
        labor?.trabajador_nombre ? `${labor.trabajador_nombre} ${labor.trabajador_apellido ?? ''}`.trim() : '-',
        formatPesos(p.total_estimado),
        estadoNombre(p.estado_id) ?? '-',
      ];
    }),
    styles: { fontSize: 8 },
    headStyles: { fillColor: BRAND_COLOR },
    margin: { left: 10, right: 10 },
  });

  // Detalle por presupuesto
  for (const p of presupuestos) {
    const materiales = materialesPorPresupuesto[p.id] ?? [];
    if (materiales.length === 0) continue;

    doc.addPage();
    addHeader(doc, `Materiales — ${p.nombre || `Presupuesto #${p.id}`}`);

    autoTable(doc, {
      startY: 24,
      head: [['Material', 'Unidad', 'Cantidad', 'Precio unit.', 'Subtotal']],
      body: materiales.map((m) => [
        m.material_nombre ?? '-',
        m.unidad ?? '-',
        m.cantidad,
        formatPesos(m.precio_unitario),
        formatPesos(m.subtotal),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: BRAND_COLOR },
      margin: { left: 10, right: 10 },
    });
  }

  doc.save(`reporte-presupuestos-${new Date().toISOString().slice(0, 10)}.pdf`);
}