import type { Pago, SoportePago } from "@/types";

function soportePdf(nombre: string): SoportePago {
  return { nombre, tipo: "pdf", url: `/soportes/${nombre}` };
}

function soporteImg(nombre: string): SoportePago {
  return { nombre, tipo: "imagen", url: `/soportes/${nombre}` };
}

export const pagos: Pago[] = [
  // ==========================================
  // COMP-001: Carolina Mejía — Financiada, en plan de pagos
  // Lote 12, Mirador del Valle, $150.000.000
  // Separación: $5.000.000 (pagado)
  // Cuota inicial: $30.000.000 (pagado)
  // Financiación: $115.000.000 en 24 cuotas de ~$4.791.667
  // Cuotas 1-8 pagadas, cuota 9 parcial ($3.000.000 de $4.791.667), cuotas 10-24 pendientes
  // ==========================================
  {
    id: "pag-001-sep",
    compraId: "comp-001",
    tipo: "separacion",
    valor: 5000000,
    valorPagado: 5000000,
    saldoPendiente: 0,
    estado: "pagado",
    fechaVencimiento: "2025-01-20",
    fechaPago: "2025-01-18",
    soportes: [soportePdf("recibo-separacion-comp001.pdf"), soporteImg("comprobante-separacion-comp001.jpg")],
  },
  {
    id: "pag-001-ci",
    compraId: "comp-001",
    tipo: "cuota_inicial",
    valor: 30000000,
    valorPagado: 30000000,
    saldoPendiente: 0,
    estado: "pagado",
    fechaVencimiento: "2025-03-15",
    fechaPago: "2025-03-10",
    soportes: [soportePdf("recibo-cuota-inicial-comp001.pdf")],
  },
  // Cuotas de financiación comp-001: 24 cuotas
  ...Array.from({ length: 24 }, (_, i) => {
    const numeroCuota = i + 1;
    const valorCuota = i < 23 ? 4791667 : 4791669;
    const base = {
      id: `pag-001-cuota-${numeroCuota}`,
      compraId: "comp-001",
      tipo: "cuota_financiacion" as const,
      numeroCuota,
      valor: valorCuota,
      fechaVencimiento: new Date(2025, 3 + i, 15).toISOString().split("T")[0],
    };
    if (numeroCuota <= 8) {
      return {
        ...base,
        valorPagado: valorCuota,
        saldoPendiente: 0,
        estado: "pagado" as const,
        fechaPago: new Date(2025, 2 + i, 12).toISOString().split("T")[0],
        soportes: [soportePdf(`recibo-cuota${numeroCuota}-comp001.pdf`)],
      };
    }
    if (numeroCuota === 9) {
      return {
        ...base,
        valorPagado: 3000000,
        saldoPendiente: valorCuota - 3000000,
        estado: "parcial" as const,
        fechaPago: new Date(2025, 10, 10).toISOString().split("T")[0],
        soportes: [soporteImg(`comprobante-parcial-cuota9-comp001.jpg`)],
      };
    }
    return {
      ...base,
      valorPagado: 0,
      saldoPendiente: valorCuota,
      estado: "pendiente" as const,
    };
  }),

  // ==========================================
  // COMP-002: Andrés Suárez — Contado
  // Lote 5, Cumbres de Envigado, $198.000.000
  // Separación: $10.000.000 (pagado)
  // Cuota inicial: $188.000.000 (pagado)
  // Sin financiación
  // ==========================================
  {
    id: "pag-002-sep",
    compraId: "comp-002",
    tipo: "separacion",
    valor: 10000000,
    valorPagado: 10000000,
    saldoPendiente: 0,
    estado: "pagado",
    fechaVencimiento: "2025-03-05",
    fechaPago: "2025-03-03",
    soportes: [soportePdf("recibo-separacion-comp002.pdf")],
  },
  {
    id: "pag-002-ci",
    compraId: "comp-002",
    tipo: "cuota_inicial",
    valor: 188000000,
    valorPagado: 188000000,
    saldoPendiente: 0,
    estado: "pagado",
    fechaVencimiento: "2025-04-01",
    fechaPago: "2025-03-28",
    soportes: [soportePdf("recibo-cuota-inicial-comp002.pdf"), soporteImg("comprobante-ci-comp002.jpg")],
  },

  // ==========================================
  // COMP-003: María Isabel Cardona — Financiada, en plan de pagos
  // Lote 7, Altos de la Montaña, $125.000.000
  // Separación: $5.000.000 (pagado)
  // Cuota inicial: $20.000.000 (pagado)
  // Financiación: $100.000.000 en 36 cuotas de ~$2.777.778
  // Cuotas 1-6 pagadas, cuotas 7-36 pendientes
  // ==========================================
  {
    id: "pag-003-sep",
    compraId: "comp-003",
    tipo: "separacion",
    valor: 5000000,
    valorPagado: 5000000,
    saldoPendiente: 0,
    estado: "pagado",
    fechaVencimiento: "2025-02-25",
    fechaPago: "2025-02-22",
    soportes: [soportePdf("recibo-separacion-comp003.pdf")],
  },
  {
    id: "pag-003-ci",
    compraId: "comp-003",
    tipo: "cuota_inicial",
    valor: 20000000,
    valorPagado: 20000000,
    saldoPendiente: 0,
    estado: "pagado",
    fechaVencimiento: "2025-04-15",
    fechaPago: "2025-04-10",
    soportes: [soportePdf("recibo-cuota-inicial-comp003.pdf")],
  },
  ...Array.from({ length: 36 }, (_, i) => {
    const numeroCuota = i + 1;
    const valorCuota = i < 35 ? 2777778 : 2777770;
    const base = {
      id: `pag-003-cuota-${numeroCuota}`,
      compraId: "comp-003",
      tipo: "cuota_financiacion" as const,
      numeroCuota,
      valor: valorCuota,
      fechaVencimiento: new Date(2025, 4 + i, 15).toISOString().split("T")[0],
    };
    if (numeroCuota <= 6) {
      return {
        ...base,
        valorPagado: valorCuota,
        saldoPendiente: 0,
        estado: "pagado" as const,
        fechaPago: new Date(2025, 3 + i, 12).toISOString().split("T")[0],
        soportes: [soportePdf(`recibo-cuota${numeroCuota}-comp003.pdf`)],
      };
    }
    return {
      ...base,
      valorPagado: 0,
      saldoPendiente: valorCuota,
      estado: "pendiente" as const,
    };
  }),

  // ==========================================
  // COMP-004: María Isabel Cardona — Financiada, separado (sin cuotas generadas)
  // Lote 15, Praderas del Sur, $160.000.000
  // Separación: $8.000.000 (pagado)
  // Cuota inicial: $32.000.000 (pendiente)
  // Sin cuotas de financiación generadas aún
  // ==========================================
  {
    id: "pag-004-sep",
    compraId: "comp-004",
    tipo: "separacion",
    valor: 8000000,
    valorPagado: 8000000,
    saldoPendiente: 0,
    estado: "pagado",
    fechaVencimiento: "2025-05-12",
    fechaPago: "2025-05-11",
    soportes: [soportePdf("recibo-separacion-comp004.pdf")],
  },
  {
    id: "pag-004-ci",
    compraId: "comp-004",
    tipo: "cuota_inicial",
    valor: 32000000,
    valorPagado: 0,
    saldoPendiente: 32000000,
    estado: "pendiente",
    fechaVencimiento: "2025-07-10",
  },

  // ==========================================
  // COMP-005: María Isabel Cardona — En negociación (cotización, sin pagos)
  // Lote 3, Praderas del Sur, $110.000.000
  // Sin pagos aún
  // ==========================================
];
