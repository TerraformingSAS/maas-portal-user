import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { CompraAdapter, PagoAdapter, getEtapasProceso } from "@/services/adapters";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const compra = CompraAdapter.getById(id, session.clienteId);
  if (!compra) {
    return NextResponse.json(
      { error: "Compra no encontrada" },
      { status: 404 }
    );
  }

  const estadoCuenta = PagoAdapter.getEstadoCuenta(id);
  const etapas = getEtapasProceso(compra);

  return NextResponse.json({
    data: {
      compra: {
        id: compra.id,
        estado: compra.estado,
        modalidad: compra.modalidad,
        valorTotal: compra.valorTotal,
        numeroPedido: compra.numeroPedido,
        lote: compra.lote
          ? {
              id: compra.lote.id,
              identificador: compra.lote.identificador,
              area: compra.lote.area,
            }
          : null,
        proyecto: compra.proyecto
          ? {
              id: compra.proyecto.id,
              nombre: compra.proyecto.nombre,
              imagen: compra.proyecto.imagen,
            }
          : null,
      },
      separacion: estadoCuenta.separacion,
      cuotaInicial: estadoCuenta.cuotaInicial,
      planPagos: estadoCuenta.planPagos,
      totalPagado: estadoCuenta.totalPagado,
      totalPendiente: estadoCuenta.totalPendiente,
      etapas,
    },
  });
}
