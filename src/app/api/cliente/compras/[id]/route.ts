import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { CompraAdapter } from "@/services/adapters";

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

  return NextResponse.json({
    data: {
      id: compra.id,
      estado: compra.estado,
      modalidad: compra.modalidad,
      valorTotal: compra.valorTotal,
      numeroPedido: compra.numeroPedido,
      numeroCotizacion: compra.numeroCotizacion,
      fechaCreacion: compra.fechaCreacion,
      lote: compra.lote
        ? {
            id: compra.lote.id,
            identificador: compra.lote.identificador,
            area: compra.lote.area,
            valor: compra.lote.valor,
          }
        : null,
      proyecto: compra.proyecto
        ? {
            id: compra.proyecto.id,
            nombre: compra.proyecto.nombre,
            descripcion: compra.proyecto.descripcion,
            imagen: compra.proyecto.imagen,
            ubicacion: compra.proyecto.ubicacion,
            etapa: compra.proyecto.etapa,
          }
        : null,
    },
  });
}
