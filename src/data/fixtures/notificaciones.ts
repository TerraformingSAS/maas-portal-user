import type { Notificacion } from "@/types";

export const notificaciones: Notificacion[] = [
  {
    id: "notif-001",
    clienteId: "cli-001",
    titulo: "Cuota próxima a vencer",
    mensaje:
      "La cuota 10 de tu compra en Mirador del Valle vence el 15 de enero de 2026. Recuerda realizar tu pago a tiempo.",
    fecha: "2026-01-08",
    leida: false,
    tipo: "vencimiento",
  },
  {
    id: "notif-002",
    clienteId: "cli-001",
    titulo: "Pago registrado",
    mensaje:
      "Tu abono de $3.000.000 a la cuota 9 de Mirador del Valle ha sido aplicado correctamente. Saldo pendiente: $1.791.667.",
    fecha: "2025-11-10",
    leida: true,
    tipo: "confirmacion",
  },
  {
    id: "notif-003",
    clienteId: "cli-001",
    titulo: "Actualización de estado",
    mensaje:
      "Tu proceso de compra en Mirador del Valle se encuentra en etapa de Plan de Pagos. Continúa con el pago de tus cuotas.",
    fecha: "2025-10-01",
    leida: true,
    tipo: "info",
  },
  {
    id: "notif-004",
    clienteId: "cli-002",
    titulo: "Compra finalizada",
    mensaje:
      "¡Felicitaciones! Tu compra de contado en Cumbres de Envigado ha sido completada exitosamente. Pronto nos contactaremos para el proceso de escrituración.",
    fecha: "2025-04-02",
    leida: true,
    tipo: "confirmacion",
  },
  {
    id: "notif-005",
    clienteId: "cli-003",
    titulo: "Cuota próxima a vencer",
    mensaje:
      "La cuota 7 de tu compra en Altos de la Montaña vence el 15 de octubre de 2025.",
    fecha: "2025-10-08",
    leida: false,
    tipo: "vencimiento",
  },
  {
    id: "notif-006",
    clienteId: "cli-003",
    titulo: "Cuota inicial pendiente",
    mensaje:
      "Recuerda que la cuota inicial de $32.000.000 para tu lote en Praderas del Sur vence el 10 de julio de 2025.",
    fecha: "2025-06-25",
    leida: false,
    tipo: "pago",
  },
  {
    id: "notif-007",
    clienteId: "cli-003",
    titulo: "Nueva cotización generada",
    mensaje:
      "Se ha generado la cotización COT-2025-0721 para el Lote 15 en Praderas del Sur. Revisa los detalles en tu portal.",
    fecha: "2025-05-12",
    leida: true,
    tipo: "info",
  },
  {
    id: "notif-008",
    clienteId: "cli-003",
    titulo: "Cotización disponible",
    mensaje:
      "Tu cotización para el Lote 3 en Praderas del Sur está disponible. Contáctanos para continuar con el proceso.",
    fecha: "2025-06-20",
    leida: false,
    tipo: "info",
  },
];
