import { describe, it, expect } from "vitest";
import {
  ClienteAdapter,
  CompraAdapter,
  PagoAdapter,
  NotificacionAdapter,
  getEtapasProceso,
} from "@/services/adapters/local-adapter";

describe("ClienteAdapter", () => {
  it("authenticates valid credentials", () => {
    const cliente = ClienteAdapter.authenticate(
      "carolina.mejia@correo.com",
      "Terra2025*"
    );
    expect(cliente).not.toBeNull();
    expect(cliente!.nombre).toBe("Carolina");
  });

  it("rejects invalid credentials", () => {
    const cliente = ClienteAdapter.authenticate(
      "carolina.mejia@correo.com",
      "wrong"
    );
    expect(cliente).toBeNull();
  });

  it("gets client by id", () => {
    const cliente = ClienteAdapter.getById("cli-001");
    expect(cliente).not.toBeNull();
    expect(cliente!.email).toBe("carolina.mejia@correo.com");
  });
});

describe("CompraAdapter - data separation by client", () => {
  it("Carolina (cli-001) has exactly 1 compra", () => {
    const compras = CompraAdapter.getByCliente("cli-001");
    expect(compras).toHaveLength(1);
  });

  it("Andrés (cli-002) has exactly 1 compra (contado)", () => {
    const compras = CompraAdapter.getByCliente("cli-002");
    expect(compras).toHaveLength(1);
    expect(compras[0].modalidad).toBe("contado");
  });

  it("María Isabel (cli-003) has 3 compras", () => {
    const compras = CompraAdapter.getByCliente("cli-003");
    expect(compras).toHaveLength(3);
  });

  it("Jorge (cli-004) has 0 compras", () => {
    const compras = CompraAdapter.getByCliente("cli-004");
    expect(compras).toHaveLength(0);
  });

  it("compras are not mixed between clients", () => {
    const carolina = CompraAdapter.getByCliente("cli-001");
    const maria = CompraAdapter.getByCliente("cli-003");
    const carolinaIds = carolina.map((c) => c.id);
    const mariaIds = maria.map((c) => c.id);
    const overlap = carolinaIds.filter((id) => mariaIds.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it("getById returns null for compra of different client", () => {
    const compra = CompraAdapter.getById("comp-001", "cli-002");
    expect(compra).toBeNull();
  });
});

describe("CompraAdapter - resumen financiero", () => {
  it("Carolina's resumen is calculated correctly", () => {
    const resumen = CompraAdapter.getResumenFinanciero("cli-001");
    expect(resumen.totalCompras).toBe(1);
    expect(resumen.pagosRealizados).toBeGreaterThan(0);
    expect(resumen.saldoPendiente).toBeGreaterThanOrEqual(0);
    expect(resumen.pagosRealizados + resumen.saldoPendiente).toBeLessThanOrEqual(
      150000000 + 100
    );
  });

  it("Jorge's resumen shows zero for all values", () => {
    const resumen = CompraAdapter.getResumenFinanciero("cli-004");
    expect(resumen.totalCompras).toBe(0);
    expect(resumen.pagosRealizados).toBe(0);
    expect(resumen.saldoPendiente).toBe(0);
    expect(resumen.cuotasPagadas).toBe(0);
    expect(resumen.totalCuotas).toBe(0);
  });

  it("cuotas pagadas never exceeds total cuotas", () => {
    const resumen = CompraAdapter.getResumenFinanciero("cli-001");
    expect(resumen.cuotasPagadas).toBeLessThanOrEqual(resumen.totalCuotas);
  });
});

describe("PagoAdapter - financial consistency", () => {
  it("comp-001 (financiada) has separacion + cuota inicial + 24 cuotas", () => {
    const pagos = PagoAdapter.getByCompra("comp-001");
    const separacion = pagos.filter((p) => p.tipo === "separacion");
    const cuotaInicial = pagos.filter((p) => p.tipo === "cuota_inicial");
    const cuotas = pagos.filter((p) => p.tipo === "cuota_financiacion");

    expect(separacion).toHaveLength(1);
    expect(cuotaInicial).toHaveLength(1);
    expect(cuotas).toHaveLength(24);
  });

  it("comp-002 (contado) has no cuotas de financiacion", () => {
    const cuotas = PagoAdapter.getCuotasFinanciacion("comp-002");
    expect(cuotas).toHaveLength(0);
  });

  it("comp-004 (separado, sin cuotas generadas) has no cuotas de financiacion", () => {
    const cuotas = PagoAdapter.getCuotasFinanciacion("comp-004");
    expect(cuotas).toHaveLength(0);
  });

  it("every pago has saldoPendiente = valor - valorPagado", () => {
    const pagos = PagoAdapter.getByCompra("comp-001");
    for (const pago of pagos) {
      expect(pago.saldoPendiente).toBe(pago.valor - pago.valorPagado);
    }
  });

  it("no pago has negative saldoPendiente", () => {
    const allCompras = ["comp-001", "comp-002", "comp-003", "comp-004"];
    for (const compId of allCompras) {
      const pagos = PagoAdapter.getByCompra(compId);
      for (const pago of pagos) {
        expect(pago.saldoPendiente).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("no pago has valorPagado exceeding valor", () => {
    const allCompras = ["comp-001", "comp-002", "comp-003", "comp-004"];
    for (const compId of allCompras) {
      const pagos = PagoAdapter.getByCompra(compId);
      for (const pago of pagos) {
        expect(pago.valorPagado).toBeLessThanOrEqual(pago.valor);
      }
    }
  });

  it("comp-001 has a partial payment (cuota 9)", () => {
    const cuotas = PagoAdapter.getCuotasFinanciacion("comp-001");
    const parcial = cuotas.find((c) => c.estado === "parcial");
    expect(parcial).not.toBeUndefined();
    expect(parcial!.valorPagado).toBeGreaterThan(0);
    expect(parcial!.saldoPendiente).toBeGreaterThan(0);
  });

  it("plan de pagos for comp-001 calculates correctly", () => {
    const plan = PagoAdapter.getPlanPagos("comp-001");
    expect(plan).not.toBeNull();
    expect(plan!.totalCuotas).toBe(24);
    expect(plan!.cuotasPagadas).toBe(8);
    expect(plan!.valorPagado).toBeGreaterThan(0);
    expect(plan!.saldoPendiente).toBeGreaterThan(0);
  });

  it("plan de pagos returns null when no cuotas exist", () => {
    const plan = PagoAdapter.getPlanPagos("comp-002");
    expect(plan).toBeNull();
  });
});

describe("Estado de cuenta - scenarios", () => {
  it("Scenario A: financiada con cuotas generadas (comp-001)", () => {
    const ec = PagoAdapter.getEstadoCuenta("comp-001");
    expect(ec.separacion).not.toBeNull();
    expect(ec.cuotaInicial).not.toBeNull();
    expect(ec.planPagos).not.toBeNull();
    expect(ec.planPagos!.cuotas.length).toBeGreaterThan(0);
  });

  it("Scenario B: financiada sin cuotas generadas (comp-004)", () => {
    const ec = PagoAdapter.getEstadoCuenta("comp-004");
    expect(ec.separacion).not.toBeNull();
    expect(ec.cuotaInicial).not.toBeNull();
    expect(ec.planPagos).toBeNull();
  });

  it("Scenario C: compra de contado (comp-002)", () => {
    const ec = PagoAdapter.getEstadoCuenta("comp-002");
    expect(ec.separacion).not.toBeNull();
    expect(ec.cuotaInicial).not.toBeNull();
    expect(ec.planPagos).toBeNull();
  });

  it("Scenario D: pagos parciales are represented correctly", () => {
    const cuotas = PagoAdapter.getCuotasFinanciacion("comp-001");
    const parcial = cuotas.find((c) => c.estado === "parcial");
    expect(parcial).not.toBeUndefined();
    expect(parcial!.valorPagado).toBeGreaterThan(0);
    expect(parcial!.saldoPendiente).toBeGreaterThan(0);
    expect(parcial!.valorPagado + parcial!.saldoPendiente).toBe(parcial!.valor);
  });
});

describe("Etapas del proceso", () => {
  it("comp-001 (en_plan_pagos) has correct etapas", () => {
    const compra = CompraAdapter.getById("comp-001", "cli-001");
    const etapas = getEtapasProceso(compra!);
    expect(etapas).toHaveLength(4);
    expect(etapas[0].etiqueta).toBe("Separación");
    expect(etapas[0].completada).toBe(true);
    expect(etapas[1].etiqueta).toBe("Cuota inicial");
    expect(etapas[1].completada).toBe(true);
    expect(etapas[2].etiqueta).toBe("Plan de pagos");
    expect(etapas[2].actual).toBe(true);
  });

  it("comp-002 (contado) excludes plan de pagos etapa", () => {
    const compra = CompraAdapter.getById("comp-002", "cli-002");
    const etapas = getEtapasProceso(compra!);
    const hasPlanPagos = etapas.some((e) => e.etapa === "plan_pagos");
    expect(hasPlanPagos).toBe(false);
  });
});

describe("Notificaciones - data separation", () => {
  it("Carolina has notifications", () => {
    const notifs = NotificacionAdapter.getByCliente("cli-001");
    expect(notifs.length).toBeGreaterThan(0);
  });

  it("Jorge has no notifications", () => {
    const notifs = NotificacionAdapter.getByCliente("cli-004");
    expect(notifs).toHaveLength(0);
  });

  it("notifications are sorted by date descending", () => {
    const notifs = NotificacionAdapter.getByCliente("cli-003");
    for (let i = 1; i < notifs.length; i++) {
      const prev = new Date(notifs[i - 1].fecha).getTime();
      const curr = new Date(notifs[i].fecha).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});
