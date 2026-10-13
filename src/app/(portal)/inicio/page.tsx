"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Wallet, TrendingUp, CreditCard,
  ArrowRight, ChevronRight, Loader2, Building2, MapPin,
} from "lucide-react";
import { ItcButton } from "itc-frontend-base";
import { ItcButtonCard } from "itc-frontend-base";
import { ItcTable } from "itc-frontend-base";
import type { TableColumn } from "itc-frontend-base";
import { Badge } from "@/components/ui/badge";
import { formatCOP, formatArea, getEstadoCompraLabel } from "@/lib/format";

interface ClienteInfo { nombre: string; apellido: string }
interface Resumen { totalCompras: number; pagosRealizados: number; saldoPendiente: number; cuotasPagadas: number; totalCuotas: number }
interface CompraItem { id: string; estado: string; modalidad: string; valorTotal: number; numeroPedido: string; lote: { identificador: string; area: number } | null; proyecto: { nombre: string } | null }

const estadoColor: Record<string, string> = {
  en_negociacion: "bg-amber-100 text-amber-700 border-amber-200/50",
  separado: "bg-blue-100 text-blue-700 border-blue-200/50",
  cuota_inicial: "bg-purple-100 text-purple-700 border-purple-200/50",
  en_plan_pagos: "bg-terra-50 text-terra-700 border-terra-200/50",
  escriturado: "bg-terra-100 text-terra-800 border-terra-200/50",
  contado: "bg-terra-100 text-terra-800 border-terra-200/50",
  cancelado: "bg-red-100 text-red-700 border-red-200/50",
};

export default function InicioPage() {
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cR, rR, coR] = await Promise.all([fetch("/api/cliente/me"), fetch("/api/cliente/resumen"), fetch("/api/cliente/compras")]);
        if (cR.ok) setCliente((await cR.json()).data);
        if (rR.ok) setResumen((await rR.json()).data);
        if (coR.ok) setCompras((await coR.json()).data);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-terra" /></div>;

  const cols: TableColumn<CompraItem>[] = [
    { key: "proyecto", title: "Proyecto", render: (r) => <span className="font-semibold">{r.proyecto?.nombre || "—"}</span> },
    { key: "lote", title: "Lote", render: (r) => r.lote?.identificador || "—" },
    { key: "area", title: "Área", render: (r) => r.lote ? formatArea(r.lote.area) : "—" },
    { key: "valorTotal", title: "Valor total", render: (r) => <span className="font-semibold">{formatCOP(r.valorTotal)}</span> },
    { key: "estado", title: "Estado", render: (r) => <Badge className={`${estadoColor[r.estado] || "bg-gray-100 text-gray-700"} border rounded-lg px-2.5 py-0.5`} variant="secondary">{getEstadoCompraLabel(r.estado)}</Badge> },
    { key: "acciones", title: "", align: "right", render: (r) => <Link href={`/mis-lotes/${r.id}`}><ItcButton variant="secondary" size="sm" label="Ver detalle" className="!rounded-xl !text-terra !border-terra/20 hover:!bg-terra-50" /></Link> },
  ];

  const indicators = [
    { title: "Mis lotes", value: String(resumen?.totalCompras ?? 0), icon: ShoppingBag, color: "terra", sub: "procesos activos" },
    { title: "Pagos realizados", value: formatCOP(resumen?.pagosRealizados ?? 0), icon: TrendingUp, color: "terra", sub: "total abonado" },
    { title: "Saldo pendiente", value: formatCOP(resumen?.saldoPendiente ?? 0), icon: Wallet, color: "amber", sub: "por pagar" },
    { title: "Cuotas pagadas", value: `${resumen?.cuotasPagadas ?? 0} de ${resumen?.totalCuotas ?? 0}`, icon: CreditCard, color: "terra", sub: "progreso" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Banner */}
      <div className="gradient-terra rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 border border-white/10 rounded-full" />
          <div className="absolute bottom-0 right-32 w-52 h-52 border border-white/8 rounded-full" />
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
          <div className="flex-1 text-white space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Building2 className="h-4 w-4" />
              Portal de Gestión Inmobiliaria
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">V1.0</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              ¡Hola, {cliente?.nombre} {cliente?.apellido}!
            </h1>
            <p className="text-white/80 leading-relaxed max-w-lg text-base">
              Consulta tus compras, conoce tu Estado de cuenta y accede a la información relacionada con tu proceso.
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center w-44 h-44 bg-white/10 rounded-3xl backdrop-blur-sm float-animation">
            <div className="grid grid-cols-3 gap-2 opacity-60">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`w-8 h-8 bg-white/20 rounded-lg ${i === 4 ? "bg-white/40" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Accesos rápidos</h2>
        <Link href="/mis-pagos" className="block">
          <div className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-terra/8 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-terra rounded-r-xl" />
            <div className="flex items-center gap-5 pl-2">
              <div className="w-14 h-14 gradient-terra-soft rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="h-7 w-7 text-terra" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">Estado de cuenta</p>
                <p className="text-sm text-muted-foreground mt-0.5">Revisa tus pagos y cuotas</p>
              </div>
              <ArrowRight className="h-6 w-6 text-terra/50 group-hover:text-terra group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        </Link>
      </div>

      {/* Indicadores */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen general</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((ind) => {
            const Icon = ind.icon;
            const isAmber = ind.color === "amber";
            return (
              <div key={ind.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isAmber ? "bg-amber-100" : "gradient-terra-soft"}`}>
                    <Icon className={`h-5 w-5 ${isAmber ? "text-amber-600" : "text-terra"}`} />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">{ind.title}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{ind.value}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{ind.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Mis lotes</h2>
          {compras.length > 0 && (
            <Link href="/mis-lotes" className="text-sm text-terra hover:text-terra-light font-semibold flex items-center gap-1 group">
              Ver todas
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
        {compras.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No tienes compras registradas actualmente</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ItcTable data={compras} columns={cols} rowKey={(r) => r.id} striped hoverable pagination pageSize={10} />
          </div>
        )}
      </div>
    </div>
  );
}
