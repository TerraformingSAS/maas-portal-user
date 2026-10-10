"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ItcButton } from "itc-frontend-base";
import { ItcInput } from "itc-frontend-base";
import { Eye, EyeOff, Loader2, Building2, MapPin, TrendingUp, Shield } from "lucide-react";

export default function LoginPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Ingresa tu correo electrónico"); return; }
    if (!password.trim()) { setError("Ingresa tu contraseña"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Credenciales inválidas"); return; }
      router.push("/inicio");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — Branding */}
      <div className="hidden lg:flex lg:w-[55%] gradient-terra relative overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] border border-white/10 rounded-full" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] border border-white/5 rounded-full" />
          <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] border border-white/8 rounded-full float-animation" />
          <div className="absolute bottom-[20%] right-[10%] w-[120px] h-[120px] bg-white/5 rounded-full blur-xl" />
          <div className="absolute top-[15%] left-[30%] w-[80px] h-[80px] bg-white/5 rounded-full blur-lg" />
        </div>

        <div className="relative z-10 flex flex-col justify-between px-14 xl:px-20 py-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/95 rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <span className="text-terra font-bold text-2xl">T</span>
            </div>
            <span className="font-bold text-3xl text-white tracking-tight">TERRA</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-5">
                Portal de<br />Clientes
              </h1>
              <p className="text-xl text-white/80 leading-relaxed max-w-lg">
                Consulta tus compras, revisa tu estado de cuenta y gestiona tu proceso inmobiliario.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md">
              {[
                { icon: Building2, text: "Proyectos" },
                { icon: MapPin, text: "Lotes" },
                { icon: TrendingUp, text: "Pagos" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="glass-dark rounded-2xl p-4 text-center space-y-2">
                  <Icon className="h-7 w-7 text-terra-200 mx-auto" />
                  <p className="text-sm font-medium text-white/90">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Shield className="h-4 w-4" />
            <span>Portal seguro · Datos protegidos</span>
          </div>
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-8 py-12 bg-gradient-to-br from-white via-gray-50/50 to-terra-50/30">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-terra rounded-2xl flex items-center justify-center shadow-lg shadow-terra/20">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-2xl text-terra tracking-tight">TERRA</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar sesión</h2>
            <p className="text-base text-muted-foreground">
              Ingresa tus credenciales para acceder a tu portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <ItcInput
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                fullWidth
                size="lg"
                variant="outlined"
                className="[&_input]:rounded-xl [&_input]:h-12"
              />
            </div>

            <div className="space-y-1.5">
              <ItcInput
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                fullWidth
                size="lg"
                variant="outlined"
                className="[&_input]:rounded-xl [&_input]:h-12"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-terra transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200/60 text-red-700 text-sm rounded-xl px-5 py-3.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            <ItcButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              label={loading ? "Iniciando sesión..." : "Iniciar sesión"}
              className="!bg-terra hover:!bg-terra-light !rounded-xl !h-12 !text-base !font-semibold !shadow-lg !shadow-terra/25 hover:!shadow-xl hover:!shadow-terra/30 !transition-all !duration-200"
            />
          </form>

          <p className="text-center text-xs text-muted-foreground/60 mt-8">
            Al iniciar sesión aceptas los términos de uso y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
