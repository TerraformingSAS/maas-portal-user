"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2, CheckCircle2, Circle, Clock, Wallet,
  ShoppingBag, ChevronRight, FileText, ImageIcon,
  ExternalLink, CreditCard,
} from "lucide-react";
import { ItcButton } from "itc-frontend-base";
import { ItcTable } from "itc-frontend-base";
import type { TableColumn } from "itc-frontend-base";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatCOP, formatArea, formatDateShort,
  getEstadoCompraLabel, getEstadoPagoLabel, getModalidadLabel,
} from "@/lib/format";

interface SoporteItem { nombre: string; tipo: "pdf" | "imagen"; url: string }
interface CompraItem { id: string; estado: string; modalidad: string; valorTotal: number; numeroPedido: string; lote: { identificador: string; area: number } | null; proyecto: { nombre: string; imagen: string } | null }
interface PagoItem { id: string; valor: number; valorPagado: number; saldoPendiente: number; estado: string; fechaVencimiento: string; fechaPago?: string; soportes?: SoporteItem[] }
interface PlanPagosItem { totalCuotas: number; cuotasPagadas: number; cuotasPendientes: number; cuotasVencidas: number; valorTotal: number; valorPagado: number; saldoPendiente: number; cuotas: Array<PagoItem & { numeroCuota: number }> }
interface EtapaItem { etapa: string; etiqueta: string; completada: boolean; actual: boolean; pendiente: boolean }
interface EstadoCuentaData { compra: { id: string; estado: string; modalidad: string; valorTotal: number; numeroPedido: string; lote: { identificador: string; area: number } | null; proyecto: { nombre: string; imagen: string } | null }; separacion: PagoItem | null; cuotaInicial: PagoItem | null; planPagos: PlanPagosItem | null; totalPagado: number; totalPendiente: number; etapas: EtapaItem[] }

const pagoEstadoConfig: Record<string, { color: string; status: string }> = {
  pagado: { color: "bg-terra-100 text-terra-800", status: "success" },
  pendiente: { color: "bg-amber-100 text-amber-700", status: "warning" },
  vencido: { color: "bg-red-100 text-red-700", status: "error" },
  parcial: { color: "bg-blue-100 text-blue-700", status: "info" },
};

const compraEstadoColor: Record<string, string> = {
  en_negociacion: "bg-amber-100 text-amber-700", separado: "bg-blue-100 text-blue-700",
  cuota_inicial: "bg-purple-100 text-purple-700", en_plan_pagos: "bg-terra-50 text-terra-700",
  escriturado: "bg-terra-100 text-terra-800", contado: "bg-terra-100 text-terra-800",
  cancelado: "bg-red-100 text-red-700",
};

function SoportesCell({ soportes }: { soportes?: SoporteItem[] }) {
  if (!soportes || soportes.length === 0) return <span className="text-muted-foreground/40">—</span>;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {soportes.map((s) => (
        <a
          key={s.nombre}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-terra-50 text-terra hover:bg-terra-100 transition-colors"
          title={s.nombre}
        >
          {s.tipo === "pdf" ? <FileText className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
          <span className="max-w-[80px] truncate">{s.tipo === "pdf" ? "PDF" : "Img"}</span>
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
      ))}
    </div>
  );
}

function PseButton({ pagoId, valor }: { pagoId: string; valor: number }) {
  const handleClick = () => {
    alert(`Redirigiendo a PSE para el pago ${pagoId} por valor de ${formatCOP(valor)}.\n\nEn producción esto abriría la pasarela de pagos PSE.`);
  };
  return (
    <ItcButton
      variant="primary"
      size="sm"
      label="Pagar PSE"
      iconLeft={<CreditCard className="h-4 w-4" />}
      onClick={handleClick}
      className="!rounded-xl !bg-terra hover:!bg-terra-light !text-white !text-xs !px-3 !py-1.5"
    />
  );
}

function MisPagosContent() {
  const searchParams = useSearchParams();
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaData | null>(null);
  const [loadingCompras, setLoadingCompras] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    fetch("/api/cliente/compras").then((r) => r.json()).then((d) => {
      setCompras(d.data);
      const q = searchParams.get("compra");
      if (q && d.data.some((c: CompraItem) => c.id === q)) setSelectedId(q);
      else if (d.data.length > 0) setSelectedId(d.data[0].id);
    }).catch(() => {}).finally(() => setLoadingCompras(false));
  }, [searchParams]);

  const loadEC = useCallback(async (cid: string) => {
    setLoadingDetalle(true);
    try { const r = await fetch(`/api/cliente/pedidos/${cid}/estado-cuenta`); if (r.ok) setEstadoCuenta((await r.json()).data); } catch {} finally { setLoadingDetalle(false); }
  }, []);

  useEffect(() => { if (selectedId) loadEC(selectedId); else setEstadoCuenta(null); }, [selectedId, loadEC]);

  if (loadingCompras) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-terra" /></div>;
  if (compras.length === 0) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6"><h1 className="text-2xl font-bold text-gray-900 mb-2">Mis pagos</h1><div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm"><Wallet className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground font-medium">No tienes compras registradas para consultar el estado de cuenta</p></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis pagos</h1>
      <p className="text-sm text-muted-foreground mb-6">Consulta el estado de cuenta de tus compras</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel izquierdo */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-sm text-gray-900 mb-3">Mis pedidos y cotizaciones</h3>
            <div className="space-y-2">
              {compras.map((c) => {
                const sel = c.id === selectedId;
                return (
                  <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${sel ? "bg-terra-50 border-terra/30 shadow-sm shadow-terra/10" : "border-gray-100 hover:border-terra/20 hover:bg-gray-50/80"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${sel ? "gradient-terra text-white shadow-md shadow-terra/20" : "gradient-terra-soft text-terra"}`}>
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${sel ? "text-terra-800" : "text-gray-900"}`}>{c.lote?.identificador || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.proyecto?.nombre || "—"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[11px] text-muted-foreground">{c.numeroPedido}</p>
                          <Badge className={`text-[10px] px-1.5 py-0 ${compraEstadoColor[c.estado] || "bg-gray-100 text-gray-700"}`} variant="secondary">{getEstadoCompraLabel(c.estado)}</Badge>
                        </div>
                      </div>
                      {sel && <ChevronRight className="h-4 w-4 text-terra shrink-0 mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="lg:col-span-8 xl:col-span-9">
          {loadingDetalle ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-terra" /></div> : !estadoCuenta ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm"><p className="text-muted-foreground font-medium">Selecciona un pedido para ver su estado de cuenta</p></div>
          ) : (
            <div className="space-y-6">
              {/* Encabezado */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1.5 gradient-terra" />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Estado de cuenta</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                    <div><p className="text-muted-foreground text-xs">Proyecto</p><p className="font-semibold mt-0.5">{estadoCuenta.compra.proyecto?.nombre || "—"}</p></div>
                    <div><p className="text-muted-foreground text-xs">Lote</p><p className="font-semibold mt-0.5">{estadoCuenta.compra.lote?.identificador || "—"}</p></div>
                    <div><p className="text-muted-foreground text-xs">Área</p><p className="font-semibold mt-0.5">{estadoCuenta.compra.lote ? formatArea(estadoCuenta.compra.lote.area) : "—"}</p></div>
                    <div><p className="text-muted-foreground text-xs">Valor</p><p className="font-semibold mt-0.5">{formatCOP(estadoCuenta.compra.valorTotal)}</p></div>
                    <div><p className="text-muted-foreground text-xs">Modalidad</p><p className="font-semibold mt-0.5">{getModalidadLabel(estadoCuenta.compra.modalidad)}</p></div>
                    <div><p className="text-muted-foreground text-xs">Estado</p><Badge className={`${compraEstadoColor[estadoCuenta.compra.estado] || "bg-gray-100 text-gray-700"} mt-1 rounded-lg px-2.5 py-0.5`} variant="secondary">{getEstadoCompraLabel(estadoCuenta.compra.estado)}</Badge></div>
                  </div>
                </div>
              </div>

              {/* Progreso */}
              {estadoCuenta.etapas.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-5">Proceso comercial</h3>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full z-0" />
                    {estadoCuenta.etapas.map((etapa) => (
                      <div key={etapa.etapa} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / estadoCuenta.etapas.length}%` }}>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-all ${etapa.completada ? "gradient-terra text-white shadow-lg shadow-terra/25" : etapa.actual ? "bg-terra-100 text-terra ring-2 ring-terra ring-offset-2" : "bg-gray-100 text-gray-400"}`}>
                          {etapa.completada ? <CheckCircle2 className="h-5 w-5" /> : etapa.actual ? <Clock className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </div>
                        <p className={`text-xs font-semibold text-center ${etapa.completada || etapa.actual ? "text-terra" : "text-gray-400"}`}>{etapa.etiqueta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Separación y Cuota Inicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {estadoCuenta.separacion && <PagoCard title="Pago de separación" pago={estadoCuenta.separacion} />}
                {estadoCuenta.cuotaInicial && <PagoCard title="Cuota inicial" pago={estadoCuenta.cuotaInicial} />}
              </div>

              {/* Plan de pagos */}
              {estadoCuenta.planPagos && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-5">
                    <h3 className="font-bold text-gray-900">Plan de pagos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {[
                        { l: "Total cuotas", v: String(estadoCuenta.planPagos.totalCuotas), c: "text-gray-900" },
                        { l: "Cuotas pagadas", v: String(estadoCuenta.planPagos.cuotasPagadas), c: "text-terra" },
                        { l: "Cuotas pendientes", v: String(estadoCuenta.planPagos.cuotasPendientes), c: "text-amber-600" },
                        { l: "Valor pagado", v: formatCOP(estadoCuenta.planPagos.valorPagado), c: "text-terra" },
                        { l: "Saldo pendiente", v: formatCOP(estadoCuenta.planPagos.saldoPendiente), c: "text-amber-600" },
                      ].map(({ l, v, c }) => (
                        <div key={l} className="bg-gray-50/80 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground">{l}</p>
                          <p className={`text-lg font-bold ${c} mt-0.5`}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-3">Detalle de cuotas</h4>
                      <CuotasTable cuotas={estadoCuenta.planPagos.cuotas} />
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen total */}
              <div className="gradient-terra-soft rounded-2xl border border-terra/10 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-terra/70 font-medium">Total pagado</p><p className="text-2xl font-bold text-terra mt-0.5">{formatCOP(estadoCuenta.totalPagado)}</p></div>
                  <div><p className="text-sm text-amber-700/70 font-medium">Total pendiente</p><p className="text-2xl font-bold text-amber-700 mt-0.5">{formatCOP(estadoCuenta.totalPendiente)}</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PagoCard({ title, pago }: { title: string; pago: PagoItem }) {
  const cfg = pagoEstadoConfig[pago.estado] || { color: "bg-gray-100 text-gray-700", status: "info" };
  const puedePagar = pago.estado === "pendiente" || pago.estado === "vencido" || pago.estado === "parcial";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-1 ${pago.estado === "pagado" ? "bg-terra" : pago.estado === "vencido" ? "bg-red-500" : pago.estado === "parcial" ? "bg-blue-500" : "bg-amber-500"}`} />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <Badge className={`${cfg.color} rounded-lg px-2.5 py-0.5`} variant="secondary">{getEstadoPagoLabel(pago.estado)}</Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Valor</span><span className="font-semibold">{formatCOP(pago.valor)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Valor pagado</span><span className="font-semibold text-terra">{formatCOP(pago.valorPagado)}</span></div>
          {pago.saldoPendiente > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Saldo pendiente</span><span className="font-semibold text-amber-600">{formatCOP(pago.saldoPendiente)}</span></div>}
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Vencimiento</span><span className="font-medium">{formatDateShort(pago.fechaVencimiento)}</span></div>
          {pago.fechaPago && <div className="flex justify-between"><span className="text-muted-foreground">Fecha de pago</span><span className="font-medium">{formatDateShort(pago.fechaPago)}</span></div>}
        </div>
        {/* Soportes */}
        {pago.soportes && pago.soportes.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Soportes de pago</p>
            <div className="flex flex-wrap gap-2">
              {pago.soportes.map((s) => (
                <a
                  key={s.nombre}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-terra-50 text-terra hover:bg-terra-100 border border-terra/10 transition-colors"
                >
                  {s.tipo === "pdf" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  {s.nombre}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        )}
        {/* Botón PSE */}
        {puedePagar && (
          <div className="pt-2">
            <PseButton pagoId={pago.id} valor={pago.saldoPendiente} />
          </div>
        )}
      </div>
    </div>
  );
}

interface CuotaRow { id: string; numeroCuota: number; valor: number; valorPagado: number; saldoPendiente: number; estado: string; fechaVencimiento: string; fechaPago?: string; soportes?: SoporteItem[] }

function CuotasTable({ cuotas }: { cuotas: CuotaRow[] }) {
  const cols: TableColumn<CuotaRow>[] = [
    { key: "numeroCuota", title: "Cuota", render: (r) => <span className="font-semibold">{r.numeroCuota}</span> },
    { key: "valor", title: "Valor", render: (r) => formatCOP(r.valor) },
    { key: "fechaVencimiento", title: "Vencimiento", render: (r) => formatDateShort(r.fechaVencimiento) },
    { key: "estado", title: "Estado", render: (r) => { const c = pagoEstadoConfig[r.estado] || { color: "bg-gray-100 text-gray-700" }; return <Badge className={`${c.color} rounded-lg px-2.5 py-0.5`} variant="secondary">{getEstadoPagoLabel(r.estado)}</Badge>; } },
    { key: "valorPagado", title: "Valor pagado", render: (r) => formatCOP(r.valorPagado) },
    { key: "saldoPendiente", title: "Saldo pendiente", render: (r) => formatCOP(r.saldoPendiente) },
    { key: "soportes", title: "Soporte", render: (r) => <SoportesCell soportes={r.soportes} /> },
    { key: "accion", title: "Acción", align: "center" as const, render: (r) => {
      const puedePagar = r.estado === "pendiente" || r.estado === "vencido" || r.estado === "parcial";
      if (!puedePagar) return <span className="text-muted-foreground/40">—</span>;
      return <PseButton pagoId={r.id} valor={r.saldoPendiente} />;
    }},
  ];
  return <ItcTable data={cuotas} columns={cols} rowKey={(r) => r.id} striped hoverable pagination pageSize={10} />;
}

export default function MisPagosPage() {
  return <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-terra" /></div>}><MisPagosContent /></Suspense>;
}
