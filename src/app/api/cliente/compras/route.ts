import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { CompraAdapter } from "@/services/adapters";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const compras = CompraAdapter.getByCliente(session.clienteId);
  return NextResponse.json({
    data: compras.map((c) => ({
      id: c.id,
      estado: c.estado,
      modalidad: c.modalidad,
      valorTotal: c.valorTotal,
      numeroPedido: c.numeroPedido,
      numeroCotizacion: c.numeroCotizacion,
      fechaCreacion: c.fechaCreacion,
      lote: c.lote
        ? {
            id: c.lote.id,
            identificador: c.lote.identificador,
            area: c.lote.area,
            valor: c.lote.valor,
          }
        : null,
      proyecto: c.proyecto
        ? {
            id: c.proyecto.id,
            nombre: c.proyecto.nombre,
            descripcion: c.proyecto.descripcion,
            imagen: c.proyecto.imagen,
            ubicacion: c.proyecto.ubicacion,
            etapa: c.proyecto.etapa,
          }
        : null,
    })),
  });
}
