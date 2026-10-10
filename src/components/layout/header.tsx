"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, MapPin, Wallet, Bell, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { ItcButton } from "itc-frontend-base";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback } from "react";

interface HeaderProps {
  cliente: { nombre: string; apellido: string; email: string };
  notificacionesNoLeidas: number;
}

const navItems = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/mis-lotes", label: "Mis lotes", icon: MapPin },
  { href: "/mis-pagos", label: "Mis pagos", icon: Wallet },
];

export function Header({ cliente, notificacionesNoLeidas }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const initials = `${cliente.nombre.charAt(0)}${cliente.apellido.charAt(0)}`;

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }, [router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-lg shadow-black/5" : "bg-terra"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px]">

          {/* Izquierda: Logo + Navegación */}
          <div className="flex items-center gap-6">
            <Link href="/inicio" className="flex items-center gap-2.5 shrink-0 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${scrolled ? "bg-terra shadow-md shadow-terra/20" : "bg-white/95 shadow-lg shadow-black/10"}`}>
                <span className={`font-bold text-lg ${scrolled ? "text-white" : "text-terra"}`}>T</span>
              </div>
              <span className={`font-bold text-xl tracking-tight max-sm:hidden transition-colors ${scrolled ? "text-terra" : "text-white"}`}>
                TERRA
              </span>
            </Link>

            <nav className="max-md:hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? scrolled
                        ? "bg-terra text-white shadow-md shadow-terra/20"
                        : "bg-white/15 text-white"
                      : scrolled
                        ? "text-gray-600 hover:bg-terra-50 hover:text-terra"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Derecha: Notificaciones + Perfil usuario */}
          <div className="flex items-center gap-3">
            <button className={`relative p-2.5 rounded-xl transition-all duration-200 ${scrolled ? "hover:bg-terra-50 text-gray-600" : "hover:bg-white/10 text-white/90"}`}>
              <Bell className="h-5 w-5" />
              {notificacionesNoLeidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className={`max-sm:hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 outline-none ${scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
                <Avatar className={`h-9 w-9 ring-2 ring-offset-1 ${scrolled ? "ring-terra/20" : "ring-white/30"}`}>
                  <AvatarFallback className={`text-xs font-semibold ${scrolled ? "bg-terra-50 text-terra" : "bg-white/20 text-white"}`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className={`text-sm font-semibold leading-tight ${scrolled ? "text-gray-900" : "text-white"}`}>
                    {cliente.nombre} {cliente.apellido}
                  </p>
                  <p className={`text-[11px] leading-tight ${scrolled ? "text-muted-foreground" : "text-white/60"}`}>
                    Cliente
                  </p>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${scrolled ? "text-gray-400" : "text-white/50"}`} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl shadow-black/10 border-0 p-2">
                <div className="px-3 py-3 mb-1 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-terra text-white font-semibold text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{cliente.nombre} {cliente.apellido}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cliente.email}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer rounded-lg mt-1 focus:bg-red-50 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className={`md:hidden p-2.5 rounded-xl transition-all ${scrolled ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-white"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-gray-200/50 shadow-xl shadow-black/5">
          <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "bg-terra text-white shadow-md shadow-terra/20"
                      : "text-gray-700 hover:bg-terra-50 hover:text-terra"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="pt-3 mt-2 border-t border-gray-200/60">
              <div className="flex items-center gap-3 px-2 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-terra text-white font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{cliente.nombre} {cliente.apellido}</p>
                  <p className="text-xs text-muted-foreground">{cliente.email}</p>
                </div>
              </div>
              <ItcButton variant="danger" size="md" fullWidth label="Cerrar sesión" iconLeft={<LogOut className="h-4 w-4" />} onClick={handleLogout} className="!rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
