import type {
  Cliente,
  Compra,
  Pago,
  PlanPagos,
  Proyecto,
  Lote,
  ResumenFinanciero,
  Notificacion,
  EstadoEtapa,
} from "@/types";
import {
  clientes,
  compras,
  pagos,
  proyectos,
  lotes,
  notificaciones,
} from "@/data/fixtures";

function enrichCompra(compra: Compra): Compra {
  const lote = lotes.find((l) => l.id === compra.loteId);
  const proyecto = proyectos.find((p) => p.id === compra.proyectoId);
  return {
    ...compra,
    lote: lote ? { ...lote, proyecto } : undefined,
    proyecto,
  };
}

export const ClienteAdapter = {
  authenticate(email: string, password: string): Cliente | null {
    return (
      clientes.find((c) => c.email === email && c.password === password) || null
    );
  },

  getById(id: string): Cliente | null {
    return clientes.find((c) => c.id === id) || null;
  },

  getByEmail(email: string): Cliente | null {
    return clientes.find((c) => c.email === email) || null;
  },
};

export const CompraAdapter = {
  getByCliente(clienteId: string): Compra[] {
    return compras
      .filter((c) => c.clienteId === clienteId)
      .map(enrichCompra);
  },

  getById(id: string, clienteId: string): Compra | null {
    const compra = compras.find(
      (c) => c.id === id && c.clienteId === clienteId
    );
    return compra ? enrichCompra(compra) : null;
  },

  getResumenFinanciero(clienteId: string): ResumenFinanciero {
    const comprasCliente = compras.filter(
      (c) => c.clienteId === clienteId
    );
    const pagosCliente = pagos.filter((p) =>
      comprasCliente.some((c) => c.id === p.compraId)
    );

    const totalCompras = comprasCliente.length;
    const pagosRealizados = pagosCliente.reduce(
      (sum, p) => sum + p.valorPagado,
      0
    );
    const saldoPendiente = pagosCliente.reduce(
      (sum, p) => sum + p.saldoPendiente,
      0
    );
    const cuotasPagadas = pagosCliente.filter(
      (p) =>
        p.tipo === "cuota_financiacion" && p.estado === "pagado"
    ).length;
    const totalCuotas = pagosCliente.filter(
      (p) => p.tipo === "cuota_financiacion"
    ).length;

    return {
      totalCompras,
      pagosRealizados,
      saldoPendiente,
      cuotasPagadas,
      totalCuotas,
    };
  },
};

export const PagoAdapter = {
  getByCompra(compraId: string): Pago[] {
    return pagos.filter((p) => p.compraId === compraId);
  },

  getSeparacion(compraId: string): Pago | null {
    return (
      pagos.find((p) => p.compraId === compraId && p.tipo === "separacion") ||
      null
    );
  },

  getCuotaInicial(compraId: string): Pago | null {
    return (
      pagos.find(
        (p) => p.compraId === compraId && p.tipo === "cuota_inicial"
      ) || null
    );
  },

  getCuotasFinanciacion(compraId: string): Pago[] {
    return pagos.filter(
      (p) => p.compraId === compraId && p.tipo === "cuota_financiacion"
    );
  },

  getPlanPagos(compraId: string): PlanPagos | null {
    const cuotas = this.getCuotasFinanciacion(compraId);
    if (cuotas.length === 0) return null;

    const totalCuotas = cuotas.length;
    const cuotasPagadas = cuotas.filter((c) => c.estado === "pagado").length;
    const cuotasVencidas = cuotas.filter((c) => c.estado === "vencido").length;
    const cuotasPendientes = totalCuotas - cuotasPagadas - cuotasVencidas;
    const valorTotal = cuotas.reduce((sum, c) => sum + c.valor, 0);
    const valorPagado = cuotas.reduce((sum, c) => sum + c.valorPagado, 0);
    const saldoPendiente = cuotas.reduce(
      (sum, c) => sum + c.saldoPendiente,
      0
    );

    return {
      compraId,
      totalCuotas,
      cuotasPagadas,
      cuotasPendientes,
      cuotasVencidas,
      valorTotal,
      valorPagado,
      saldoPendiente,
      cuotas,
    };
  },

  getEstadoCuenta(compraId: string) {
    const separacion = this.getSeparacion(compraId);
    const cuotaInicial = this.getCuotaInicial(compraId);
    const planPagos = this.getPlanPagos(compraId);
    const todosLosPagos = this.getByCompra(compraId);

    const totalPagado = todosLosPagos.reduce(
      (sum, p) => sum + p.valorPagado,
      0
    );
    const totalPendiente = todosLosPagos.reduce(
      (sum, p) => sum + p.saldoPendiente,
      0
    );

    return {
      separacion,
      cuotaInicial,
      planPagos,
      totalPagado,
      totalPendiente,
    };
  },
};

export const ProyectoAdapter = {
  getById(id: string): Proyecto | null {
    return proyectos.find((p) => p.id === id) || null;
  },

  getAll(): Proyecto[] {
    return proyectos;
  },
};

export const LoteAdapter = {
  getById(id: string): Lote | null {
    return lotes.find((l) => l.id === id) || null;
  },
};

export const NotificacionAdapter = {
  getByCliente(clienteId: string): Notificacion[] {
    return notificaciones
      .filter((n) => n.clienteId === clienteId)
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
  },

  getNoLeidas(clienteId: string): number {
    return notificaciones.filter(
      (n) => n.clienteId === clienteId && !n.leida
    ).length;
  },
};

export function getEtapasProceso(compra: Compra): EstadoEtapa[] {
  const pagosCompra = pagos.filter((p) => p.compraId === compra.id);
  const separacion = pagosCompra.find((p) => p.tipo === "separacion");
  const cuotaInicial = pagosCompra.find(
    (p) => p.tipo === "cuota_inicial"
  );
  const tieneCuotas = pagosCompra.some(
    (p) => p.tipo === "cuota_financiacion"
  );

  const sepCompletada = separacion?.estado === "pagado";
  const ciCompletada = cuotaInicial?.estado === "pagado";
  const planCompletado =
    tieneCuotas &&
    pagosCompra
      .filter((p) => p.tipo === "cuota_financiacion")
      .every((p) => p.estado === "pagado");

  const etapas: EstadoEtapa[] = [
    {
      etapa: "separacion",
      etiqueta: "Separación",
      completada: sepCompletada,
      actual: !sepCompletada,
      pendiente: !sepCompletada,
    },
    {
      etapa: "cuota_inicial",
      etiqueta: "Cuota inicial",
      completada: ciCompletada,
      actual: sepCompletada && !ciCompletada,
      pendiente: !ciCompletada,
    },
    {
      etapa: "plan_pagos",
      etiqueta: "Plan de pagos",
      completada: planCompletado,
      actual: ciCompletada && !planCompletado && tieneCuotas,
      pendiente: !planCompletado && tieneCuotas,
    },
    {
      etapa: "escrituracion",
      etiqueta: "Escrituración",
      completada: compra.estado === "escriturado",
      actual: planCompletado && compra.estado !== "escriturado",
      pendiente: compra.estado !== "escriturado",
    },
  ];

  if (compra.modalidad === "contado") {
    return etapas.filter((e) => e.etapa !== "plan_pagos");
  }

  return etapas;
}
