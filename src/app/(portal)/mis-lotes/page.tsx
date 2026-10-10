"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Loader2, ChevronRight, Wallet } from "lucide-react";
import { ItcButton } from "itc-frontend-base";
import { ItcInput } from "itc-frontend-base";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCOP, formatArea, getEstadoCompraLabel, getModalidadLabel } from "@/lib/format";

interface CompraItem {
  id: string; estado: string; modalidad: string; valorTotal: number;
  numeroPedido: string; numeroCotizacion?: string; fechaCreacion: string;
  lote: { identificador: string; area: number } | null;
  proyecto: { nombre: string; imagen: string } | null;
}

const ESTADOS = [
  { value: "todos", label: "Todos" }, { value: "en_negociacion", label: "En negociación" },
  { value: "separado", label: "Separado" }, { value: "cuota_inicial", label: "Cuota inicial" },
  { value: "en_plan_pagos", label: "En plan de pagos" }, { value: "escriturado", label: "Escriturado" },
  { value: "contado", label: "De contado" },
];

const estadoConfig: Record<string, { color: string; status: "success" | "warning" | "info" | "error" }> = {
  en_negociacion: { color: "bg-amber-100 text-amber-700 border-amber-200/50", status: "warning" },
  separado: { color: "bg-blue-100 text-blue-700 border-blue-200/50", status: "info" },
  cuota_inicial: { color: "bg-purple-100 text-purple-700 border-purple-200/50", status: "info" },
  en_plan_pagos: { color: "bg-terra-50 text-terra-700 border-terra-200/50", status: "success" },
  escriturado: { color: "bg-terra-100 text-terra-800 border-terra-200/50", status: "success" },
  contado: { color: "bg-terra-100 text-terra-800 border-terra-200/50", status: "success" },
  cancelado: { color: "bg-red-100 text-red-700 border-red-200/50", status: "error" },
};

export default function MisComprasPage() {
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [filtered, setFiltered] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  useEffect(() => {
    fetch("/api/cliente/compras").then((r) => r.json()).then((d) => { setCompras(d.data); setFiltered(d.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = compras;
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter((c) => c.proyecto?.nombre.toLowerCase().includes(q) || c.lote?.identificador.toLowerCase().includes(q)); }
    if (estadoFiltro !== "todos") r = r.filter((c) => c.estado === estadoFiltro);
    setFiltered(r);
  }, [search, estadoFiltro, compras]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-terra" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis lotes</h1>
        <p className="text-sm text-muted-foreground mt-1">Consulta el estado de tus procesos de compra inmobiliaria</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <ItcInput placeholder="Buscar por proyecto o lote..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} fullWidth className="[&_input]:rounded-xl [&_input]:h-11" />
        </div>
        <Select value={estadoFiltro} onValueChange={(v: string | null) => setEstadoFiltro(v ?? "todos")}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl h-11">{<SelectValue placeholder="Filtrar estado" />}</SelectTrigger>
          <SelectContent>{ESTADOS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} compra{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
          <ShoppingBag className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">{compras.length === 0 ? "No tienes compras registradas actualmente" : "No se encontraron compras con los filtros aplicados"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const cfg = estadoConfig[c.estado] || { color: "bg-gray-100 text-gray-700", status: "info" as const };
            return (
              <div key={c.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-terra/6 transition-all duration-300 overflow-hidden">
                <div className="h-2 gradient-terra" />
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 text-lg">{c.proyecto?.nombre || "—"}</p>
                      <p className="text-sm text-muted-foreground">{c.lote?.identificador || "—"} · {c.lote ? formatArea(c.lote.area) : "—"}</p>
                    </div>
                    <Badge className={`${cfg.color} border rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0`} variant="secondary">
                      {getEstadoCompraLabel(c.estado)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50/80 rounded-xl p-3">
                    <div><p className="text-muted-foreground text-xs mb-0.5">Valor</p><p className="font-semibold">{formatCOP(c.valorTotal)}</p></div>
                    <div><p className="text-muted-foreground text-xs mb-0.5">Modalidad</p><p className="font-semibold">{getModalidadLabel(c.modalidad)}</p></div>
                    <div><p className="text-muted-foreground text-xs mb-0.5">Pedido</p><p className="font-medium text-xs">{c.numeroPedido}</p></div>
                    <div><p className="text-muted-foreground text-xs mb-0.5">Cotización</p><p className="font-medium text-xs">{c.numeroCotizacion || "—"}</p></div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link href={`/mis-lotes/${c.id}`} className="flex-1">
                      <ItcButton variant="secondary" size="sm" fullWidth label="Ver detalle" iconRight={<ChevronRight className="h-4 w-4" />} className="!rounded-xl !text-terra !border-terra/20 hover:!bg-terra-50" />
                    </Link>
                    <Link href={`/mis-pagos?compra=${c.id}`} className="flex-1">
                      <ItcButton variant="primary" size="sm" fullWidth label="Estado de cuenta" iconLeft={<Wallet className="h-4 w-4" />} className="!bg-terra hover:!bg-terra-light !rounded-xl" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
