const BASE_URL = "";

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${endpoint}`);
  if (!res.ok) {
    throw new Error(`Error fetching ${endpoint}: ${res.status}`);
  }
  return res.json();
}

export const ApiService = {
  getCliente() {
    return fetchAPI<{ data: { id: string; nombre: string; apellido: string; email: string; telefono: string; tipoDocumento: string; numeroDocumento: string } }>("/cliente/me");
  },

  getResumen() {
    return fetchAPI<{ data: { totalCompras: number; pagosRealizados: number; saldoPendiente: number; cuotasPagadas: number; totalCuotas: number } }>("/cliente/resumen");
  },

  getCompras() {
    return fetchAPI<{
      data: Array<{
        id: string;
        estado: string;
        modalidad: string;
        valorTotal: number;
        numeroPedido: string;
        numeroCotizacion?: string;
        fechaCreacion: string;
        lote: { id: string; identificador: string; area: number; valor: number };
        proyecto: { id: string; nombre: string; descripcion: string; imagen: string; ubicacion: string; etapa?: string };
      }>;
    }>("/cliente/compras");
  },

  getCompra(id: string) {
    return fetchAPI<{
      data: {
        id: string;
        estado: string;
        modalidad: string;
        valorTotal: number;
        numeroPedido: string;
        numeroCotizacion?: string;
        fechaCreacion: string;
        lote: { id: string; identificador: string; area: number; valor: number };
        proyecto: { id: string; nombre: string; descripcion: string; imagen: string; ubicacion: string; etapa?: string };
      };
    }>(`/cliente/compras/${id}`);
  },

  getEstadoCuenta(compraId: string) {
    return fetchAPI<{
      data: {
        compra: {
          id: string;
          estado: string;
          modalidad: string;
          valorTotal: number;
          numeroPedido: string;
          lote: { id: string; identificador: string; area: number };
          proyecto: { id: string; nombre: string; imagen: string };
        };
        separacion: { id: string; valor: number; valorPagado: number; saldoPendiente: number; estado: string; fechaVencimiento: string; fechaPago?: string } | null;
        cuotaInicial: { id: string; valor: number; valorPagado: number; saldoPendiente: number; estado: string; fechaVencimiento: string; fechaPago?: string } | null;
        planPagos: {
          totalCuotas: number;
          cuotasPagadas: number;
          cuotasPendientes: number;
          cuotasVencidas: number;
          valorTotal: number;
          valorPagado: number;
          saldoPendiente: number;
          cuotas: Array<{
            id: string;
            numeroCuota: number;
            valor: number;
            valorPagado: number;
            saldoPendiente: number;
            estado: string;
            fechaVencimiento: string;
            fechaPago?: string;
          }>;
        } | null;
        totalPagado: number;
        totalPendiente: number;
        etapas: Array<{
          etapa: string;
          etiqueta: string;
          completada: boolean;
          actual: boolean;
          pendiente: boolean;
        }>;
      };
    }>(`/cliente/pedidos/${compraId}/estado-cuenta`);
  },

  getNotificaciones() {
    return fetchAPI<{
      data: Array<{
        id: string;
        titulo: string;
        mensaje: string;
        fecha: string;
        leida: boolean;
        tipo: string;
      }>;
      noLeidas: number;
    }>("/cliente/notificaciones");
  },
};
