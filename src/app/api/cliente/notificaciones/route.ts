import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { NotificacionAdapter } from "@/services/adapters";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const notifs = NotificacionAdapter.getByCliente(session.clienteId);
  const noLeidas = NotificacionAdapter.getNoLeidas(session.clienteId);

  return NextResponse.json({
    data: notifs.map((n) => ({
      id: n.id,
      titulo: n.titulo,
      mensaje: n.mensaje,
      fecha: n.fecha,
      leida: n.leida,
      tipo: n.tipo,
    })),
    noLeidas,
  });
}
