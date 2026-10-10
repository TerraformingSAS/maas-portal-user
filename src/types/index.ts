export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  avatar?: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  ubicacion: string;
  etapa?: string;
}

export interface Lote {
  id: string;
  identificador: string;
  area: number;
  valor: number;
  proyectoId: string;
  proyecto?: Proyecto;
}

export type EstadoCompra =
  | "en_negociacion"
  | "separado"
  | "cuota_inicial"
  | "en_plan_pagos"
  | "escriturado"
  | "contado"
  | "cancelado";

export type ModalidadNegociacion = "financiada" | "contado";

export interface Compra {
  id: string;
  clienteId: string;
  loteId: string;
  lote?: Lote;
  proyectoId: string;
  proyecto?: Proyecto;
  estado: EstadoCompra;
  modalidad: ModalidadNegociacion;
  valorTotal: number;
  numeroPedido: string;
  numeroCotizacion?: string;
  fechaCreacion: string;
}

export type EstadoPago =
  | "pagado"
  | "pendiente"
  | "vencido"
  | "parcial";

export type TipoPago =
  | "separacion"
  | "cuota_inicial"
  | "cuota_financiacion";

export interface SoportePago {
  nombre: string;
  tipo: "pdf" | "imagen";
  url: string;
}

export interface Pago {
  id: string;
  compraId: string;
  tipo: TipoPago;
  numeroCuota?: number;
  valor: number;
  valorPagado: number;
  saldoPendiente: number;
  estado: EstadoPago;
  fechaVencimiento: string;
  fechaPago?: string;
  soportes?: SoportePago[];
}

export interface PlanPagos {
  compraId: string;
  totalCuotas: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  cuotasVencidas: number;
  valorTotal: number;
  valorPagado: number;
  saldoPendiente: number;
  cuotas: Pago[];
}

export interface ResumenFinanciero {
  totalCompras: number;
  pagosRealizados: number;
  saldoPendiente: number;
  cuotasPagadas: number;
  totalCuotas: number;
}

export type EtapaProceso =
  | "separacion"
  | "cuota_inicial"
  | "plan_pagos"
  | "escrituracion";

export interface EstadoEtapa {
  etapa: EtapaProceso;
  etiqueta: string;
  completada: boolean;
  actual: boolean;
  pendiente: boolean;
}

export interface Notificacion {
  id: string;
  clienteId: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: "pago" | "vencimiento" | "confirmacion" | "info";
}

export interface SesionCliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}
