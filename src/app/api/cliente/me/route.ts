import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ClienteAdapter } from "@/services/adapters";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cliente = ClienteAdapter.getById(session.clienteId);
  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: {
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
    },
  });
}
