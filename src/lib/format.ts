export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatArea(area: number): string {
  return `${new Intl.NumberFormat("es-CO").format(area)} m²`;
}

export function getInitials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

export function getEstadoCompraLabel(estado: string): string {
  const labels: Record<string, string> = {
    en_negociacion: "En negociación",
    separado: "Separado",
    cuota_inicial: "Cuota inicial",
    en_plan_pagos: "En plan de pagos",
    escriturado: "Escriturado",
    contado: "De contado",
    cancelado: "Cancelado",
  };
  return labels[estado] || estado;
}

export function getEstadoPagoLabel(estado: string): string {
  const labels: Record<string, string> = {
    pagado: "Pagado",
    pendiente: "Pendiente",
    vencido: "Vencido",
    parcial: "Parcial",
  };
  return labels[estado] || estado;
}

export function getModalidadLabel(modalidad: string): string {
  const labels: Record<string, string> = {
    financiada: "Financiada",
    contado: "De contado",
  };
  return labels[modalidad] || modalidad;
}
