import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ClienteAdapter } from "@/services/adapters";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const cliente = ClienteAdapter.authenticate(email, password);
    if (!cliente) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await createSession({
      clienteId: cliente.id,
      email: cliente.email,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
    });

    const response = NextResponse.json({
      data: {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
      },
    });

    response.cookies.set(setSessionCookie(token));
    return response;
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
