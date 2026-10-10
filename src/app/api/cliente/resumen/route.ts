import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { CompraAdapter } from "@/services/adapters";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const resumen = CompraAdapter.getResumenFinanciero(session.clienteId);
  return NextResponse.json({ data: resumen });
}
