import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-terra rounded-xl flex items-center justify-center shadow-lg shadow-terra/20">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">TERRA</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Gestión inmobiliaria de confianza. Proyectos residenciales y lotes con las mejores ubicaciones y condiciones del mercado.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Enlaces</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/inicio" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/mis-lotes" className="hover:text-white transition-colors">Mis lotes</Link></li>
              <li><Link href="/mis-pagos" className="hover:text-white transition-colors">Mis pagos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Política de privacidad</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Términos y condiciones</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Protección de datos personales</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Terra Gestión Inmobiliaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
