import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const BRAND_COLOR: [number, number, number] = [30, 80, 160];
const DARK: [number, number, number] = [15, 23, 42];
const GRAY: [number, number, number] = [100, 116, 139];
const GREEN: [number, number, number] = [22, 163, 74];

function formatPesos(valor: number | string | null | undefined): string {
  return `$${Number(valor ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
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
  doc.text(
    new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }),
    200, 11, { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);
  if (subtitulo) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(subtitulo, 10, 24);
    doc.setTextColor(0, 0, 0);
  }
}

export interface LaborExportData {
  id: number;
  nombre: string;
  estado_nombre: string;
  trabajador_nombre: string | null;
  costo_mano_obra: number;
  costo_materiales: number;
  total: number;
  materiales: {
    nombre: string;
    unidad: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}

export interface ObraExportData {
  nombre: string;
  ubicacion?: string | null;
  estado_nombre: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  labores: LaborExportData[];
}

// ── PDF ──────────────────────────────────────────────────────
export function generarPdfDetalleObra(obra: ObraExportData) {
  const doc = new jsPDF();
  addHeader(doc, `Detalle de Obra — ${obra.nombre}`, obra.ubicacion ?? undefined);

  let y = 28;

  // Info obra
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(obra.nombre, 10, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  if (obra.ubicacion) { doc.text(obra.ubicacion, 10, y); y += 5; }
  doc.text(`Estado: ${obra.estado_nombre}`, 10, y);
  y += 8;
  doc.setTextColor(0, 0, 0);

  // Totales generales
  const totalManoObra = obra.labores.reduce((a, l) => a + l.costo_mano_obra, 0);
  const totalMateriales = obra.labores.reduce((a, l) => a + l.costo_materiales, 0);
  const totalObra = totalManoObra + totalMateriales;

  autoTable(doc, {
    startY: y,
    head: [['Resumen de la obra', '']],
    body: [
      ['Total mano de obra (presupuestos confirmados)', formatPesos(totalManoObra)],
      ['Total materiales', formatPesos(totalMateriales)],
      ['TOTAL GENERAL', formatPesos(totalObra)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: DARK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 140 },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    bodyStyles: { textColor: [0, 0, 0] },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [240, 253, 244];
        data.cell.styles.textColor = GREEN;
      }
    },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Tabla de labores
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Labores de la obra', 10, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [['Labor', 'Estado', 'Responsable', 'Mano de obra', 'Materiales', 'Total']],
    body: obra.labores.map((l) => [
      l.nombre,
      l.estado_nombre,
      l.trabajador_nombre ?? 'Sin asignar',
      formatPesos(l.costo_mano_obra),
      formatPesos(l.costo_materiales),
      formatPesos(l.total),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: BRAND_COLOR },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 10, right: 10 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Detalle de materiales por labor
  const laboresConMateriales = obra.labores.filter((l) => l.materiales.length > 0);

  if (laboresConMateriales.length > 0) {
    if (y > 220) { doc.addPage(); addHeader(doc, `Materiales — ${obra.nombre}`); y = 28; }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Materiales por labor', 10, y);
    y += 3;

    for (const labor of laboresConMateriales) {
      if (y > 240) { doc.addPage(); addHeader(doc, `Materiales — ${obra.nombre}`); y = 28; }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(labor.nombre, 10, y + 5);
      doc.setTextColor(0, 0, 0);

      autoTable(doc, {
        startY: y + 7,
        head: [['Material', 'Unidad', 'Cantidad', 'Precio unit.', 'Subtotal']],
        body: labor.materiales.map((m) => [
          m.nombre,
          m.unidad,
          m.cantidad,
          formatPesos(m.precio_unitario),
          formatPesos(m.subtotal),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 10, right: 10 },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  doc.save(`obra-detalle-${obra.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

// ── EXCEL ────────────────────────────────────────────────────
export function generarExcelDetalleObra(obra: ObraExportData) {
  const wb = XLSX.utils.book_new();

  // Hoja 1 — Resumen de labores
  const resumenData = [
    ['Obra', obra.nombre],
    ['Ubicación', obra.ubicacion ?? '-'],
    ['Estado', obra.estado_nombre],
    [],
    ['Labor', 'Estado', 'Responsable', 'Mano de obra ($)', 'Materiales ($)', 'Total ($)'],
    ...obra.labores.map((l) => [
      l.nombre,
      l.estado_nombre,
      l.trabajador_nombre ?? 'Sin asignar',
      l.costo_mano_obra,
      l.costo_materiales,
      l.total,
    ]),
    [],
    ['TOTALES', '', '',
      obra.labores.reduce((a, l) => a + l.costo_mano_obra, 0),
      obra.labores.reduce((a, l) => a + l.costo_materiales, 0),
      obra.labores.reduce((a, l) => a + l.total, 0),
    ],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  wsResumen['!cols'] = [{ wch: 50 }, { wch: 16 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja 2 — Detalle de materiales
  const materialesData = [
    ['Labor', 'Material', 'Unidad', 'Cantidad', 'Precio unitario ($)', 'Subtotal ($)'],
    ...obra.labores.flatMap((l) =>
      l.materiales.map((m) => [
        l.nombre,
        m.nombre,
        m.unidad,
        m.cantidad,
        m.precio_unitario,
        m.subtotal,
      ])
    ),
  ];

  const wsMateriales = XLSX.utils.aoa_to_sheet(materialesData);
  wsMateriales['!cols'] = [{ wch: 50 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsMateriales, 'Materiales');

  XLSX.writeFile(wb, `obra-detalle-${obra.nombre.replace(/\s+/g, '-').toLowerCase()}.xlsx`);
}