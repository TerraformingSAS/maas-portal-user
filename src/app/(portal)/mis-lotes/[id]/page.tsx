"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Ruler, Wallet, FileText, Calendar, Building2 } from "lucide-react";
import { ItcButton } from "itc-frontend-base";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCOP, formatArea, getEstadoCompraLabel, getModalidadLabel, formatDate } from "@/lib/format";

interface CompraDetail {
  id: string; estado: string; modalidad: string; valorTotal: number;
  numeroPedido: string; numeroCotizacion?: string; fechaCreacion: string;
  lote: { identificador: string; area: number; valor: number } | null;
  proyecto: { nombre: string; descripcion: string; imagen: string; ubicacion: string; etapa?: string } | null;
}

const estadoColor: Record<string, string> = {
  en_negociacion: "bg-amber-100 text-amber-700", separado: "bg-blue-100 text-blue-700",
  cuota_inicial: "bg-purple-100 text-purple-700", en_plan_pagos: "bg-terra-50 text-terra-700",
  escriturado: "bg-terra-100 text-terra-800", contado: "bg-terra-100 text-terra-800",
  cancelado: "bg-red-100 text-red-700",
};

export default function CompraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [compra, setCompra] = useState<CompraDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/cliente/compras/${id}`).then((r) => r.json()).then((d) => setCompra(d.data)).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-terra" /></div>;
  if (!compra) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center"><p className="text-muted-foreground">Lote no encontrado</p><ItcButton variant="secondary" label="Volver a Mis lotes" className="mt-4 !rounded-xl" onClick={() => router.push("/mis-lotes")} /></div>;

  const details = [
    { icon: Ruler, label: "Área", value: compra.lote ? formatArea(compra.lote.area) : "—" },
    { icon: Wallet, label: "Valor total", value: formatCOP(compra.valorTotal) },
    { icon: FileText, label: "Modalidad", value: getModalidadLabel(compra.modalidad) },
    { icon: Calendar, label: "Fecha de creación", value: formatDate(compra.fechaCreacion) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <ItcButton variant="link" size="sm" label="Volver a Mis lotes" iconLeft={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push("/mis-lotes")} className="!text-terra" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proyecto */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-40 gradient-terra flex items-center justify-center relative">
              <Building2 className="h-16 w-16 text-white/20" />
              {compra.proyecto?.etapa && (
                <span className="absolute top-4 right-4 bg-white/90 text-terra text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {compra.proyecto.etapa}
                </span>
              )}
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-lg text-gray-900">{compra.proyecto?.nombre}</h3>
              {compra.proyecto?.ubicacion && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />{compra.proyecto.ubicacion}
                </p>
              )}
              {compra.proyecto?.descripcion && <p className="text-sm text-muted-foreground leading-relaxed">{compra.proyecto.descripcion}</p>}
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 gradient-terra" />
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{compra.lote?.identificador || "Lote"}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{compra.numeroPedido}</p>
                </div>
                <Badge className={`${estadoColor[compra.estado] || "bg-gray-100 text-gray-700"} border rounded-lg px-3 py-1`} variant="secondary">
                  {getEstadoCompraLabel(compra.estado)}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl">
                    <div className="w-10 h-10 gradient-terra-soft rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-terra" />
                    </div>
                    <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold text-sm">{value}</p></div>
                  </div>
                ))}
              </div>
              {compra.numeroCotizacion && <><Separator /><div className="text-sm"><span className="text-muted-foreground">Cotización: </span><span className="font-semibold">{compra.numeroCotizacion}</span></div></>}
            </div>
          </div>
          <Link href={`/mis-pagos?compra=${compra.id}`}>
            <ItcButton variant="primary" size="lg" fullWidth label="Ver Estado de cuenta" iconLeft={<Wallet className="h-5 w-5" />} className="!bg-terra hover:!bg-terra-light !rounded-2xl py-5 !shadow-lg !shadow-terra/20" />
          </Link>
        </div>
      </div>
    </div>
  );
}
