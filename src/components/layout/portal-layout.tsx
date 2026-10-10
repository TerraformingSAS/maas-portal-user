"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { Suspense } from "react";

interface ClienteInfo {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface PortalLayoutProps {
  children: ReactNode;
}

function PortalLayoutInner({ children }: PortalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [notifsNoLeidas, setNotifsNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [clienteRes, notifsRes] = await Promise.all([
          fetch("/api/cliente/me"),
          fetch("/api/cliente/notificaciones"),
        ]);

        if (!clienteRes.ok) {
          router.push("/login");
          return;
        }

        const clienteData = await clienteRes.json();
        setCliente(clienteData.data);

        if (notifsRes.ok) {
          const notifsData = await notifsRes.json();
          setNotifsNoLeidas(notifsData.noLeidas || 0);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-terra border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cliente={cliente}
        notificacionesNoLeidas={notifsNoLeidas}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-terra border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PortalLayoutInner>{children}</PortalLayoutInner>
    </Suspense>
  );
}
